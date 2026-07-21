"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { CloudArrowUp, Globe, LockKey, ArrowLeft, Image as ImageIcon, X } from "@phosphor-icons/react";
import Link from "next/link";
import { motion, AnimatePresence } from "motion/react";
import { authFetch } from "@/lib/auth";

export default function UploadPage() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [privacy, setPrivacy] = useState<"public" | "private">("public");
  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [isDragOver, setIsDragOver] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    authFetch("/api/auth/me")
      .then((res) => res.json())
      .then((data) => {
        if (!data.success) {
          router.push("/login");
        } else {
          setAuthLoading(false);
        }
      })
      .catch(() => router.push("/login"));
  }, [router]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement> | { target: { files: FileList | null } }) => {
    if (e.target.files && e.target.files.length > 0) {
      const selectedFiles = Array.from(e.target.files);
      setFiles((prev) => [...prev, ...selectedFiles]);
      
      const newPreviews = selectedFiles.map(file => URL.createObjectURL(file));
      setPreviews((prev) => [...prev, ...newPreviews]);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files) {
      handleFileChange({ target: { files: e.dataTransfer.files } });
    }
  };

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
    setPreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (files.length === 0) {
      setError("Please select at least one image");
      return;
    }

    setLoading(true);
    setError("");

    const formData = new FormData();
    formData.append("title", title);
    formData.append("description", description);
    formData.append("privacy", privacy);
    files.forEach(file => formData.append("images", file));

    try {
      const res = await authFetch("/api/images/upload", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      
      if (data.success) {
        router.push("/profile");
      } else {
        setError(data.errors?.join(", ") || data.error || "Upload failed");
      }
    } catch (err) {
      setError("Network error occurred");
    } finally {
      setLoading(false);
    }
  };

  if (authLoading) {
    return (
      <div className="flex h-[50vh] w-full items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-zinc-600 border-t-zinc-300" />
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-64px)] w-full">
      <form id="upload-form" onSubmit={handleSubmit} className="flex flex-col lg:flex-row h-full">
        
        {/* Left Column: Dropzone & Previews */}
        <div className="flex-1 p-6 lg:p-12 lg:border-r border-zinc-800/50 flex flex-col relative min-h-[50vh] lg:min-h-[calc(100vh-64px)]">

          <div
            onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
            onDragLeave={() => setIsDragOver(false)}
            onDrop={handleDrop}
            className={`flex-1 w-full h-full rounded-3xl border-2 border-dashed transition-all duration-300 flex flex-col overflow-hidden relative ${
              isDragOver 
                ? "border-emerald-500 bg-emerald-500/5 scale-[0.99]" 
                : files.length > 0 
                  ? "border-zinc-800/50 bg-zinc-950" 
                  : "border-zinc-800 hover:border-zinc-700 hover:bg-zinc-900/30 bg-zinc-900/10 cursor-pointer"
            }`}
            onClick={() => { if (files.length === 0) fileInputRef.current?.click(); }}
          >
            <input
              type="file"
              ref={fileInputRef}
              multiple
              accept="image/*,video/*"
              onChange={handleFileChange}
              className="hidden"
            />
            
            {previews.length === 0 ? (
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <div className="h-24 w-24 rounded-full bg-zinc-900 flex items-center justify-center mb-6 shadow-2xl shadow-emerald-500/10 border border-zinc-800">
                  <CloudArrowUp weight="duotone" className="text-4xl text-emerald-500" />
                </div>
                <h3 className="text-xl font-medium text-zinc-200 mb-2">Drag and drop your files</h3>
                <p className="text-zinc-500 text-sm">Or click anywhere to browse your files</p>
                <div className="mt-8 flex items-center gap-4 text-xs text-zinc-600 font-medium">
                  <span className="flex items-center gap-1"><ImageIcon /> HIGH RES</span>
                  <span className="flex items-center gap-1">• JPG, PNG, WEBP</span>
                  <span className="flex items-center gap-1">• MP4, MOV, WEBM</span>
                  <span className="flex items-center gap-1">• MAX 500MB</span>
                </div>
              </div>
            ) : (
              <div className="w-full h-full p-6 overflow-y-auto">
                <div className="columns-2 md:columns-3 gap-4 space-y-4">
                  <AnimatePresence>
                    {previews.map((preview, idx) => (
                      <motion.div 
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        key={idx} 
                        className="relative group rounded-2xl overflow-hidden bg-zinc-900 border border-zinc-800 break-inside-avoid"
                      >
                        {files[idx]?.type.startsWith("video/") ? (
                          <video src={preview} className="w-full h-auto object-cover" muted playsInline />
                        ) : (
                          <img src={preview} alt="Preview" className="w-full h-auto object-cover" />
                        )}
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-[2px]" />
                        <button
                          type="button"
                          onClick={(e) => { e.stopPropagation(); removeFile(idx); }}
                          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-12 w-12 flex items-center justify-center rounded-full bg-rose-500 text-white opacity-0 group-hover:opacity-100 transition-all hover:bg-rose-600 hover:scale-110 shadow-xl"
                        >
                          <X weight="bold" className="text-xl" />
                        </button>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
                
                <div className="mt-8 flex justify-center pb-12">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="flex items-center gap-2 rounded-full border border-zinc-700 bg-zinc-800/50 px-6 py-3 text-sm font-medium text-zinc-300 hover:bg-zinc-700 hover:text-zinc-50 transition-colors backdrop-blur-md"
                  >
                    <CloudArrowUp weight="bold" />
                    Add More Images
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Details & Settings */}
        <div className="w-full lg:w-[480px] bg-zinc-950 p-8 lg:p-12 flex flex-col lg:sticky top-16 h-auto lg:h-[calc(100vh-64px)] overflow-y-auto">
          <div className="mb-10">
            <h2 className="text-2xl font-medium tracking-tight text-zinc-50 mb-2">Publish Details</h2>
            <p className="text-sm text-zinc-500">Provide metadata to help others discover your work.</p>
          </div>

          <div className="flex flex-col gap-8 flex-1">
            {error && (
              <div className="rounded-xl border border-rose-900 bg-rose-950/30 p-4 text-sm text-rose-400">
                {error}
              </div>
            )}

            <div className="flex flex-col gap-3">
              <label className="text-sm font-medium text-zinc-300">Title</label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full bg-transparent border-b-2 border-zinc-800 py-3 text-lg text-zinc-50 placeholder:text-zinc-700 focus:border-emerald-500 focus:outline-none transition-colors"
                placeholder="A descriptive title..."
              />
            </div>

            <div className="flex flex-col gap-3">
              <label className="text-sm font-medium text-zinc-300">Description</label>
              <textarea
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full rounded-2xl border border-zinc-800 bg-zinc-900/50 px-4 py-4 text-sm text-zinc-100 placeholder:text-zinc-600 focus:border-zinc-600 focus:outline-none focus:ring-1 focus:ring-zinc-600 transition-all resize-none"
                placeholder="Tell the story behind this shot..."
              />
            </div>

            <div className="flex flex-col gap-4">
              <label className="text-sm font-medium text-zinc-300">Visibility</label>
              <div className="grid grid-cols-2 gap-4">
                <label className={`flex flex-col gap-2 p-4 rounded-2xl border cursor-pointer transition-all ${privacy === "public" ? "border-emerald-500 bg-emerald-500/5" : "border-zinc-800 bg-zinc-900/50 hover:bg-zinc-800"}`}>
                  <div className="flex items-center justify-between">
                    <Globe weight={privacy === "public" ? "duotone" : "regular"} className={`text-2xl ${privacy === "public" ? "text-emerald-500" : "text-zinc-400"}`} />
                    <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${privacy === "public" ? "border-emerald-500" : "border-zinc-700"}`}>
                      {privacy === "public" && <div className="w-2 h-2 rounded-full bg-emerald-500" />}
                    </div>
                  </div>
                  <div className="mt-2">
                    <div className={`text-sm font-medium ${privacy === "public" ? "text-emerald-500" : "text-zinc-300"}`}>Public</div>
                    <div className="text-xs text-zinc-500 mt-1">Visible to everyone on the platform.</div>
                  </div>
                  <input type="radio" className="hidden" checked={privacy === "public"} onChange={() => setPrivacy("public")} />
                </label>

                <label className={`flex flex-col gap-2 p-4 rounded-2xl border cursor-pointer transition-all ${privacy === "private" ? "border-emerald-500 bg-emerald-500/5" : "border-zinc-800 bg-zinc-900/50 hover:bg-zinc-800"}`}>
                  <div className="flex items-center justify-between">
                    <LockKey weight={privacy === "private" ? "duotone" : "regular"} className={`text-2xl ${privacy === "private" ? "text-emerald-500" : "text-zinc-400"}`} />
                    <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${privacy === "private" ? "border-emerald-500" : "border-zinc-700"}`}>
                      {privacy === "private" && <div className="w-2 h-2 rounded-full bg-emerald-500" />}
                    </div>
                  </div>
                  <div className="mt-2">
                    <div className={`text-sm font-medium ${privacy === "private" ? "text-emerald-500" : "text-zinc-300"}`}>Private</div>
                    <div className="text-xs text-zinc-500 mt-1">Only visible to you on your profile.</div>
                  </div>
                  <input type="radio" className="hidden" checked={privacy === "private"} onChange={() => setPrivacy("private")} />
                </label>
              </div>
            </div>
          </div>

          <div className="pt-8 mt-auto border-t border-zinc-800/50">
            <button
              type="submit"
              disabled={loading || files.length === 0}
              className="w-full flex items-center justify-center gap-2 rounded-2xl bg-zinc-100 px-6 py-4 text-sm font-medium text-zinc-950 hover:bg-zinc-300 active:scale-[0.98] transition-all disabled:opacity-50 disabled:active:scale-100"
            >
              {loading ? "Publishing..." : `Publish ${files.length > 0 ? files.length : ''} File${files.length > 1 ? 's' : ''}`}
              {!loading && <CloudArrowUp weight="bold" className="text-lg" />}
            </button>
          </div>
        </div>

      </form>
    </div>
  );
}
