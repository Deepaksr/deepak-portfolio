import { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { useSite } from '../lib/store.jsx';

export default function Header() {
  const [open, setOpen] = useState(false);
  const { settings } = useSite();
  const textLink = ({ isActive }) => (isActive ? 'active' : '');
  return (
    <>
      <header className="site-header">
        <div className="wrap topbar">
          <Link to="/" className="brand" aria-label="Deepak Roshan">
            <svg className="brand-mark" viewBox="477 499.5 106.7 80" aria-hidden="true" focusable="false">
              <g fill="currentColor">
                <path d="M477.03,499.55h24.44c15.92,0,28.84,12.92,28.84,28.84v22.24c0,15.92-12.92,28.84-28.84,28.84h-24.44v-79.92h0Z" />
                <path d="M530.31,499.55h33.3c11.03,0,19.98,8.95,19.98,19.98h0c0,11.03-8.95,19.98-19.98,19.98h-33.3v-39.96h0Z" />
                <path d="M530.31,539.51h29.85c12.93,0,23.43,10.5,23.43,23.43v16.53h-53.28v-39.96h0Z" />
              </g>
            </svg>
          </Link>
          <div className="topbar-right">
            <nav className="topnav main-nav">
              <NavLink to="/" end className={textLink}>Index</NavLink>
              <NavLink to="/projects" className={textLink}>Projects</NavLink>
              <NavLink to="/info" className={textLink}>About</NavLink>
            </nav>
            <a className="topmail main-nav" href={`mailto:${settings.contactEmail}`}>{settings.contactEmail}</a>
          </div>
          <button className={`menu-btn${open ? ' open' : ''}`} onClick={() => setOpen((v) => !v)} aria-label="Menu" aria-expanded={open}>
            <span /><span />
          </button>
        </div>
      </header>
      {open && (
        <nav className="mobile-menu">
          <Link to="/" onClick={() => setOpen(false)}>Index</Link>
          <Link to="/projects" onClick={() => setOpen(false)}>Projects</Link>
          <Link to="/info" onClick={() => setOpen(false)}>About</Link>
        </nav>
      )}
    </>
  );
}
