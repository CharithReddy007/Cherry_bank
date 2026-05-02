import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import AppNav from '../components/AppNav';
import { api } from '../lib/api';

const S = {
  page: { minHeight: '100vh', background: 'var(--cream)' },
  main: { maxWidth: 1200, margin: '0 auto', padding: '32px 24px' },
  topGrid: { display: 'grid', gridTemplateColumns: '1fr 320px', gap: 16, marginBottom: 32 },
  card: { background: 'var(--white)', border: '1px solid var(--border)', borderRadius: 8, padding: '28px 32px' },
  cardTag: { fontSize: 10, letterSpacing: '0.14em', color: 'var(--text-muted)', textTransform: 'uppercase', borderBottom: '1px solid var(--border)', paddingBottom: 8, marginBottom: 20 },
  balance: { fontFamily: 'var(--font-serif)', fontSize: 52, fontWeight: 400, color: 'var(--text-primary)', lineHeight: 1, marginBottom: 6 },
  balanceSub: { fontSize: 14, color: 'var(--text-muted)', marginBottom: 24 },
  actionBtns: { display: 'flex', gap: 10 },
  btnDark: {
    display: 'flex', alignItems: 'center', gap: 6, padding: '9px 18px',
    background: 'var(--green-dark)', color: 'var(--white)', border: 'none',
    borderRadius: 6, fontSize: 13, fontWeight: 500, cursor: 'pointer'
  },
  btnLight: {
    display: 'flex', alignItems: 'center', gap: 6, padding: '9px 18px',
    background: 'var(--white)', color: 'var(--text-primary)',
    border: '1px solid var(--border)', borderRadius: 6, fontSize: 13, cursor: 'pointer'
  },
  quickFacts: { display: 'flex', flexDirection: 'column', gap: 0 },
  qfRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '13px 0', borderBottom: '1px solid var(--border)', fontSize: 14 },
  qfLabel: { color: 'var(--text-secondary)' },
  qfVal: { fontWeight: 500, color: 'var(--text-primary)' },

  sectionHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  sectionTitle: { fontFamily: 'var(--font-serif)', fontSize: 26, fontWeight: 400 },
  newBtn: { fontSize: 14, color: 'var(--text-secondary)', background: 'none', border: 'none', cursor: 'pointer' },

  // Accounts list
  accountsCard: { background: 'var(--white)', border: '1px solid var(--border)', borderRadius: 8, overflow: 'hidden', marginBottom: 32 },
  accountRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 28px', borderBottom: '1px solid var(--border)' },
  accountLeft: { display: 'flex', gap: 16, alignItems: 'center' },
  accountIcon: { width: 40, height: 40, borderRadius: 8, background: 'var(--green-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 },
  accountName: { fontWeight: 500, fontSize: 15, marginBottom: 2 },
  accountNum: { fontSize: 12, color: 'var(--text-muted)', fontFamily: 'monospace', letterSpacing: '0.05em' },
  accountBadge: (status) => ({
    fontSize: 10, padding: '2px 8px', borderRadius: 20, letterSpacing: '0.08em', textTransform: 'uppercase',
    background: status === 'active' ? '#dcfce7' : '#fee2e2',
    color: status === 'active' ? '#16a34a' : '#dc2626'
  }),
  accountBalance: { textAlign: 'right' },
  accountBalanceAmt: { fontFamily: 'var(--font-serif)', fontSize: 22, fontWeight: 400 },
  accountBalanceSub: { fontSize: 12, color: 'var(--text-muted)' },
  emptyBox: { padding: '60px 28px', textAlign: 'center' },
  emptyTitle: { fontFamily: 'var(--font-serif)', fontSize: 22, marginBottom: 8, color: 'var(--text-secondary)' },
  emptySub: { fontSize: 14, color: 'var(--text-muted)', marginBottom: 20 },
  btnDarkCenter: { padding: '11px 24px', background: 'var(--green-dark)', color: 'var(--white)', border: 'none', borderRadius: 6, fontSize: 14, fontWeight: 500, cursor: 'pointer' },

  // Table
  table: { width: '100%', borderCollapse: 'collapse', fontSize: 13 },
  th: { fontSize: 10, letterSpacing: '0.1em', color: 'var(--text-muted)', textTransform: 'uppercase', padding: '10px 16px', textAlign: 'left', borderBottom: '1px solid var(--border)', fontWeight: 500 },
  td: { padding: '13px 16px', borderBottom: '1px solid var(--border)', color: 'var(--text-primary)' },
  tdMuted: { padding: '13px 16px', borderBottom: '1px solid var(--border)', color: 'var(--text-secondary)' },
  tableWrap: { background: 'var(--white)', border: '1px solid var(--border)', borderRadius: 8, overflow: 'hidden' },

  // Modal
  overlay: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.35)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center' },
  modal: { background: 'var(--white)', borderRadius: 12, padding: '32px', width: 420, position: 'relative' },
  modalTitle: { fontFamily: 'var(--font-serif)', fontSize: 26, marginBottom: 24 },
  closeBtn: { position: 'absolute', top: 20, right: 20, background: 'none', border: 'none', fontSize: 20, cursor: 'pointer', color: 'var(--text-muted)' },
  typeGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 20 },
  typeCard: (active) => ({
    padding: '16px', border: `1.5px solid ${active ? 'var(--green-dark)' : 'var(--border)'}`,
    borderRadius: 6, cursor: 'pointer',
    background: active ? 'var(--green-dark)' : 'var(--white)'
  }),
  typeTitle: (active) => ({ fontWeight: 500, fontSize: 15, color: active ? 'var(--white)' : 'var(--text-primary)', marginBottom: 4 }),
  typeSub: (active) => ({ fontSize: 12, color: active ? 'rgba(255,255,255,0.65)' : 'var(--text-muted)' }),
  modalLabel: { fontSize: 11, letterSpacing: '0.12em', color: 'var(--text-muted)', textTransform: 'uppercase', borderBottom: '1px solid var(--border)', paddingBottom: 6, marginBottom: 8 },
  modalInput: { width: '100%', padding: '12px 14px', border: '1px solid var(--border)', borderRadius: 4, fontSize: 15, outline: 'none', marginBottom: 20 },

  footer: { borderTop: '1px solid var(--border)', padding: '16px 32px', display: 'flex', justifyContent: 'space-between', fontSize: 12, color: 'var(--text-muted)', background: 'var(--cream)', marginTop: 48 },
};

