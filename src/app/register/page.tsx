"use client";

import { useState } from "react";
import Link from "next/link";
import { Image as ImageIcon, ArrowRight } from "@phosphor-icons/react";

export default function Register() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, email, password }),
      });
      const data = await res.json();
      
      if (data.success) {
        window.location.href = "/login";
      } else {
        setError(data.error || "Registration failed");
      }
    } catch (err) {
      setError("Network error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-100px)] w-full items-center justify-center pt-8">
      <div className="grid w-full max-w-[1000px] overflow-hidden rounded-3xl bg-zinc-900 border border-zinc-800 md:grid-cols-2 shadow-2xl">
        <div className="hidden flex-col justify-between bg-zinc-950 p-12 md:flex border-r border-zinc-800 relative overflow-hidden">
          <div className="absolute inset-0 opacity-20 bg-[url('https://picsum.photos/seed/gallery2/1000/1000')] bg-cover bg-center" />
          <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/80 to-transparent" />
          
          <div className="relative z-10">
            <div className="flex items-center gap-2 text-zinc-50 font-medium mb-12">
              <ImageIcon weight="duotone" className="text-emerald-500 text-2xl" />
              <span className="tracking-tight">Gallery</span>
            </div>
            
            <h1 className="text-4xl font-medium tracking-tight text-zinc-50 mb-4">
              Join the curation.
            </h1>
            <p className="text-zinc-400 max-w-sm leading-relaxed">
              Create an account to start building your own premium portfolio and sharing with the world.
            </p>
          </div>
        </div>

        <div className="flex flex-col justify-center p-8 md:p-12 lg:p-16">
          <div className="mx-auto w-full max-w-[340px]">
            <h2 className="mb-2 text-2xl font-medium tracking-tight text-zinc-50">Create an account</h2>
            <p className="mb-8 text-sm text-zinc-400">
              Already have an account?{" "}
              <Link href="/login" className="text-emerald-400 hover:text-emerald-300 transition-colors">
                Log in
              </Link>
            </p>

            <form onSubmit={handleSubmit} className="flex flex-col gap-5">
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-zinc-300">Username</label>
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full rounded-xl border border-zinc-800 bg-zinc-950/50 px-4 py-3 text-sm text-zinc-100 placeholder:text-zinc-600 focus:border-zinc-700 focus:outline-none focus:ring-1 focus:ring-zinc-700 transition-all"
                  placeholder="johndoe"
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-zinc-300">Email address</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-xl border border-zinc-800 bg-zinc-950/50 px-4 py-3 text-sm text-zinc-100 placeholder:text-zinc-600 focus:border-zinc-700 focus:outline-none focus:ring-1 focus:ring-zinc-700 transition-all"
                  placeholder="name@example.com"
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-zinc-300">Password</label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-xl border border-zinc-800 bg-zinc-950/50 px-4 py-3 text-sm text-zinc-100 placeholder:text-zinc-600 focus:border-zinc-700 focus:outline-none focus:ring-1 focus:ring-zinc-700 transition-all"
                  placeholder="••••••••"
                />
              </div>

              {error && (
                <div className="text-sm text-rose-400 bg-rose-950/30 border border-rose-900/50 p-3 rounded-lg">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-zinc-100 px-4 py-3 text-sm font-medium text-zinc-900 hover:bg-zinc-300 active:scale-[0.98] transition-all disabled:opacity-50"
              >
                {loading ? "Creating..." : "Sign up"}
                {!loading && <ArrowRight weight="bold" />}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
