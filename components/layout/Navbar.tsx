"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Disc3, BarChart3, ListOrdered, Grid3X3, Settings } from "lucide-react";

const navLinks = [
  { href: "/", label: "Home", icon: Disc3 },
  { href: "/browse", label: "Browse", icon: Grid3X3 },
  { href: "/ranked", label: "Ranked", icon: ListOrdered },
  { href: "/stats", label: "Stats", icon: BarChart3 },
];

export function Navbar() {
  const pathname = usePathname();

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
            Sam&apos;s Albums
          </span>
        </Link>

        {/* Nav Links */}
        <div className="hidden md:flex items-center gap-1">
          {navLinks.map((link) => {
            const isActive =
              link.href === "/"
                ? pathname === "/"
                : pathname.startsWith(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "relative px-4 py-2 text-sm font-medium rounded-lg transition-colors",
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
                <span className="relative">{link.label}</span>
              </Link>
            );
          })}
        </div>

        {/* Admin link */}
        <Link
          href="/admin"
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-zinc-500 hover:text-zinc-300 transition-colors rounded-lg hover:bg-white/5"
        >
          <Settings className="w-3.5 h-3.5" />
          Admin
        </Link>

        {/* Mobile nav */}
        <div className="flex md:hidden items-center gap-1 absolute bottom-0 left-0 right-0 -mb-14 justify-center bg-surface/90 backdrop-blur-xl border-b border-white/5 px-2 pb-1">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive =
              link.href === "/"
                ? pathname === "/"
                : pathname.startsWith(link.href);
            return (
              <Link
                key={link.href}
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
