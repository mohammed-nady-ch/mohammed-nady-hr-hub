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
  en: { home: 'Home', about: 'About', tools: 'HR Tools', grossNet: 'Private-Sector Salary Tool', governmentSalary: 'Government Salary Tool', salaryIncrease: 'Salary Increase Tool', contact: 'Contact' },
  ar: { home: 'الرئيسية', about: 'عني', tools: 'أدوات الموارد البشرية', grossNet: 'حاسبة مرتب القطاع الخاص', governmentSalary: 'حاسبة مرتب القطاع الحكومي', salaryIncrease: 'محاكي زيادات الرواتب', contact: 'تواصل' },
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
    { icon: '▣', title: 'Private-Sector Salary Calculator — Gross ↔ Net', body: 'Estimate monthly salary deductions for private-sector employees in Egypt using editable HR assumptions.', action: 'Open Tool', page: 'grossNet' },
    { icon: '▤', title: 'Government-Sector Salary Calculator — Egypt', body: 'Estimate monthly net salary for a standard government civil-service employee using separate government payroll rules.', action: 'Open Tool', page: 'governmentSalary' },
    { icon: '↗', title: 'Salary Increase Budget Simulator', body: 'Compare uniform, weighted and performance-based salary increase allocations against an annual budget.', action: 'Open Tool', page: 'salaryIncrease' },
    { icon: '◎', title: 'Compa-Ratio & Salary Positioning', body: 'Compare pay against midpoint and identify compression signals.', action: 'Coming Soon' },
  ],
  ar: [
    { icon: '▣', title: 'حاسبة مرتب القطاع الخاص — الإجمالي ↔ الصافي', body: 'تقدير استقطاعات الراتب الشهري لموظفي القطاع الخاص في مصر باستخدام افتراضات قابلة للتعديل.', action: 'افتح الأداة', page: 'grossNet' },
    { icon: '▤', title: 'حاسبة مرتب القطاع الحكومي — مصر', body: 'تقدير صافي الراتب الشهري لموظف بالقطاع الحكومي خاضع لقانون الخدمة المدنية، باستخدام قواعد حكومية مستقلة.', action: 'افتح الأداة', page: 'governmentSalary' },
    { icon: '↗', title: 'محاكي ميزانية زيادات الرواتب', body: 'قارن توزيع الزيادات الموحدة أو الموزونة أو المرتبطة بالأداء مع الميزانية السنوية.', action: 'افتح الأداة', page: 'salaryIncrease' },
    { icon: '◎', title: 'نسبة الراتب إلى منتصف النطاق (Compa-Ratio)', body: 'مقارنة الراتب بمنتصف النطاق واكتشاف إشارات ضغط الرواتب.', action: 'قريبًا' },
  ],
};
