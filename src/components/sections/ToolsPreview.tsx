import { copy, toolCards } from '../../siteContent';
import type { Lang, Page } from '../../types';

export default function ToolsPreview({ lang, setPage }: { lang: Lang; setPage: (page: Page) => void }) {
  const t = copy[lang];
  return (
    <section className="section" id="tools">
      <div className="title">
        <h2>{t.featured}</h2>
        <p>{lang === 'ar' ? 'أدوات عملية مبنية حول قرارات HR اليومية.' : 'Practical tools built around everyday HR decisions.'}</p>
      </div>
      <div className="tools">
        {toolCards[lang].map((tool) => (
          <article key={tool.title}>
            <i>{tool.icon}</i><h3>{tool.title}</h3><p>{tool.body}</p>
            {tool.page ? (
              <button onClick={() => setPage(tool.page!)} type="button">{tool.action} →</button>
            ) : <span>{tool.action}</span>}
          </article>
        ))}
      </div>
    </section>
  );
}
