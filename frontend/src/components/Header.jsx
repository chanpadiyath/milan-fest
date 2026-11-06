import { useEffect, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';

const links = [
  { to: '/', label: 'Home', end: true },
  { to: '/events', label: 'Events' },
  { to: '/#about', label: 'About' },
];

export default function Header() {
  const [open, setOpen] = useState(false);
  const location = useLocation();

  // Close the mobile menu whenever the route changes.
  useEffect(() => setOpen(false), [location.pathname, location.hash]);

  return (
    <header className="site-header">
      <div className="container header-inner">
        <Link to="/" className="brand" aria-label="Milan home">
          <span className="brand-mark" aria-hidden="true">M</span>
          <span className="brand-text">
            Milan <span className="brand-year">2027</span>
          </span>
        </Link>

        <button
          className="menu-toggle"
          aria-expanded={open}
          aria-controls="primary-nav"
          onClick={() => setOpen((o) => !o)}
        >
          <span className="sr-only">{open ? 'Close menu' : 'Open menu'}</span>
          <span className="menu-icon" aria-hidden="true" />
        </button>

        <nav id="primary-nav" className={`primary-nav ${open ? 'is-open' : ''}`} aria-label="Primary">
          <ul>
            {links.map((l) => (
              <li key={l.to}>
                {/* Hash links point into a page, so they never show as the active page. */}
                {l.to.includes('#') ? (
                  <Link to={l.to}>{l.label}</Link>
                ) : (
                  <NavLink to={l.to} end={l.end}>
                    {l.label}
                  </NavLink>
                )}
              </li>
            ))}
          </ul>
          <Link to="/events" className="btn btn-primary btn-sm">
            Register
          </Link>
        </nav>
      </div>
    </header>
  );
}
