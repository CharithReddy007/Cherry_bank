import { useNavigate } from 'react-router-dom';
import { useEffect, useRef } from 'react';

const S = {
  root: { minHeight: '100vh', background: 'var(--cream)', fontFamily: 'var(--font-sans)' },

  // NAV
  nav: { background: 'var(--cream)', borderBottom: '1px solid var(--border)', position: 'sticky', top: 0, zIndex: 50 },
  navInner: { maxWidth: 1200, margin: '0 auto', padding: '0 32px', height: 56, display: 'flex', alignItems: 'center', justifyContent: 'space-between' },
  logoRow: { display: 'flex', alignItems: 'center', gap: 10 },
  logoIcon: { width: 30, height: 30, border: '1.5px solid var(--green-dark)', borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center' },
  logoText: { fontFamily: 'var(--font-serif)', fontSize: 20, fontWeight: 500, color: 'var(--green-dark)', letterSpacing: '-0.3px' },
  navLinks: { display: 'flex', gap: 32 },
  navLink: { fontSize: 14, color: 'var(--text-secondary)', cursor: 'pointer', background: 'none', border: 'none' },
  navRight: { display: 'flex', gap: 12, alignItems: 'center' },
  btnSignIn: { fontSize: 14, color: 'var(--text-primary)', background: 'none', border: 'none', cursor: 'pointer' },
  btnOpenAccount: {
    fontSize: 14, fontWeight: 500, padding: '9px 20px', borderRadius: 6,
    background: 'var(--green-dark)', color: 'var(--white)', border: 'none', cursor: 'pointer'
  },

  // HERO
  hero: {
    background: 'var(--green-darkest)', minHeight: 'calc(100vh - 57px)',
    display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
    position: 'relative', overflow: 'hidden'
  },
  heroContent: { padding: '80px 64px 0', maxWidth: 760, position: 'relative', zIndex: 2 },
  eyebrow: { fontSize: 11, letterSpacing: '0.18em', color: 'rgba(255,255,255,0.45)', textTransform: 'uppercase', marginBottom: 24 },
  heroH1: { fontFamily: 'var(--font-serif)', fontSize: 'clamp(48px, 6vw, 80px)', fontWeight: 400, lineHeight: 1.1, color: 'var(--white)', marginBottom: 28 },
  heroItalic: { fontStyle: 'italic', color: '#c8a84b' },
  heroPara: { fontSize: 16, color: 'rgba(255,255,255,0.6)', lineHeight: 1.7, maxWidth: 480, marginBottom: 40 },
  heroCtas: { display: 'flex', gap: 12, marginBottom: 80 },
  btnHeroWhite: {
    display: 'flex', alignItems: 'center', gap: 8, padding: '12px 24px',
    background: 'var(--white)', color: 'var(--green-dark)', border: 'none',
    borderRadius: 4, fontSize: 14, fontWeight: 500, cursor: 'pointer'
  },
  btnHeroBorder: {
    padding: '12px 24px', background: 'transparent',
    color: 'var(--white)', border: '1px solid rgba(255,255,255,0.35)',
    borderRadius: 4, fontSize: 14, cursor: 'pointer'
  },

  // Feature cards at bottom of hero
  featuresRow: {
    display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)',
    borderTop: '1px solid rgba(255,255,255,0.08)', position: 'relative', zIndex: 2
  },
  featureCard: {
    padding: '24px 32px', borderRight: '1px solid rgba(255,255,255,0.08)'
  },
  featureNum: { fontSize: 10, letterSpacing: '0.12em', color: 'rgba(255,255,255,0.3)', marginBottom: 12 },
  featureTitle: { fontFamily: 'var(--font-serif)', fontSize: 20, color: 'var(--white)', marginBottom: 4 },
  featureSub: { fontSize: 12, color: 'rgba(255,255,255,0.4)' },

  // Footer
  footer: {
    borderTop: '1px solid var(--border)', padding: '20px 32px',
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    fontSize: 12, color: 'var(--text-muted)', background: 'var(--cream)'
  },
  footerRight: { display: 'flex', gap: 24, letterSpacing: '0.05em', fontFamily: 'monospace', fontSize: 11 }
};

