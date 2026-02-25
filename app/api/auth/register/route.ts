import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
  const body = await req.json();
  const { name, username, email, password } = body;

  // Validate required fields
  if (!username || !email || !password) {
    return NextResponse.json(
      { error: "Username, email, and password are required" },
      { status: 400 }
    );
  }

  // Validate username format
  if (!/^[a-z0-9_]+$/.test(username)) {
    return NextResponse.json(
      {
        error:
          "Username can only contain lowercase letters, numbers, and underscores",
      },
      { status: 400 }
    );
  }

  if (username.length < 3 || username.length > 30) {
    return NextResponse.json(
      { error: "Username must be between 3 and 30 characters" },
      { status: 400 }
    );
  }

  // Validate password length
  if (password.length < 8) {
    return NextResponse.json(
      { error: "Password must be at least 8 characters" },
      { status: 400 }
    );
  }

  // Check uniqueness
  const [existingEmail, existingUsername] = await Promise.all([
    prisma.user.findUnique({ where: { email } }),
    prisma.user.findUnique({ where: { username } }),
  ]);

  if (existingEmail) {
    return NextResponse.json(
      { error: "An account with this email already exists" },
      { status: 409 }
    );
  }
  if (existingUsername) {
    return NextResponse.json(
      { error: "This username is already taken" },
      { status: 409 }
    );
  }

  // Hash password and create user
  const passwordHash = await bcrypt.hash(password, 12);
  const user = await prisma.user.create({
    data: {
      name: name?.trim() || null,
      username,
      email: email.toLowerCase().trim(),
      passwordHash,
    },
    select: { id: true, email: true, username: true },
  });

  return NextResponse.json(user, { status: 201 });
}
