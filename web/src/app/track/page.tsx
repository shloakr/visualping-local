"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
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

  // Parse URL on change
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
      setUrlError("Invalid UCLA class URL. Make sure you copy the full URL from the Schedule of Classes.");
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

    if (!resendKey) {
      setSubmitError("Resend API key is required");
      return;
    }

    if (!resendKey.startsWith("re_")) {
      setSubmitError("Resend API key should start with 're_'");
      return;
    }

    if (!expiresAt) {
      setSubmitError("Please set an end date for tracking");
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
          expiresAt: expiresAt || null,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to create tracker");
      }

      setSubmitSuccess(true);
      
      // Redirect to manage page after short delay
      setTimeout(() => {
        router.push(`/manage?email=${encodeURIComponent(email)}&created=true`);
      }, 2000);
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : "Something went wrong");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitSuccess) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16">
        <div className="card text-center">
          <div className="text-5xl mb-4">✅</div>
          <h1 className="text-2xl font-bold mb-2">Tracker Created!</h1>
          <p className="text-[var(--muted)]">
            We&apos;ll start checking your class and email you when the enrollment status changes.
          </p>
          <p className="text-sm text-[var(--muted)] mt-4">
            Redirecting to manage page...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-2">Track a UCLA Class</h1>
      <p className="text-[var(--muted)] mb-8">
        Get notified when the enrollment status changes for any UCLA class.
      </p>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* UCLA URL Input */}
        <div>
          <label htmlFor="url" className="block font-medium mb-2">
            UCLA Class URL <span className="text-red-500">*</span>
          </label>
          <input
            id="url"
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://sa.ucla.edu/ro/Public/SOC/Results/ClassDetail?term_cd=..."
            className="input-field font-mono text-sm"
            required
          />
          {urlError && (
            <p className="mt-1 text-sm text-red-500">{urlError}</p>
          )}
          
          {/* How to get the URL - collapsible */}
          <details className="mt-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg p-4">
            <summary className="cursor-pointer font-medium text-[var(--ucla-blue)] hover:underline">
              How do I get this URL?
            </summary>
            <div className="mt-3 space-y-3 text-sm">
              <p className="text-[var(--muted)]">Follow these steps:</p>
              <ol className="list-decimal list-inside space-y-2 text-[var(--foreground)]">
                <li>
                  Go to the{" "}
                  <a
                    href="https://sa.ucla.edu/ro/Public/SOC/Results"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[var(--ucla-blue)] hover:underline font-medium"
                  >
                    UCLA Schedule of Classes →
                  </a>
                </li>
                <li>Search for your class by subject area (e.g., &quot;ECON&quot;, &quot;MATH&quot;, &quot;CS&quot;)</li>
                <li>Find your class in the results and click on <strong>&quot;Lec 1&quot;</strong>, <strong>&quot;Lec 2&quot;</strong>, etc.</li>
                <li>A new tab will open with the class details - <strong>copy the URL</strong> from your browser</li>
              </ol>
              <div className="mt-3 p-3 bg-[var(--ucla-gold)]/10 rounded border border-[var(--ucla-gold)]/30">
                <p className="text-xs text-[var(--muted)]">
                  <strong>Example URL:</strong>
                </p>
                <code className="text-xs break-all text-[var(--foreground)]">
                  https://sa.ucla.edu/ro/Public/SOC/Results/ClassDetail?term_cd=26S&subj_area_cd=ECON...
                </code>
              </div>
            </div>
          </details>
        </div>

        {/* Parsed Class Preview */}
        {parsedClass && (
          <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-green-600 dark:text-green-400">✓</span>
              <span className="font-medium text-green-800 dark:text-green-200">Valid UCLA Class URL</span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>
                <span className="text-[var(--muted)]">Class:</span>{" "}
                <span className="font-medium">{generateClassName(parsedClass)}</span>
              </div>
              <div>
                <span className="text-[var(--muted)]">Term:</span>{" "}
                <span className="font-medium">{formatTermCode(parsedClass.termCode)}</span>
              </div>
            </div>
          </div>
        )}

        {/* Email Input */}
        <div>
          <label htmlFor="email" className="block font-medium mb-2">
            Email Address <span className="text-red-500">*</span>
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
            We&apos;ll send notifications to this address when the class status changes.
          </p>
        </div>

        {/* Resend API Key Input */}
        <div>
          <label htmlFor="resendKey" className="block font-medium mb-2">
            Resend API Key <span className="text-red-500">*</span>
          </label>
          <input
            id="resendKey"
            type="password"
            value={resendKey}
            onChange={(e) => setResendKey(e.target.value)}
            placeholder="re_xxxxxxxxx..."
            className="input-field font-mono"
            required
          />
          <p className="mt-1 text-sm text-[var(--muted)]">
            Get a free API key from{" "}
            <a
              href="https://resend.com/api-keys"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[var(--ucla-blue)] hover:underline"
            >
              resend.com/api-keys
            </a>
            {" "}- we&apos;ll verify it works before saving.
          </p>
        </div>

        {/* Check Interval */}
        <div>
          <label htmlFor="interval" className="block font-medium mb-2">
            Check Frequency
          </label>
          <select
            id="interval"
            value={checkInterval}
            onChange={(e) => setCheckInterval(e.target.value as "hourly" | "6hours" | "daily")}
            className="input-field"
          >
            <option value="hourly">Every hour (recommended)</option>
            <option value="6hours">Every 6 hours</option>
            <option value="daily">Once daily</option>
          </select>
        </div>

        {/* Expiry Date */}
        <div>
          <label htmlFor="expires" className="block font-medium mb-2">
            Stop Tracking After <span className="text-red-500">*</span>
          </label>
          <input
            id="expires"
            type="date"
            value={expiresAt}
            onChange={(e) => setExpiresAt(e.target.value)}
            className="input-field"
            min={new Date().toISOString().split("T")[0]}
            required
          />
          <p className="mt-1 text-sm text-[var(--muted)]">
            Set when to stop tracking (e.g., end of enrollment period).
          </p>
        </div>

        {/* Error Message */}
        {submitError && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 text-red-700 dark:text-red-300">
            {submitError}
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isSubmitting || !parsedClass}
          className="btn-primary w-full py-3 text-lg disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? "Creating Tracker..." : "Start Tracking"}
        </button>
      </form>
    </div>
  );
}
