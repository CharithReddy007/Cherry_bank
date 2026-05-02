import { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { api } from '../lib/api';
import { useAuth } from '../context/AuthContext';

const S = {
  root: { display: 'flex', minHeight: '100vh' },
  left: { flex: 1, background: 'var(--cream)', padding: '48px 64px', display: 'flex', flexDirection: 'column' },
  right: { width: '48%', background: 'var(--green-darkest)', position: 'relative', overflow: 'hidden', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' },
  back: { display: 'flex', alignItems: 'center', gap: 6, fontSize: 14, color: 'var(--text-secondary)', background: 'none', border: 'none', cursor: 'pointer', marginBottom: 40 },
  tag: { fontSize: 11, letterSpacing: '0.14em', color: 'var(--text-muted)', textTransform: 'uppercase', borderBottom: '1px solid var(--border)', paddingBottom: 10, marginBottom: 16, width: 160 },
  h1: { fontFamily: 'var(--font-serif)', fontSize: 40, fontWeight: 400, color: 'var(--text-primary)', marginBottom: 8 },
  sub: { fontSize: 15, color: 'var(--text-secondary)', marginBottom: 36 },
  formGroup: { marginBottom: 20 },
  label: { display: 'block', fontSize: 11, letterSpacing: '0.12em', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 8, borderBottom: '1px solid var(--border)', paddingBottom: 6 },
  input: {
    width: '100%', padding: '12px 16px', border: '1px solid var(--border)',
    borderRadius: 4, fontSize: 15, color: 'var(--text-primary)',
    background: 'var(--white)', outline: 'none', transition: 'border-color 0.15s'
  },
  btnPrimary: {
    width: '100%', padding: '14px', background: 'var(--green-dark)', color: 'var(--white)',
    border: 'none', borderRadius: 4, fontSize: 15, fontWeight: 500, cursor: 'pointer', marginTop: 8
  },
  already: { fontSize: 14, color: 'var(--text-secondary)', marginTop: 20 },
  link: { color: 'var(--green-dark)', textDecoration: 'underline' },
  error: { background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 4, padding: '10px 14px', fontSize: 13, color: '#dc2626', marginBottom: 16 },

  // Right panel
  logoRow: { padding: '28px 36px', display: 'flex', alignItems: 'center', gap: 10, position: 'relative', zIndex: 2 },
  logoIcon: { width: 30, height: 30, border: '1.5px solid rgba(255,255,255,0.4)', borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center' },
  logoText: { fontFamily: 'var(--font-serif)', fontSize: 18, color: 'var(--white)' },
  rightBottom: { padding: '40px 40px 48px', position: 'relative', zIndex: 2 },
  rightTag: { fontSize: 10, letterSpacing: '0.16em', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', marginBottom: 16 },
  rightH2: { fontFamily: 'var(--font-serif)', fontSize: 'clamp(32px, 3vw, 48px)', color: 'var(--white)', fontWeight: 400, lineHeight: 1.2 },
};

export default function Register() {
  const [form, setForm] = useState({ fullName: '', email: '', phone: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let offset = 0, animId;
    const animate = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.strokeStyle = 'rgba(180,140,60,0.1)';
      ctx.lineWidth = 1;
      for (let i = -canvas.height; i < canvas.width + canvas.height; i += 60) {
        ctx.beginPath();
        ctx.moveTo(i + offset % 60, 0);
        ctx.lineTo(i + offset % 60 - canvas.height, canvas.height);
        ctx.stroke();
      }
      offset -= 0.3;
      animId = requestAnimationFrame(animate);
    };
    animate();
    return () => cancelAnimationFrame(animId);
  }, []);

  const handle = (e) => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const submit = async () => {
    setError('');
    if (!form.fullName || !form.email || !form.password) return setError('Please fill all required fields.');
    if (form.password.length < 6) return setError('Password must be at least 6 characters.');
    setLoading(true);
    try {
      const data = await api.post('/auth/register', form);
      login(data.token, data.user);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={S.root}>
      <div style={S.left}>
        <button style={S.back} onClick={() => navigate('/')}>← Back</button>
        <div style={S.tag}>New Customer</div>
        <h1 style={S.h1}>Open an account</h1>
        <p style={S.sub}>Takes about a minute. You'll add your first account after sign-in.</p>

        {error && <div style={S.error}>{error}</div>}

        <div style={S.formGroup}>
          <label style={S.label}>Full Name</label>
          <input style={S.input} name="fullName" value={form.fullName} onChange={handle} autoFocus />
        </div>
        <div style={S.formGroup}>
          <label style={S.label}>Email</label>
          <input style={S.input} name="email" type="email" value={form.email} onChange={handle} />
        </div>
        <div style={S.formGroup}>
          <label style={S.label}>Phone (Optional)</label>
          <input style={S.input} name="phone" type="tel" value={form.phone} onChange={handle} />
        </div>
        <div style={S.formGroup}>
          <label style={S.label}>Password</label>
          <input style={S.input} name="password" type="password" value={form.password} onChange={handle} />
        </div>

        <button style={{ ...S.btnPrimary, opacity: loading ? 0.7 : 1 }} onClick={submit} disabled={loading}>
          {loading ? 'Creating account…' : 'Create account'}
        </button>

        <p style={S.already}>Already bank with us? <Link to="/signin" style={S.link}>Sign in</Link></p>
      </div>

      <div style={S.right}>
        <canvas ref={canvasRef} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }} />
        <div style={S.logoRow}>
          <div style={S.logoIcon}>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <rect x="1" y="5" width="12" height="8" rx="1" stroke="rgba(255,255,255,0.6)" strokeWidth="1.2" />
              <path d="M3 5V4a4 4 0 018 0v1" stroke="rgba(255,255,255,0.6)" strokeWidth="1.2" />
            </svg>
          </div>
          <span style={S.logoText}>SecureBank</span>
        </div>
        <div style={S.rightBottom}>
          <div style={S.rightTag}>A Better Place to Keep Money</div>
          <div style={S.rightH2}>Deliberate. Private.<br />Yours.</div>
        </div>
      </div>
    </div>
  );
}
