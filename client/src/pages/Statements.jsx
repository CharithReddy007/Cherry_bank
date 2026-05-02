import { useState, useEffect } from 'react';
import AppNav from '../components/AppNav';
import { api } from '../lib/api';

const S = {
  page: { minHeight: '100vh', background: 'var(--cream)' },
  main: { maxWidth: 1200, margin: '0 auto', padding: '40px 24px' },
  tag: { fontSize: 10, letterSpacing: '0.14em', color: 'var(--text-muted)', textTransform: 'uppercase', borderBottom: '1px solid var(--border)', paddingBottom: 8, marginBottom: 16, width: 40 },
  h1: { fontFamily: 'var(--font-serif)', fontSize: 40, fontWeight: 400, marginBottom: 8 },
  sub: { fontSize: 15, color: 'var(--text-secondary)', marginBottom: 28 },
  periodCard: { background: 'var(--white)', border: '1px solid var(--border)', borderRadius: 8, padding: '20px 28px', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 24 },
  periodLabel: { fontSize: 11, letterSpacing: '0.12em', color: 'var(--text-muted)', textTransform: 'uppercase', borderBottom: '1px solid var(--border)', paddingBottom: 6, marginBottom: 0, minWidth: 60 },
  monthInput: { padding: '8px 12px', border: '1px solid var(--border)', borderRadius: 4, fontSize: 14, outline: 'none', background: 'var(--white)' },
  periodSub: { fontSize: 14, color: 'var(--text-secondary)' },

  stmtCard: { background: 'var(--white)', border: '1px solid var(--border)', borderRadius: 8, padding: '28px', marginBottom: 16 },
  stmtHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 },
  stmtTitle: { fontFamily: 'var(--font-serif)', fontSize: 22, marginBottom: 4 },
  stmtNum: { fontSize: 12, color: 'var(--text-muted)', fontFamily: 'monospace', letterSpacing: '0.05em' },
  stmtStats: { display: 'flex', gap: 32, marginBottom: 20 },
  statItem: {},
  statLabel: { fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 4 },
  statVal: { fontFamily: 'var(--font-serif)', fontSize: 24 },
  downloadBtn: { display: 'flex', alignItems: 'center', gap: 6, padding: '9px 16px', border: '1px solid var(--border)', borderRadius: 6, fontSize: 13, background: 'var(--white)', cursor: 'pointer' },

  table: { width: '100%', borderCollapse: 'collapse', fontSize: 13 },
  th: { fontSize: 10, letterSpacing: '0.1em', color: 'var(--text-muted)', textTransform: 'uppercase', padding: '8px 0', textAlign: 'left', borderBottom: '1px solid var(--border)', fontWeight: 500 },
  td: { padding: '10px 0', borderBottom: '1px solid var(--border)', color: 'var(--text-primary)' },
  tdMuted: { padding: '10px 0', borderBottom: '1px solid var(--border)', color: 'var(--text-secondary)' },
  emptyCard: { background: 'var(--white)', border: '1px solid var(--border)', borderRadius: 8, padding: '28px', fontSize: 14, color: 'var(--text-secondary)' },
  footer: { borderTop: '1px solid var(--border)', padding: '16px 32px', display: 'flex', justifyContent: 'space-between', fontSize: 12, color: 'var(--text-muted)', background: 'var(--cream)', marginTop: 48 },
};

function fmt(n) { return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n); }