function fmt(n) { return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n); }

export default function Dashboard() {
  const [accounts, setAccounts] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [accountType, setAccountType] = useState('savings');
  const [initialDeposit, setInitialDeposit] = useState('1000');
  const [creating, setCreating] = useState(false);
  const navigate = useNavigate();

  const loadAccounts = useCallback(async () => {
    try {
      const data = await api.get('/accounts');
      setAccounts(data);
    } catch {}
  }, []);

  const loadTransactions = useCallback(async () => {
    try {
      const data = await api.get('/transactions?limit=10');
      setTransactions(data.transactions || []);
    } catch {}
  }, []);

  useEffect(() => { loadAccounts(); loadTransactions(); }, [loadAccounts, loadTransactions]);

  const totalBalance = accounts.reduce((s, a) => s + a.balance, 0);
  const frozen = accounts.filter(a => a.status === 'frozen').length;

  const openAccount = async () => {
    setCreating(true);
    try {
      await api.post('/accounts', { type: accountType, initialDeposit });
      setShowModal(false);
      loadAccounts();
      loadTransactions();
    } catch (err) {
      alert(err.message);
    } finally {
      setCreating(false);
    }
  };

  return (
    <div style={S.page}>
      <AppNav />
      <div style={S.main}>

        {/* Top summary */}
        <div style={S.topGrid}>
          <div style={S.card}>
            <div style={S.cardTag}>Total Balance · Active Accounts</div>
            <div style={S.balance}>{fmt(totalBalance)}</div>
            <div style={S.balanceSub}>Across {accounts.length} account{accounts.length !== 1 ? 's' : ''}</div>

            {/* Sparkline placeholder */}
            <svg width="200" height="40" style={{ display: 'block', margin: '0 0 20px auto', opacity: 0.3 }}>
              <polyline points="0,35 40,20 80,28 120,10 160,18 200,5" fill="none" stroke="var(--green-dark)" strokeWidth="1.5" />
            </svg>

            <div style={S.actionBtns}>
              <button style={S.btnDark} onClick={() => navigate('/transfer')}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M7 16V4m0 0L3 8m4-4l4 4M17 8v12m0 0l4-4m-4 4l-4-4"/></svg>
                Transfer
              </button>
              <button style={S.btnLight} onClick={() => setShowModal(true)}>
                <span style={{ fontSize: 16, lineHeight: 1 }}>+</span> Open account
              </button>
              <button style={S.btnLight} onClick={() => navigate('/transactions')}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 3h18v18H3z"/><path d="M3 9h18M9 21V9"/></svg>
                Transactions
              </button>
            </div>
          </div>

          <div style={S.card}>
            <div style={S.cardTag}>Quick Facts</div>
            <div style={S.quickFacts}>
              {[
                ['Savings accounts', accounts.filter(a => a.type === 'savings').length],
                ['Current accounts', accounts.filter(a => a.type === 'current').length],
                ['Frozen accounts', frozen],
                ['Recent transactions', transactions.length],
              ].map(([label, val]) => (
                <div key={label} style={S.qfRow}>
                  <span style={S.qfLabel}>{label}</span>
                  <span style={S.qfVal}>{val}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Accounts */}
        <div style={S.sectionHeader}>
          <h2 style={S.sectionTitle}>Your accounts</h2>
          <button style={S.newBtn} onClick={() => setShowModal(true)}>+ New</button>
        </div>
        <div style={S.accountsCard}>
          {accounts.length === 0 ? (
            <div style={S.emptyBox}>
              <div style={S.emptyTitle}>No accounts yet</div>
              <p style={S.emptySub}>Open a savings or current account to get started.</p>
              <button style={S.btnDarkCenter} onClick={() => setShowModal(true)}>Open my first account</button>
            </div>
          ) : accounts.map(acc => (
            <div key={acc._id} style={S.accountRow}>
              <div style={S.accountLeft}>
                <div style={S.accountIcon}>{acc.type === 'savings' ? '🏦' : '💳'}</div>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={S.accountName}>{acc.type === 'savings' ? 'Savings' : 'Current'} Account</div>
                    <span style={S.accountBadge(acc.status)}>{acc.status}</span>
                  </div>
                  <div style={S.accountNum}>{acc.accountNumber}</div>
                </div>
              </div>
              <div style={S.accountBalance}>
                <div style={S.accountBalanceAmt}>{fmt(acc.balance)}</div>
                <div style={S.accountBalanceSub}>{acc.interestRate}% {acc.type === 'savings' ? 'APY' : 'p.a.'}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Recent activity */}
        <div style={S.sectionHeader}>
          <h2 style={S.sectionTitle}>Recent activity</h2>
          <button style={S.newBtn} onClick={() => navigate('/transactions')}>View all</button>
        </div>
        <div style={S.tableWrap}>
          <table style={S.table}>
            <thead>
              <tr>
                {['Date', 'Type', 'Counterparty', 'Description', 'Amount', 'Balance'].map(h => (
                  <th key={h} style={S.th}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {transactions.length === 0 ? (
                <tr><td colSpan={6} style={{ ...S.td, textAlign: 'center', color: 'var(--text-muted)' }}>No transactions yet.</td></tr>
              ) : transactions.map(tx => (
                <tr key={tx._id}>
                  <td style={S.tdMuted}>{new Date(tx.createdAt).toLocaleDateString()}</td>
                  <td style={S.td}>{tx.type}</td>
                  <td style={S.td}>{tx.counterparty || '—'}</td>
                  <td style={S.tdMuted}>{tx.description || '—'}</td>
                  <td style={{ ...S.td, color: tx.type === 'debit' ? '#dc2626' : '#16a34a', fontWeight: 500 }}>
                    {tx.type === 'debit' ? '-' : '+'}{fmt(tx.amount)}
                  </td>
                  <td style={S.tdMuted}>{tx.balanceAfter != null ? fmt(tx.balanceAfter) : '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <footer style={S.footer}>
        <span>© 2026 SecureBank — Simulated banking platform for demonstration.</span>
        <div style={{ display: 'flex', gap: 16, fontFamily: 'monospace', fontSize: 11 }}>
          <span>FDIC-Sim</span><span>·</span><span>OTP 2FA</span><span>·</span><span>Fraud Rules Engine</span>
        </div>
      </footer>

      {/* Open Account Modal */}
      {showModal && (
        <div style={S.overlay} onClick={e => e.target === e.currentTarget && setShowModal(false)}>
          <div style={S.modal}>
            <button style={S.closeBtn} onClick={() => setShowModal(false)}>×</button>
            <h2 style={S.modalTitle}>Open new account</h2>
            <div style={S.modalLabel}>Account Type</div>
            <div style={S.typeGrid}>
              {[
                { val: 'savings', title: 'Savings', sub: '2.4% APY · 3 free wd/mo' },
                { val: 'current', title: 'Current', sub: '0.1% · unlimited' },
              ].map(opt => (
                <div key={opt.val} style={S.typeCard(accountType === opt.val)} onClick={() => setAccountType(opt.val)}>
                  <div style={S.typeTitle(accountType === opt.val)}>{opt.title}</div>
                  <div style={S.typeSub(accountType === opt.val)}>{opt.sub}</div>
                </div>
              ))}
            </div>
            <div style={S.modalLabel}>Initial Deposit</div>
            <input
              style={S.modalInput}
              type="number"
              value={initialDeposit}
              onChange={e => setInitialDeposit(e.target.value)}
              min="0"
            />
            <button
              style={{ ...S.btnDarkCenter, width: '100%', padding: '13px', fontSize: 15, opacity: creating ? 0.7 : 1 }}
              onClick={openAccount}
              disabled={creating}
            >
              {creating ? 'Opening…' : 'Open account'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