export default function Landing() {
  const navigate = useNavigate();
  const canvasRef = useRef(null);

  // Animated diagonal lines like in the screenshots
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animId;
    let offset = 0;

    const draw = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const spacing = 60;
      const lineColor = 'rgba(180, 140, 60, 0.12)';
      ctx.strokeStyle = lineColor;
      ctx.lineWidth = 1;
      const diag = canvas.width + canvas.height;
      for (let i = -canvas.height; i < canvas.width + canvas.height; i += spacing) {
        ctx.beginPath();
        ctx.moveTo(i + offset % spacing, 0);
        ctx.lineTo(i + offset % spacing - canvas.height, canvas.height);
        ctx.stroke();
      }
    };

    const animate = () => {
      offset -= 0.3;
      draw();
      animId = requestAnimationFrame(animate);
    };

    animate();
    return () => cancelAnimationFrame(animId);
  }, []);

  const features = [
    { num: '01', title: 'Accounts', sub: 'Savings + Current' },
    { num: '02', title: 'OTP 2FA', sub: 'Login & high-value' },
    { num: '03', title: 'Ledger', sub: 'Paginated + PDF' },
    { num: '04', title: 'Oversight', sub: 'Admin fraud rules' },
  ];

  return (
    <div style={S.root}>
      {/* NAV */}
      <nav style={S.nav}>
        <div style={S.navInner}>
          <div style={S.logoRow}>
            <div style={S.logoIcon}>
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <rect x="1" y="5" width="12" height="8" rx="1" stroke="var(--green-dark)" strokeWidth="1.2" />
                <path d="M3 5V4a4 4 0 018 0v1" stroke="var(--green-dark)" strokeWidth="1.2" />
              </svg>
            </div>
            <span style={S.logoText}>SecureBank</span>
          </div>
          <div style={S.navLinks}>
            {['Features', 'Trust'].map(l => <button key={l} style={S.navLink}>{l}</button>)}
          </div>
          <div style={S.navRight}>
            <button style={S.btnSignIn} onClick={() => navigate('/signin')}>Sign in</button>
            <button style={S.btnOpenAccount} onClick={() => navigate('/register')}>Open an account</button>
          </div>
        </div>
      </nav>

      {/* HERO */}
      <section style={S.hero}>
        <canvas ref={canvasRef} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', zIndex: 1 }} />

        <div style={S.heroContent}>
          <div style={S.eyebrow}>EST · MMXXVI · HERITAGE TRUST BANKING</div>
          <h1 style={S.heroH1}>
            Banking built on <em style={S.heroItalic}>quiet<br />confidence</em> — not loud<br />promises.
          </h1>
          <p style={S.heroPara}>
            Open savings &amp; current accounts, move funds with OTP-verified
            transfers, and let our fraud engine watch the perimeter. A deliberately
            simulated retail banking platform.
          </p>
          <div style={S.heroCtas}>
            <button style={S.btnHeroWhite} onClick={() => navigate('/register')}>
              Open an account <span>→</span>
            </button>
            <button style={S.btnHeroBorder} onClick={() => navigate('/signin')}>
              I already bank here
            </button>
          </div>
        </div>

        <div style={S.featuresRow}>
          {features.map((f, i) => (
            <div key={i} style={{ ...S.featureCard, borderRight: i < 3 ? '1px solid rgba(255,255,255,0.08)' : 'none' }}>
              <div style={S.featureNum}>{f.num}</div>
              <div style={S.featureTitle}>{f.title}</div>
              <div style={S.featureSub}>{f.sub}</div>
            </div>
          ))}
        </div>
      </section>

      <footer style={S.footer}>
        <span>© 2026 SecureBank — Simulated banking platform for demonstration.</span>
        <div style={S.footerRight}>
          <span>FDIC-Sim</span>
          <span>·</span>
          <span>OTP 2FA</span>
          <span>·</span>
          <span>Fraud Rules Engine</span>
        </div>
      </footer>
    </div>
  );
}
