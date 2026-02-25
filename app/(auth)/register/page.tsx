"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Disc3, User, Mail, Lock, AtSign, Loader2 } from "lucide-react";

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    name: "",
    username: "",
    email: "",
    password: "",
    confirm: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function update(field: string, value: string) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (form.password !== form.confirm) {
      setError("Passwords do not match");
      return;
    }
    if (form.password.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }
    if (!/^[a-z0-9_]+$/.test(form.username)) {
      setError(
        "Username can only contain lowercase letters, numbers, and underscores"
      );
      return;
    }

    setLoading(true);

    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: form.name || undefined,
        username: form.username,
        email: form.email,
        password: form.password,
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      setError(data.error || "Registration failed");
      setLoading(false);
      return;
    }

    router.push("/login?registered=true");
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm">
        <div className="flex justify-center mb-8">
          <Link href="/">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-500 to-violet-700 flex items-center justify-center shadow-xl shadow-purple-500/25 hover:shadow-purple-500/40 transition-shadow">
              <Disc3 className="w-7 h-7 text-white" />
            </div>
          </Link>
        </div>

        <h1 className="font-serif text-2xl font-bold text-white text-center mb-1">
          Create an account
        </h1>
        <p className="text-zinc-500 text-sm text-center mb-8">
          Join and start ranking your albums
        </p>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="relative">
            <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
            <input
              type="text"
              placeholder="Display name (optional)"
              value={form.name}
              onChange={(e) => update("name", e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-surface-2 border border-white/8 rounded-xl text-white placeholder-zinc-600 focus:outline-none focus:border-purple-500/50 text-sm"
            />
          </div>
          <div className="relative">
            <AtSign className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
            <input
              type="text"
              placeholder="Username (letters, numbers, underscores)"
              value={form.username}
              onChange={(e) => update("username", e.target.value.toLowerCase())}
              required
              className="w-full pl-10 pr-4 py-3 bg-surface-2 border border-white/8 rounded-xl text-white placeholder-zinc-600 focus:outline-none focus:border-purple-500/50 text-sm"
            />
          </div>
          <div className="relative">
            <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
            <input
              type="email"
              placeholder="Email"
              value={form.email}
              onChange={(e) => update("email", e.target.value)}
              required
              className="w-full pl-10 pr-4 py-3 bg-surface-2 border border-white/8 rounded-xl text-white placeholder-zinc-600 focus:outline-none focus:border-purple-500/50 text-sm"
            />
          </div>
          <div className="relative">
            <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
            <input
              type="password"
              placeholder="Password (min 8 characters)"
              value={form.password}
              onChange={(e) => update("password", e.target.value)}
              required
              className="w-full pl-10 pr-4 py-3 bg-surface-2 border border-white/8 rounded-xl text-white placeholder-zinc-600 focus:outline-none focus:border-purple-500/50 text-sm"
            />
          </div>
          <div className="relative">
            <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
            <input
              type="password"
              placeholder="Confirm password"
              value={form.confirm}
              onChange={(e) => update("confirm", e.target.value)}
              required
              className="w-full pl-10 pr-4 py-3 bg-surface-2 border border-white/8 rounded-xl text-white placeholder-zinc-600 focus:outline-none focus:border-purple-500/50 text-sm"
            />
          </div>

          {error && (
            <p className="text-red-400 text-sm text-center">{error}</p>
          )}

          <button
            type="submit"
            disabled={
              loading ||
              !form.username ||
              !form.email ||
              !form.password ||
              !form.confirm
            }
            className="w-full py-3 bg-purple-600 hover:bg-purple-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium rounded-xl transition-colors flex items-center justify-center gap-2 mt-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Creating account...
              </>
            ) : (
              "Create Account"
            )}
          </button>
        </form>

        <p className="text-center text-sm text-zinc-500 mt-6">
          Already have an account?{" "}
          <Link
            href="/login"
            className="text-purple-400 hover:text-purple-300 transition-colors"
          >
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
