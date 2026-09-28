import ToolsPreview from '../components/sections/ToolsPreview';
import type { Lang, Page } from '../types';

export default function ToolsPage({ ar, lang, setPage }: { ar: boolean; lang: Lang; setPage: (page: Page) => void }) {
  return (
    <>
      <section className="pageHero">
        <small>{ar ? 'أدوات الموارد البشرية' : 'HR TOOLS'}</small>
        <h1>{ar ? 'أدوات عملية لدعم قرارات الموارد البشرية اليومية.' : 'Practical tools for day-to-day HR decision support.'}</h1>
        <p>{ar ? 'استخدم حاسبة الراتب أو قارن سيناريوهات ميزانية الزيادات، مع إضافة أدوات تحليل موقع الراتب لاحقًا.' : 'Use the salary calculator or compare salary-increase budget scenarios. Salary positioning tools will follow.'}</p>
      </section>
      <ToolsPreview lang={lang} setPage={setPage} />
    </>
  );
}
