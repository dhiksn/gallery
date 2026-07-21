"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Image as ImageIcon, LockKey, PlayCircle } from "@phosphor-icons/react";
import { authFetch } from "@/lib/auth";

interface ImageItem {
  _id: string;
  title: string;
  description: string;
  image_path: string;
  user_id: string;
  username: string;
  profile_picture?: string;
  privacy: "public" | "private";
  media_type?: "image" | "video";
}

import { ImageModal } from "@/components/ImageModal";

export default function Home() {
  const [images, setImages] = useState<ImageItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [selectedImage, setSelectedImage] = useState<any>(null);

  useEffect(() => {
    authFetch("/api/auth/me")
      .then((res) => res.json())
      .then((data) => data.success && setCurrentUser(data.user))
      .catch(() => {});

    authFetch("/api/images")
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setImages(data.images);
        }
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex h-[50vh] w-full items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-zinc-600 border-t-zinc-300" />
      </div>
    );
  }

  if (images.length === 0) {
    return (
      <div className="flex h-[50vh] w-full flex-col items-center justify-center gap-4 text-zinc-500">
        <ImageIcon weight="duotone" className="text-6xl" />
        <p>No images found. Be the first to upload.</p>
      </div>
    );
  }

  return (
    <div className="mt-8">
      <div className="columns-1 gap-6 sm:columns-2 lg:columns-3 xl:columns-4 2xl:columns-5 space-y-6">
        <AnimatePresence>
          {images.map((img, i) => (
            <motion.div
              key={img._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: (i % 10) * 0.05, duration: 0.4 }}
              onClick={() => setSelectedImage(img)}
              className="break-inside-avoid relative group cursor-zoom-in rounded-2xl bg-zinc-900 overflow-hidden"
            >
              {img.media_type === "video" ? (
                <video
                  src={img.image_path}
                  className="w-full object-cover transition-transform duration-500"
                  muted
                  playsInline
                  preload="metadata"
                />
              ) : (
                <img
                  src={img.image_path}
                  alt={img.title}
                  className="w-full object-cover"
                  loading="lazy"
                />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/90 via-zinc-950/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
              
              {/* Media type badge */}
              <div className="absolute top-3 right-3 pointer-events-none">
                {img.media_type === "video" ? (
                  <div className="flex items-center gap-1.5 rounded-full bg-black/60 backdrop-blur-md px-2.5 py-1 text-xs font-semibold text-white">
                    <PlayCircle weight="fill" className="text-sm" />
                    VID
                  </div>
                ) : null}
              </div>

              <div className="absolute bottom-0 left-0 w-full p-4 translate-y-4 group-hover:translate-y-0 opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none">
                <div className="flex items-center gap-2 mb-1">
                  {img.privacy === "private" && (
                    <LockKey weight="bold" className="text-zinc-400" />
                  )}
                  <h3 className="text-zinc-50 font-medium truncate">{img.title}</h3>
                </div>
                
                <div className="flex items-center gap-2 mt-3">
                  <div className="h-6 w-6 rounded-full overflow-hidden bg-zinc-800">
                    {img.profile_picture ? (
                      <img src={`/uploads/profiles/${img.profile_picture.split(/[\\/]/).pop()}`} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-[10px] font-bold text-zinc-400">
                        {img.username.charAt(0).toUpperCase()}
                      </div>
                    )}
                  </div>
                  <span className="text-xs text-zinc-400">{img.username}</span>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {selectedImage && (
        <ImageModal
          image={selectedImage}
          currentUser={currentUser}
          onClose={() => setSelectedImage(null)}
        />
      )}
    </div>
  );
}
