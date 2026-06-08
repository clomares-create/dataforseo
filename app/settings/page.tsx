"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

export default function SettingsPage() {
  const [login, setLogin] = useState("");
  const [password, setPassword] = useState("");
  const [hasPassword, setHasPassword] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const [cacheCount, setCacheCount] = useState<number | null>(null);
  const [clearingCache, setClearingCache] = useState(false);

  useEffect(() => {
    fetch("/api/settings")
      .then((r) => r.json())
      .then((d) => {
        setLogin(d.login ?? "");
        setHasPassword(d.hasPassword ?? false);
        setLoading(false);
      })
      .catch(() => setLoading(false));

    fetch("/api/cache")
      .then((r) => r.json())
      .then((d) => setCacheCount(d.count ?? 0))
      .catch(() => {});
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!login || !password) return;
    setSaving(true);
    setStatus("idle");
    try {
      const res = await fetch("/api/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ login, password }),
      });
      const data = await res.json();
      if (data.ok) {
        setStatus("success");
        setHasPassword(true);
        setPassword("");
      } else {
        setStatus("error");
        setErrorMsg(data.error ?? "Erreur inconnue");
      }
    } catch {
      setStatus("error");
      setErrorMsg("Erreur réseau");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#F5F0E8" }}>
      <header style={{ backgroundColor: "#1a2e1a" }} className="px-8 py-5 flex items-center justify-between">
        <Link href="/" className="text-white text-xl font-semibold tracking-tight">
          ← DataForSEO Dashboard
        </Link>
      </header>

      <main className="max-w-lg mx-auto px-6 py-16">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Paramètres API</h1>
        <p className="text-gray-500 mb-8 text-sm">
          Tes credentials DataForSEO sont stockés de façon sécurisée dans la base de données.
        </p>

        {loading ? (
          <div className="text-gray-400 text-sm">Chargement…</div>
        ) : (
          <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Login DataForSEO
              </label>
              <input
                type="email"
                value={login}
                onChange={(e) => setLogin(e.target.value)}
                placeholder="ton@email.com"
                className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-700"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Password DataForSEO
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={hasPassword ? "••••••••  (laisser vide pour conserver)" : "Mot de passe"}
                className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-700"
                required={!hasPassword}
              />
              {hasPassword && (
                <p className="text-xs text-green-700 mt-1">✓ Un mot de passe est déjà enregistré</p>
              )}
            </div>

            {status === "success" && (
              <div className="bg-green-50 border border-green-200 rounded-lg px-4 py-3 text-sm text-green-800">
                ✓ Credentials sauvegardés avec succès
              </div>
            )}
            {status === "error" && (
              <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-sm text-red-800">
                Erreur : {errorMsg}
              </div>
            )}

            <button
              type="submit"
              disabled={saving || !login || (!password && !hasPassword)}
              style={{ backgroundColor: "#1a2e1a" }}
              className="w-full text-white rounded-lg py-2.5 text-sm font-medium hover:opacity-90 disabled:opacity-40 transition-opacity"
            >
              {saving ? "Enregistrement…" : "Sauvegarder"}
            </button>
          </form>
        )}

        <div className="mt-8 bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-1">
            <div>
              <h2 className="text-sm font-medium text-gray-700">Cache API</h2>
              <p className="text-xs text-gray-400 mt-0.5">
                {cacheCount === null ? "Chargement…" : `${cacheCount} entrée${cacheCount !== 1 ? "s" : ""} en cache · TTL 7 jours`}
              </p>
            </div>
            <button
              onClick={async () => {
                setClearingCache(true);
                await fetch("/api/cache", { method: "DELETE" });
                setCacheCount(0);
                setClearingCache(false);
              }}
              disabled={clearingCache || cacheCount === 0}
              className="text-sm text-red-500 hover:text-red-700 disabled:opacity-40 transition-colors"
            >
              {clearingCache ? "Suppression…" : "Vider le cache"}
            </button>
          </div>
          <p className="text-xs text-gray-400 mt-3">
            Le cache évite de rappeler l&apos;API pour les mêmes domaines/périodes.
            Vide-le si tu veux forcer un refresh des données.
          </p>
        </div>

        <p className="text-xs text-gray-400 mt-6 text-center">
          Les credentials sont stockés dans Turso (chiffrement en transit TLS).
          Ils ne sont jamais exposés côté client.
        </p>
      </main>
    </div>
  );
}