function generatePDF(stmt, period) {
  const rows = stmt.transactions.map(tx =>
    `<tr><td>${new Date(tx.createdAt).toLocaleDateString()}</td><td>${tx.type}</td><td>${tx.counterparty || '—'}</td><td>${tx.description || '—'}</td><td style="text-align:right;color:${tx.type === 'debit' ? 'red' : 'green'}">${tx.type === 'debit' ? '-' : '+'}${fmt(tx.amount)}</td><td style="text-align:right">${tx.balanceAfter != null ? fmt(tx.balanceAfter) : '—'}</td></tr>`
  ).join('');

  const html = `<!DOCTYPE html><html><head><title>Statement</title><style>body{font-family:Georgia,serif;padding:40px;color:#1a1a18}h1{color:#1a3a2a}table{width:100%;border-collapse:collapse;font-size:13px}th{font-size:10px;letter-spacing:0.1em;text-transform:uppercase;padding:8px;border-bottom:2px solid #ccc;text-align:left}td{padding:8px;border-bottom:1px solid #eee}.meta{display:flex;gap:40px;margin:24px 0}.stat label{font-size:11px;color:#666;text-transform:uppercase}.stat p{font-size:24px;margin:4px 0}</style></head><body><h1>SecureBank — Monthly Statement</h1><p>Account: <strong>${stmt.account.accountNumber}</strong> (${stmt.account.type})<br>Period: ${new Date(period.year, period.month - 1).toLocaleString('default', { month: 'long', year: 'numeric' })}</p><div class="meta"><div class="stat"><label>Credits</label><p>${fmt(stmt.credits)}</p></div><div class="stat"><label>Debits</label><p>${fmt(stmt.debits)}</p></div><div class="stat"><label>Closing Balance</label><p>${fmt(stmt.account.balance)}</p></div></div><table><thead><tr><th>Date</th><th>Type</th><th>Counterparty</th><th>Description</th><th style="text-align:right">Amount</th><th style="text-align:right">Balance</th></tr></thead><tbody>${rows || '<tr><td colspan="6" style="text-align:center;color:#999;padding:24px">No transactions this period.</td></tr>'}</tbody></table></body></html>`;

  const blob = new Blob([html], { type: 'text/html' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `securebank-statement-${period.year}-${period.month}-${stmt.account.accountNumber}.html`;
  a.click();
  URL.revokeObjectURL(url);
}

export default function Statements() {
  const now = new Date();
  const [period, setPeriod] = useState(`${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`);
  const [data, setData] = useState(null);

  useEffect(() => {
    const [year, month] = period.split('-');
    api.get(`/statements?year=${year}&month=${month}`).then(setData).catch(() => {});
  }, [period]);

  return (
    <div style={S.page}>
      <AppNav />
      <div style={S.main}>
        <div style={S.tag}>PDF</div>
        <h1 style={S.h1}>Monthly statements</h1>
        <p style={S.sub}>Download a typeset PDF statement for any of your accounts.</p>

        <div style={S.periodCard}>
          <div style={S.periodLabel}>Period</div>
          <input
            style={S.monthInput}
            type="month"
            value={period}
            onChange={e => setPeriod(e.target.value)}
          />
          <div style={S.periodSub}>Statements cover the calendar month.</div>
        </div>

        {!data ? null : data.statements.length === 0 ? (
          <div style={S.emptyCard}>No accounts yet.</div>
        ) : data.statements.map(stmt => (
          <div key={stmt.account._id} style={S.stmtCard}>
            <div style={S.stmtHeader}>
              <div>
                <div style={S.stmtTitle}>{stmt.account.type === 'savings' ? 'Savings' : 'Current'} Account</div>
                <div style={S.stmtNum}>{stmt.account.accountNumber}</div>
              </div>
              <button style={S.downloadBtn} onClick={() => generatePDF(stmt, data.period)}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3"/></svg>
                Download PDF
              </button>
            </div>

            <div style={S.stmtStats}>
              {[['Credits', fmt(stmt.credits)], ['Debits', fmt(stmt.debits)], ['Closing Balance', fmt(stmt.account.balance)]].map(([label, val]) => (
                <div key={label} style={S.statItem}>
                  <div style={S.statLabel}>{label}</div>
                  <div style={S.statVal}>{val}</div>
                </div>
              ))}
            </div>

            <table style={S.table}>
              <thead>
                <tr>
                  {['Date', 'Type', 'Counterparty', 'Description', 'Amount', 'Balance'].map(h => <th key={h} style={S.th}>{h}</th>)}
                </tr>
              </thead>
              <tbody>
                {stmt.transactions.length === 0 ? (
                  <tr><td colSpan={6} style={{ ...S.td, textAlign: 'center', color: 'var(--text-muted)', padding: '20px 0' }}>No transactions this period.</td></tr>
                ) : stmt.transactions.map(tx => (
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
        ))}
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
