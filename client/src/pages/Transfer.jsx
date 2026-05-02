import { useState, useEffect, useRef } from 'react';
import AppNav from '../components/AppNav';
import { api } from '../lib/api';

const S = {
  page: { minHeight: '100vh', background: 'var(--cream)' },
  main: { maxWidth: 900, margin: '0 auto', padding: '40px 24px' },
  tag: { fontSize: 10, letterSpacing: '0.14em', color: 'var(--text-muted)', textTransform: 'uppercase', borderBottom: '1px solid var(--border)', paddingBottom: 8, marginBottom: 16, width: 120 },
  h1: { fontFamily: 'var(--font-serif)', fontSize: 40, fontWeight: 400, marginBottom: 8 },
  sub: { fontSize: 15, color: 'var(--text-secondary)', marginBottom: 32 },
  card: { background: 'var(--white)', border: '1px solid var(--border)', borderRadius: 8, padding: '32px' },
  label: { display: 'block', fontSize: 11, letterSpacing: '0.12em', color: 'var(--text-muted)', textTransform: 'uppercase', borderBottom: '1px solid var(--border)', paddingBottom: 6, marginBottom: 10 },
  input: { width: '100%', padding: '12px 14px', border: '1px solid var(--border)', borderRadius: 4, fontSize: 15, outline: 'none', background: 'var(--white)', color: 'var(--text-primary)', marginBottom: 20 },
  select: { width: '100%', padding: '12px 14px', border: '1px solid var(--border)', borderRadius: 4, fontSize: 15, outline: 'none', background: 'var(--white)', color: 'var(--text-primary)', marginBottom: 20, appearance: 'none', backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'12\' height=\'8\' viewBox=\'0 0 12 8\' fill=\'none\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cpath d=\'M1 1l5 5 5-5\' stroke=\'%23999\' stroke-width=\'1.5\'/%3E%3C/svg%3E")', backgroundRepeat: 'no-repeat', backgroundPosition: 'right 14px center', cursor: 'pointer' },
  row2: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 },
  btnSubmit: (disabled) => ({
    width: '100%', padding: '14px', background: disabled ? '#9aab9e' : 'var(--green-dark)',
    color: 'var(--white)', border: 'none', borderRadius: 4, fontSize: 15, fontWeight: 500,
    cursor: disabled ? 'default' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8
  }),
  error: { background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 4, padding: '10px 14px', fontSize: 13, color: '#dc2626', marginBottom: 16 },
  success: { background: '#f0fdf4', border: '1px solid #86efac', borderRadius: 4, padding: '16px', fontSize: 14, color: '#15803d', marginBottom: 16 },
  otpNote: { background: '#fffbeb', border: '1px solid #fde68a', borderRadius: 4, padding: '12px 16px', fontSize: 13, color: '#92400e', marginBottom: 16 },
  otpDisplay: { background: 'var(--cream-dark)', border: '1px solid var(--border)', borderRadius: 6, padding: '14px', textAlign: 'center', fontSize: 24, letterSpacing: '10px', fontFamily: 'monospace', marginBottom: 16 },
  footer: { borderTop: '1px solid var(--border)', padding: '16px 32px', display: 'flex', justifyContent: 'space-between', fontSize: 12, color: 'var(--text-muted)', background: 'var(--cream)', marginTop: 48 },
};

function fmt(n) { return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n); }

