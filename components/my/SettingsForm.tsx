"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Loader2, Check, User } from "lucide-react";
import { useSession } from "next-auth/react";

const inputClass =
  "w-full px-3 py-2.5 bg-surface-2 border border-white/8 rounded-xl text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-purple-500/50";

type UserData = {
  id: string;
  name: string | null;
  username: string | null;
  email: string;
  bio: string | null;
  image: string | null;
  hasPassword: boolean;
  oauthProviders: string[];
};

export function SettingsForm({ user }: { user: UserData }) {
  const router = useRouter();
  const { update } = useSession();

  const [name, setName] = useState(user.name ?? "");
  const [username, setUsername] = useState(user.username ?? "");
  const [bio, setBio] = useState(user.bio ?? "");
  const [image, setImage] = useState(user.image ?? "");

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [profileSaving, setProfileSaving] = useState(false);
  const [profileSaved, setProfileSaved] = useState(false);
  const [profileError, setProfileError] = useState("");

  const [passwordSaving, setPasswordSaving] = useState(false);
  const [passwordSaved, setPasswordSaved] = useState(false);
  const [passwordError, setPasswordError] = useState("");

  async function handleProfileSave(e: React.FormEvent) {
    e.preventDefault();
    if (!user.username) return;
    setProfileError("");
    setProfileSaving(true);

    try {
      const res = await fetch(`/api/users/${user.username}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, username, bio, image }),
      });

      const data = await res.json();

      if (!res.ok) {
        setProfileError(data.error ?? "Failed to save");
        return;
      }

      // Update session if username changed
      await update({ username: data.username, name: data.name });

      setProfileSaved(true);
      setTimeout(() => setProfileSaved(false), 2000);

      // If username changed, redirect to new username URL
      if (data.username !== user.username) {
        router.push("/settings");
      } else {
        router.refresh();
      }
    } finally {
      setProfileSaving(false);
    }
  }

  async function handlePasswordSave(e: React.FormEvent) {
    e.preventDefault();
    setPasswordError("");

    if (newPassword !== confirmPassword) {
      setPasswordError("Passwords do not match");
      return;
    }
    if (newPassword.length < 8) {
      setPasswordError("Password must be at least 8 characters");
      return;
    }

    setPasswordSaving(true);
    try {
      const res = await fetch(`/api/users/${user.username}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword }),
      });

      const data = await res.json();

      if (!res.ok) {
        setPasswordError(data.error ?? "Failed to update password");
        return;
      }

      setPasswordSaved(true);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setTimeout(() => setPasswordSaved(false), 2000);
    } finally {
      setPasswordSaving(false);
    }
  }

  return (
    <div className="space-y-8">
      {/* Profile form */}
      <form onSubmit={handleProfileSave} className="glass rounded-2xl p-6 space-y-5">
        <h2 className="font-serif text-lg font-bold text-white">Profile</h2>

        {/* Avatar preview */}
        <div className="flex items-center gap-4">
          {image ? (
            <Image
              src={image}
              alt={name || "Avatar"}
              width={56}
              height={56}
              className="rounded-full flex-shrink-0"
            />
          ) : (
            <div className="w-14 h-14 rounded-full bg-purple-600/30 flex items-center justify-center flex-shrink-0">
              <User className="w-6 h-6 text-purple-400" />
            </div>
          )}
          <div className="flex-1">
            <label className="block text-xs font-medium text-zinc-400 mb-1.5">
              Avatar URL
            </label>
            <input
              type="url"
              value={image}
              onChange={(e) => setImage(e.target.value)}
              placeholder="https://..."
              className={inputClass}
            />
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-zinc-400 mb-1.5">
              Display Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your name"
              className={inputClass}
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-zinc-400 mb-1.5">
              Username
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 text-sm">
                @
              </span>
              <input
                type="text"
                value={username}
                onChange={(e) =>
                  setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ""))
                }
                placeholder="username"
                className={`${inputClass} pl-7`}
              />
            </div>
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-zinc-400 mb-1.5">
            Bio
          </label>
          <textarea
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            rows={3}
            placeholder="Tell the community about your music taste..."
            className={`${inputClass} resize-none`}
          />
        </div>

        <div className="flex items-center gap-2">
          <div className="flex-1 text-xs text-zinc-600">
            Signed in as{" "}
            <span className="text-zinc-400">{user.email}</span>
            {user.oauthProviders.length > 0 && (
              <span> via {user.oauthProviders.join(", ")}</span>
            )}
          </div>
          <button
            type="submit"
            disabled={profileSaving}
            className="flex items-center gap-2 px-5 py-2.5 bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white font-medium rounded-xl transition-colors text-sm"
          >
            {profileSaving ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : profileSaved ? (
              <Check className="w-4 h-4" />
            ) : null}
            {profileSaving
              ? "Saving..."
              : profileSaved
              ? "Saved!"
              : "Save Profile"}
          </button>
        </div>

        {profileError && (
          <p className="text-red-400 text-sm">{profileError}</p>
        )}
      </form>

      {/* Password form — only show for credentials users */}
      {user.hasPassword && (
        <form
          onSubmit={handlePasswordSave}
          className="glass rounded-2xl p-6 space-y-4"
        >
          <h2 className="font-serif text-lg font-bold text-white">
            Change Password
          </h2>

          <div>
            <label className="block text-xs font-medium text-zinc-400 mb-1.5">
              Current Password
            </label>
            <input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className={inputClass}
              autoComplete="current-password"
            />
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-zinc-400 mb-1.5">
                New Password
              </label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Min 8 characters"
                className={inputClass}
                autoComplete="new-password"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-zinc-400 mb-1.5">
                Confirm New Password
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className={inputClass}
                autoComplete="new-password"
              />
            </div>
          </div>

          {passwordError && (
            <p className="text-red-400 text-sm">{passwordError}</p>
          )}

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={
                passwordSaving || !currentPassword || !newPassword || !confirmPassword
              }
              className="flex items-center gap-2 px-5 py-2.5 bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white font-medium rounded-xl transition-colors text-sm"
            >
              {passwordSaving ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : passwordSaved ? (
                <Check className="w-4 h-4" />
              ) : null}
              {passwordSaving
                ? "Updating..."
                : passwordSaved
                ? "Updated!"
                : "Update Password"}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
