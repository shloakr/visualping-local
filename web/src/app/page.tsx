import Link from "next/link";

export default function Home() {
  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-[var(--ucla-gold)]/10 text-[var(--ucla-darkest-blue)] dark:text-[var(--ucla-gold)] px-4 py-1.5 rounded-full text-sm font-medium mb-6">
            <span>🎓</span>
            <span>Free for UCLA Students</span>
          </div>
          
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight mb-6">
            Never Miss a Class Again
          </h1>
          
          <p className="text-lg text-[var(--muted)] max-w-2xl mx-auto mb-8">
            Track UCLA class enrollment status and get instant email notifications 
            when spots open up. Stop refreshing the Schedule of Classes manually.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/track" className="btn-primary text-lg px-8 py-3 inline-block text-center">
              Start Tracking a Class
            </Link>
            <Link href="#how-it-works" className="btn-secondary text-lg px-8 py-3 inline-block text-center">
              How It Works
            </Link>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-16 px-4 bg-slate-50 dark:bg-slate-900/50">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">How It Works</h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="card text-center">
              <div className="w-12 h-12 bg-[var(--ucla-blue)]/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">1️⃣</span>
              </div>
              <h3 className="font-semibold text-lg mb-2">Paste Your Class URL</h3>
              <p className="text-[var(--muted)]">
                Copy the URL from the UCLA Schedule of Classes page for the class you want to track.
              </p>
            </div>
            
            <div className="card text-center">
              <div className="w-12 h-12 bg-[var(--ucla-blue)]/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">2️⃣</span>
              </div>
              <h3 className="font-semibold text-lg mb-2">Add Your Email & API Key</h3>
              <p className="text-[var(--muted)]">
                Enter your email and free Resend API key. We verify your key works before saving.
              </p>
            </div>
            
            <div className="card text-center">
              <div className="w-12 h-12 bg-[var(--ucla-blue)]/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">3️⃣</span>
              </div>
              <h3 className="font-semibold text-lg mb-2">Get Notified</h3>
              <p className="text-[var(--muted)]">
                We check the class every hour. When enrollment status changes, you get an instant email.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 px-4">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">Features</h2>
          
          <div className="grid md:grid-cols-2 gap-6">
            <div className="card flex gap-4">
              <div className="text-2xl">⚡</div>
              <div>
                <h3 className="font-semibold mb-1">Hourly Checks</h3>
                <p className="text-[var(--muted)] text-sm">
                  We check your classes every hour so you never miss a spot opening.
                </p>
              </div>
            </div>
            
            <div className="card flex gap-4">
              <div className="text-2xl">🔒</div>
              <div>
                <h3 className="font-semibold mb-1">Your Own API Key</h3>
                <p className="text-[var(--muted)] text-sm">
                  You use your own Resend key, so you&apos;re in full control of your email notifications.
                </p>
              </div>
            </div>
            
            <div className="card flex gap-4">
              <div className="text-2xl">🎯</div>
              <div>
                <h3 className="font-semibold mb-1">Enrollment Status Only</h3>
                <p className="text-[var(--muted)] text-sm">
                  We track the enrollment table specifically, ignoring irrelevant page changes.
                </p>
              </div>
            </div>
            
            <div className="card flex gap-4">
              <div className="text-2xl">📅</div>
              <div>
                <h3 className="font-semibold mb-1">Auto-Expiry</h3>
                <p className="text-[var(--muted)] text-sm">
                  Set an expiration date and tracking stops automatically after enrollment ends.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Resend Setup */}
      <section className="py-16 px-4 bg-slate-50 dark:bg-slate-900/50">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-4">Getting a Resend API Key</h2>
          <p className="text-center text-[var(--muted)] mb-8">
            Resend is a free email service. Get your API key in 2 minutes:
          </p>
          
          <div className="card">
            <ol className="space-y-4">
              <li className="flex gap-3">
                <span className="font-mono bg-[var(--ucla-blue)] text-white w-6 h-6 rounded-full flex items-center justify-center text-sm flex-shrink-0">1</span>
                <span>
                  Go to <a href="https://resend.com/signup" target="_blank" rel="noopener noreferrer" className="text-[var(--ucla-blue)] hover:underline">resend.com/signup</a> and create a free account
                </span>
              </li>
              <li className="flex gap-3">
                <span className="font-mono bg-[var(--ucla-blue)] text-white w-6 h-6 rounded-full flex items-center justify-center text-sm flex-shrink-0">2</span>
                <span>
                  Go to <strong>API Keys</strong> in the sidebar
                </span>
              </li>
              <li className="flex gap-3">
                <span className="font-mono bg-[var(--ucla-blue)] text-white w-6 h-6 rounded-full flex items-center justify-center text-sm flex-shrink-0">3</span>
                <span>
                  Click <strong>Create API Key</strong>, give it a name like &quot;UCLA Tracker&quot;
                </span>
              </li>
              <li className="flex gap-3">
                <span className="font-mono bg-[var(--ucla-blue)] text-white w-6 h-6 rounded-full flex items-center justify-center text-sm flex-shrink-0">4</span>
                <span>
                  Copy the key (starts with <code className="bg-slate-100 dark:bg-slate-800 px-1 rounded">re_</code>) and paste it in our form
                </span>
              </li>
            </ol>
            
            <div className="mt-6 p-4 bg-[var(--ucla-gold)]/10 rounded-lg">
              <p className="text-sm">
                <strong>Free tier:</strong> 100 emails/day and 3,000 emails/month — more than enough for class tracking!
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Track Your Classes?</h2>
          <p className="text-[var(--muted)] mb-8">
            Set up tracking in under a minute. No account needed.
          </p>
          <Link href="/track" className="btn-primary text-lg px-8 py-3 inline-block">
            Start Tracking Now
          </Link>
        </div>
      </section>
    </div>
  );
}
