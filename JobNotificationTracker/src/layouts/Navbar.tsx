import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { areAllTestsPassed, readTestChecklistState, TEST_CHECKLIST_UPDATED_EVENT } from '../utils';

type NavItem = {
  label: string;
  path: string;
  isActive: (pathname: string) => boolean;
};

const navItems: NavItem[] = [
  { label: 'Dashboard', path: '/dashboard', isActive: (p) => p === '/dashboard' },
  { label: 'Saved', path: '/saved', isActive: (p) => p === '/saved' },
  { label: 'Digest', path: '/digest', isActive: (p) => p === '/digest' },
  { label: 'Test', path: '/jt/07-test', isActive: (p) => p === '/jt/07-test' },
  { label: 'Ship', path: '/jt/08-ship', isActive: (p) => p === '/jt/08-ship' },
  { label: 'Settings', path: '/settings', isActive: (p) => p === '/settings' || p === '/' },
  { label: 'Proof', path: '/proof', isActive: (p) => p === '/proof' || p === '/jt/proof' },
];

export function Navbar() {
  const { pathname } = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [shipUnlocked, setShipUnlocked] = useState(() => areAllTestsPassed(readTestChecklistState()));

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    const syncShipLock = () => {
      setShipUnlocked(areAllTestsPassed(readTestChecklistState()));
    };

    window.addEventListener('storage', syncShipLock);
    window.addEventListener(TEST_CHECKLIST_UPDATED_EVENT, syncShipLock as EventListener);

    return () => {
      window.removeEventListener('storage', syncShipLock);
      window.removeEventListener(TEST_CHECKLIST_UPDATED_EVENT, syncShipLock as EventListener);
    };
  }, []);

  const renderNavLink = (item: NavItem) => {
    const isShipLocked = item.path === '/jt/08-ship' && !shipUnlocked;

    return (
      <Link
        to={item.path}
        className={
          isShipLocked
            ? 'nav-link nav-link--disabled'
            : item.isActive(pathname)
              ? 'nav-link active'
              : 'nav-link'
        }
        onClick={isShipLocked ? (event) => event.preventDefault() : undefined}
        aria-disabled={isShipLocked}
        title={isShipLocked ? 'Complete all checklist items to unlock Ship.' : undefined}
      >
        {item.label}
      </Link>
    );
  };

  return (
    <header className="top-nav-wrap">
      <nav className="top-nav" aria-label="Primary">
        <button
          type="button"
          className="menu-toggle"
          aria-expanded={mobileMenuOpen}
          aria-controls="mobile-nav-links"
          onClick={() => setMobileMenuOpen((current) => !current)}
        >
          <span className="sr-only">Toggle navigation menu</span>
          <span className="menu-line" />
          <span className="menu-line" />
          <span className="menu-line" />
        </button>

        <ul className="nav-links desktop-nav">
          {navItems.map((item) => (
            <li key={item.path}>
              {renderNavLink(item)}
            </li>
          ))}
        </ul>

        <ul
          id="mobile-nav-links"
          className={mobileMenuOpen ? 'nav-links mobile-nav open' : 'nav-links mobile-nav'}
        >
          {navItems.map((item) => (
            <li key={`mobile-${item.path}`}>
              {renderNavLink(item)}
            </li>
          ))}
        </ul>
      </nav>
    </header>
  );
}
