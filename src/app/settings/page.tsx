"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { GearSix, Key, Trash, WarningCircle } from "@phosphor-icons/react";
import { authFetch, removeToken } from "@/lib/auth";

export default function SettingsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<{ username: string; email: string } | null>(null);

  const [passwordForm, setPasswordForm] = useState({
    current_password: "",
    new_password: "",
    confirm_password: "",
  });
  const [deletePassword, setDeletePassword] = useState("");

  const [passwordSaving, setPasswordSaving] = useState(false);
  const [deleteSaving, setDeleteSaving] = useState(false);
  const [passwordMessage, setPasswordMessage] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [deleteError, setDeleteError] = useState("");

  useEffect(() => {
    authFetch("/api/auth/me")
      .then((res) => res.json())
      .then((data) => {
        if (!data.success || !data.user) {
          router.push("/login");
          return;
        }

        setUser({
          username: data.user.username || "",
          email: data.user.email || "",
        });
      })
      .finally(() => setLoading(false));
  }, [router]);

  const handleChangePassword = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setPasswordSaving(true);
    setPasswordMessage("");
    setPasswordError("");

    try {
      const res = await authFetch("/api/profile/password", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(passwordForm),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setPasswordError(data.error || "Gagal mengubah password");
        return;
      }

      setPasswordMessage(data.message || "Password berhasil diubah");
      setPasswordForm({
        current_password: "",
        new_password: "",
        confirm_password: "",
      });
    } catch {
      setPasswordError("Terjadi gangguan jaringan");
    } finally {
      setPasswordSaving(false);
    }
  };

  const handleDeleteAccount = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setDeleteSaving(true);
    setDeleteError("");

    try {
      const res = await authFetch("/api/profile", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ password: deletePassword }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setDeleteError(data.error || "Gagal menghapus akun");
        return;
      }

      removeToken();
      window.alert("Akun berhasil dihapus.");
      window.location.href = "/";
    } catch {
      setDeleteError("Terjadi gangguan jaringan");
    } finally {
      setDeleteSaving(false);
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
    <div className="mx-auto mt-12 mb-24 max-w-[1100px]">
      <div className="mb-8">
        <div>
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-zinc-800 bg-zinc-900/70 px-4 py-2 text-xs uppercase tracking-[0.18em] text-zinc-400">
            <GearSix weight="bold" />
            Settings
          </div>
          <h1 className="text-3xl font-medium tracking-tight text-zinc-50">Pengaturan akun</h1>
          <p className="mt-2 text-sm text-zinc-400">
            Kelola keamanan akun dan tindakan sensitif untuk profil {user?.username}.
          </p>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-[1.3fr_0.9fr]">
        <section className="rounded-3xl border border-zinc-800 bg-zinc-900/50 p-8 shadow-xl">
          <div className="mb-8 flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-400">
              <Key weight="bold" className="text-2xl" />
            </div>
            <div>
              <h2 className="text-xl font-medium text-zinc-50">Edit password</h2>
              <p className="text-sm text-zinc-500">Gunakan password baru yang berbeda dari password lama.</p>
            </div>
          </div>

          <form onSubmit={handleChangePassword} className="flex flex-col gap-6">
            {passwordMessage && (
              <div className="rounded-2xl border border-emerald-900 bg-emerald-950/30 p-4 text-sm text-emerald-400">
                {passwordMessage}
              </div>
            )}

            {passwordError && (
              <div className="rounded-2xl border border-rose-900 bg-rose-950/30 p-4 text-sm text-rose-400">
                {passwordError}
              </div>
            )}

            <div className="flex flex-col gap-3">
              <label className="text-sm font-medium text-zinc-300">Password saat ini</label>
              <input
                type="password"
                value={passwordForm.current_password}
                onChange={(e) => setPasswordForm({ ...passwordForm, current_password: e.target.value })}
                className="w-full rounded-2xl border border-zinc-800 bg-zinc-950/60 px-4 py-3 text-sm text-zinc-100 placeholder:text-zinc-600 focus:border-zinc-600 focus:outline-none focus:ring-1 focus:ring-zinc-600"
                placeholder="Masukkan password saat ini"
              />
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <div className="flex flex-col gap-3">
                <label className="text-sm font-medium text-zinc-300">Password baru</label>
                <input
                  type="password"
                  value={passwordForm.new_password}
                  onChange={(e) => setPasswordForm({ ...passwordForm, new_password: e.target.value })}
                  className="w-full rounded-2xl border border-zinc-800 bg-zinc-950/60 px-4 py-3 text-sm text-zinc-100 placeholder:text-zinc-600 focus:border-zinc-600 focus:outline-none focus:ring-1 focus:ring-zinc-600"
                  placeholder="Minimal 6 karakter"
                />
              </div>

              <div className="flex flex-col gap-3">
                <label className="text-sm font-medium text-zinc-300">Konfirmasi password baru</label>
                <input
                  type="password"
                  value={passwordForm.confirm_password}
                  onChange={(e) => setPasswordForm({ ...passwordForm, confirm_password: e.target.value })}
                  className="w-full rounded-2xl border border-zinc-800 bg-zinc-950/60 px-4 py-3 text-sm text-zinc-100 placeholder:text-zinc-600 focus:border-zinc-600 focus:outline-none focus:ring-1 focus:ring-zinc-600"
                  placeholder="Ulangi password baru"
                />
              </div>
            </div>

            <div className="flex justify-end border-t border-zinc-800/60 pt-6">
              <button
                type="submit"
                disabled={passwordSaving}
                className="rounded-2xl bg-emerald-500 px-6 py-3 text-sm font-medium text-emerald-950 transition-all hover:bg-emerald-400 disabled:opacity-50"
              >
                {passwordSaving ? "Menyimpan..." : "Simpan password baru"}
              </button>
            </div>
          </form>
        </section>

        <section className="rounded-3xl border border-rose-900/50 bg-rose-950/10 p-8 shadow-xl">
          <div className="mb-6 flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-500/10 text-rose-400">
              <Trash weight="bold" className="text-2xl" />
            </div>
            <div>
              <h2 className="text-xl font-medium text-zinc-50">Delete akun</h2>
              <p className="text-sm text-zinc-500">Tindakan ini permanen dan tidak bisa dibatalkan.</p>
            </div>
          </div>

          <div className="mb-6 rounded-2xl border border-rose-900/50 bg-zinc-950/50 p-4 text-sm text-zinc-400">
            <div className="mb-2 flex items-center gap-2 text-rose-400">
              <WarningCircle weight="fill" />
              Perhatian
            </div>
            <p>
              Semua foto, komentar, dan data profil yang terhubung ke akun ini akan ikut terhapus.
            </p>
          </div>

          <form onSubmit={handleDeleteAccount} className="flex flex-col gap-4">
            {deleteError && (
              <div className="rounded-2xl border border-rose-900 bg-rose-950/30 p-4 text-sm text-rose-400">
                {deleteError}
              </div>
            )}

            <div className="flex flex-col gap-3">
              <label className="text-sm font-medium text-zinc-300">Konfirmasi dengan password</label>
              <input
                type="password"
                value={deletePassword}
                onChange={(e) => setDeletePassword(e.target.value)}
                className="w-full rounded-2xl border border-zinc-800 bg-zinc-950/60 px-4 py-3 text-sm text-zinc-100 placeholder:text-zinc-600 focus:border-rose-700 focus:outline-none focus:ring-1 focus:ring-rose-700"
                placeholder="Masukkan password akun"
              />
            </div>

            <button
              type="submit"
              disabled={deleteSaving}
              onClick={(e) => {
                if (!window.confirm("Yakin ingin menghapus akun ini secara permanen?")) {
                  e.preventDefault();
                }
              }}
              className="mt-2 rounded-2xl bg-rose-500 px-6 py-3 text-sm font-medium text-white transition-all hover:bg-rose-400 disabled:opacity-50"
            >
              {deleteSaving ? "Menghapus akun..." : "Delete akun sekarang"}
            </button>
          </form>
        </section>
      </div>
    </div>
  );
}
