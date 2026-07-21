"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { UserCircle, FloppyDisk, Camera, WarningCircle } from "@phosphor-icons/react";
import Link from "next/link";
import { motion } from "motion/react";

export default function EditProfile() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    username: "",
    email: "",
    full_name: "",
    bio: "",
  });
  const [profilePic, setProfilePic] = useState<File | null>(null);
  const [picPreview, setPicPreview] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => res.json())
      .then((data) => {
        if (!data.success) {
          router.push("/login");
          return;
        }
        setFormData({
          username: data.user.username || "",
          email: data.user.email || "",
          full_name: data.user.full_name || "",
          bio: data.user.bio || "",
        });
        if (data.user.profile_picture) {
          setPicPreview(`/uploads/profiles/${data.user.profile_picture.split(/[\\/]/).pop()}`);
        }
      })
      .finally(() => setLoading(false));
  }, [router]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setProfilePic(file);
      setPicPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage("");
    setError("");

    const data = new FormData();
    data.append("bio", formData.bio);
    data.append("username", formData.username);
    if (profilePic) {
      data.append("profile_picture", profilePic);
    }

    try {
      const res = await fetch("/api/profile", {
        method: "PUT",
        body: data,
      });
      const resData = await res.json();
      if (resData.success) {
        setMessage("Profile updated successfully");
        setTimeout(() => router.push("/profile"), 1500);
      } else {
        setError(resData.error || "Failed to update profile");
      }
    } catch (err) {
      setError("Network error occurred");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-[50vh] w-full items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-zinc-600 border-t-zinc-300" />
      </div>
    );
  }

  return (
    <div className="max-w-[1200px] mx-auto mt-12 mb-24">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="grid grid-cols-1 lg:grid-cols-[1fr_2fr] gap-8 lg:gap-16"
      >
        {/* Left Column: Avatar & Meta */}
        <div className="flex flex-col gap-8">
          <div>
            <h1 className="text-3xl font-medium tracking-tight text-zinc-50 mb-2">Public Profile</h1>
            <p className="text-zinc-400 text-sm leading-relaxed">
              This information will be displayed publicly so be careful what you share.
            </p>
          </div>

          <div className="p-8 rounded-3xl bg-zinc-900 border border-zinc-800 shadow-xl flex flex-col items-center text-center">
            <div className="relative group mb-6">
              <div className="h-40 w-40 overflow-hidden rounded-full border-4 border-zinc-950 bg-zinc-950 shadow-2xl">
                {picPreview ? (
                  <img src={picPreview} alt="Preview" className="h-full w-full object-cover transition-transform group-hover:scale-105 duration-500" />
                ) : (
                  <UserCircle weight="duotone" className="h-full w-full text-zinc-700" />
                )}
              </div>
              <label className="absolute inset-0 flex items-center justify-center rounded-full bg-black/60 opacity-0 group-hover:opacity-100 backdrop-blur-sm transition-all cursor-pointer">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <div className="flex flex-col items-center gap-2 text-white">
                  <Camera weight="bold" className="text-2xl" />
                  <span className="text-xs font-medium">Change Photo</span>
                </div>
              </label>
            </div>

            <h2 className="text-lg font-medium text-zinc-50 mb-1">{formData.username}</h2>
            <p className="text-sm text-zinc-500 mb-6">{formData.email}</p>

            <div className="w-full bg-zinc-950/50 rounded-2xl p-4 border border-zinc-800/50">
              <div className="flex items-center gap-2 text-amber-500/80 text-sm mb-2 font-medium">
                <WarningCircle weight="fill" />
                Account Details
              </div>
              <p className="text-xs text-zinc-500 text-left">
                Your email address cannot be changed. Contact support if you need to migrate your account.
              </p>
            </div>
          </div>
        </div>

        {/* Right Column: Form Inputs */}
        <div className="p-8 lg:p-12 rounded-3xl bg-zinc-900/50 border border-zinc-800 shadow-xl">
          <form onSubmit={handleSubmit} className="flex flex-col gap-10">
            {message && (
              <div className="rounded-2xl border border-emerald-900 bg-emerald-950/30 p-5 text-sm font-medium text-emerald-400">
                {message}
              </div>
            )}
            
            {error && (
              <div className="rounded-2xl border border-rose-900 bg-rose-950/30 p-5 text-sm font-medium text-rose-400">
                {error}
              </div>
            )}

            <div className="flex flex-col gap-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="flex flex-col gap-3">
                  <label className="text-sm font-medium text-zinc-300">Full Name <span className="text-zinc-600 text-xs font-normal">(cannot be changed)</span></label>
                  <input
                    type="text"
                    value={formData.full_name}
                    disabled
                    className="w-full bg-transparent border-b-2 border-zinc-800/40 py-3 text-lg text-zinc-600 cursor-not-allowed focus:outline-none"
                  />
                </div>

                <div className="flex flex-col gap-3">
                  <label className="text-sm font-medium text-zinc-300">Email Address <span className="text-zinc-600 text-xs font-normal">(cannot be changed)</span></label>
                  <input
                    type="email"
                    value={formData.email}
                    disabled
                    className="w-full bg-transparent border-b-2 border-zinc-800/40 py-3 text-lg text-zinc-600 cursor-not-allowed focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-3">
                <label className="text-sm font-medium text-zinc-300">Username</label>
                <input
                  type="text"
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  autoComplete="off"
                  className="w-full bg-transparent border-b-2 border-zinc-700 py-3 text-zinc-50 placeholder:text-zinc-600 focus:border-emerald-500 focus:outline-none transition-colors"
                  placeholder="username"
                />
              </div>

              <div className="flex flex-col gap-3">
                <label className="text-sm font-medium text-zinc-300">Biography</label>
                <p className="text-xs text-zinc-500 mb-2">Write a short introduction about yourself or your photography style.</p>
                <textarea
                  rows={5}
                  value={formData.bio}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  className="w-full rounded-2xl border border-zinc-800 bg-zinc-950/50 px-5 py-4 text-sm text-zinc-100 placeholder:text-zinc-600 focus:border-zinc-600 focus:outline-none focus:ring-1 focus:ring-zinc-600 transition-all resize-none"
                  placeholder="Tell us about yourself..."
                />
              </div>
            </div>

            <div className="pt-6 mt-4 border-t border-zinc-800/50 flex justify-end">
              <button
                type="submit"
                disabled={saving}
                className="flex items-center gap-2 rounded-2xl bg-emerald-500 px-8 py-4 text-sm font-medium text-emerald-950 hover:bg-emerald-400 active:scale-[0.98] transition-all disabled:opacity-50"
              >
                {saving ? "Saving Changes..." : "Save Changes"}
                {!saving && <FloppyDisk weight="bold" className="text-lg" />}
              </button>
            </div>
          </form>
        </div>
      </motion.div>
    </div>
  );
}
