import { Link } from 'react-router-dom';
import { FEST } from '../lib/constants.js';

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="container footer-inner">
        <div>
          <p className="footer-brand">Milan {FEST.year}</p>
          <p className="muted">
            {FEST.dates} · {FEST.place}
          </p>
          <p className="muted small">Organised by the Directorate of Student Affairs, SRMIST.</p>
        </div>
        <nav aria-label="Footer">
          <ul className="footer-links">
            <li><Link to="/events">All events</Link></li>
            <li><Link to="/events?category=Dance">Dance</Link></li>
            <li><Link to="/events?category=Music">Music</Link></li>
            <li><Link to="/events?category=Technical">Technical</Link></li>
          </ul>
        </nav>
      </div>
      <p className="container small muted footer-note">
        Sample event data for the DSA Tech Team selection round. All participant details are fictional.
      </p>
    </footer>
  );
}
