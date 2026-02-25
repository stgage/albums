import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import Credentials from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    Credentials({
      name: "Email & Password",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const user = await prisma.user.findUnique({
          where: { email: credentials.email as string },
        });

        if (!user || !user.passwordHash) return null;

        const valid = await bcrypt.compare(
          credentials.password as string,
          user.passwordHash
        );
        if (!valid) return null;

        return user;
      },
    }),
  ],
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "database",
  },
  callbacks: {
    async session({ session, user }) {
      if (session.user && user) {
        session.user.id = user.id;
        // @ts-expect-error — custom fields on session user
        session.user.username = (user as { username?: string }).username ?? null;
        // @ts-expect-error — custom fields on session user
        session.user.isAdmin = (user as { isAdmin?: boolean }).isAdmin ?? false;
      }
      return session;
    },
    async signIn({ user, account }) {
      // Auto-generate a username for OAuth users who don't have one
      if (account?.provider !== "credentials") {
        const existing = await prisma.user.findUnique({
          where: { id: user.id! },
          select: { username: true },
        });
        if (existing && !existing.username) {
          // Derive a candidate from email or name
          const base = (user.email?.split("@")[0] ?? user.name ?? "user")
            .toLowerCase()
            .replace(/[^a-z0-9]/g, "")
            .slice(0, 20);
          let candidate = base;
          let suffix = 1;
          while (
            await prisma.user.findUnique({ where: { username: candidate } })
          ) {
            candidate = `${base}${suffix++}`;
          }
          await prisma.user.update({
            where: { id: user.id! },
            data: { username: candidate },
          });
        }
      }
      return true;
    },
  },
});
