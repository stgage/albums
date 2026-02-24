import Link from "next/link";
import { Disc3 } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-surface flex items-center justify-center px-4">
      <div className="text-center">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500/20 to-violet-700/20 border border-purple-500/20 flex items-center justify-center mx-auto mb-6">
          <Disc3 className="w-8 h-8 text-purple-400" />
        </div>
        <h1 className="font-serif text-4xl font-bold text-white mb-3">
          404
        </h1>
        <p className="text-zinc-400 mb-8">
          This album doesn&apos;t exist in the collection.
        </p>
        <Link
          href="/"
          className="px-6 py-3 bg-purple-600 hover:bg-purple-500 text-white font-medium rounded-xl transition-colors"
        >
          Go Home
        </Link>
      </div>
    </div>
  );
}
