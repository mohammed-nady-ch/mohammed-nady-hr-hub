import ToolsPreview from '../components/sections/ToolsPreview';
import type { Lang, Page } from '../types';

export default function ToolsPage({ ar, lang, setPage }: { ar: boolean; lang: Lang; setPage: (page: Page) => void }) {
  return (
    <>
      <section className="pageHero">
        <small>{ar ? 'HR TOOLS' : 'HR TOOLS'}</small>
        <h1>{ar ? 'أدوات عملية لدعم قرارات الموارد البشرية اليومية.' : 'Practical tools for day-to-day HR decision support.'}</h1>
        <p>{ar ? 'ابدأ بحاسبة الراتب، ثم لاحقًا سيتم إضافة محاكاة الزيادات وتحليل موقع الراتب داخل النطاق.' : 'Start with the salary calculator. Salary increase simulation and salary positioning tools will follow.'}</p>
      </section>
      <ToolsPreview lang={lang} setPage={setPage} />
    </>
  );
}
