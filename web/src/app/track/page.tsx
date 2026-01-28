"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { parseUclaUrl, formatTermCode, generateClassName } from "@/lib/supabase";

interface ParsedClass {
  termCode: string;
  subjectArea: string;
  catalogNumber: string;
  classId: string;
}

export default function TrackPage() {
  const router = useRouter();
  const [url, setUrl] = useState("");
  const [email, setEmail] = useState("");
  const [resendKey, setResendKey] = useState("");
  const [expiresAt, setExpiresAt] = useState("");
  const [checkInterval, setCheckInterval] = useState<"hourly" | "6hours" | "daily">("hourly");
  
  const [parsedClass, setParsedClass] = useState<ParsedClass | null>(null);
  const [urlError, setUrlError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [showUrlHelp, setShowUrlHelp] = useState(false);

  useEffect(() => {
    if (!url.trim()) {
      setParsedClass(null);
      setUrlError("");
      return;
    }

    const parsed = parseUclaUrl(url);
    if (parsed) {
      setParsedClass(parsed);
      setUrlError("");
    } else {
      setParsedClass(null);
      if (url.length > 20) {
        setUrlError("This doesn't look like a UCLA class URL");
      }
    }
  }, [url]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!parsedClass) {
      setUrlError("Please enter a valid UCLA class URL");
      return;
    }

    if (!email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
      setSubmitError("Please enter a valid email address");
      return;
    }

    if (!resendKey || !resendKey.startsWith("re_")) {
      setSubmitError("Resend API key should start with 're_'");
      return;
    }

    if (!expiresAt) {
      setSubmitError("Please set an end date");
      return;
    }

    setIsSubmitting(true);
    setSubmitError("");

    try {
      const response = await fetch("/api/trackers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          resendApiKey: resendKey,
          uclaUrl: url,
          className: generateClassName(parsedClass),
          termCode: parsedClass.termCode,
          subjectArea: parsedClass.subjectArea,
          catalogNumber: parsedClass.catalogNumber,
          checkInterval,
          expiresAt,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to create tracker");
      }

      setSubmitSuccess(true);
      
      setTimeout(() => {
        router.push(`/manage?email=${encodeURIComponent(email)}&created=true`);
      }, 1500);
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : "Something went wrong");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitSuccess) {
    return (
      <div className="form-page">
        {/* Nav */}
        <nav className="nav" style={{ position: 'absolute' }}>
          <Link href="/" className="nav-logo nav-logo-dark">
            UCLA Class Tracker
          </Link>
        </nav>

        <div className="form-container" style={{ paddingTop: '2rem' }}>
          <div className="form-card animate-fade-in" style={{ textAlign: 'center', padding: '3.5rem 2.5rem' }}>
            <div style={{
              width: '88px',
              height: '88px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1.75rem',
              boxShadow: '0 8px 32px rgba(34, 197, 94, 0.3)'
            }}>
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 6L9 17l-5-5"/>
              </svg>
            </div>
            <h1 className="form-title" style={{ marginBottom: '0.625rem' }}>You&apos;re all set!</h1>
            <p style={{ color: 'var(--text-medium)', fontSize: '0.95rem', lineHeight: 1.6 }}>
              We&apos;ll email you when the enrollment status changes.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="form-page">
      {/* Nav */}
      <nav className="nav" style={{ position: 'absolute' }}>
        <Link href="/" className="nav-logo nav-logo-dark">
          UCLA Class Tracker
        </Link>
        <Link href="/manage" className="nav-btn nav-btn-dark">
          Manage
        </Link>
      </nav>

      <div className="form-container" style={{ maxWidth: '480px' }}>
        {/* Header */}
        <div className="form-header animate-fade-in">
          <h1 className="form-title">Track a class</h1>
          <p className="form-subtitle" style={{ fontSize: '0.95rem' }}>Get notified when enrollment status changes.</p>
        </div>

        {/* Form Card */}
        <div className="form-card animate-fade-in delay-1">
          <form onSubmit={handleSubmit}>
            {/* UCLA URL */}
            <div className="form-group">
              <label htmlFor="url" className="label">Class URL</label>
              <input
                id="url"
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://sa.ucla.edu/ro/Public/SOC/..."
                className={`input ${urlError ? 'input-error' : ''}`}
                style={{ fontFamily: 'var(--font-geist-mono)', fontSize: '0.875rem' }}
                required
              />
              
              {urlError && (
                <p style={{ fontSize: '0.85rem', color: 'var(--error)', marginTop: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10"/>
                    <line x1="12" y1="8" x2="12" y2="12"/>
                    <line x1="12" y1="16" x2="12.01" y2="16"/>
                  </svg>
                  {urlError}
                </p>
              )}

              {parsedClass && (
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '0.5rem', 
                  marginTop: '0.75rem',
                  fontSize: '0.9rem',
                  padding: '0.625rem 0.875rem',
                  background: '#F0FDF4',
                  borderRadius: '10px',
                  border: '1px solid #BBF7D0'
                }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="10" fill="#22c55e"/>
                    <path d="M8 12l3 3 5-6" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  <span style={{ fontWeight: 600, color: '#16A34A' }}>{generateClassName(parsedClass)}</span>
                  <span style={{ color: '#4ade80' }}>·</span>
                  <span style={{ color: '#16A34A', opacity: 0.8 }}>{formatTermCode(parsedClass.termCode)}</span>
                </div>
              )}

              <button
                type="button"
                onClick={() => setShowUrlHelp(!showUrlHelp)}
                className="link"
                style={{ 
                  marginTop: '0.75rem', 
                  fontSize: '0.85rem',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: 0
                }}
              >
                {showUrlHelp ? 'Hide help' : 'How do I get this URL?'}
              </button>

              {showUrlHelp && (
                <div style={{
                  marginTop: '0.75rem',
                  padding: '1.125rem',
                  background: 'var(--cream)',
                  borderRadius: '12px',
                  fontSize: '0.875rem',
                  color: 'var(--text-medium)',
                  border: '1px solid var(--cream-dark)'
                }}>
                  <ol style={{ paddingLeft: '1.25rem', margin: 0, lineHeight: 1.9 }}>
                    <li>Go to <a href="https://sa.ucla.edu/ro/Public/SOC/Results" target="_blank" rel="noopener noreferrer" className="link">UCLA Schedule of Classes</a></li>
                    <li>Search for your class</li>
                    <li>Click on the lecture (e.g., &quot;Lec 1&quot;)</li>
                    <li>Copy the URL from your browser</li>
                  </ol>
                </div>
              )}
            </div>

            {/* Email */}
            <div className="form-group">
              <label htmlFor="email" className="label">Email</label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@ucla.edu"
                className="input"
                required
              />
            </div>

            {/* Resend Key */}
            <div className="form-group">
              <label htmlFor="resendKey" className="label">Resend API Key</label>
              <input
                id="resendKey"
                type="password"
                value={resendKey}
                onChange={(e) => setResendKey(e.target.value)}
                placeholder="re_..."
                className="input"
                style={{ fontFamily: 'var(--font-geist-mono)', fontSize: '0.875rem' }}
                required
              />
              <p className="helper-text" style={{ marginTop: '0.5rem' }}>
                Free at <a href="https://resend.com/api-keys" target="_blank" rel="noopener noreferrer" className="link">resend.com</a>
              </p>
            </div>

            {/* Check Interval & Expiry */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="form-group">
                <label htmlFor="interval" className="label">Check every</label>
                <select
                  id="interval"
                  value={checkInterval}
                  onChange={(e) => setCheckInterval(e.target.value as "hourly" | "6hours" | "daily")}
                  className="input"
                >
                  <option value="hourly">Hour</option>
                  <option value="6hours">6 hours</option>
                  <option value="daily">Day</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="expires" className="label">Until</label>
                <input
                  id="expires"
                  type="date"
                  value={expiresAt}
                  onChange={(e) => setExpiresAt(e.target.value)}
                  className="input"
                  min={new Date().toISOString().split("T")[0]}
                  required
                />
              </div>
            </div>

            {/* Error */}
            {submitError && (
              <div className="message message-error">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10"/>
                  <line x1="12" y1="8" x2="12" y2="12"/>
                  <line x1="12" y1="16" x2="12.01" y2="16"/>
                </svg>
                {submitError}
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={isSubmitting || !parsedClass}
              className="btn-solid btn-blue"
              style={{ width: '100%', marginTop: '0.75rem' }}
            >
              {isSubmitting ? (
                <>
                  <span className="spinner"></span>
                  Creating...
                </>
              ) : (
                <>
                  Start tracking
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
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
