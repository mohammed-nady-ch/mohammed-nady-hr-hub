import React from 'react';
import {
  calculateNetToGross,
  calculatePayroll,
  type EmployerBenefit,
  type PayrollInput,
  type SalaryComponent,
} from '../features/payroll/engine';
import { egyptPayrollRules2026 } from '../features/payroll/rules/egypt/2026';

type CalculationDirection = 'grossToNet' | 'netToGross';
type EarningId = 'basic' | 'fixedAllowance' | 'variableAllowance' | 'endOfServiceBenefit' | 'commission' | 'overtime' | 'leaveBalanceSettlement' | 'otherEarnings';
type BenefitId = 'medical' | 'lifeInsurance' | 'transportation' | 'meals' | 'otherBenefits';

const terminationExemptionIds = new Set<EarningId>(['endOfServiceBenefit', 'leaveBalanceSettlement']);
const permanentlyInsurableIds = new Set<EarningId>(['basic', 'fixedAllowance']);
const permanentlyNonInsurableIds = new Set<EarningId>([
  'commission',
  'overtime',
  'otherEarnings',
  'leaveBalanceSettlement',
  'endOfServiceBenefit',
]);

interface EditableEarning extends SalaryComponent {
  id: EarningId;
}

const initialEarnings: EditableEarning[] = [
  { id: 'basic', amount: 25_000, taxable: true, insurable: true, subjectToMartyrsFund: true },
  { id: 'fixedAllowance', amount: 0, taxable: true, insurable: true },
  { id: 'variableAllowance', amount: 0, taxable: true, insurable: true },
  { id: 'commission', amount: 0, taxable: true, insurable: false, excludedFromNonInsurableCap: true },
  { id: 'overtime', amount: 0, taxable: true, insurable: false, excludedFromNonInsurableCap: true },
  { id: 'otherEarnings', amount: 0, taxable: true, insurable: false, excludedFromNonInsurableCap: true },
  { id: 'leaveBalanceSettlement', amount: 0, taxable: false, insurable: false, excludedFromNonInsurableCap: true },
  { id: 'endOfServiceBenefit', amount: 0, taxable: false, insurable: false, excludedFromNonInsurableCap: true },
];

const initialBenefits: EmployerBenefit[] = [
  { id: 'medical', amount: 0 },
  { id: 'lifeInsurance', amount: 0 },
  { id: 'transportation', amount: 0 },
  { id: 'meals', amount: 0 },
  { id: 'otherBenefits', amount: 0 },
];

