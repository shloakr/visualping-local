"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { formatTermCode } from "@/lib/supabase";
import Link from "next/link";

interface Tracker {
  id: string;
  email: string;
  ucla_url: string;
  class_name: string | null;
  term_code: string | null;
  subject_area: string | null;
  catalog_number: string | null;
  selector: string;
  check_interval: string;
  expires_at: string | null;
  last_checked_at: string | null;
  last_change_at: string | null;
  is_active: boolean;
  created_at: string;
}

function ManageContent() {
  const searchParams = useSearchParams();
  const emailParam = searchParams.get("email");
  const tokenParam = searchParams.get("token");
  const created = searchParams.get("created");

  const [email, setEmail] = useState(emailParam || "");
  const [trackers, setTrackers] = useState<Tracker[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isVerified, setIsVerified] = useState(!!tokenParam);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState(created ? "Tracker created successfully!" : "");
  const [verifyMessage, setVerifyMessage] = useState("");

  // Auto-load trackers if we have email and token
  useEffect(() => {
    if (emailParam && tokenParam) {
      fetchTrackers(emailParam, tokenParam);
    }
  }, [emailParam, tokenParam]);

  const fetchTrackers = async (emailToFetch: string, token?: string) => {
    setIsLoading(true);
    setError("");

    try {
      const url = new URL("/api/trackers", window.location.origin);
      url.searchParams.set("email", emailToFetch);
      if (token) {
        url.searchParams.set("token", token);
      }

      const response = await fetch(url.toString());
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to fetch trackers");
      }

      setTrackers(data.trackers);
      setIsVerified(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setIsVerified(false);
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    setVerifyMessage("");

    try {
      const response = await fetch("/api/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to send verification");
      }

      setVerifyMessage(data.message || "Verification email sent! Check your inbox.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (trackerId: string) => {
    if (!confirm("Are you sure you want to delete this tracker?")) {
      return;
    }

    try {
      const response = await fetch(
        `/api/trackers?id=${trackerId}&email=${encodeURIComponent(email)}`,
        { method: "DELETE" }
      );

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to delete tracker");
      }

      setTrackers((prev) => prev.filter((t) => t.id !== trackerId));
      setSuccessMessage("Tracker deleted successfully!");
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete tracker");
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "Never";
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // If not verified, show verification form
  if (!isVerified) {
    return (
      <div className="max-w-md mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold mb-2">Manage Your Trackers</h1>
        <p className="text-[var(--muted)] mb-8">
          Enter your email to receive a verification link.
        </p>

        <form onSubmit={handleVerify} className="space-y-4">
          <div>
            <label htmlFor="email" className="block font-medium mb-2">
              Email Address
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@ucla.edu"
              className="input-field"
              required
            />
            <p className="mt-1 text-sm text-[var(--muted)]">
              We&apos;ll send a verification link using your saved Resend API key.
            </p>
          </div>

          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 text-red-700 dark:text-red-300">
              {error}
            </div>
          )}

          {verifyMessage && (
            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
              <p className="text-green-700 dark:text-green-300">{verifyMessage}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="btn-primary w-full py-3 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? "Sending..." : "Send Verification Email"}
          </button>
        </form>
      </div>
    );
  }

  // Verified - show trackers
  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-1">Your Trackers</h1>
          <p className="text-[var(--muted)]">{email}</p>
        </div>
        <Link href="/track" className="btn-primary">
          + Add New Tracker
        </Link>
      </div>

      {successMessage && (
        <div className="mb-6 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4 text-green-700 dark:text-green-300">
          {successMessage}
        </div>
      )}

      {error && (
        <div className="mb-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 text-red-700 dark:text-red-300">
          {error}
        </div>
      )}

      {isLoading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--ucla-blue)] mx-auto"></div>
          <p className="mt-4 text-[var(--muted)]">Loading trackers...</p>
        </div>
      ) : trackers.length === 0 ? (
        <div className="card text-center py-12">
          <div className="text-4xl mb-4">📭</div>
          <h2 className="text-xl font-semibold mb-2">No Trackers Yet</h2>
          <p className="text-[var(--muted)] mb-4">
            You haven&apos;t set up any class trackers yet.
          </p>
          <Link href="/track" className="btn-primary inline-block">
            Track Your First Class
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {trackers.filter(t => t.is_active).map((tracker) => (
            <div key={tracker.id} className="card">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-lg truncate">
                    {tracker.class_name || "Unknown Class"}
                  </h3>
                  <p className="text-[var(--muted)] text-sm">
                    {tracker.term_code ? formatTermCode(tracker.term_code) : "Unknown Term"}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                    tracker.is_active 
                      ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300"
                      : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400"
                  }`}>
                    {tracker.is_active ? "Active" : "Inactive"}
                  </span>
                </div>
              </div>

              <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <span className="text-[var(--muted)]">Check Frequency</span>
                  <p className="font-medium capitalize">{tracker.check_interval}</p>
                </div>
                <div>
                  <span className="text-[var(--muted)]">Last Checked</span>
                  <p className="font-medium">{formatDate(tracker.last_checked_at)}</p>
                </div>
                <div>
                  <span className="text-[var(--muted)]">Last Change</span>
                  <p className="font-medium">{formatDate(tracker.last_change_at)}</p>
                </div>
                <div>
                  <span className="text-[var(--muted)]">Expires</span>
                  <p className="font-medium">{tracker.expires_at ? formatDate(tracker.expires_at) : "Never"}</p>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-[var(--border)] flex items-center justify-between">
                <a
                  href={tracker.ucla_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[var(--ucla-blue)] hover:underline text-sm"
                >
                  View on UCLA SOC →
                </a>
                <button
                  onClick={() => handleDelete(tracker.id)}
                  className="text-red-600 hover:text-red-700 text-sm font-medium"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function ManagePage() {
  return (
    <Suspense fallback={
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-8"></div>
          <div className="h-32 bg-gray-200 rounded"></div>
        </div>
      </div>
    }>
      <ManageContent />
    </Suspense>
  );
}
