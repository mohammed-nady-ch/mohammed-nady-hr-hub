import { Link } from 'react-router-dom';
import FocusSection from '../components/sections/FocusSection';
import ToolsPreview from '../components/sections/ToolsPreview';
import { copy } from '../siteContent';
import { contactSearch } from '../types';
import type { Lang, Page } from '../types';

export default function HomePage({ ar, lang, setPage }: { ar: boolean; lang: Lang; setPage: (page: Page) => void }) {
  const t = copy[lang];
  return (
    <>
      <section className="hero" id="home">
        <div className="copy">
          <small>{ar ? 'الأفراد × العمليات × البيانات × التكنولوجيا' : 'PEOPLE × PROCESS × DATA × TECHNOLOGY'}</small>
          <h1>{t.name}</h1><h2>{t.title}</h2><h3>{t.hero}</h3><p>{t.intro}</p>
          <div className="actions">
            <button onClick={() => setPage('tools')} type="button">{t.tools} {ar ? '←' : '→'}</button>
            <button className="ghost" onClick={() => setPage('about')} type="button">{ar ? 'اعرف المزيد' : 'Learn More'}</button>
          </div>
        </div>
        <div className="portrait"><img alt={t.name} src={`${import.meta.env.BASE_URL}mohammed-nady-hero.png`} /></div>
      </section>
      <Stats ar={ar} />
      <FocusSection lang={lang} />
      <ToolsPreview lang={lang} setPage={setPage} />
      <CaseInsights ar={ar} lang={lang} />
    </>
  );
}

function Stats({ ar }: { ar: boolean }) {
  const items = [
    ['20+', ar ? 'عامًا من الخبرة منذ 2003' : 'Years of Experience Since 2003'],
    ['♙', ar ? 'عمليات الموارد البشرية' : 'HR Operations'],
    ['▥', ar ? 'التعويضات' : 'Compensation'],
    ['◔', ar ? 'تحليلات القوى العاملة' : 'Workforce Analytics'],
    ['⚙', ar ? 'التحول الرقمي والأتمتة' : 'Digital HR & Automation'],
  ];
  return (
    <section className="stats">
      {items.map(([icon, text]) => <div key={text}><b>{icon}</b><span>{text}</span></div>)}
    </section>
  );
}

function CaseInsights({ ar, lang }: { ar: boolean; lang: Lang }) {
  const t = copy[lang];
  const insights = ar
    ? ['لماذا يحدث ضغط الرواتب وكيف تكتشفه الموارد البشرية؟', 'عدد الموظفين لا يساوي تخطيط القوى العاملة', 'من Excel إلى دعم القرار']
    : ['Why Salary Compression Happens — and How HR Can Detect It', 'Headcount Is Not Workforce Planning', 'From Excel to Decision Support'];
  return (
    <section className="lower section">
      <div id="cases">
        <h2>{t.selected}</h2>
        <article className="case"><div>CDSS</div><section>
          <h3>{ar ? 'نظام دعم قرارات التعويضات' : 'Compensation Decision Support System'}</h3>
          <p>{ar ? 'تحويل تخطيط الزيادات إلى عملية قرار منظمة وقابلة للتفسير.' : 'Turning salary increase planning into a structured, explainable decision process.'}</p>
        </section></article>
      </div>
      <div id="insights">
        <h2>{t.insights}</h2>
        {insights.map((item) => <Link className="article" key={item} to={{ pathname: '/', search: contactSearch }}>▥ <b>{item}</b> {ar ? '←' : '→'}</Link>)}
      </div>
    </section>
  );
}
