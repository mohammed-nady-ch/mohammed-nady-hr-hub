import FocusSection from '../components/sections/FocusSection';
import type { Lang } from '../types';

export default function AboutPage({ ar, lang }: { ar: boolean; lang: Lang }) {
  return (
    <>
      <section className="pageHero">
        <small>{ar ? 'عن محمد نادي' : 'ABOUT MOHAMMED NADY'}</small>
        <h1>{ar ? 'خبرة HR عملية تجمع التشغيل، التعويضات، البيانات، والتحول الرقمي.' : 'Practical HR expertise across operations, rewards, analytics and digital transformation.'}</h1>
        <p>{ar ? 'الهدف من هذا الـHub هو تحويل خبرة الموارد البشرية إلى أدوات، نماذج، ودراسات عملية تساعد فرق HR والإدارة على اتخاذ قرارات أوضح.' : 'This hub turns HR experience into practical tools, frameworks and case studies that help HR teams and leaders make clearer decisions.'}</p>
      </section>
      <FocusSection lang={lang} />
      <section className="section split">
        <article><h2>{ar ? 'طريقة العمل' : 'How I Work'}</h2><p>{ar ? 'أبدأ بفهم المشكلة التشغيلية، ثم أبني إطار قرار واضح، وبعدها أحول الإطار إلى أداة قابلة للاستخدام والمتابعة.' : 'I start from the operating problem, shape it into a clear decision framework, then turn that framework into a usable tool or workflow.'}</p></article>
        <article><h2>{ar ? 'ما الذي يميز الـHub' : 'What Makes This Hub Useful'}</h2><p>{ar ? 'المحتوى هنا ليس عرضًا نظريًا؛ كل صفحة أو أداة مصممة لتقليل الغموض وتحسين جودة قرارات الموارد البشرية.' : 'The content here is not theory-first; each page and tool is designed to reduce ambiguity and improve HR decision quality.'}</p></article>
      </section>
    </>
  );
}
