import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

// Scroll to the top on page change, or to #hash targets like /#about.
export default function ScrollToTop() {
  const { pathname, hash } = useLocation();
  useEffect(() => {
    if (hash) {
      document.getElementById(hash.slice(1))?.scrollIntoView({ behavior: 'smooth' });
    } else {
      window.scrollTo(0, 0);
    }
  }, [pathname, hash]);
  return null;
}
