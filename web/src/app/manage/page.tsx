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
  const [successMessage, setSuccessMessage] = useState(created ? "Tracker created!" : "");
  const [verifyMessage, setVerifyMessage] = useState("");

  useEffect(() => {
    if (emailParam && tokenParam) {
      fetchTrackers(emailParam, tokenParam);
    }
  }, [emailParam, tokenParam]);

  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => setSuccessMessage(""), 3000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  const fetchTrackers = async (emailToFetch: string, token?: string) => {
    setIsLoading(true);
    setError("");

    try {
      const url = new URL("/api/trackers", window.location.origin);
      url.searchParams.set("email", emailToFetch);
      if (token) url.searchParams.set("token", token);

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

      setVerifyMessage("Check your email for the verification link.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (trackerId: string) => {
    if (!confirm("Delete this tracker?")) return;

    try {
      const response = await fetch(
        `/api/trackers?id=${trackerId}&email=${encodeURIComponent(email)}`,
        { method: "DELETE" }
      );

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to delete");
      }

      setTrackers((prev) => prev.filter((t) => t.id !== trackerId));
      setSuccessMessage("Tracker deleted");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete");
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "—";
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  };

  // Verification view
  if (!isVerified) {
    return (
      <div className="form-page">
        {/* Nav */}
        <nav className="nav" style={{ position: 'absolute' }}>
          <Link href="/" className="nav-logo nav-logo-dark">
            UCLA Class Tracker
          </Link>
          <Link href="/track" className="nav-btn nav-btn-dark">
            Track
          </Link>
        </nav>

        <div className="form-container" style={{ maxWidth: '400px' }}>
          <div className="form-card animate-fade-in" style={{ textAlign: 'center', padding: '2.5rem 2rem' }}>
            <div style={{
              width: '72px',
              height: '72px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, var(--ucla-blue) 0%, var(--ucla-dark-blue) 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1.5rem'
            }}>
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                <polyline points="22,6 12,13 2,6"/>
              </svg>
            </div>
            
            <h1 className="form-title">Manage trackers</h1>
            <p style={{ color: 'var(--text-medium)', marginBottom: '1.5rem' }}>
              Enter your email to access your trackers.
            </p>

            <form onSubmit={handleVerify}>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@ucla.edu"
                className="input"
                style={{ textAlign: 'center', marginBottom: '1rem' }}
                required
              />

              {error && (
                <div className="message message-error">
                  {error}
                </div>
              )}

              {verifyMessage && (
                <div className="message message-success">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 6L9 17l-5-5"/>
                  </svg>
                  {verifyMessage}
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="btn-solid btn-blue"
                style={{ width: '100%' }}
              >
                {isLoading ? (
                  <>
                    <span className="spinner"></span>
                    Sending...
                  </>
                ) : (
                  <>
                    Send verification link
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M5 12h14M12 5l7 7-7 7"/>
                    </svg>
                  </>
                )}
              </button>
            </form>
          </div>
        </div>

        {/* Footer */}
        <footer className="footer-simple" style={{ position: 'fixed', bottom: 0, left: 0, right: 0 }}>
          <span>Not affiliated with UCLA</span>
          <a href="https://github.com/shloakr/visualping-local" target="_blank" rel="noopener noreferrer">
            GitHub
          </a>
        </footer>
      </div>
    );
  }

  // Trackers view
  const activeTrackers = trackers.filter(t => t.is_active);

  return (
    <div className="form-page">
      {/* Nav */}
      <nav className="nav" style={{ position: 'absolute' }}>
        <Link href="/" className="nav-logo nav-logo-dark">
          UCLA Class Tracker
        </Link>
        <Link href="/track" className="nav-btn nav-btn-dark">
          Track
        </Link>
      </nav>

      <div className="form-container" style={{ maxWidth: '540px' }}>
        {/* Header Card */}
        <div className="form-card animate-fade-in" style={{ 
          padding: '1.25rem 1.5rem', 
          marginBottom: '1rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div>
            <h1 style={{ fontSize: '1.25rem', fontWeight: 700 }}>Your trackers</h1>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-light)' }}>{email}</p>
          </div>
          <Link href="/track" className="btn-solid btn-blue btn-sm">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 5v14M5 12h14"/>
            </svg>
            Add new
          </Link>
        </div>

        {successMessage && (
          <div className="message message-success animate-fade-in" style={{ marginBottom: '1rem' }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 6L9 17l-5-5"/>
            </svg>
            {successMessage}
          </div>
        )}

        {error && (
          <div className="message message-error" style={{ marginBottom: '1rem' }}>
            {error}
          </div>
        )}

        {isLoading ? (
          <div className="form-card" style={{ padding: '3rem', textAlign: 'center' }}>
            <span className="spinner" style={{ margin: '0 auto', display: 'block', color: 'var(--ucla-blue)' }}></span>
          </div>
        ) : activeTrackers.length === 0 ? (
          <div className="form-card animate-fade-in" style={{ padding: '3rem 2rem', textAlign: 'center' }}>
            <div style={{
              width: '72px',
              height: '72px',
              borderRadius: '50%',
              background: 'var(--cream)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1rem'
            }}>
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--text-light)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
                <polyline points="3.27 6.96 12 12.01 20.73 6.96"/>
                <line x1="12" y1="22.08" x2="12" y2="12"/>
              </svg>
            </div>
            <p style={{ color: 'var(--text-light)', marginBottom: '1.5rem' }}>No active trackers yet</p>
            <Link href="/track" className="btn-solid btn-gold">
              Track your first class
            </Link>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {activeTrackers.map((tracker, index) => (
              <div 
                key={tracker.id} 
                className="tracker-card animate-fade-in"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '1rem' }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem', minWidth: 0 }}>
                    <div className="tracker-icon">
                      {tracker.subject_area?.slice(0, 2) || "??"}
                    </div>
                    <div style={{ minWidth: 0 }}>
                      <div className="tracker-name" style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {tracker.class_name || "Unknown Class"}
                      </div>
                      <p className="tracker-meta">
                        {tracker.term_code ? formatTermCode(tracker.term_code) : ""}
                      </p>
                    </div>
                  </div>
                  <span className="badge badge-success" style={{ flexShrink: 0 }}>
                    <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'currentColor' }}></span>
                    Active
                  </span>
                </div>

                <div className="tracker-divider"></div>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.85rem', color: 'var(--text-light)' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="10"/>
                        <polyline points="12 6 12 12 16 14"/>
                      </svg>
                      {tracker.check_interval === 'hourly' ? 'Hourly' : tracker.check_interval === '6hours' ? 'Every 6h' : 'Daily'}
                    </span>
                    <span>·</span>
                    <span>Until {formatDate(tracker.expires_at)}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                    <a
                      href={tracker.ucla_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="icon-btn"
                      title="View on UCLA"
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
                        <polyline points="15 3 21 3 21 9"/>
                        <line x1="10" y1="14" x2="21" y2="3"/>
                      </svg>
                    </a>
                    <button
                      onClick={() => handleDelete(tracker.id)}
                      className="icon-btn icon-btn-danger"
                      title="Delete tracker"
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="3 6 5 6 21 6"/>
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="footer-simple" style={{ position: 'fixed', bottom: 0, left: 0, right: 0 }}>
        <span>Not affiliated with UCLA</span>
        <a href="https://github.com/shloakr/visualping-local" target="_blank" rel="noopener noreferrer">
          GitHub
        </a>
      </footer>
    </div>
  );
}

export default function ManagePage() {
  return (
    <Suspense fallback={
      <div className="form-page">
        <div className="form-container" style={{ maxWidth: '540px' }}>
          <div className="form-card" style={{ padding: '2rem' }}>
            <div style={{ height: '24px', background: 'var(--cream)', borderRadius: '8px', width: '40%', marginBottom: '0.5rem' }}></div>
            <div style={{ height: '16px', background: 'var(--cream)', borderRadius: '6px', width: '30%' }}></div>
          </div>
        </div>
      </div>
    }>
      <ManageContent />
    </Suspense>
  );
}
