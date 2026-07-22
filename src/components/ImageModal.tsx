"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "motion/react";
import { X, DownloadSimple, PaperPlaneRight, Trash, UserCircle } from "@phosphor-icons/react";
import { authFetch } from "@/lib/auth";

interface Comment {
  _id: string;
  comment_text: string;
  user_id: string;
  username: string;
  profile_picture?: string;
  created_at: string;
}

interface ModalImage {
  _id: string;
  title: string;
  description?: string;
  image_path: string;
  username: string;
  profile_picture?: string;
  media_type?: "image" | "video";
}

interface CurrentUser {
  _id: string;
}

interface ImageModalProps {
  image: ModalImage | null;
  currentUser: CurrentUser | null;
  onClose: () => void;
}

export function ImageModal({ image, currentUser, onClose }: ImageModalProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [loadingComments, setLoadingComments] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function loadComments() {
      if (!image) {
        if (!cancelled) {
          setComments([]);
          setNewComment("");
          setLoadingComments(false);
        }
        return;
      }

      setLoadingComments(true);

      try {
        const res = await authFetch(`/api/comments?image_id=${image._id}`);
        const data = await res.json();

        if (!cancelled && data.success) {
          setComments(data.comments);
        }
      } finally {
        if (!cancelled) {
          setLoadingComments(false);
        }
      }
    }

    void loadComments();

    return () => {
      cancelled = true;
    };
  }, [image]);

  // Close on Escape — close image modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  if (!image) return null;

  const handlePostComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    try {
      const res = await authFetch("/api/comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image_id: image._id, comment_text: newComment }),
      });
      const data = await res.json();
      if (data.success) {
        setNewComment("");
        authFetch(`/api/comments?image_id=${image._id}`)
          .then((r) => r.json())
          .then((d) => d.success && setComments(d.comments));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    try {
      const res = await authFetch(`/api/comments/${commentId}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        setComments((prev) => prev.filter((c) => c._id !== commentId));
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <>
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 z-[100] bg-zinc-950/90 backdrop-blur-md flex items-center justify-center p-4"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-5xl bg-zinc-950 border border-zinc-800 rounded-2xl overflow-hidden flex flex-col md:flex-row shadow-2xl"
          style={{ height: "min(90vh, 600px)" }}
          >
            {/* Media Section */}
            <div className="flex-1 bg-zinc-900 flex items-center justify-center relative min-h-0 border-b md:border-b-0 md:border-r border-zinc-800 h-full">
              {image.media_type === "video" ? (
                <video
                  src={image.image_path}
                  controls
                  autoPlay={false}
                  className="w-full h-full object-contain max-h-[90vh]"
                  onClick={(e) => e.stopPropagation()}
                />
              ) : (
                <Image
                  src={image.image_path}
                  alt={image.title}
                  width={1200}
                  height={900}
                  className="w-full h-full object-contain max-h-[90vh]"
                  unoptimized
                />
              )}
              <button
                onClick={onClose}
                className="absolute top-4 left-4 h-10 w-10 md:hidden flex items-center justify-center rounded-full bg-black/50 text-white backdrop-blur-md"
              >
                <X weight="bold" />
              </button>
            </div>

            {/* Details Section */}
            <div className="w-full md:w-[400px] flex flex-col h-full overflow-hidden bg-zinc-950">
              <div className="flex items-center justify-between p-4 border-b border-zinc-800/50">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-zinc-800 overflow-hidden border border-zinc-700">
                    {image.profile_picture ? (
                      <Image
                        src={`/uploads/profiles/${image.profile_picture.split(/[\\/]/).pop()}`}
                        alt={`${image.username} avatar`}
                        width={40}
                        height={40}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <UserCircle weight="duotone" className="h-full w-full text-zinc-500" />
                    )}
                  </div>
                  <h3 className="text-sm font-medium text-zinc-50">{image.username}</h3>
                </div>

                <div className="flex items-center gap-2">
                  <a
                    href={image.image_path}
                    download={image.media_type === "video" ? undefined : image.title}
                    target={image.media_type === "video" ? "_blank" : undefined}
                    rel="noreferrer"
                    className="flex h-9 w-9 items-center justify-center rounded-full bg-zinc-900 text-zinc-400 hover:text-zinc-50 hover:bg-zinc-800 transition-colors"
                    title="Download"
                  >
                    <DownloadSimple weight="bold" />
                  </a>
                  <button
                    onClick={onClose}
                    className="hidden md:flex h-9 w-9 items-center justify-center rounded-full bg-zinc-900 text-zinc-400 hover:text-zinc-50 hover:bg-zinc-800 transition-colors"
                  >
                    <X weight="bold" />
                  </button>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto flex flex-col">
                {/* Title & description — always at top */}
                <div className="p-4 border-b border-zinc-800/50">
                  <h2 className="text-lg font-medium text-zinc-50 mb-2">{image.title}</h2>
                  {image.description && (
                    <p className="text-sm text-zinc-400 leading-relaxed">{image.description}</p>
                  )}
                </div>

                {/* Comments */}
                <div className="flex flex-col gap-4 p-4">
                  {loadingComments ? (
                    <div className="flex justify-center p-4">
                      <div className="h-5 w-5 animate-spin rounded-full border-2 border-zinc-600 border-t-zinc-300" />
                    </div>
                  ) : comments.length === 0 ? (
                    <div className="text-sm text-zinc-500 pt-2">
                      No comments yet. Be the first to comment!
                    </div>
                  ) : (
                  comments.map((comment) => (
                    <div key={comment._id} className="flex gap-3 group">
                      <div className="h-8 w-8 shrink-0 rounded-full bg-zinc-800 overflow-hidden">
                        {comment.profile_picture ? (
                          <Image
                            src={`/uploads/profiles/${comment.profile_picture.split(/[\\/]/).pop()}`}
                            alt={`${comment.username} avatar`}
                            width={32}
                            height={32}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center text-xs font-medium text-zinc-400">
                            {comment.username.charAt(0).toUpperCase()}
                          </div>
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-baseline gap-2 mb-0.5">
                          <span className="text-sm font-medium text-zinc-200">{comment.username}</span>
                          <span className="text-[10px] text-zinc-500">
                            {new Date(comment.created_at).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-sm text-zinc-400">{comment.comment_text}</p>
                      </div>
                      {currentUser && currentUser._id === comment.user_id && (
                        <button
                          onClick={() => handleDeleteComment(comment._id)}
                          className="opacity-0 group-hover:opacity-100 p-1 text-zinc-500 hover:text-rose-400 transition-colors shrink-0"
                        >
                          <Trash weight="bold" />
                        </button>
                      )}
                    </div>
                  ))
                )}
                </div>{/* end comments list */}
              </div>{/* end scroll area */}

              {currentUser ? (
                <div className="p-4 border-t border-zinc-800 bg-zinc-950">
                  <form onSubmit={handlePostComment} className="relative flex items-center">
                    <input
                      type="text"
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      placeholder="Add a comment..."
                      className="w-full rounded-full border border-zinc-800 bg-zinc-900 py-2.5 pl-4 pr-12 text-sm text-zinc-100 placeholder:text-zinc-500 focus:border-zinc-700 focus:outline-none focus:ring-1 focus:ring-zinc-700 transition-all"
                    />
                    <button
                      type="submit"
                      disabled={!newComment.trim()}
                      className="absolute right-2 flex h-7 w-7 items-center justify-center rounded-full bg-emerald-500 text-emerald-950 disabled:opacity-50 disabled:bg-zinc-800 disabled:text-zinc-500 transition-colors"
                    >
                      <PaperPlaneRight weight="fill" className="text-xs" />
                    </button>
                  </form>
                </div>
              ) : (
                <div className="p-4 border-t border-zinc-800 bg-zinc-950 text-center">
                  <p className="text-sm text-zinc-500">
                    <a href="/login" className="text-emerald-400 hover:underline">Log in</a> to post a comment.
                  </p>
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      </AnimatePresence>

      {/* Delete comment confirm modal */}
    </>
  );
}
