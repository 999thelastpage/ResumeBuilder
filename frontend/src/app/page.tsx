import Link from 'next/link';
import Script from 'next/script';

export const metadata = {
  title: 'CV Modernizer | The Anti-SaaS Resume Builder',
  description: 'A 100% free, AI-powered resume builder. No logins, no subscriptions, no data persistence. Just results.',
};

export default function LandingPage() {
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": "Is it really 100% free?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Yes. There are no premium tiers, no watermarks, and no hidden fees to download your PDF. It is built as a completely free utility."
        }
      },
      {
        "@type": "Question",
        "name": "Do you store or sell my resume data?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Absolutely not. Your data is temporarily cached for 3 hours solely to prevent AI spam, after which it is permanently deleted. We do not want your data."
        }
      },
      {
        "@type": "Question",
        "name": "How does the AI work?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "We use an advanced LLM to instantly parse your uploaded resume, rewrite bullet points for maximum impact, and format it into a professional, ATS-friendly structure."
        }
      }
    ]
  };

  return (
    <div className="bento-page">
      {/* JSON-LD Structured Data for SEO (Invisible to user) */}
      <Script
        id="faq-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />

      <div className="bento-container">
        {/* Header spanning top */}
        <header className="bento-header">
          <div className="bento-header-text">
            <h1 className="hero-title">
              Stop paying to get hired. <span className="text-gradient">Build your resume for free.</span>
            </h1>
            <p className="hero-subtitle">
              No logins. No subscriptions. No data mining. Just a lightning-fast, AI-powered 
              utility that turns your outdated CV into an ATS-friendly masterpiece.
            </p>
          </div>
          <Link href="/editor" className="btn-primary btn-large bento-cta">
            Start Building Now <span className="arrow">→</span>
          </Link>
        </header>

        {/* Main Content: Left Diff, Right Features */}
        <div className="bento-main">
          {/* Diff Section */}
          <div className="bento-diff-section">
            <div className="diff-col diff-good">
              <div className="diff-header">CV Modernizer</div>
              <ul>
                <li><span>✅</span> 100% free PDF exports</li>
                <li><span>✅</span> No login required</li>
                <li><span>✅</span> No subscriptions, ever</li>
                <li><span>✅</span> Zero data persistence</li>
              </ul>
            </div>
            <div className="diff-col diff-bad">
              <div className="diff-header">Typical SaaS Builder</div>
              <ul>
                <li><span>❌</span> Paywalls to export PDF</li>
                <li><span>❌</span> Forced account creation</li>
                <li><span>❌</span> Monthly subscriptions ($15+/mo)</li>
                <li><span>❌</span> Sells your personal data</li>
              </ul>
            </div>
          </div>

          {/* Features Grid */}
          <div className="bento-features-grid">
            <div className="bento-card">
              <div className="feature-icon">💸</div>
              <h3>100% Free Forever</h3>
              <p>No paywalls exactly when you try to download. Export perfectly formatted PDFs instantly.</p>
            </div>
            <div className="bento-card">
              <div className="feature-icon">⚡</div>
              <h3>Fast AI Review</h3>
              <p>Powered by an advanced LLM. Upload your old PDF and let our AI instantly extract and structure your bullet points.</p>
            </div>
            <div className="bento-card">
              <div className="feature-icon">🛡️</div>
              <h3>Zero Persistence</h3>
              <p>Resumes are wiped from our cache within hours. No accounts, no tracking.</p>
            </div>
            <div className="bento-card">
              <div className="feature-icon">🤖</div>
              <h3>ATS-Optimized</h3>
              <p>Server-side headless browser generates raw text PDFs without CSS hacks. ATS scanners read it perfectly.</p>
            </div>
          </div>
        </div>

        {/* Footer spanning bottom */}
        <footer className="bento-footer">
          <p>Built with ❤️ and honesty. Completely open source.</p>
        </footer>
      </div>
    </div>
  );
}
