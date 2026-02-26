"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import {
  Disc3,
  Radio,
  ListOrdered,
  Grid3X3,
  Library,
  LogOut,
  Settings,
  User,
  LayoutDashboard,
  ChevronDown,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import Image from "next/image";

function UserInitials({ name }: { name?: string | null }) {
  const initials = name
    ? name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "?";
  return (
    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-violet-700 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
      {initials}
    </div>
  );
}

function AvatarDropdown() {
  const { data: session } = useSession();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node))
        setOpen(false);
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  if (!session?.user) return null;

  const user = session.user;
  // @ts-expect-error — custom session fields
  const username: string | null = user.username ?? null;
  // @ts-expect-error — custom session fields
  const isAdmin: boolean = user.isAdmin ?? false;

  async function handleSignOut() {
    setOpen(false);
    await signOut({ redirect: false });
    router.push("/");
    router.refresh();
  }

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-1.5 rounded-full hover:ring-2 hover:ring-purple-500/40 transition-all p-0.5"
        aria-label="User menu"
      >
        {user.image ? (
          <div className="w-8 h-8 flex-shrink-0 relative rounded-full overflow-hidden">
            <Image
              src={user.image}
              alt={user.name ?? "User"}
              fill
              className="object-cover"
              sizes="32px"
            />
          </div>
        ) : (
          <UserInitials name={user.name} />
        )}
        <ChevronDown
          className={cn(
            "w-3.5 h-3.5 text-zinc-400 transition-transform flex-shrink-0",
            open && "rotate-180"
          )}
        />
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-52 bg-surface-1 border border-white/8 rounded-xl shadow-xl shadow-black/40 overflow-hidden z-50">
          <div className="px-4 py-3 border-b border-white/5">
            <p className="text-sm font-medium text-white truncate">
              {user.name ?? username ?? "User"}
            </p>
            {username && (
              <p className="text-xs text-zinc-500 truncate">@{username}</p>
            )}
          </div>

          <div className="py-1">
            {username && (
              <Link
                href={`/u/${username}`}
                onClick={() => setOpen(false)}
                className="flex items-center gap-2.5 px-4 py-2 text-sm text-zinc-300 hover:text-white hover:bg-white/5 transition-colors"
              >
                <User className="w-4 h-4" />
                My Albums
              </Link>
            )}
            <Link
              href="/my/collection"
              onClick={() => setOpen(false)}
              className="flex items-center gap-2.5 px-4 py-2 text-sm text-zinc-300 hover:text-white hover:bg-white/5 transition-colors"
            >
              <Library className="w-4 h-4" />
              Manage Collection
            </Link>
            <Link
              href="/settings"
              onClick={() => setOpen(false)}
              className="flex items-center gap-2.5 px-4 py-2 text-sm text-zinc-300 hover:text-white hover:bg-white/5 transition-colors"
            >
              <Settings className="w-4 h-4" />
              Settings
            </Link>
            {isAdmin && (
              <Link
                href="/admin"
                onClick={() => setOpen(false)}
                className="flex items-center gap-2.5 px-4 py-2 text-sm text-zinc-300 hover:text-white hover:bg-white/5 transition-colors"
              >
                <LayoutDashboard className="w-4 h-4" />
                Admin
              </Link>
            )}
          </div>

          <div className="border-t border-white/5 py-1">
            <button
              onClick={handleSignOut}
              className="flex items-center gap-2.5 px-4 py-2 text-sm text-zinc-400 hover:text-white hover:bg-white/5 transition-colors w-full text-left"
            >
              <LogOut className="w-4 h-4" />
              Sign Out
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export function Navbar() {
  const pathname = usePathname();
  const { data: session, status } = useSession();

  // @ts-expect-error — custom session fields
  const username = session?.user?.username as string | null | undefined;
  const myAlbumsHref = username ? `/u/${username}` : "/my/collection";

  const navLinks = [
    { href: "/", label: "Feed", icon: Radio },
    { href: "/browse", label: "Browse", icon: Grid3X3 },
    { href: "/ranked", label: "Ranked", icon: ListOrdered },
    { href: myAlbumsHref, label: "My Albums", icon: Library },
  ];

  return (
    <header className="fixed top-0 left-0 right-0 z-50 h-16">
      <div className="absolute inset-0 bg-surface/80 backdrop-blur-xl border-b border-white/5" />
      <nav className="relative max-w-7xl mx-auto px-4 h-full flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-violet-700 flex items-center justify-center shadow-lg shadow-purple-500/25 group-hover:shadow-purple-500/40 transition-shadow">
            <Disc3 className="w-4 h-4 text-white" />
          </div>
          <span className="font-serif text-lg font-bold text-white">
            Albums
          </span>
        </Link>

        {/* Desktop nav links */}
        <div className="hidden md:flex items-center gap-1">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive =
              link.label === "My Albums"
                ? pathname.startsWith("/u/") || pathname.startsWith("/my/")
                : link.href === "/"
                  ? pathname === "/"
                  : pathname.startsWith(link.href);
            return (
              <Link
                key={link.label}
                href={link.href}
                className={cn(
                  "relative flex items-center gap-1.5 px-4 py-2 text-sm font-medium rounded-lg transition-colors",
                  isActive
                    ? "text-white"
                    : "text-zinc-400 hover:text-zinc-200"
                )}
              >
                {isActive && (
                  <motion.div
                    layoutId="nav-indicator"
                    className="absolute inset-0 bg-white/8 rounded-lg"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.4 }}
                  />
                )}
                <Icon className="relative w-4 h-4" />
                <span className="relative">{link.label}</span>
              </Link>
            );
          })}
        </div>

        {/* Right side: auth */}
        <div className="flex items-center gap-2">
          {status === "loading" ? (
            <div className="w-8 h-8 rounded-full bg-white/8 animate-pulse" />
          ) : session?.user ? (
            <AvatarDropdown />
          ) : (
            <Link
              href="/login"
              className="px-4 py-2 text-sm font-medium bg-purple-600 hover:bg-purple-500 text-white rounded-lg transition-colors"
            >
              Log In
            </Link>
          )}
        </div>

        {/* Mobile bottom nav */}
        <div className="flex md:hidden items-center gap-1 absolute bottom-0 left-0 right-0 -mb-14 justify-center bg-surface/90 backdrop-blur-xl border-b border-white/5 px-2 pb-1">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive =
              link.label === "My Albums"
                ? pathname.startsWith("/u/") || pathname.startsWith("/my/")
                : link.href === "/"
                  ? pathname === "/"
                  : pathname.startsWith(link.href);
            return (
              <Link
                key={link.label}
                href={link.href}
                className={cn(
                  "flex flex-col items-center gap-0.5 px-3 py-2 text-xs rounded-lg transition-colors",
                  isActive ? "text-purple-400" : "text-zinc-500"
                )}
              >
                <Icon className="w-5 h-5" />
                {link.label}
              </Link>
            );
          })}
        </div>
      </nav>
    </header>
  );
}