const content = {
  en: {
    eyebrow: 'EGYPT · PRIVATE SECTOR · 2026',
    title: 'Monthly Gross / Net Salary Calculator',
    body: 'Estimate monthly salary deductions using separated 2026 rules. Choose the direction, enter the actual salary components, then review the full employee and employer breakdown.',
    grossToNet: 'Gross to Net', netToGross: 'Net to Gross',
    salaryComponents: 'Monthly salary components', targetNet: 'Target monthly net', calculatedBasic: 'Calculated basic salary',
    basic: 'Basic salary', fixedAllowance: 'Fixed allowances', variableAllowance: 'Variable allowances', endOfServiceBenefit: 'End-of-service benefit', commission: 'Commission', overtime: 'Overtime', leaveBalanceSettlement: 'Leave balance paid after termination', otherEarnings: 'Other earnings', otherDeductions: 'Other deductions',
    insurable: 'SI', employerBearsTax: 'Employer bears tax', taxExempt: 'Tax exempt', treatmentHint: 'Regular payments remain taxable. Use the special termination fields only when their exemption conditions are met.',
    taxBorneWarning: 'Employer-borne tax remains a payroll tax liability. Its estimated incremental value is added to employer cost and is not deducted from employee net.',
    legalExemptionWarning: 'End-of-service benefit and leave balance are treated as exempt only when the employment relationship has ended and the applicable evidence is available.',
    insuranceLimitNote: 'Only variable allowances selected as non-insurable are limited to 30% of the insurance contribution wage. Commission, overtime, other earnings and termination payments are outside this modelling limit.',
    maximumForField: 'Maximum currently available',
    specialSettings: 'Employee status', insured: 'Employee is insured', martyrsFund: 'Apply Martyrs Fund contribution',
    advanced: 'Advanced settings and employer benefits', employeeRate: 'Employee SI rate', employerRate: 'Employer SI rate', minimumWage: 'Minimum SI wage', maximumWage: 'Maximum SI wage', exemption: 'Annual personal exemption',
    customWage: 'Use a declared insurance wage', declaredWage: 'Declared monthly insurance wage', customWarning: 'Scenario input only. The calculator does not create a 25% or 30% exempt allowance automatically.',
    medical: 'Medical insurance', lifeInsurance: 'Life insurance', transportation: 'Transportation', meals: 'Meals', otherBenefits: 'Other employer benefits',
    result: 'Calculation result', gross: 'Monthly gross', taxableEarnings: 'Taxable monthly earnings', insuranceWage: 'Insurance contribution wage', employeeInsurance: 'Employee social insurance', monthlyTax: 'Employee income tax', employerBorneTax: 'Income tax borne by employer', martyrsContribution: 'Martyrs Fund contribution', totalDeductions: 'Total employee deductions', net: 'Monthly net', employerInsurance: 'Employer social insurance', employerBenefits: 'Employer benefits above gross', employerCost: 'Total employer cost', annualTaxable: 'Annual taxable income',
    unreachable: 'The fixed earnings already produce a net above the requested target. Reduce them to calculate a matching basic salary.',
    note: 'Monthly annualized estimate for a full month. Validate operational payroll with Payroll/Tax and the official forms.',
  },
  ar: {
    eyebrow: 'مصر · القطاع الخاص · 2026',
    title: 'حاسبة الراتب الشهري من الإجمالي للصافي والعكس',
    body: 'تقدير استقطاعات الراتب باستخدام قواعد 2026 المفصولة عن المحرك. اختر اتجاه الحساب، وأدخل مكونات الراتب الفعلية، ثم راجع تفاصيل الموظف وتكلفة الشركة.',
    grossToNet: 'من الإجمالي إلى الصافي', netToGross: 'من الصافي إلى الإجمالي',
    salaryComponents: 'مكونات الراتب الشهرية', targetNet: 'صافي الراتب المطلوب', calculatedBasic: 'الراتب الأساسي المحسوب',
    basic: 'الراتب الأساسي', fixedAllowance: 'البدلات الثابتة', variableAllowance: 'البدلات المتغيرة', endOfServiceBenefit: 'مكافأة نهاية الخدمة', commission: 'العمولات', overtime: 'العمل الإضافي', leaveBalanceSettlement: 'رصيد الإجازات بعد انتهاء الخدمة', otherEarnings: 'استحقاقات أخرى', otherDeductions: 'استقطاعات أخرى',
    insurable: 'تأمين', employerBearsTax: 'الشركة تتحمل الضريبة', taxExempt: 'معفى ضريبيًا', treatmentHint: 'تظل المدفوعات العادية خاضعة للضريبة. استخدم حقلي انتهاء الخدمة فقط عند تحقق شروط الإعفاء.',
    taxBorneWarning: 'الضريبة التي تتحملها الشركة تظل التزامًا ضريبيًا، وتضاف قيمتها التقديرية إلى تكلفة الموظف بدل خصمها من صافي راتبه.',
    legalExemptionWarning: 'تعامل مكافأة نهاية الخدمة ورصيد الإجازات كمعفيين فقط عند انتهاء علاقة العمل وتوافر المستندات المؤيدة.',
    insuranceLimitNote: 'يُطبق حد 30% من أجر الاشتراك التأميني فقط على البدلات المتغيرة عند اختيار عدم خضوعها للتأمينات. العمولات والعمل الإضافي والاستحقاقات الأخرى ومدفوعات انتهاء الخدمة خارج هذا القيد.',
    maximumForField: 'الحد المتاح حاليًا',
    specialSettings: 'حالة الموظف', insured: 'الموظف مؤمّن عليه', martyrsFund: 'تطبيق مساهمة صندوق الشهداء',
    advanced: 'الإعدادات المتقدمة ومزايا الشركة', employeeRate: 'نسبة تأمين الموظف', employerRate: 'نسبة تأمين الشركة', minimumWage: 'الحد الأدنى للأجر التأميني', maximumWage: 'الحد الأقصى للأجر التأميني', exemption: 'الإعفاء الشخصي السنوي',
    customWage: 'استخدام أجر تأميني مُعلن', declaredWage: 'الأجر التأميني الشهري المُعلن', customWarning: 'للمحاكاة فقط. الحاسبة لا تنشئ بدلًا معفى بنسبة 25% أو 30% تلقائيًا.',
    medical: 'التأمين الطبي', lifeInsurance: 'التأمين على الحياة', transportation: 'الانتقالات', meals: 'الوجبات', otherBenefits: 'مزايا أخرى تتحملها الشركة',
    result: 'نتيجة الحساب', gross: 'إجمالي الراتب الشهري', taxableEarnings: 'الاستحقاقات الشهرية الخاضعة للضريبة', insuranceWage: 'أجر الاشتراك التأميني', employeeInsurance: 'تأمينات الموظف', monthlyTax: 'ضريبة الدخل على الموظف', employerBorneTax: 'ضريبة الدخل التي تتحملها الشركة', martyrsContribution: 'مساهمة صندوق الشهداء', totalDeductions: 'إجمالي استقطاعات الموظف', net: 'صافي الراتب الشهري', employerInsurance: 'تأمينات الشركة', employerBenefits: 'مزايا الشركة فوق الإجمالي', employerCost: 'إجمالي تكلفة الشركة', annualTaxable: 'الدخل السنوي الخاضع للضريبة',
    unreachable: 'الاستحقاقات الثابتة وحدها تنتج صافيًا أعلى من المطلوب. خفّضها حتى يمكن حساب راتب أساسي مطابق.',
    note: 'تقدير شهري على أساس شهر كامل وتحويل سنوي. راجع Payroll/Tax والنماذج الرسمية قبل الاستخدام التشغيلي.',
  },
} as const;

