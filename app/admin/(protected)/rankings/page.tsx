import { ListOrdered } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Rankings — Admin" };

export default function RankingsPage() {
  return (
    <div className="p-8 max-w-2xl">
      <div className="mb-8">
        <h1 className="font-serif text-3xl font-bold text-white">Rankings</h1>
        <p className="text-zinc-500 mt-1">
          Global rankings are now computed from user lists
        </p>
      </div>

      <div className="glass rounded-2xl p-8 text-center">
        <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center mx-auto mb-4">
          <ListOrdered className="w-6 h-6 text-purple-400" />
        </div>
        <h2 className="font-serif text-xl font-bold text-white mb-2">
          Rankings moved to user profiles
        </h2>
        <p className="text-zinc-500 text-sm max-w-sm mx-auto">
          Each user now maintains their own ranked list. The global Borda ranking
          is computed from all users&apos; personal lists and displayed on{" "}
          <a href="/ranked" className="text-purple-400 hover:text-purple-300">
            /ranked
          </a>
          .
        </p>
      </div>
    </div>
  );
}
