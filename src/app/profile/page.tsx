"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "motion/react";
import { PencilSimple, Image as ImageIcon, LockKey, Trash, WarningCircle, X, PlayCircle } from "@phosphor-icons/react";
import { authFetch } from "@/lib/auth";
import { ImageModal } from "@/components/ImageModal";

interface ProfileImage {
  _id: string;
  title: string;
  description?: string;
  image_path: string;
  privacy: "public" | "private";
  media_type?: "image" | "video";
}

interface ProfileData {
  user: {
    _id: string;
    username: string;
    email: string;
    full_name?: string;
    bio?: string;
    profile_picture?: string;
  };
  images: ProfileImage[];
  image_count: number;
}

export default function Profile() {
  const [data, setData] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState<ProfileImage | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; title: string } | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Close delete modal on Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setDeleteTarget(null);
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  const loadProfile = () => {
    authFetch("/api/profile")
      .then((res) => res.json())
      .then((resData) => {
        if (resData.success) {
          setData(resData);
        } else {
          window.location.href = "/login";
        }
      })
      .catch(() => (window.location.href = "/login"))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadProfile();
  }, []);

  const confirmDelete = (e: React.MouseEvent, id: string, title: string) => {
    e.stopPropagation();
    setDeleteTarget({ id, title });
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      const res = await authFetch(`/api/images/${deleteTarget.id}`, { method: "DELETE" });
      const resData = await res.json();
      if (resData.success) {
        setDeleteTarget(null);
        loadProfile();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-[50vh] w-full items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-zinc-600 border-t-zinc-300" />
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="mt-12 max-w-[1000px] mx-auto">
      {/* Profile Header section */}
      <div className="flex flex-col md:flex-row items-start md:items-center gap-8 mb-16 pb-12 border-b border-zinc-800/50">
        <div className="h-36 w-36 shrink-0 overflow-hidden rounded-full border border-zinc-800 bg-zinc-900">
          {data.user.profile_picture ? (
            <Image
              src={`/uploads/profiles/${data.user.profile_picture.split(/[\\/]/).pop()}`}
              alt="Profile"
              width={144}
              height={144}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-5xl font-medium text-zinc-500">
              {data.user.username.charAt(0).toUpperCase()}
            </div>
          )}
        </div>

        <div className="flex-1">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
            <div>
              <h1 className="text-3xl font-medium tracking-tight text-zinc-50 mb-1">
                {data.user.username}
              </h1>
              <p className="text-sm text-zinc-400">{data.user.email}</p>
            </div>

            <Link
              href="/edit-profile"
              className="inline-flex items-center gap-2 rounded-full bg-zinc-900 px-4 py-2 text-sm font-medium text-zinc-300 hover:bg-zinc-800 hover:text-zinc-50 transition-colors border border-zinc-800"
            >
              <PencilSimple weight="bold" />
              Edit Profile
            </Link>
          </div>

          {data.user.bio && (
            <p className="max-w-xl text-zinc-300 text-sm leading-relaxed mb-6">
              {data.user.bio}
            </p>
          )}

          <div className="flex items-center gap-6 text-sm">
            <div className="flex flex-col">
              <span className="text-xl font-medium text-zinc-50">{data.image_count}</span>
              <span className="text-zinc-500">Uploads</span>
            </div>
          </div>
        </div>
      </div>

      {/* Gallery Section */}
      <div className="mb-8">
        <h2 className="text-xl font-medium text-zinc-50 mb-6 tracking-tight">Your Portfolio</h2>

        {data.images.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-zinc-500 rounded-3xl border border-zinc-800/50 border-dashed bg-zinc-900/20">
            <ImageIcon weight="duotone" className="text-5xl mb-4 opacity-50" />
            <p className="mb-6">You haven&apos;t uploaded any images yet.</p>
            <Link
              href="/upload"
              className="rounded-full bg-zinc-100 px-5 py-2.5 text-sm font-medium text-zinc-900 hover:bg-zinc-300 transition-colors"
            >
              Upload first image
            </Link>
          </div>
        ) : (
          <div className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-6 space-y-6">
            {data.images.map((img, i: number) => (
              <motion.div
                key={img._id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                onClick={() => setSelectedImage(img)}
                className="break-inside-avoid relative group cursor-zoom-in rounded-2xl bg-zinc-900 overflow-hidden border border-zinc-800"
              >
                {img.media_type === "video" ? (
                  <video
                    src={img.image_path}
                    className="w-full object-cover"
                    muted
                    playsInline
                    preload="metadata"
                  />
                ) : (
                  <>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={img.image_path}
                      alt={img.title}
                      className="w-full object-cover"
                      loading="lazy"
                    />
                  </>
                )}

                <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

                {/* Top-left badges */}
                <div className="absolute top-3 left-3 flex flex-col gap-1.5 pointer-events-none z-10">
                  {img.privacy === "private" && (
                    <div className="flex items-center gap-1.5 rounded-full bg-black/60 backdrop-blur-md px-2.5 py-1 text-xs font-medium text-zinc-200">
                      <LockKey weight="bold" />
                      Private
                    </div>
                  )}
                  {img.media_type === "video" && (
                    <div className="flex items-center gap-1.5 rounded-full bg-black/60 backdrop-blur-md px-2.5 py-1 text-xs font-semibold text-white">
                      <PlayCircle weight="fill" className="text-sm" />
                      VID
                    </div>
                  )}
                </div>

                {/* Delete button — top right */}
                <button
                  onClick={(e) => confirmDelete(e, img._id, img.title)}
                  className="absolute top-3 right-3 h-8 w-8 flex items-center justify-center rounded-full bg-rose-500/90 text-white opacity-0 group-hover:opacity-100 transition-all hover:bg-rose-600 shadow-lg hover:scale-105 z-10"
                  title="Delete image"
                >
                  <Trash weight="bold" />
                </button>

                <div className="absolute bottom-0 left-0 w-full p-4 translate-y-4 group-hover:translate-y-0 opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none">
                  <h3 className="text-zinc-50 font-medium truncate mb-1">{img.title}</h3>
                  {img.description && (
                    <p className="text-xs text-zinc-400 line-clamp-2">{img.description}</p>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Image view modal */}
      {selectedImage && (
        <ImageModal
          image={{
            ...selectedImage,
            username: data.user.username,
            profile_picture: data.user.profile_picture,
          }}
          currentUser={data.user}
          onClose={() => setSelectedImage(null)}
        />
      )}

      {/* Delete confirm modal */}
      <AnimatePresence>
        {deleteTarget && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setDeleteTarget(null)}
              className="fixed inset-0 z-[200] bg-zinc-950/80 backdrop-blur-sm"
            />
            <div className="fixed inset-0 z-[210] flex items-center justify-center p-4 pointer-events-none">
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 16 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 16 }}
                className="w-full max-w-sm bg-zinc-900 border border-zinc-800 rounded-3xl shadow-2xl pointer-events-auto p-6 flex flex-col gap-5"
              >
                {/* Header */}
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-rose-500/10">
                      <WarningCircle weight="fill" className="text-rose-500 text-xl" />
                    </div>
                    <h2 className="text-base font-semibold text-zinc-50">Delete Image</h2>
                  </div>
                  <button
                    onClick={() => setDeleteTarget(null)}
                    className="text-zinc-500 hover:text-zinc-300 transition-colors mt-0.5"
                  >
                    <X weight="bold" />
                  </button>
                </div>

                {/* Body */}
                <p className="text-sm text-zinc-400 leading-relaxed">
                  Are you sure you want to delete{" "}
                  <span className="font-medium text-zinc-200">&quot;{deleteTarget.title}&quot;</span>?
                  This action cannot be undone.
                </p>

                {/* Actions */}
                <div className="flex gap-3 justify-end pt-1">
                  <button
                    onClick={() => setDeleteTarget(null)}
                    disabled={deleting}
                    className="px-4 py-2 rounded-xl text-sm font-medium text-zinc-300 hover:text-zinc-50 hover:bg-zinc-800 transition-colors disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleDelete}
                    disabled={deleting}
                    className="flex items-center gap-2 px-5 py-2 rounded-xl bg-rose-500 text-sm font-medium text-white hover:bg-rose-400 active:scale-[0.98] transition-all disabled:opacity-50"
                  >
                    <Trash weight="bold" />
                    {deleting ? "Deleting..." : "Delete"}
                  </button>
                </div>
              </motion.div>
            </div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