function NumberInput({ label, value, onChange, disabled = false, step = 1, maximum, help }: { label: string; value: number; onChange: (value: number) => void; disabled?: boolean; step?: number; maximum?: number; help?: string }) {
  return (
    <label className="moneyField">
      <span>{label}</span>
      <input dir="ltr" disabled={disabled} max={maximum} min="0" onChange={(event) => onChange(Math.min(maximum ?? Number.POSITIVE_INFINITY, Math.max(0, Number(event.target.value))))} step={step} type="number" value={Number.isFinite(value) ? value : 0} />
      {help && <small>{help}</small>}
    </label>
  );
}

export default function GrossNetPage({ ar }: { ar: boolean }) {
  const labels = content[ar ? 'ar' : 'en'];
  const [direction, setDirection] = React.useState<CalculationDirection>('grossToNet');
  const [targetNet, setTargetNet] = React.useState(25_000);
  const [earnings, setEarnings] = React.useState<EditableEarning[]>(initialEarnings);
  const [otherDeductions, setOtherDeductions] = React.useState(0);
  const [insured, setInsured] = React.useState(true);
  const [martyrsFundEnabled, setMartyrsFundEnabled] = React.useState(true);
  const [useDeclaredWage, setUseDeclaredWage] = React.useState(false);
  const [declaredWage, setDeclaredWage] = React.useState(16_700);
  const [employeeRate, setEmployeeRate] = React.useState(11);
  const [employerRate, setEmployerRate] = React.useState(18.75);
  const [minimumWage, setMinimumWage] = React.useState(2_700);
  const [maximumWage, setMaximumWage] = React.useState(16_700);
  const [personalExemption, setPersonalExemption] = React.useState(20_000);
  const [employerBenefits, setEmployerBenefits] = React.useState<EmployerBenefit[]>(initialBenefits);

  const rules = React.useMemo(() => ({
    ...egyptPayrollRules2026,
    socialInsurance: {
      ...egyptPayrollRules2026.socialInsurance,
      minimumMonthlyWage: Math.min(minimumWage, maximumWage),
      maximumMonthlyWage: Math.max(minimumWage, maximumWage),
      employeeRate: employeeRate / 100,
      employerRate: employerRate / 100,
    },
    incomeTax: {
      ...egyptPayrollRules2026.incomeTax,
      annualPersonalExemption: personalExemption,
    },
  }), [employeeRate, employerRate, maximumWage, minimumWage, personalExemption]);

  const createInput = React.useCallback((components: readonly SalaryComponent[]): PayrollInput => ({
    earnings: components.map((component) => {
      const id = component.id as EarningId;
      if (permanentlyInsurableIds.has(id)) return { ...component, insurable: true };
      if (permanentlyNonInsurableIds.has(id)) return { ...component, insurable: false, excludedFromNonInsurableCap: true };
      return component;
    }),
    insured,
    martyrsFundEnabled,
    otherEmployeeDeductions: otherDeductions,
    employerBenefits,
    declaredMonthlyInsuranceWage: insured && useDeclaredWage ? declaredWage : undefined,
  }), [declaredWage, employerBenefits, insured, martyrsFundEnabled, otherDeductions, useDeclaredWage]);

  const calculationState = React.useMemo(() => {
    if (direction === 'grossToNet') {
      return { calculation: calculatePayroll(createInput(earnings), rules), targetReachable: true };
    }

    const fixedEarnings = earnings.filter(({ id }) => id !== 'basic');
    const fixedGross = fixedEarnings.reduce((total, component) => total + component.amount, 0);
    const basicTemplate = earnings.find(({ id }) => id === 'basic') ?? initialEarnings[0];
    const fixedOnly = calculatePayroll(createInput([{ ...basicTemplate, amount: 0 }, ...fixedEarnings]), rules);
    const targetReachable = fixedOnly.net <= targetNet;
    const solved = calculateNetToGross(targetNet, (gross) => createInput([
      { ...basicTemplate, amount: Math.max(0, gross - fixedGross) },
      ...fixedEarnings,
    ]), rules);
    return { calculation: solved.calculation, targetReachable };
  }, [createInput, direction, earnings, rules, targetNet]);

  const { calculation, targetReachable } = calculationState;
  const fixedGross = earnings.filter(({ id }) => id !== 'basic').reduce((total, component) => total + component.amount, 0);
  const calculatedBasic = Math.max(0, calculation.gross - fixedGross);
  const displayedCalculatedBasic = Math.round(calculatedBasic);
  const hasEmployerBorneTax = earnings.some(({ amount, employerBearsIncomeTax }) => amount > 0 && employerBearsIncomeTax);
  const hasTerminationExemption = earnings.some(({ id, amount, taxable }) => terminationExemptionIds.has(id) && amount > 0 && !taxable);
  const money = React.useMemo(() => new Intl.NumberFormat(ar ? 'ar-EG' : 'en-EG', {
    maximumFractionDigits: rules.displayCurrencyDigits,
    style: 'currency',
    currency: 'EGP',
  }), [ar, rules.displayCurrencyDigits]);

  const updateEarning = (id: EarningId, changes: Partial<EditableEarning>) => {
    setEarnings((current) => current.map((component) => component.id === id ? { ...component, ...changes } : component));
  };

  const updateInsurableTreatment = (id: EarningId, nextInsurable: boolean) => {
    if (permanentlyInsurableIds.has(id) || permanentlyNonInsurableIds.has(id)) return;

    setEarnings((current) => {
      if (nextInsurable || !insured) {
        return current.map((component) => component.id === id ? { ...component, insurable: nextInsurable } : component);
      }

      const target = current.find((component) => component.id === id);
      if (!target) return current;
      const otherNonInsurable = current
        .filter((component) => component.id !== id && !component.insurable && !component.excludedFromNonInsurableCap)
        .reduce((total, component) => total + component.amount, 0);
      const rawInsuranceWage = useDeclaredWage
        ? declaredWage
        : current
          .filter((component) => component.id !== id && component.insurable)
          .reduce((total, component) => total + component.amount, 0);
      const contributionWage = rawInsuranceWage > 0
        ? Math.min(rules.socialInsurance.maximumMonthlyWage, Math.max(rules.socialInsurance.minimumMonthlyWage, rawInsuranceWage))
        : 0;
      const available = Math.max(0, contributionWage * rules.socialInsurance.nonInsurableEarningsCapRatio - otherNonInsurable);
      return current.map((component) => component.id === id
        ? { ...component, amount: Math.min(component.amount, available), insurable: false }
        : component);
    });
  };

  const updateBenefit = (id: BenefitId, amount: number) => {
    setEmployerBenefits((current) => current.map((benefit) => benefit.id === id ? { ...benefit, amount } : benefit));
  };

  const resultRows = [
    [labels.gross, calculation.gross],
    [labels.taxableEarnings, calculation.taxableMonthlyEarnings],
    [labels.insuranceWage, calculation.insuranceContributionWage],
    [labels.employeeInsurance, calculation.employeeSocialInsurance],
    [labels.monthlyTax, calculation.monthlyIncomeTax],
    [labels.employerBorneTax, calculation.employerBorneIncomeTax],
    [labels.martyrsContribution, calculation.martyrsFundContribution],
    [labels.otherDeductions, calculation.otherEmployeeDeductions],
    [labels.totalDeductions, calculation.totalEmployeeDeductions],
    [labels.net, calculation.net],
    [labels.employerInsurance, calculation.employerSocialInsurance],
    [labels.employerBenefits, calculation.employerBenefits],
    [labels.employerCost, calculation.employerCost],
    [labels.annualTaxable, calculation.annualTaxableIncome],
  ] as const;
  const primaryResultLabel = direction === 'grossToNet' ? labels.net : labels.gross;
  const detailedResultRows = resultRows.filter(([label]) => label !== primaryResultLabel);

  return (
    <>
      <section className="pageHero"><small>{labels.eyebrow}</small><h1>{labels.title}</h1><p>{labels.body}</p></section>
      <section className="payrollSection section">
        <div className="calculationTabs" role="group" aria-label={labels.title}>
          <button aria-pressed={direction === 'grossToNet'} className={direction === 'grossToNet' ? 'active' : ''} onClick={() => setDirection('grossToNet')} type="button">{labels.grossToNet}</button>
          <button aria-pressed={direction === 'netToGross'} className={direction === 'netToGross' ? 'active' : ''} onClick={() => setDirection('netToGross')} type="button">{labels.netToGross}</button>
        </div>

        <div className="toolShell payrollShell">
          <div className="calculator payrollInputs">
            {direction === 'netToGross' && <NumberInput label={labels.targetNet} onChange={setTargetNet} value={targetNet} />}
            <div className="formSectionHeading"><h2>{labels.salaryComponents}</h2><p>{labels.treatmentHint}</p></div>
            <div className="earningList">
              {earnings.map((component) => {
                const isCalculatedBasic = direction === 'netToGross' && component.id === 'basic';
                const terminationExemption = terminationExemptionIds.has(component.id);
                const permanentlyInsurable = permanentlyInsurableIds.has(component.id);
                const permanentlyNonInsurable = permanentlyNonInsurableIds.has(component.id);
                const otherNonInsurable = earnings
                  .filter(({ id, insurable: componentInsurable, excludedFromNonInsurableCap }) => id !== component.id && !componentInsurable && !excludedFromNonInsurableCap)
                  .reduce((total, { amount }) => total + amount, 0);
                const maximumNonInsurableAmount = component.insurable || component.excludedFromNonInsurableCap || !insured
                  ? undefined
                  : Math.max(0, calculation.maximumNonInsurableMonthlyEarnings - otherNonInsurable);
                const nonInsurableHelp = maximumNonInsurableAmount === undefined
                  ? undefined
                  : `${labels.maximumForField}: ${money.format(maximumNonInsurableAmount)}`;
                return (
                  <div className="earningRow" key={component.id}>
                    <NumberInput disabled={isCalculatedBasic} help={nonInsurableHelp} label={isCalculatedBasic ? labels.calculatedBasic : labels[component.id]} maximum={maximumNonInsurableAmount} onChange={(amount) => updateEarning(component.id, { amount })} value={isCalculatedBasic ? displayedCalculatedBasic : component.amount} />
                    <div className="componentTreatment">
                      {terminationExemption ? (
                        <label><input checked={!component.taxable} onChange={(event) => updateEarning(component.id, { taxable: !event.target.checked, employerBearsIncomeTax: false })} type="checkbox" /> {labels.taxExempt}</label>
                      ) : (
                        <label><input checked={Boolean(component.employerBearsIncomeTax)} onChange={(event) => updateEarning(component.id, { taxable: true, employerBearsIncomeTax: event.target.checked })} type="checkbox" /> {labels.employerBearsTax}</label>
                      )}
                      <label><input checked={component.insurable} disabled={permanentlyInsurable || permanentlyNonInsurable || !insured} onChange={(event) => updateInsurableTreatment(component.id, event.target.checked)} type="checkbox" /> {labels.insurable}</label>
                    </div>
                  </div>
                );
              })}
            </div>
            {hasEmployerBorneTax && <p className="settingWarning">{labels.taxBorneWarning}</p>}
            {hasTerminationExemption && <p className="settingWarning legalNotice">{labels.legalExemptionWarning}</p>}
            <p className="settingWarning insuranceNotice">{labels.insuranceLimitNote}</p>
            <NumberInput label={labels.otherDeductions} onChange={setOtherDeductions} value={otherDeductions} />

            <fieldset className="payrollChecks">
              <legend>{labels.specialSettings}</legend>
              <label><input checked={insured} onChange={(event) => setInsured(event.target.checked)} type="checkbox" /> {labels.insured}</label>
              <label><input checked={martyrsFundEnabled} onChange={(event) => setMartyrsFundEnabled(event.target.checked)} type="checkbox" /> {labels.martyrsFund}</label>
            </fieldset>

            <details className="advancedSettings">
              <summary>{labels.advanced}</summary>
              <div className="advancedGrid">
                <NumberInput label={`${labels.employeeRate} (%)`} onChange={setEmployeeRate} step={0.01} value={employeeRate} />
                <NumberInput label={`${labels.employerRate} (%)`} onChange={setEmployerRate} step={0.01} value={employerRate} />
                <NumberInput label={labels.minimumWage} onChange={setMinimumWage} value={minimumWage} />
                <NumberInput label={labels.maximumWage} onChange={setMaximumWage} value={maximumWage} />
                <NumberInput label={labels.exemption} onChange={setPersonalExemption} value={personalExemption} />
              </div>
              <label className="customWageToggle"><input checked={useDeclaredWage} disabled={!insured} onChange={(event) => setUseDeclaredWage(event.target.checked)} type="checkbox" /> {labels.customWage}</label>
              {useDeclaredWage && insured && <NumberInput label={labels.declaredWage} onChange={setDeclaredWage} value={declaredWage} />}
              <p className="settingWarning">{labels.customWarning}</p>
              <div className="advancedGrid employerBenefitFields">
                {(employerBenefits as { id: BenefitId; amount: number }[]).map((benefit) => (
                  <NumberInput key={benefit.id} label={labels[benefit.id]} onChange={(amount) => updateBenefit(benefit.id, amount)} value={benefit.amount} />
                ))}
              </div>
            </details>
          </div>

          <aside className="results payrollResults" aria-live="polite">
            <small>{labels.result}</small>
            <div className="primaryResult net"><span>{primaryResultLabel}</span><b>{money.format(direction === 'grossToNet' ? calculation.net : calculation.gross)}</b></div>
            {!targetReachable && <p className="calculationWarning" role="alert">{labels.unreachable}</p>}
            <div className="resultBreakdown">
              {detailedResultRows.map(([label, value]) => (
                <div className={label === labels.net || label === labels.employerCost ? 'emphasizedRow' : ''} key={label}><span>{label}</span><b>{money.format(value)}</b></div>
              ))}
            </div>
            <p>{labels.note}</p>
          </aside>
        </div>
      </section>
    </>
  );
}
