import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";

type Params = { params: Promise<{ username: string }> };

export async function PATCH(req: Request, { params }: Params) {
  const session = await auth();
  if (!session?.user) return new NextResponse("Unauthorized", { status: 401 });
  // @ts-expect-error custom session
  const sessionUsername: string | null = session.user.username;
  // @ts-expect-error custom session
  const userId: string = session.user.id;

  const { username: targetUsername } = await params;

  // Users can only edit their own profile
  if (sessionUsername !== targetUsername) {
    return new NextResponse("Forbidden", { status: 403 });
  }

  const body = await req.json();
  const { name, username, bio, image, currentPassword, newPassword } = body;

  // If changing username, check uniqueness
  if (username && username !== sessionUsername) {
    if (!/^[a-z0-9_]+$/.test(username)) {
      return NextResponse.json(
        { error: "Username can only contain lowercase letters, numbers, and underscores" },
        { status: 400 }
      );
    }
    const taken = await prisma.user.findUnique({ where: { username } });
    if (taken) {
      return NextResponse.json(
        { error: "Username already taken" },
        { status: 409 }
      );
    }
  }

  // If changing password
  if (newPassword) {
    if (!currentPassword) {
      return NextResponse.json(
        { error: "Current password required" },
        { status: 400 }
      );
    }
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { passwordHash: true },
    });
    if (!user?.passwordHash) {
      return NextResponse.json(
        { error: "Password change not available for OAuth accounts" },
        { status: 400 }
      );
    }
    const valid = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!valid) {
      return NextResponse.json(
        { error: "Current password is incorrect" },
        { status: 400 }
      );
    }
    if (newPassword.length < 8) {
      return NextResponse.json(
        { error: "New password must be at least 8 characters" },
        { status: 400 }
      );
    }
  }

  const updateData: Record<string, unknown> = {};
  if ("name" in body) updateData.name = name?.trim() || null;
  if ("username" in body && username) updateData.username = username;
  if ("bio" in body) updateData.bio = bio?.trim() || null;
  if ("image" in body) updateData.image = image?.trim() || null;
  if (newPassword) {
    updateData.passwordHash = await bcrypt.hash(newPassword, 12);
  }

  const updated = await prisma.user.update({
    where: { id: userId },
    data: updateData,
    select: {
      id: true,
      name: true,
      username: true,
      bio: true,
      image: true,
      email: true,
    },
  });

  return NextResponse.json(updated);
}
