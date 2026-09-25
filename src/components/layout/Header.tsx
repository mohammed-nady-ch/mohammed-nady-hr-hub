import React from 'react';
import { Link } from 'react-router-dom';
import { copy, navLabels } from '../../siteContent';
import { contactSearch, pagePaths } from '../../types';
import type { Lang, Page } from '../../types';

type HeaderProps = {
  ar: boolean;
  lang: Lang;
  page: Page;
  setLang: (lang: Lang) => void;
  setPage: (page: Page) => void;
};

export default function Header({ ar, lang, page, setLang, setPage }: HeaderProps) {
  const labels = navLabels[lang];
  const items: Page[] = ['home', 'about', 'tools'];
  const [menuOpen, setMenuOpen] = React.useState(false);
  const menuButtonRef = React.useRef<HTMLButtonElement>(null);
  const menuLabel = menuOpen
    ? ar ? 'إغلاق قائمة التنقل' : 'Close navigation menu'
    : ar ? 'فتح قائمة التنقل' : 'Open navigation menu';

  React.useEffect(() => {
    setMenuOpen(false);
  }, [page]);

  React.useEffect(() => {
    if (!menuOpen) return;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setMenuOpen(false);
        menuButtonRef.current?.focus();
      }
    };
    window.addEventListener('keydown', closeOnEscape);
    return () => window.removeEventListener('keydown', closeOnEscape);
  }, [menuOpen]);

  const selectPage = (nextPage: Page) => {
    setPage(nextPage);
    setMenuOpen(false);
  };

  const switchLanguage = () => {
    setLang(ar ? 'en' : 'ar');
    setMenuOpen(false);
  };

  const navigationItems = items.map((item) => {
    const active = page === item || (item === 'tools' && page === 'grossNet');
    return (
      <button
        aria-current={active ? 'page' : undefined}
        className={active ? 'active' : ''}
        key={item}
        onClick={() => selectPage(item)}
        type="button"
      >
        {labels[item]}
      </button>
    );
  });

  return (
    <header>
      <button className="brand" onClick={() => selectPage('home')} type="button">
        <span className="mn">MN</span>
        <span><b>{copy[lang].name}</b><small>HR OPERATIONS</small></span>
      </button>
      <nav aria-label={ar ? 'التنقل الرئيسي' : 'Primary navigation'} className="desktopNav">
        {navigationItems}
        <Link to={{ pathname: pagePaths[page], search: contactSearch }}>{labels.contact}</Link>
      </nav>
      <button
        aria-controls="mobile-navigation"
        aria-expanded={menuOpen}
        aria-label={menuLabel}
        className={`menuToggle${menuOpen ? ' open' : ''}`}
        onClick={() => setMenuOpen((open) => !open)}
        ref={menuButtonRef}
        type="button"
      >
        <span aria-hidden="true" /><span aria-hidden="true" /><span aria-hidden="true" />
      </button>
      <nav
        aria-label={ar ? 'قائمة التنقل للهاتف' : 'Mobile navigation'}
        className={`mobileNav${menuOpen ? ' open' : ''}`}
        id="mobile-navigation"
      >
        {navigationItems}
        <Link onClick={() => setMenuOpen(false)} to={{ pathname: pagePaths[page], search: contactSearch }}>{labels.contact}</Link>
      </nav>
      <button className="lang" onClick={switchLanguage} type="button">{ar ? 'EN' : 'AR'}</button>
      <a className="in" href="https://www.linkedin.com/in/mohammed-nady" target="_blank">in</a>
    </header>
  );
}
