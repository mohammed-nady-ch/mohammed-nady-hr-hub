import React from 'react';
import {
  calculateGovernmentPayroll,
  type GovernmentJobGrade,
} from '../features/governmentPayroll/engine';
import { egyptGovernmentPayrollRules2026 } from '../features/governmentPayroll/rules/egypt/2026';

const content = {
  en: {
    eyebrow: 'EGYPT · CIVIL SERVICE EMPLOYEES · 2026',
    title: 'Government Salary Calculator',
    intro: 'Estimate monthly net salary for a standard insured civil-service employee. The government calculation engine and rules are fully separate from the private-sector calculator.',
    scope: 'V1 scope', scopeText: 'Regular monthly government salary for civil-service employees. Public-sector companies, special cadres, annual settlements and Net-to-Gross are not included.',
    earnings: 'Monthly earnings', functional: 'Functional wage', complementary: 'Complementary wage', otherTaxable: 'Other taxable earnings',
    insurance: 'Insurance and employee status', nonInsurable: 'Non-insurable allowances included in the earnings above', nonInsurableHelp: 'This value is not added again to total earnings.', declaredToggle: 'Use the insurance wage shown on the payslip', declaredWage: 'Declared monthly insurance wage', insured: 'Employee is socially insured',
    grade: 'Job grade (optional)', gradeHelp: 'For reference only. It does not affect the calculation result.', gradeThird: 'Third grade and below', gradeFirst: 'Second and first grades', gradeSenior: 'Senior, excellent and above first',
    deductions: 'Government deductions', stamp: 'Apply proportional stamp duty', martyrs: 'Apply Martyrs Fund contribution', otherDeductions: 'Other employee deductions',
    uhi: 'Universal Health Insurance', uhiQuestion: 'A Universal Health Insurance contribution is deducted from the payslip', uhiHelp: 'Select this only when the payslip includes the new Universal Health Insurance contribution.', spouse: 'Non-working spouses', dependents: 'Dependents',
    result: 'Estimated monthly result', net: 'Net salary', totalEarnings: 'Total earnings', calculatedInsurance: 'Calculated insurance wage before limits', contributionWage: 'Insurance contribution wage', socialInsurance: 'Employee social insurance', employeeUhi: 'Employee UHI contribution', familyUhi: 'Family UHI contributions', stampDuty: 'Proportional stamp duty', tax: 'Monthly income tax', martyrsFund: 'Martyrs Fund contribution', totalDeductions: 'Total deductions', annualTaxable: 'Annual taxable income',
    nonInsurableError: 'Non-insurable allowances cannot exceed total monthly earnings.',
    method: 'Method and limitations', methodText: 'The estimate annualizes one month and applies the documented 2026 assumptions. Stamp duty is modelled for regular salary disbursements under article 79. Confirm the payslip insurance wage, UHI status, exemptions and exceptional employment status with Payroll or the employing authority.',
    sources: 'Official sources',
  },
  ar: {
    eyebrow: 'مصر · موظفو الخدمة المدنية · 2026',
    title: 'حاسبة المرتب الحكومي',
    intro: 'تقدير صافي الراتب الشهري للحالة القياسية لموظف حكومي مؤمّن عليه وخاضع لقانون الخدمة المدنية. محرك وقواعد الحكومة منفصلان بالكامل عن حاسبة القطاع الخاص.',
    scope: 'نطاق الإصدار الأول', scopeText: 'المرتب الحكومي الشهري المعتاد لموظفي الخدمة المدنية. لا يشمل شركات القطاع العام أو الكوادر الخاصة أو التسويات السنوية أو الحساب من الصافي إلى الإجمالي.',
    earnings: 'الاستحقاقات الشهرية', functional: 'الأجر الوظيفي', complementary: 'الأجر المكمل', otherTaxable: 'استحقاقات أخرى خاضعة للضريبة',
    insurance: 'التأمينات وحالة الموظف', nonInsurable: 'بدلات غير خاضعة للتأمينات ومشمولة في الاستحقاقات أعلاه', nonInsurableHelp: 'لا تُضاف هذه القيمة مرة أخرى إلى إجمالي الاستحقاقات.', declaredToggle: 'استخدام الأجر التأميني المسجل في مفردات المرتب', declaredWage: 'الأجر التأميني الشهري المسجل', insured: 'الموظف مؤمّن عليه اجتماعيًا',
    grade: 'الدرجة الوظيفية (اختياري)', gradeHelp: 'للبيان فقط، ولا تؤثر في نتيجة الحساب.', gradeThird: 'الدرجة الثالثة وما دونها', gradeFirst: 'الدرجتان الثانية والأولى', gradeSenior: 'العليا والممتازة وما فوق الأولى',
    deductions: 'الاستقطاعات الحكومية', stamp: 'تطبيق الدمغة النسبية', martyrs: 'تطبيق مساهمة صندوق الشهداء', otherDeductions: 'استقطاعات أخرى على الموظف',
    uhi: 'التأمين الصحي الشامل', uhiQuestion: 'يوجد خصم للتأمين الصحي الشامل في مفردات المرتب', uhiHelp: 'اختر هذا فقط إذا كانت مفردات المرتب تتضمن خصم نظام التأمين الصحي الشامل الجديد.', spouse: 'عدد الزوجات غير العاملات', dependents: 'عدد المعالين',
    result: 'النتيجة الشهرية التقديرية', net: 'صافي الراتب', totalEarnings: 'إجمالي الاستحقاقات', calculatedInsurance: 'الأجر التأميني المحسوب قبل الحدود', contributionWage: 'أجر الاشتراك التأميني', socialInsurance: 'حصة الموظف في التأمينات الاجتماعية', employeeUhi: 'اشتراك الموظف في التأمين الصحي الشامل', familyUhi: 'اشتراكات الأسرة في التأمين الصحي الشامل', stampDuty: 'الدمغة النسبية', tax: 'ضريبة الدخل الشهرية', martyrsFund: 'مساهمة صندوق الشهداء', totalDeductions: 'إجمالي الاستقطاعات', annualTaxable: 'الدخل السنوي الخاضع للضريبة',
    nonInsurableError: 'لا يمكن أن تتجاوز البدلات غير التأمينية إجمالي الاستحقاقات الشهرية.',
    method: 'المنهج والحدود', methodText: 'يحوّل التقدير شهرًا كاملًا إلى أساس سنوي ويطبق افتراضات 2026 الموثقة. تُحسب الدمغة للصرفية الشهرية المعتادة وفق المادة 79. راجع أجر الاشتراك وحالة التأمين الصحي الشامل والإعفاءات والحالات الوظيفية الخاصة مع إدارة الرواتب أو جهة العمل.',
    sources: 'المصادر الرسمية',
  },
} as const;

