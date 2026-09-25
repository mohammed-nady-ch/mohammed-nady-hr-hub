import { copy, focusItems } from '../../siteContent';
import type { Lang } from '../../types';

export default function FocusSection({ lang }: { lang: Lang }) {
  const t = copy[lang];
  return (
    <section className="section" id="about">
      <div className="title"><h2>{t.focus}</h2><p>{t.impact}</p></div>
      <div className="grid4">
        {focusItems[lang].map(([title, body], index) => (
          <article key={title}>
            <i>{['♙', '◉', '▥', '⚙'][index]}</i><h3>{title}</h3><p>{body}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
