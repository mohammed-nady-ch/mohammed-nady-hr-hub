import type { Page } from './types';

export const copy = {
  en: {
    name: 'Mohammed Nady', title: 'Head of HR Operations', hero: 'Turning HR Challenges into Practical Solutions',
    intro: 'I combine HR operations expertise with compensation, workforce analytics and digital solutions to turn complex HR challenges into practical, data-informed decisions.',
    tools: 'Explore HR Tools', cases: 'View Case Studies', focus: 'What I Focus On', impact: 'Practical HR solutions for real business impact.',
    featured: 'Featured HR Tools', selected: 'Selected Case Studies', insights: 'Latest HR Insights', connect: "Let's Connect on LinkedIn",
  },
  ar: {
    name: 'محمد نادي', title: 'رئيس عمليات الموارد البشرية', hero: 'أحوّل تحديات الموارد البشرية إلى حلول عملية',
    intro: 'أجمع بين خبرة عمليات الموارد البشرية والتعويضات وتحليلات القوى العاملة والحلول الرقمية لتحويل التحديات المعقدة إلى قرارات عملية مدعومة بالبيانات.',
    tools: 'استكشف أدوات HR', cases: 'استعرض الدراسات العملية', focus: 'مجالات التركيز', impact: 'حلول موارد بشرية عملية ذات أثر حقيقي على الأعمال.',
    featured: 'أدوات HR المميزة', selected: 'دراسات عملية مختارة', insights: 'أحدث رؤى HR', connect: 'تواصل معي على LinkedIn',
  },
};

export const navLabels = {
  en: { home: 'Home', about: 'About', tools: 'HR Tools', grossNet: 'Gross / Net Tool', contact: 'Contact' },
  ar: { home: 'الرئيسية', about: 'عني', tools: 'أدوات HR', grossNet: 'حاسبة الراتب', contact: 'تواصل' },
};

export const focusItems = {
  en: [
    ['HR Operations', 'Efficient, compliant and people-centric HR services.'],
    ['Compensation & Benefits', 'Fair, competitive and sustainable total rewards.'],
    ['Workforce Analytics', 'Transforming data into meaningful workforce decisions.'],
    ['Digital HR & Automation', 'Leveraging technology to simplify and enhance HR processes.'],
  ],
  ar: [
    ['HR Operations', 'عمليات موارد بشرية فعالة ومنضبطة تتمحور حول الأفراد.'],
    ['Compensation & Benefits', 'مكافآت عادلة وتنافسية ومستدامة.'],
    ['Workforce Analytics', 'تحويل البيانات إلى قرارات أكثر وضوحًا.'],
    ['Digital HR & Automation', 'توظيف التكنولوجيا لتبسيط وتحسين العمليات.'],
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
    { icon: '▣', title: 'حاسبة Gross ↔ Net — مصر', body: 'تقدير استقطاعات الراتب الشهري باستخدام افتراضات HR قابلة للتعديل.', action: 'افتح الأداة', page: 'grossNet' },
    { icon: '↗', title: 'محاكي زيادات الرواتب', body: 'نمذجة ميزانيات الزيادات وتأثيرها الشهري المتوقع.', action: 'قريبًا' },
    { icon: '◎', title: 'Compa-Ratio وتحديد موقع الراتب', body: 'مقارنة الراتب بمنتصف النطاق واكتشاف إشارات الضغط الداخلي.', action: 'قريبًا' },
  ],
};
