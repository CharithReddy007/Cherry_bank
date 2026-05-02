import { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { api } from '../lib/api';
import { useAuth } from '../context/AuthContext';

const S = {
  root: { display: 'flex', minHeight: '100vh' },
  left: { width: '48%', background: 'var(--green-darkest)', position: 'relative', overflow: 'hidden', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' },
  right: { flex: 1, background: 'var(--cream)', padding: '48px 72px', display: 'flex', flexDirection: 'column' },
  back: { display: 'flex', alignItems: 'center', gap: 6, fontSize: 14, color: 'var(--text-secondary)', background: 'none', border: 'none', cursor: 'pointer', marginBottom: 40 },
  stepTag: { fontSize: 11, letterSpacing: '0.14em', color: 'var(--text-muted)', textTransform: 'uppercase', borderBottom: '1px solid var(--border)', paddingBottom: 10, marginBottom: 16, width: 220 },
  h1: { fontFamily: 'var(--font-serif)', fontSize: 44, fontWeight: 400, color: 'var(--text-primary)', marginBottom: 8 },
  sub: { fontSize: 15, color: 'var(--text-secondary)', marginBottom: 36 },
  label: { display: 'block', fontSize: 11, letterSpacing: '0.12em', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 8, borderBottom: '1px solid var(--border)', paddingBottom: 6 },
  input: {
    width: '100%', padding: '13px 16px', border: '1px solid var(--border)',
    borderRadius: 4, fontSize: 15, color: 'var(--text-primary)', background: 'var(--white)', outline: 'none', marginBottom: 20
  },
  btnPrimary: {
    width: '100%', padding: '14px', background: 'var(--green-dark)', color: 'var(--white)',
    border: 'none', borderRadius: 4, fontSize: 15, fontWeight: 500, cursor: 'pointer'
  },
  btnOutline: {
    flex: 1, padding: '13px', background: 'var(--white)', color: 'var(--text-primary)',
    border: '1px solid var(--border)', borderRadius: 4, fontSize: 14, cursor: 'pointer'
  },
  demoBox: { background: 'var(--cream-dark)', border: '1px solid var(--border)', borderRadius: 6, padding: '12px 16px', marginTop: 20, fontSize: 13, color: 'var(--text-secondary)', display: 'flex', gap: 10 },
  error: { background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 4, padding: '10px 14px', fontSize: 13, color: '#dc2626', marginBottom: 16 },

  // OTP boxes
  otpDisplay: {
    background: 'var(--cream-dark)', border: '1px solid var(--border)', borderRadius: 6,
    padding: '16px', textAlign: 'center', fontSize: 28, letterSpacing: '12px',
    fontWeight: 500, color: 'var(--text-primary)', marginBottom: 24, fontFamily: 'monospace'
  },
  otpInputs: { display: 'flex', gap: 8, marginBottom: 24 },
  otpBox: (active) => ({
    width: 52, height: 56, border: `1.5px solid ${active ? 'var(--green-dark)' : 'var(--border)'}`,
    borderRadius: 6, fontSize: 24, fontWeight: 500, textAlign: 'center',
    background: 'var(--white)', outline: 'none', color: 'var(--text-primary)'
  }),

  // Left panel
  leftLogoRow: { padding: '28px 36px', display: 'flex', alignItems: 'center', gap: 10, position: 'relative', zIndex: 2 },
  leftIcon: { width: 30, height: 30, border: '1.5px solid rgba(255,255,255,0.4)', borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center' },
  leftBottom: { padding: '40px 40px 48px', position: 'relative', zIndex: 2 },
  leftTag: { fontSize: 10, letterSpacing: '0.16em', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', marginBottom: 16 },
  leftH2: { fontFamily: 'var(--font-serif)', fontSize: 'clamp(28px, 3vw, 44px)', color: 'var(--white)', fontWeight: 400, lineHeight: 1.3, marginBottom: 16 },
  leftSub: { fontSize: 13, color: 'rgba(255,255,255,0.45)' },
};

export default function Login() {
  const [step, setStep] = useState(1); // 1=credentials, 2=OTP
  const [email, setEmail] = useState('admin@securebank.com');
  const [password, setPassword] = useState('Admin@12345');
  const [demoOtp, setDemoOtp] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();
  const canvasRef = useRef(null);
  const otpRefs = useRef([]);

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

  const submitCredentials = async () => {
    setError('');
    if (!email || !password) return setError('Enter email and password.');
    setLoading(true);
    try {
      const data = await api.post('/auth/login', { email, password });
      setDemoOtp(data.demoOtp);
      setStep(2);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleOtpChange = (idx, val) => {
    if (!/^\d?$/.test(val)) return;
    const next = [...otp];
    next[idx] = val;
    setOtp(next);
    if (val && idx < 5) otpRefs.current[idx + 1]?.focus();
  };

  const handleOtpKeyDown = (idx, e) => {
    if (e.key === 'Backspace' && !otp[idx] && idx > 0) otpRefs.current[idx - 1]?.focus();
  };

  const submitOtp = async () => {
    setError('');
    const code = otp.join('');
    if (code.length !== 6) return setError('Enter the full 6-digit code.');
    setLoading(true);
    try {
      const data = await api.post('/auth/verify-otp', { email, otp: code });
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
      {/* LEFT - pattern panel */}
      <div style={S.left}>
        <canvas ref={canvasRef} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }} />
        <div style={S.leftLogoRow}>
          <div style={S.leftIcon}>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <rect x="1" y="5" width="12" height="8" rx="1" stroke="rgba(255,255,255,0.6)" strokeWidth="1.2" />
              <path d="M3 5V4a4 4 0 018 0v1" stroke="rgba(255,255,255,0.6)" strokeWidth="1.2" />
            </svg>
          </div>
          <span style={{ fontFamily: 'var(--font-serif)', fontSize: 18, color: 'var(--white)' }}>SecureBank</span>
        </div>
        <div style={S.leftBottom}>
          <div style={S.leftTag}>Welcome Back</div>
          <div style={S.leftH2}>Your vault is where you<br />left it.</div>
          <div style={S.leftSub}>Every login verified with a one-time passcode. Always.</div>
        </div>
      </div>

      {/* RIGHT - form */}
      <div style={S.right}>
        <button style={S.back} onClick={() => step === 2 ? setStep(1) : navigate('/')}>← Back</button>

        {step === 1 ? (
          <>
            <div style={S.stepTag}>Step 1 · Credentials</div>
            <h1 style={S.h1}>Sign in</h1>
            <p style={S.sub}>Use your email and password. A one-time code will be required next.</p>

            {error && <div style={S.error}>{error}</div>}

            <label style={S.label}>Email</label>
            <input style={S.input} type="email" value={email} onChange={e => setEmail(e.target.value)} autoFocus />

            <label style={S.label}>Password</label>
            <input style={S.input} type="password" value={password} onChange={e => setPassword(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && submitCredentials()} />

            <button style={{ ...S.btnPrimary, opacity: loading ? 0.7 : 1 }} onClick={submitCredentials} disabled={loading}>
              {loading ? 'Checking…' : 'Continue'}
            </button>

            <p style={{ fontSize: 14, color: 'var(--text-secondary)', marginTop: 20 }}>
              Don't have an account? <Link to="/register" style={{ color: 'var(--green-dark)', textDecoration: 'underline' }}>Open one</Link>
            </p>

            <div style={S.demoBox}>
              <span>ⓘ</span>
              <div>
                Demo credentials are pre-filled.&nbsp;&nbsp;
                <strong>Admin:</strong> admin@securebank.com / Admin@12345
              </div>
            </div>
          </>
        ) : (
          <>
            <div style={S.stepTag}>Step 2 · Verification</div>
            <h1 style={S.h1}>Enter your OTP</h1>
            <p style={S.sub}>We sent a 6-digit code. In demo mode, it is:</p>

            {error && <div style={S.error}>{error}</div>}

            {demoOtp && <div style={S.otpDisplay}>{demoOtp}</div>}

            <div style={S.otpInputs}>
              {otp.map((d, i) => (
                <input
                  key={i}
                  ref={el => otpRefs.current[i] = el}
                  style={S.otpBox(document.activeElement === otpRefs.current[i])}
                  maxLength={1}
                  value={d}
                  onChange={e => handleOtpChange(i, e.target.value)}
                  onKeyDown={e => handleOtpKeyDown(i, e)}
                  inputMode="numeric"
                />
              ))}
            </div>

            <div style={{ display: 'flex', gap: 12 }}>
              <button style={S.btnOutline} onClick={() => setStep(1)}>Back</button>
              <button style={{ ...S.btnPrimary, flex: 1, opacity: loading ? 0.7 : 1 }} onClick={submitOtp} disabled={loading}>
                {loading ? 'Verifying…' : 'Verify & sign in'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
