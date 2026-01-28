import Link from "next/link";

export default function Home() {
  return (
    <>
      {/* Hero Section with Background */}
      <div className="hero-bg">
        {/* Navigation */}
        <nav className="nav">
          <Link href="/" className="nav-logo">
            UCLA Class Tracker
          </Link>
          <div className="nav-links">
            <Link href="/track" className="nav-btn">
              Track a Class
            </Link>
            <Link href="/manage" className="nav-btn">
              Manage
            </Link>
          </div>
        </nav>

        {/* Hero Content */}
        <div className="hero-content">
          {/* Badge */}
          <div className="badge-pill animate-fade-in">
            <span className="badge-dot"></span>
            <span>Free for all Bruins</span>
          </div>

          {/* Main Headline */}
          <h1 className="hero-title animate-fade-in delay-1">
            Never miss a UCLA class again.
          </h1>
          
          <p className="hero-subtitle animate-fade-in delay-2">
            Get instant email alerts when spots open up in your classes. We check every hour so you don&apos;t have to.
          </p>

          {/* CTA Buttons */}
          <div className="animate-fade-in delay-3" style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', justifyContent: 'center' }}>
            <Link href="/track" className="btn-solid">
              Start tracking
            </Link>
            <Link href="#how" className="btn-outline">
              How it works
            </Link>
          </div>

          {/* Floating Stats Card */}
          {/* <div className="float-card" style={{ bottom: '20%', right: '8%' }}>
            <div style={{ fontWeight: 700, marginBottom: '0.75rem', fontSize: '0.9rem' }}>Stats</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.85rem', color: 'var(--text-medium)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: '2rem' }}>
                <span>Monitoring</span>
                <span style={{ fontWeight: 600, color: 'var(--ucla-blue)' }}>24/7</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: '2rem' }}>
                <span>Check interval</span>
                <span style={{ fontWeight: 600, color: 'var(--ucla-blue)' }}>1 hour</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: '2rem' }}>
                <span>Price</span>
                <span style={{ fontWeight: 600, color: 'var(--ucla-gold)' }}>Free</span>
              </div>
            </div>
          </div> */}
        </div>
      </div>

      {/* How it Works Section */}
      <section id="how" className="section-cream">
        <h2 className="section-title">How it works</h2>
        <p className="section-subtitle">Three simple steps to never miss enrollment</p>

        <div className="steps-container">
          <div className="step-card animate-fade-in">
            <div className="step-number">1</div>
            <div>
              <div className="step-title">Paste the class URL</div>
              <p className="step-desc">
                Search for your class on UCLA&apos;s Schedule of Classes, click on the lecture section, and copy the URL.
              </p>
            </div>
          </div>

          <div className="step-card animate-fade-in delay-1">
            <div className="step-number">2</div>
            <div>
              <div className="step-title">Add your email + API key</div>
              <p className="step-desc">
                Enter your email and a free Resend API key. We&apos;ll use it to send you notifications.
              </p>
            </div>
          </div>

          <div className="step-card animate-fade-in delay-2">
            <div className="step-number step-number-gold">3</div>
            <div>
              <div className="step-title">Get notified instantly</div>
              <p className="step-desc">
                We check every hour. The moment enrollment status changes, you&apos;ll get an email.
              </p>
            </div>
          </div>
        </div>

        {/* API Key Info */}
        <div className="info-card animate-fade-in delay-3">
          <div className="info-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#B45309" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4"/>
            </svg>
          </div>
          <div style={{ flex: 1 }}>
            <div className="info-title">Getting a Resend API key</div>
            <ol className="info-list">
              <li>Sign up at <a href="https://resend.com" target="_blank" rel="noopener noreferrer" className="link">resend.com</a> (free)</li>
              <li>Go to API Keys → Create API Key</li>
              <li>Copy the key (starts with <code style={{ background: '#f5f5f5', padding: '0.125rem 0.375rem', borderRadius: '4px', fontSize: '0.8rem' }}>re_</code>)</li>
            </ol>
            <div className="info-footer">
              <span style={{ color: 'var(--ucla-gold)' }}>★</span> Free tier includes 100 emails/day
            </div>
          </div>
        </div>
      </section>

      {/* Footer with Purple Mountain Background */}
      <footer className="footer-hero">
        <div className="footer-content">
          <div className="footer-logo">UCLA Class Tracker</div>
          <p className="footer-text">Never miss enrollment again.</p>
          <div className="footer-links">
            <span className="footer-link">Not affiliated with UCLA</span>
            <a href="https://github.com/shloakr/visualping-local" target="_blank" rel="noopener noreferrer" className="footer-link">
              GitHub
            </a>
          </div>
        </div>
      </footer>
    </>
  );
}