function NumberInput({ label, value, onChange, help, disabled = false, step = 1 }: {
  label: string;
  value: number;
  onChange: (value: number) => void;
  help?: string;
  disabled?: boolean;
  step?: number;
}) {
  return (
    <label className="moneyField">
      <span>{label}</span>
      <input disabled={disabled} dir="ltr" min="0" onChange={(event) => onChange(Math.max(0, Number(event.target.value)))} step={step} type="number" value={Number.isFinite(value) ? value : 0} />
      {help && <small>{help}</small>}
    </label>
  );
}

export default function GovernmentSalaryPage({ ar }: { ar: boolean }) {
  const labels = content[ar ? 'ar' : 'en'];
  const [functionalWage, setFunctionalWage] = React.useState(12_000);
  const [complementaryWage, setComplementaryWage] = React.useState(8_000);
  const [otherTaxableEarnings, setOtherTaxableEarnings] = React.useState(0);
  const [nonInsurableAllowances, setNonInsurableAllowances] = React.useState(0);
  const [insured, setInsured] = React.useState(true);
  const [useDeclaredInsuranceWage, setUseDeclaredInsuranceWage] = React.useState(true);
  const [declaredInsuranceWage, setDeclaredInsuranceWage] = React.useState(16_700);
  const [jobGrade, setJobGrade] = React.useState<GovernmentJobGrade>('first-and-second');
  const [stampDutyEnabled, setStampDutyEnabled] = React.useState(true);
  const [martyrsFundEnabled, setMartyrsFundEnabled] = React.useState(true);
  const [uhiEnabled, setUhiEnabled] = React.useState(false);
  const [nonWorkingSpouses, setNonWorkingSpouses] = React.useState(0);
  const [dependents, setDependents] = React.useState(0);
  const [otherDeductions, setOtherDeductions] = React.useState(0);
  const totalEarnings = functionalWage + complementaryWage + otherTaxableEarnings;
  const invalidNonInsurable = nonInsurableAllowances > totalEarnings;

  const result = React.useMemo(() => calculateGovernmentPayroll({
    functionalWage,
    complementaryWage,
    otherTaxableEarnings,
    nonInsurableAllowances,
    declaredInsuranceWage: insured && useDeclaredInsuranceWage ? declaredInsuranceWage : undefined,
    jobGrade,
    insured,
    proportionalStampDutyEnabled: stampDutyEnabled,
    universalHealthInsurance: { enabled: uhiEnabled, nonWorkingSpouses, dependents },
    martyrsFundEnabled,
    otherDeductions,
  }, egyptGovernmentPayrollRules2026), [
    complementaryWage, declaredInsuranceWage, dependents, functionalWage, insured, jobGrade,
    martyrsFundEnabled, nonInsurableAllowances, nonWorkingSpouses, otherDeductions,
    otherTaxableEarnings, stampDutyEnabled, uhiEnabled, useDeclaredInsuranceWage,
  ]);

  const money = React.useMemo(() => new Intl.NumberFormat(ar ? 'ar-EG' : 'en-EG', {
    currency: 'EGP',
    maximumFractionDigits: 2,
    style: 'currency',
  }), [ar]);

  const rows = [
    [labels.totalEarnings, result.totalEarnings],
    [labels.calculatedInsurance, result.calculatedInsuranceWage],
    [labels.contributionWage, result.insuranceContributionWage],
    [labels.socialInsurance, result.employeeSocialInsurance],
    [labels.employeeUhi, result.employeeUhiContribution],
    [labels.familyUhi, result.familyUhiContribution],
    [labels.stampDuty, result.proportionalStampDuty],
    [labels.tax, result.monthlyIncomeTax],
    [labels.martyrsFund, result.martyrsFundContribution],
    [labels.otherDeductions, result.otherDeductions],
    [labels.totalDeductions, result.totalDeductions],
    [labels.annualTaxable, result.annualTaxableIncome],
  ] as const;

  return (
    <>
      <section className="pageHero"><small>{labels.eyebrow}</small><h1>{labels.title}</h1><p>{labels.intro}</p></section>
      <section className="governmentPayrollSection section">
        <div className="legalNotice governmentScope"><strong>{labels.scope}</strong><span>{labels.scopeText}</span></div>
        <div className="toolShell payrollShell">
          <div className="calculator payrollInputs">
            <div className="formSectionHeading"><h2>{labels.earnings}</h2></div>
            <div className="governmentFieldGrid">
              <NumberInput label={labels.functional} onChange={setFunctionalWage} value={functionalWage} />
              <NumberInput label={labels.complementary} onChange={setComplementaryWage} value={complementaryWage} />
              <NumberInput label={labels.otherTaxable} onChange={setOtherTaxableEarnings} value={otherTaxableEarnings} />
              <NumberInput help={labels.nonInsurableHelp} label={labels.nonInsurable} onChange={setNonInsurableAllowances} value={nonInsurableAllowances} />
            </div>
            {invalidNonInsurable && <p className="calculationWarning">{labels.nonInsurableError}</p>}

            <fieldset className="payrollChecks"><legend>{labels.insurance}</legend>
              <label><input checked={insured} onChange={(event) => setInsured(event.target.checked)} type="checkbox" />{labels.insured}</label>
            </fieldset>
            <label className="salaryField"><span>{labels.grade}</span><select onChange={(event) => setJobGrade(event.target.value as GovernmentJobGrade)} value={jobGrade}>
              <option value="third-and-below">{labels.gradeThird}</option>
              <option value="first-and-second">{labels.gradeFirst}</option>
              <option value="senior-and-excellent">{labels.gradeSenior}</option>
            </select><small>{labels.gradeHelp}</small></label>
            <label className="customWageToggle"><input checked={useDeclaredInsuranceWage} disabled={!insured} onChange={(event) => setUseDeclaredInsuranceWage(event.target.checked)} type="checkbox" />{labels.declaredToggle}</label>
            {useDeclaredInsuranceWage && insured && <NumberInput label={labels.declaredWage} onChange={setDeclaredInsuranceWage} value={declaredInsuranceWage} />}

            <fieldset className="payrollChecks"><legend>{labels.deductions}</legend>
              <label><input checked={stampDutyEnabled} onChange={(event) => setStampDutyEnabled(event.target.checked)} type="checkbox" />{labels.stamp}</label>
              <label><input checked={martyrsFundEnabled} onChange={(event) => setMartyrsFundEnabled(event.target.checked)} type="checkbox" />{labels.martyrs}</label>
            </fieldset>

            <details className="advancedSettings"><summary>{labels.uhi}</summary>
              <label className="customWageToggle"><input checked={uhiEnabled} disabled={!insured} onChange={(event) => setUhiEnabled(event.target.checked)} type="checkbox" />{labels.uhiQuestion}</label>
              <p className="settingWarning">{labels.uhiHelp}</p>
              {uhiEnabled && insured && <div className="advancedGrid">
                <NumberInput label={labels.spouse} onChange={setNonWorkingSpouses} step={1} value={nonWorkingSpouses} />
                <NumberInput label={labels.dependents} onChange={setDependents} step={1} value={dependents} />
              </div>}
            </details>
            <NumberInput label={labels.otherDeductions} onChange={setOtherDeductions} value={otherDeductions} />
          </div>

          <aside className="payrollResults results">
            <small>{labels.result}</small>
            <div className="net primaryResult"><span>{labels.net}</span><b>{money.format(result.netSalary)}</b></div>
            <div className="resultBreakdown">{rows.map(([label, value]) => <div className={label === labels.totalDeductions ? 'emphasizedRow' : undefined} key={label}><span>{label}</span><b>{money.format(value)}</b></div>)}</div>
          </aside>
        </div>

        <section className="governmentMethodology"><h2>{labels.method}</h2><p>{labels.methodText}</p><h3>{labels.sources}</h3><ul>{egyptGovernmentPayrollRules2026.sources.map((source) => <li key={source.url}><a href={source.url} rel="noreferrer" target="_blank">{source.title}</a></li>)}</ul></section>
      </section>
    </>
  );
}
