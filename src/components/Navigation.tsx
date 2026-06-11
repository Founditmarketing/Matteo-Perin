import React, { useState, useEffect } from 'react';
import { Logo } from './Logo';
import { SpinningLogo } from './SpinningLogo';
import { useNavigate, useLocation, Link } from 'react-router-dom';

import { useTheme } from '../context/ThemeContext';
import { useCart } from '../context/CartContext';
import { NAV_ITEMS } from '../constants';

export const Navigation: React.FC = () => {
  const [scrolled, setScrolled] = useState(false);
  const [visible, setVisible] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const { theme, toggleTheme } = useTheme();
  const { cartCount, setIsCartOpen } = useCart();
  const navigate = useNavigate();
  const location = useLocation();

  const holdTimer = React.useRef<NodeJS.Timeout | null>(null);
  const holdingSucceeded = React.useRef(false);

  const startHold = () => {
    holdingSucceeded.current = false;
    holdTimer.current = setTimeout(() => {
      holdingSucceeded.current = true;
      navigate('/vault');
    }, 3000);
  };

  const endHold = () => {
    if (holdTimer.current) {
      clearTimeout(holdTimer.current);
    }
  };

  const handleClick = (e: React.MouseEvent) => {
    if (holdingSucceeded.current) {
      e.preventDefault();
    }
  };

  // Scroll Tracker
  useEffect(() => {
    let lastScrollY = window.scrollY;

    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      const isScrollingDown = currentScrollY > lastScrollY;
      const scrollDelta = Math.abs(currentScrollY - lastScrollY);

      if (scrollDelta > 5) {
        if (isScrollingDown && currentScrollY > 100 && !mobileMenuOpen) {
          setVisible(false);
        } else {
          setVisible(true);
        }
      }
      setScrolled(currentScrollY > 10);
      lastScrollY = currentScrollY;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [mobileMenuOpen]);

  // Escape key closes mobile menu
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && mobileMenuOpen) setMobileMenuOpen(false);
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [mobileMenuOpen]);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    document.body.style.overflow = mobileMenuOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [mobileMenuOpen]);

  const isHome = location.pathname === '/';
  const showSolidNav = scrolled && !mobileMenuOpen;

  // Smart Contrast: force white only on pages that truly open on a dark hero.
  // (/bespoke and both lookbooks open on cream — white links with text-shadow
  // halos were barely legible there.)
  const darkHeroPages = ['/', '/furniture', '/the-house'];
  const hasDarkHero = darkHeroPages.includes(location.pathname);
  const textColorClass = (!showSolidNav && hasDarkHero)
    ? 'text-white [text-shadow:0_1px_8px_rgba(0,0,0,0.6),0_0_2px_rgba(0,0,0,0.4)]'
    : (showSolidNav ? 'text-matteo-charcoal dark:text-white' : 'text-matteo-charcoal dark:text-matteo-cream');

  return (
    <>
      <nav
        className={`fixed top-0 left-0 w-full z-[100000] transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] 
                ${visible ? 'translate-y-0' : '-translate-y-full'}
                ${showSolidNav ? 'bg-matteo-cream/95 dark:bg-matteo-black/95  py-4 border-b border-matteo-charcoal/5 dark:border-white/5' : 'bg-transparent py-8'}
                ${textColorClass}`}
      >
        {/* Centered Logo */}
        <Link
          to="/"
          onClick={handleClick}
          onPointerDown={startHold}
          onPointerUp={endHold}
          onPointerLeave={endHold}
          onPointerCancel={endHold}
          onTouchStart={startHold}
          onTouchEnd={endHold}
          onTouchCancel={endHold}
          onContextMenu={(e) => e.preventDefault()}
          className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 z-[300000] select-none touch-none"
          style={{ WebkitTouchCallout: 'none', WebkitUserSelect: 'none' }}
        >
          <SpinningLogo
            size={showSolidNav ? 40 : 64}
            duration={20}
            className={`transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]`}
            white={false}
          />
        </Link>

        <div className="max-w-[1920px] mx-auto px-8 md:px-16 flex items-center w-full relative z-[200000]">

          {/* Left Side: Layout -> Hug center */}
          <div className="flex-1 flex justify-end pr-4 lg:pr-8 xl:pr-12">
            <div className="hidden lg:flex items-center gap-5 xl:gap-10">
              {NAV_ITEMS.slice(0, 3).map((item) => (
                <Link key={item.label} to={item.href} className={`font-sans text-[10px] uppercase tracking-luxury hover:text-matteo-orange transition-colors whitespace-nowrap ${textColorClass}`}>
                  {item.label}
                </Link>
              ))}
            </div>
          </div>

          {/* Center: Spacer for Logo (Maintains gap) */}
          <div className="w-16 lg:w-24 shrink-0"></div>

          {/* Right Side: Layout -> Hug center */}
          <div className="flex-1 flex justify-start pl-4 lg:pl-8 xl:pl-12">
            <div className="hidden lg:flex items-center gap-5 xl:gap-10">
              {NAV_ITEMS.slice(3).map((item) => (
                <Link key={item.label} to={item.href} className={`font-sans text-[10px] uppercase tracking-luxury hover:text-matteo-orange transition-colors whitespace-nowrap ${textColorClass}`}>
                  {item.label}
                </Link>
              ))}

            </div>
          </div>

          {/* Actions: Absolute Right */}
          <div className="absolute right-8 md:right-16 top-1/2 -translate-y-1/2 flex items-center gap-6">

            {/* Bag — persistent cart trigger */}
            <button
              onClick={() => setIsCartOpen(true)}
              className="relative p-2 hover:text-matteo-orange transition-colors"
              aria-label={`Open bag${cartCount > 0 ? `, ${cartCount} item${cartCount === 1 ? '' : 's'}` : ''}`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 1 0-7.5 0v4.5m11.356-1.993 1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 0 1-1.12-1.243l1.264-12A1.125 1.125 0 0 1 5.513 7.5h12.974c.576 0 1.059.435 1.119 1.007Z" />
              </svg>
              {cartCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 px-1 rounded-full bg-matteo-orange text-white font-sans text-[10px] leading-4 text-center">
                  {cartCount}
                </span>
              )}
            </button>

            <button
              onClick={() => setMobileMenuOpen(true)}
              className="lg:hidden group flex flex-col gap-1.5 p-2 hover:opacity-70 transition-opacity"
              aria-label="Toggle navigation menu"
              aria-expanded={mobileMenuOpen}
              aria-controls="mobile-navigation"
            >
              <span className="block w-6 h-[1px] bg-current group-hover:bg-matteo-orange transition-colors"></span>
              <span className="block w-6 h-[1px] bg-current group-hover:bg-matteo-orange transition-colors"></span>
            </button>
          </div>

        </div>
      </nav>

      {/* Mobile Menu Overlay - Restored to Dark Luxury Standard */}
      <div
        id="mobile-navigation"
        onClick={(e) => { if (e.target === e.currentTarget) setMobileMenuOpen(false); }}
        className={`fixed top-0 left-0 w-full h-[100dvh] z-[100001] bg-matteo-black/95 transition-all duration-700 ease-[cubic-bezier(0.76,0,0.24,1)] ${mobileMenuOpen ? 'opacity-100 visible' : 'opacity-0 invisible pointer-events-none'}`}
      >

        <div className="absolute top-6 right-6 z-[100002]">
          <button onClick={() => setMobileMenuOpen(false)} className="flex items-center justify-center w-12 h-12 rounded-full border border-white/20 text-white hover:bg-white/10 transition-colors" aria-label="Close menu">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        <div className="h-full flex flex-col items-center justify-center space-y-8 relative z-10 text-center">
          {NAV_ITEMS.map((item, index) => (
            <Link
              key={item.label}
              to={item.href}
              onClick={() => setMobileMenuOpen(false)}
              className={`font-serif text-4xl md:text-5xl text-white hover:italic hover:text-matteo-orange transition-all duration-700 transform ${mobileMenuOpen ? 'translate-y-0 opacity-100' : 'translate-y-12 opacity-0'}`}
              style={{ transitionDelay: `${100 + index * 100}ms` }}
            >
              {item.label}
            </Link>
          ))}


        </div>
      </div>
    </>
  );
};
