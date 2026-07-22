"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { MagnifyingGlass, Image as ImageIcon, SignOut, UploadSimple, User, GearSix } from "@phosphor-icons/react";
import { authFetch, removeToken } from "@/lib/auth";

type NavbarUser = {
  username: string;
  email: string;
  profile_picture?: string | null;
};

export function Navbar() {
  const [user, setUser] = useState<NavbarUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();

  useEffect(() => {
    authFetch("/api/auth/me")
      .then((res) => res.json())
      .then((data) => {
        if (data.user) setUser(data.user);
        else setUser(null);
      })
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, [pathname]);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = async () => {
    await authFetch("/api/auth/logout", { method: "POST" });
    removeToken();
    setUser(null);
    window.location.href = "/";
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-zinc-800/50 bg-zinc-950/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-[1400px] items-center justify-between px-6">
        <Link href="/" className="flex items-center gap-2 text-zinc-50 font-medium transition-opacity hover:opacity-80">
          <ImageIcon weight="duotone" className="text-emerald-500 text-2xl" />
          <span className="tracking-tight">Gallery</span>
        </Link>

        <div className="hidden md:flex flex-1 max-w-md mx-6">
          <div className="relative w-full group">
            <MagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 transition-colors group-focus-within:text-zinc-300" />
            <input
              type="text"
              placeholder="Search images..."
              className="w-full rounded-full bg-zinc-900 border border-zinc-800 py-2 pl-10 pr-4 text-sm text-zinc-100 placeholder:text-zinc-500 focus:border-zinc-700 focus:outline-none focus:ring-1 focus:ring-zinc-700 transition-all"
            />
          </div>
        </div>

        <div className="flex items-center gap-4">
          {!loading && user ? (
            <>
              <Link 
                href="/upload"
                title="Upload"
                className="flex h-9 w-9 items-center justify-center rounded-full bg-zinc-900 text-zinc-400 hover:text-emerald-400 hover:bg-zinc-800 transition-colors"
              >
                <UploadSimple weight="bold" />
              </Link>

              {/* Avatar + Dropdown */}
              <div className="relative pl-4 border-l border-zinc-800/50" ref={dropdownRef}>
                <button
                  onClick={() => setDropdownOpen((v) => !v)}
                  className="relative flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-full bg-emerald-500/10 text-emerald-500 transition-colors hover:bg-emerald-500/20"
                >
                  {user.profile_picture ? (
                    <Image
                      src={`/uploads/profiles/${user.profile_picture.split(/[\\/]/).pop()}`}
                      alt="Profile picture"
                      fill
                      sizes="32px"
                      className="object-cover"
                    />
                  ) : (
                    <span className="text-sm font-semibold">{user.username.charAt(0).toUpperCase()}</span>
                  )}
                </button>

                {dropdownOpen && (
                  <div className="absolute right-0 top-12 w-52 rounded-2xl border border-zinc-800 bg-zinc-900 shadow-2xl overflow-hidden z-50">
                    {/* User info */}
                    <div className="px-4 py-3 border-b border-zinc-800">
                      <p className="text-sm font-medium text-zinc-100 truncate">{user.username}</p>
                      <p className="text-xs text-zinc-500 truncate">{user.email}</p>
                    </div>
                    {/* Menu items */}
                    <div className="py-1">
                      <Link href="/profile" onClick={() => setDropdownOpen(false)} className="flex items-center gap-3 px-4 py-2.5 text-sm text-zinc-300 hover:bg-zinc-800 hover:text-zinc-50 transition-colors">
                        <User weight="bold" className="text-base" />
                        My Profile
                      </Link>
                      <Link href="/settings" onClick={() => setDropdownOpen(false)} className="flex items-center gap-3 px-4 py-2.5 text-sm text-zinc-300 hover:bg-zinc-800 hover:text-zinc-50 transition-colors">
                        <GearSix weight="bold" className="text-base" />
                        Setting
                      </Link>
                    </div>
                    <div className="border-t border-zinc-800 py-1">
                      <button onClick={handleLogout} className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-rose-400 hover:bg-zinc-800 hover:text-rose-300 transition-colors">
                        <SignOut weight="bold" className="text-base" />
                        Logout
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </>
          ) : !loading ? (
            <div className="flex items-center gap-3">
              <Link href="/login" className="text-sm font-medium text-zinc-400 hover:text-zinc-50 transition-colors">
                Login
              </Link>
              <Link href="/register" className="rounded-full bg-zinc-100 px-4 py-2 text-sm font-medium text-zinc-950 hover:bg-zinc-300 transition-colors">
                Register
              </Link>
            </div>
          ) : (
            <div className="h-8 w-8 rounded-full bg-zinc-900 animate-pulse" />
          )}
        </div>
      </div>
    </header>
  );
}
