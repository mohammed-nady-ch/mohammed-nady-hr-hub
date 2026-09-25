import { copy } from '../../siteContent';
import type { Lang } from '../../types';

export default function ContactCTA({ ar, lang }: { ar: boolean; lang: Lang }) {
  const t = copy[lang];
  return (
    <section className="cta" id="contact">
      <div><small>{ar ? 'معًا نبني بيئات عمل أفضل' : "LET'S BUILD BETTER WORKPLACES"}</small><h2>{ar ? 'أفراد أقوى. مؤسسات أكثر قدرة.' : 'Stronger People. More Capable Organizations.'}</h2></div>
      <a href="https://www.linkedin.com/in/mohammed-nady" target="_blank">in&nbsp; {t.connect} {ar ? '←' : '→'}</a>
    </section>
  );
}
