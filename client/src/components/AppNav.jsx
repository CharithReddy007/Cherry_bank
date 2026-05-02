import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const navItems = [
  { label: 'Dashboard', path: '/dashboard' },
  { label: 'Transfer', path: '/transfer' },
  { label: 'Transactions', path: '/transactions' },
  { label: 'Statements', path: '/statements' },
];

const S = {
  nav: { background: 'var(--cream)', borderBottom: '1px solid var(--border)', position: 'sticky', top: 0, zIndex: 50 },
  inner: { maxWidth: 1200, margin: '0 auto', padding: '0 24px', height: 56, display: 'flex', alignItems: 'center', gap: 32 },
  logoWrap: { display: 'flex', flexDirection: 'column', marginRight: 8 },
  logo: { fontFamily: 'var(--font-serif)', fontSize: 18, fontWeight: 500, color: 'var(--green-dark)', letterSpacing: '-0.3px', lineHeight: 1 },
  logoSub: { fontSize: 9, letterSpacing: '0.12em', color: 'var(--text-muted)', textTransform: 'uppercase', lineHeight: 1, marginTop: 3 },
  icon: { width: 28, height: 28, border: '1.5px solid var(--green-dark)', borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center' },
  links: { display: 'flex', gap: 4, flex: 1 },
  link: (active) => ({
    padding: '6px 14px', borderRadius: 6, fontSize: 14, fontWeight: 400,
    color: active ? 'var(--cream)' : 'var(--text-secondary)',
    background: active ? 'var(--green-dark)' : 'transparent',
    cursor: 'pointer', border: 'none', textDecoration: 'none'
  }),
  right: { display: 'flex', alignItems: 'center', gap: 12 },
  userInfo: { textAlign: 'right' },
  userName: { fontSize: 13, fontWeight: 500 },
  userEmail: { fontSize: 11, color: 'var(--text-muted)' },
  signOut: {
    display: 'flex', alignItems: 'center', gap: 6, padding: '6px 12px',
    border: '1px solid var(--border)', borderRadius: 6, background: 'transparent',
    fontSize: 13, color: 'var(--text-primary)', cursor: 'pointer'
  }
};

export default function AppNav() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => { logout(); navigate('/'); };

  return (
    <nav style={S.nav}>
      <div style={S.inner}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={S.icon}>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <rect x="1" y="5" width="12" height="8" rx="1" stroke="var(--green-dark)" strokeWidth="1.2" />
              <path d="M3 5V4a4 4 0 018 0v1" stroke="var(--green-dark)" strokeWidth="1.2" />
            </svg>
          </div>
          <div style={S.logoWrap}>
            <span style={S.logo}>SecureBank</span>
            <span style={S.logoSub}>Personal Banking</span>
          </div>
        </div>

        <div style={S.links}>
          {navItems.map(item => (
            <Link key={item.path} to={item.path} style={S.link(location.pathname === item.path)}>
              {item.label}
            </Link>
          ))}
        </div>

        <div style={S.right}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="1.5">
              <circle cx="12" cy="8" r="4" /><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
            </svg>
            <div style={S.userInfo}>
              <div style={S.userName}>{user?.fullName}</div>
              <div style={S.userEmail}>{user?.email}</div>
            </div>
          </div>
          <button style={S.signOut} onClick={handleLogout}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
              <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9" />
            </svg>
            Sign out
          </button>
        </div>
      </div>
    </nav>
  );
}
