import type { Page } from './types';

export const copy = {
  en: {
    name: 'Mohammed Nady', title: 'Head of HR Operations', hero: 'Turning HR Challenges into Practical Solutions',
    intro: 'I combine HR operations expertise with compensation, workforce analytics, and digital solutions to turn complex HR challenges into practical, data-informed decisions.',
    tools: 'Explore HR Tools', cases: 'View Case Studies', focus: 'What I Focus On', impact: 'Practical HR solutions for real business impact.',
    featured: 'Featured HR Tools', selected: 'Selected Case Studies', insights: 'Latest HR Insights', connect: "Let's Connect on LinkedIn",
  },
  ar: {
    name: 'محمد نادي', title: 'رئيس عمليات الموارد البشرية', hero: 'أحوّل تحديات الموارد البشرية إلى حلول عملية',
    intro: 'أجمع بين خبرة عمليات الموارد البشرية والتعويضات وتحليلات القوى العاملة والحلول الرقمية لتحويل التحديات المعقدة إلى قرارات عملية مدعومة بالبيانات.',
    tools: 'استكشف أدوات الموارد البشرية', cases: 'استعرض الدراسات العملية', focus: 'مجالات التركيز', impact: 'حلول عملية للموارد البشرية ذات أثر حقيقي على الأعمال.',
    featured: 'أدوات الموارد البشرية المميزة', selected: 'دراسات عملية مختارة', insights: 'أحدث رؤى الموارد البشرية', connect: 'تواصل معي عبر LinkedIn',
  },
};

export const navLabels = {
  en: { home: 'Home', about: 'About', tools: 'HR Tools', grossNet: 'Gross / Net Tool', contact: 'Contact' },
  ar: { home: 'الرئيسية', about: 'عني', tools: 'أدوات الموارد البشرية', grossNet: 'حاسبة الإجمالي والصافي', contact: 'تواصل' },
};

export const focusItems = {
  en: [
    ['HR Operations', 'Efficient, compliant and people-centric HR services.'],
    ['Compensation & Benefits', 'Fair, competitive and sustainable total rewards.'],
    ['Workforce Analytics', 'Transforming data into meaningful workforce decisions.'],
    ['Digital HR & Automation', 'Leveraging technology to simplify and enhance HR processes.'],
  ],
  ar: [
    ['عمليات الموارد البشرية', 'عمليات فعالة ومنضبطة تتمحور حول الأفراد.'],
    ['التعويضات والمزايا', 'مكافآت عادلة وتنافسية ومستدامة.'],
    ['تحليلات القوى العاملة', 'تحويل البيانات إلى قرارات أكثر وضوحًا.'],
    ['التحول الرقمي والأتمتة', 'توظيف التكنولوجيا لتبسيط عمليات الموارد البشرية وتحسينها.'],
  ],
};

type ToolCard = { icon: string; title: string; body: string; action: string; page?: Page };

export const toolCards: Record<'en' | 'ar', ToolCard[]> = {
  en: [
    { icon: '▣', title: 'Gross ↔ Net Calculator — Egypt', body: 'Estimate monthly salary deductions with editable HR assumptions.', action: 'Open Tool', page: 'grossNet' },
    { icon: '↗', title: 'Salary Increase Simulator', body: 'Model merit budgets, increase ranges and total monthly impact.', action: 'Coming Soon' },
    { icon: '◎', title: 'Compa-Ratio & Salary Positioning', body: 'Compare pay against midpoint and identify compression signals.', action: 'Coming Soon' },
  ],
  ar: [
    { icon: '▣', title: 'حاسبة الإجمالي ↔ الصافي — مصر', body: 'تقدير استقطاعات الراتب الشهري باستخدام افتراضات قابلة للتعديل.', action: 'افتح الأداة', page: 'grossNet' },
    { icon: '↗', title: 'محاكي زيادات الرواتب', body: 'نمذجة ميزانيات الزيادات وتأثيرها الشهري المتوقع.', action: 'قريبًا' },
    { icon: '◎', title: 'نسبة الراتب إلى منتصف النطاق (Compa-Ratio)', body: 'مقارنة الراتب بمنتصف النطاق واكتشاف إشارات ضغط الرواتب.', action: 'قريبًا' },
  ],
};
