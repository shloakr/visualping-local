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
        </div>
      </div>

      {/* How it Works Section - Clean & Open */}
      <section id="how" style={{ background: 'var(--cream)', padding: '5rem 1.5rem' }}>
        <div style={{ maxWidth: '720px', margin: '0 auto', textAlign: 'center' }}>
          <h2 style={{ 
            fontFamily: 'var(--font-playfair), Georgia, serif',
            fontSize: 'clamp(2rem, 5vw, 2.75rem)',
            fontWeight: 500,
            marginBottom: '3.5rem',
            color: 'var(--text-dark)',
            letterSpacing: '-0.02em'
          }}>
            How it works
          </h2>

          {/* Steps - Horizontal on desktop, stacked on mobile */}
          <div style={{ 
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '3rem',
            textAlign: 'center',
            marginBottom: '4rem'
          }}>
            {/* Step 1 */}
            <div>
              <div style={{
                width: '56px',
                height: '56px',
                borderRadius: '50%',
                background: 'var(--ucla-blue)',
                color: 'white',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontFamily: 'var(--font-playfair), Georgia, serif',
                fontSize: '1.5rem',
                fontWeight: 500,
                margin: '0 auto 1.25rem'
              }}>
                1
              </div>
              <h3 style={{ 
                fontWeight: 600, 
                fontSize: '1.1rem',
                marginBottom: '0.5rem',
                color: 'var(--text-dark)'
              }}>
                Find your class
              </h3>
              <p style={{ 
                color: 'var(--text-medium)', 
                fontSize: '0.95rem',
                lineHeight: 1.6
              }}>
                Search on UCLA&apos;s Schedule of Classes and copy the class URL
              </p>
            </div>

            {/* Step 2 */}
            <div>
              <div style={{
                width: '56px',
                height: '56px',
                borderRadius: '50%',
                background: 'var(--ucla-blue)',
                color: 'white',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontFamily: 'var(--font-playfair), Georgia, serif',
                fontSize: '1.5rem',
                fontWeight: 500,
                margin: '0 auto 1.25rem'
              }}>
                2
              </div>
              <h3 style={{ 
                fontWeight: 600, 
                fontSize: '1.1rem',
                marginBottom: '0.5rem',
                color: 'var(--text-dark)'
              }}>
                Enter your details
              </h3>
              <p style={{ 
                color: 'var(--text-medium)', 
                fontSize: '0.95rem',
                lineHeight: 1.6
              }}>
                Add your email and a free Resend API key for notifications
              </p>
            </div>

            {/* Step 3 */}
            <div>
              <div style={{
                width: '56px',
                height: '56px',
                borderRadius: '50%',
                background: 'var(--ucla-gold)',
                color: 'var(--text-dark)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontFamily: 'var(--font-playfair), Georgia, serif',
                fontSize: '1.5rem',
                fontWeight: 500,
                margin: '0 auto 1.25rem'
              }}>
                3
              </div>
              <h3 style={{ 
                fontWeight: 600, 
                fontSize: '1.1rem',
                marginBottom: '0.5rem',
                color: 'var(--text-dark)'
              }}>
                Get notified
              </h3>
              <p style={{ 
                color: 'var(--text-medium)', 
                fontSize: '0.95rem',
                lineHeight: 1.6
              }}>
                We&apos;ll email you the moment enrollment status changes
              </p>
            </div>
          </div>

          {/* Divider line */}
          <div style={{ 
            width: '60px', 
            height: '1px', 
            background: 'rgba(0,0,0,0.1)', 
            margin: '0 auto 2.5rem' 
          }} />

          {/* API Key Info - Minimal */}
          <div style={{ textAlign: 'center' }}>
            <p style={{ 
              color: 'var(--text-medium)', 
              fontSize: '0.95rem',
              marginBottom: '0.75rem'
            }}>
              Need a Resend API key? It&apos;s free.
            </p>
            <p style={{ 
              color: 'var(--text-light)', 
              fontSize: '0.9rem',
              lineHeight: 1.7
            }}>
              Sign up at{' '}
              <a 
                href="https://resend.com" 
                target="_blank" 
                rel="noopener noreferrer" 
                style={{ color: 'var(--ucla-blue)', textDecoration: 'none', fontWeight: 500 }}
              >
                resend.com
              </a>
              {' '}→ API Keys → Create Key → Copy (starts with{' '}
              <code style={{ 
                background: 'rgba(0,0,0,0.05)', 
                padding: '0.15rem 0.4rem', 
                borderRadius: '4px',
                fontSize: '0.85rem',
                fontFamily: 'var(--font-geist-mono)'
              }}>re_</code>)
            </p>
            <p style={{ 
              color: 'var(--ucla-gold)', 
              fontSize: '0.85rem',
              marginTop: '0.75rem',
              fontWeight: 500
            }}>
              100 free emails/day
            </p>
          </div>
        </div>
      </section>

      {/* CTA Section
      <section style={{ 
        background: 'white', 
        padding: '4rem 1.5rem',
        textAlign: 'center'
      }}>
        <h2 style={{ 
          fontFamily: 'var(--font-playfair), Georgia, serif',
          fontSize: '1.75rem',
          fontWeight: 500,
          marginBottom: '0.75rem',
          color: 'var(--text-dark)'
        }}>
          Ready to start?
        </h2>
        <p style={{ 
          color: 'var(--text-medium)', 
          marginBottom: '1.75rem' 
        }}>
          Set up in under a minute. No account needed.
        </p>
        <Link href="/track" className="btn-solid btn-blue">
          Track a class now
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M5 12h14M12 5l7 7-7 7"/>
          </svg>
        </Link>
      </section> */}

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