export default function Transfer() {
  const [accounts, setAccounts] = useState([]);
  const [fromAccountId, setFromAccountId] = useState('');
  const [toAccountNumber, setToAccountNumber] = useState('');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [otp, setOtp] = useState('');
  const [demoOtp, setDemoOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const needsOtp = parseFloat(amount) >= 1000;

  useEffect(() => {
    api.get('/accounts').then(d => {
      const active = d.filter(a => a.status === 'active');
      setAccounts(active);
      if (active.length) setFromAccountId(active[0]._id);
    }).catch(() => {});
  }, []);

  const requestOtp = async () => {
    setError('');
    setLoading(true);
    try {
      const data = await api.post('/transactions/request-transfer-otp', {});
      setDemoOtp(data.demoOtp);
      setOtpSent(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const submit = async () => {
    setError(''); setSuccess('');
    if (!fromAccountId) return setError('Select a source account.');
    if (!toAccountNumber) return setError('Enter destination account number.');
    if (!amount || parseFloat(amount) <= 0) return setError('Enter a valid amount.');
    if (needsOtp && !otpSent) return setError('Please request and enter the OTP first.');

    setLoading(true);
    try {
      const data = await api.post('/transactions/transfer', {
        fromAccountId, toAccountNumber, amount: parseFloat(amount), description, otp
      });
      setSuccess(`Transfer of ${fmt(parseFloat(amount))} completed. New balance: ${fmt(data.newBalance)}${data.flagged ? ' ⚠ Flagged: ' + data.flagReason : ''}`);
      setAmount(''); setToAccountNumber(''); setDescription(''); setOtp(''); setDemoOtp(''); setOtpSent(false);
      const updated = await api.get('/accounts');
      setAccounts(updated.filter(a => a.status === 'active'));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={S.page}>
      <AppNav />
      <div style={S.main}>
        <div style={S.tag}>Move Money</div>
        <h1 style={S.h1}>Transfer funds</h1>
        <p style={S.sub}>Transfers at or above $1,000 require a one-time passcode.</p>

        {error && <div style={S.error}>{error}</div>}
        {success && <div style={S.success}>{success}</div>}

        <div style={S.card}>
          <label style={S.label}>From Account</label>
          <select style={S.select} value={fromAccountId} onChange={e => setFromAccountId(e.target.value)}>
            <option value="">Select account</option>
            {accounts.map(a => (
              <option key={a._id} value={a._id}>
                {a.type === 'savings' ? 'Savings' : 'Current'} — {a.accountNumber} ({fmt(a.balance)})
              </option>
            ))}
          </select>

          <label style={S.label}>Destination Account Number</label>
          <input style={S.input} placeholder="SBxxxxxxxxxx" value={toAccountNumber} onChange={e => setToAccountNumber(e.target.value)} />

          <div style={S.row2}>
            <div>
              <label style={S.label}>Amount (USD)</label>
              <input style={S.input} type="number" placeholder="0.00" value={amount} onChange={e => setAmount(e.target.value)} />
            </div>
            <div>
              <label style={S.label}>Description</label>
              <input style={S.input} placeholder="Rent, bills…" value={description} onChange={e => setDescription(e.target.value)} />
            </div>
          </div>

          {needsOtp && (
            <>
              <div style={S.otpNote}>
                ⚠ Transfers of $1,000+ require OTP verification.{' '}
                {!otpSent && <button onClick={requestOtp} style={{ background: 'none', border: 'none', color: 'var(--green-dark)', cursor: 'pointer', textDecoration: 'underline', fontSize: 13 }}>Send OTP</button>}
              </div>
              {otpSent && demoOtp && <div style={S.otpDisplay}>{demoOtp}</div>}
              {otpSent && (
                <>
                  <label style={S.label}>Enter OTP</label>
                  <input style={S.input} placeholder="6-digit code" maxLength={6} value={otp} onChange={e => setOtp(e.target.value)} />
                </>
              )}
            </>
          )}

          <button
            style={S.btnSubmit(loading || (accounts.length === 0))}
            onClick={submit}
            disabled={loading || accounts.length === 0}
          >
            {loading ? 'Processing…' : <>Review transfer <span>→</span></>}
          </button>
        </div>
      </div>

      <footer style={S.footer}>
        <span>© 2026 SecureBank — Simulated banking platform for demonstration.</span>
        <div style={{ display: 'flex', gap: 16, fontFamily: 'monospace', fontSize: 11 }}>
          <span>FDIC-Sim</span><span>·</span><span>OTP 2FA</span><span>·</span><span>Fraud Rules Engine</span>
        </div>
      </footer>
    </div>
  );
}
