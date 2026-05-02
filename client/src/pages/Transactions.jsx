import { useState, useEffect, useCallback } from 'react';
import AppNav from '../components/AppNav';
import { api } from '../lib/api';

const S = {
  page: { minHeight: '100vh', background: 'var(--cream)' },
  main: { maxWidth: 1200, margin: '0 auto', padding: '40px 24px' },
  topRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 24 },
  left: {},
  tag: { fontSize: 10, letterSpacing: '0.14em', color: 'var(--text-muted)', textTransform: 'uppercase', borderBottom: '1px solid var(--border)', paddingBottom: 8, marginBottom: 16, width: 60 },
  h1: { fontFamily: 'var(--font-serif)', fontSize: 40, fontWeight: 400 },
  filters: { display: 'flex', gap: 10 },
  select: { padding: '8px 32px 8px 12px', border: '1px solid var(--border)', borderRadius: 6, fontSize: 13, background: 'var(--white)', cursor: 'pointer', outline: 'none', appearance: 'none', backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'10\' height=\'6\' viewBox=\'0 0 10 6\' fill=\'none\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cpath d=\'M1 1l4 4 4-4\' stroke=\'%23999\' stroke-width=\'1.5\'/%3E%3C/svg%3E")', backgroundRepeat: 'no-repeat', backgroundPosition: 'right 10px center' },
  tableWrap: { background: 'var(--white)', border: '1px solid var(--border)', borderRadius: 8, overflow: 'hidden' },
  table: { width: '100%', borderCollapse: 'collapse', fontSize: 13 },
  th: { fontSize: 10, letterSpacing: '0.1em', color: 'var(--text-muted)', textTransform: 'uppercase', padding: '12px 16px', textAlign: 'left', borderBottom: '1px solid var(--border)', fontWeight: 500 },
  td: { padding: '13px 16px', borderBottom: '1px solid var(--border)', color: 'var(--text-primary)' },
  tdMuted: { padding: '13px 16px', borderBottom: '1px solid var(--border)', color: 'var(--text-secondary)' },
  pagination: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 0', fontSize: 14, color: 'var(--text-secondary)' },
  pageNav: { display: 'flex', alignItems: 'center', gap: 12 },
  pageBtn: (disabled) => ({ background: 'none', border: 'none', cursor: disabled ? 'default' : 'pointer', color: disabled ? 'var(--text-muted)' : 'var(--text-primary)', fontSize: 16 }),
  flagBadge: { fontSize: 10, padding: '2px 8px', borderRadius: 20, background: '#fef2f2', color: '#dc2626', letterSpacing: '0.06em' },
  footer: { borderTop: '1px solid var(--border)', padding: '16px 32px', display: 'flex', justifyContent: 'space-between', fontSize: 12, color: 'var(--text-muted)', background: 'var(--cream)', marginTop: 48 },
};

function fmt(n) { return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n); }

export default function Transactions() {
  const [accounts, setAccounts] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(1);
  const [page, setPage] = useState(1);
  const [accountId, setAccountId] = useState('');
  const [type, setType] = useState('all');
  const LIMIT = 20;

  useEffect(() => { api.get('/accounts').then(setAccounts).catch(() => {}); }, []);

  const load = useCallback(async () => {
    try {
      let qs = `?page=${page}&limit=${LIMIT}`;
      if (accountId) qs += `&accountId=${accountId}`;
      if (type !== 'all') qs += `&type=${type}`;
      const data = await api.get('/transactions' + qs);
      setTransactions(data.transactions);
      setTotal(data.total);
      setPages(data.pages);
    } catch {}
  }, [page, accountId, type]);

  useEffect(() => { load(); }, [load]);

  const cols = ['Date', 'Type', 'Account', 'Counterparty', 'Description', 'Amount', 'Balance', 'Flag'];

  return (
    <div style={S.page}>
      <AppNav />
      <div style={S.main}>
        <div style={S.topRow}>
          <div style={S.left}>
            <div style={S.tag}>Ledger</div>
            <h1 style={S.h1}>Transactions</h1>
          </div>
          <div style={S.filters}>
            <select style={S.select} value={accountId} onChange={e => { setAccountId(e.target.value); setPage(1); }}>
              <option value="">All accounts</option>
              {accounts.map(a => <option key={a._id} value={a._id}>{a.type} — {a.accountNumber}</option>)}
            </select>
            <select style={S.select} value={type} onChange={e => { setType(e.target.value); setPage(1); }}>
              <option value="all">All types</option>
              <option value="credit">Credit</option>
              <option value="debit">Debit</option>
              <option value="deposit">Deposit</option>
            </select>
          </div>
        </div>

        <div style={S.tableWrap}>
          <table style={S.table}>
            <thead>
              <tr>{cols.map(h => <th key={h} style={S.th}>{h}</th>)}</tr>
            </thead>
            <tbody>
              {transactions.length === 0 ? (
                <tr><td colSpan={8} style={{ ...S.td, textAlign: 'center', color: 'var(--text-muted)', padding: '32px' }}>No transactions.</td></tr>
              ) : transactions.map(tx => (
                <tr key={tx._id}>
                  <td style={S.tdMuted}>{new Date(tx.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</td>
                  <td style={S.td}>{tx.type}</td>
                  <td style={{ ...S.tdMuted, fontFamily: 'monospace', fontSize: 12 }}>
                    {tx.type === 'debit' ? tx.fromAccountNumber : tx.toAccountNumber}
                  </td>
                  <td style={S.td}>{tx.counterparty || '—'}</td>
                  <td style={S.tdMuted}>{tx.description || '—'}</td>
                  <td style={{ ...S.td, color: tx.type === 'debit' ? '#dc2626' : '#16a34a', fontWeight: 500 }}>
                    {tx.type === 'debit' ? '-' : '+'}{fmt(tx.amount)}
                  </td>
                  <td style={S.tdMuted}>{tx.balanceAfter != null ? fmt(tx.balanceAfter) : '—'}</td>
                  <td style={S.td}>
                    {tx.flagged && <span style={S.flagBadge} title={tx.flagReason}>FLAGGED</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div style={S.pagination}>
          <span>Showing {Math.min((page - 1) * LIMIT + 1, total) || 0}–{Math.min(page * LIMIT, total)} of {total}</span>
          <div style={S.pageNav}>
            <button style={S.pageBtn(page <= 1)} onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page <= 1}>‹</button>
            <span>Page {page} / {pages || 1}</span>
            <button style={S.pageBtn(page >= pages)} onClick={() => setPage(p => Math.min(pages, p + 1))} disabled={page >= pages}>›</button>
          </div>
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
