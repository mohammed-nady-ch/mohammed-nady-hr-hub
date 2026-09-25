import React from 'react';
import { Navigate, Route, Routes, useLocation, useNavigate } from 'react-router-dom';
import ContactCTA from '../components/layout/ContactCTA';
import Footer from '../components/layout/Footer';
import Header from '../components/layout/Header';
import AboutPage from '../pages/AboutPage';
import GrossNetPage from '../pages/GrossNetPage';
import HomePage from '../pages/HomePage';
import ToolsPage from '../pages/ToolsPage';
import { pageFromPath, pagePaths } from '../types';
import type { Lang, Page } from '../types';

export default function App() {
  const [lang, setLang] = React.useState<Lang>('en');
  const location = useLocation();
  const navigate = useNavigate();
  const page = pageFromPath(location.pathname);
  const ar = lang === 'ar';

  React.useEffect(() => {
    document.documentElement.lang = lang;
    document.documentElement.dir = ar ? 'rtl' : 'ltr';
  }, [ar, lang]);

  const setPage = (nextPage: Page) => {
    navigate(pagePaths[nextPage]);
  };

  React.useEffect(() => {
    if (new URLSearchParams(location.search).get('section') === 'contact') {
      document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' });
      return;
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [location.pathname, location.search]);

  return (
    <div dir={ar ? 'rtl' : 'ltr'} lang={lang}>
      <Header ar={ar} lang={lang} page={page} setLang={setLang} setPage={setPage} />
      <main>
        <Routes>
          <Route path={pagePaths.home} element={<HomePage ar={ar} lang={lang} setPage={setPage} />} />
          <Route path={pagePaths.about} element={<AboutPage ar={ar} lang={lang} />} />
          <Route path={pagePaths.tools} element={<ToolsPage ar={ar} lang={lang} setPage={setPage} />} />
          <Route path={pagePaths.grossNet} element={<GrossNetPage ar={ar} />} />
          <Route path="*" element={<Navigate replace to={pagePaths.home} />} />
        </Routes>
        <ContactCTA ar={ar} lang={lang} />
      </main>
      <Footer ar={ar} />
    </div>
  );
}
