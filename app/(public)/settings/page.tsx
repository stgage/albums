import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { SettingsForm } from "@/components/my/SettingsForm";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Settings" };
export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");
  // @ts-expect-error custom session
  const userId: string = session.user.id;

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      username: true,
      email: true,
      bio: true,
      image: true,
      passwordHash: true,
      accounts: { select: { provider: true } },
    },
  });

  if (!user) redirect("/login");

  const hasPassword = !!user.passwordHash;
  const oauthProviders = user.accounts.map((a) => a.provider);

  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      <h1 className="font-serif text-4xl font-bold text-white mb-2">
        Settings
      </h1>
      <p className="text-zinc-400 text-sm mb-8">
        Manage your profile and account
      </p>

      <SettingsForm
        user={{
          id: user.id,
          name: user.name,
          username: user.username,
          email: user.email,
          bio: user.bio,
          image: user.image,
          hasPassword,
          oauthProviders,
        }}
      />
    </div>
  );
}
