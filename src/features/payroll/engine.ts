export type RoundingMode = 'floor' | 'nearest';

export interface PayrollRuleSource {
  title: string;
  url: string;
  note?: string;
}

export interface ProgressiveTaxBand {
  upTo: number;
  rate: number;
}

export interface TaxSchedule {
  annualIncomeUpTo: number;
  bands: readonly ProgressiveTaxBand[];
}

export interface PayrollRules {
  id: string;
  countryCode: string;
  year: number;
  effectiveFrom: string;
  calculationMode: 'monthly-annualized-estimate';
  socialInsurance: {
    minimumMonthlyWage: number;
    maximumMonthlyWage: number;
    employeeRate: number;
    employerRate: number;
    nonInsurableEarningsCapRatio: number;
  };
  incomeTax: {
    annualPersonalExemption: number;
    taxableIncomeRounding: {
      increment: number;
      mode: RoundingMode;
    };
    schedules: readonly TaxSchedule[];
  };
  martyrsFund: {
    defaultEnabled: boolean;
    employeeRate: number;
  };
  displayCurrencyDigits: number;
  sources: readonly PayrollRuleSource[];
}

export interface SalaryComponent {
  id: string;
  amount: number;
  taxable: boolean;
  insurable: boolean;
  /**
   * Excludes exceptional payments, such as termination settlements, from the
   * optional 30% non-insurable-earnings modelling control.
   */
  excludedFromNonInsurableCap?: boolean;
  employerBearsIncomeTax?: boolean;
  subjectToMartyrsFund?: boolean;
}

export interface EmployerBenefit {
  id: string;
  amount: number;
}

export interface PayrollInput {
  earnings: readonly SalaryComponent[];
  insured: boolean;
  martyrsFundEnabled?: boolean;
  otherEmployeeDeductions?: number;
  employerBenefits?: readonly EmployerBenefit[];
  /**
   * Optional declared insurance wage for scenario modelling. It is still
   * constrained by the statutory minimum and maximum and is never inferred
   * from an artificial allowance percentage.
   */
  declaredMonthlyInsuranceWage?: number;
}

export interface PayrollResult {
  gross: number;
  taxableMonthlyEarnings: number;
  employeeTaxableMonthlyEarnings: number;
  insurableMonthlyEarnings: number;
  nonInsurableMonthlyEarnings: number;
  maximumNonInsurableMonthlyEarnings: number;
  nonInsurableEarningsExcess: number;
  insuranceContributionWage: number;
  employeeSocialInsurance: number;
  employerSocialInsurance: number;
  annualTaxableIncomeBeforeRounding: number;
  annualTaxableIncome: number;
  annualIncomeTax: number;
  totalMonthlyIncomeTax: number;
  monthlyIncomeTax: number;
  employerBorneIncomeTax: number;
  martyrsFundContribution: number;
  otherEmployeeDeductions: number;
  totalEmployeeDeductions: number;
  net: number;
  employerBenefits: number;
  employerCost: number;
}

export interface NetToGrossResult {
  calculation: PayrollResult;
  iterations: number;
  differenceFromTarget: number;
}

function nonNegative(value: number) {
  return Number.isFinite(value) ? Math.max(0, value) : 0;
}

function sum(values: readonly number[]) {
  return values.reduce((total, value) => total + nonNegative(value), 0);
}

function roundByRule(value: number, increment: number, mode: RoundingMode) {
  if (increment <= 0) return value;
  const scaled = value / increment;
  return (mode === 'floor' ? Math.floor(scaled) : Math.round(scaled)) * increment;
}

function clamp(value: number, minimum: number, maximum: number) {
  return Math.min(maximum, Math.max(minimum, value));
}

export function calculateAnnualIncomeTax(annualTaxableIncome: number, rules: PayrollRules) {
  const taxable = Math.max(0, annualTaxableIncome);
  const schedule = rules.incomeTax.schedules.find(({ annualIncomeUpTo }) => taxable <= annualIncomeUpTo)
    ?? rules.incomeTax.schedules[rules.incomeTax.schedules.length - 1];

  if (!schedule) return 0;

  let tax = 0;
  let previousLimit = 0;
  for (const band of schedule.bands) {
    if (taxable <= previousLimit) break;
    const amountInBand = Math.min(taxable, band.upTo) - previousLimit;
    tax += amountInBand * band.rate;
    previousLimit = band.upTo;
  }
  return tax;
}

export function calculatePayroll(input: PayrollInput, rules: PayrollRules): PayrollResult {
  const gross = sum(input.earnings.map(({ amount }) => amount));
  const taxableMonthlyEarnings = sum(input.earnings.filter(({ taxable }) => taxable).map(({ amount }) => amount));
  const employeeTaxableMonthlyEarnings = sum(input.earnings
    .filter(({ taxable, employerBearsIncomeTax }) => taxable && !employerBearsIncomeTax)
    .map(({ amount }) => amount));
  const insurableMonthlyEarnings = sum(input.earnings.filter(({ insurable }) => insurable).map(({ amount }) => amount));
  const nonInsurableMonthlyEarnings = input.insured
    ? sum(input.earnings.filter(({ insurable }) => !insurable).map(({ amount }) => amount))
    : 0;
  const cappedNonInsurableMonthlyEarnings = input.insured
    ? sum(input.earnings
        .filter(({ insurable, excludedFromNonInsurableCap }) => !insurable && !excludedFromNonInsurableCap)
        .map(({ amount }) => amount))
    : 0;

  const rawInsuranceWage = input.declaredMonthlyInsuranceWage === undefined
    ? insurableMonthlyEarnings
    : nonNegative(input.declaredMonthlyInsuranceWage);
  const insuranceContributionWage = input.insured && rawInsuranceWage > 0
    ? clamp(
        rawInsuranceWage,
        rules.socialInsurance.minimumMonthlyWage,
        rules.socialInsurance.maximumMonthlyWage,
      )
    : 0;

  const employeeSocialInsurance = insuranceContributionWage * rules.socialInsurance.employeeRate;
  const employerSocialInsurance = insuranceContributionWage * rules.socialInsurance.employerRate;
  const maximumNonInsurableMonthlyEarnings = input.insured
    ? insuranceContributionWage * rules.socialInsurance.nonInsurableEarningsCapRatio
    : 0;
  const nonInsurableEarningsExcess = Math.max(0, cappedNonInsurableMonthlyEarnings - maximumNonInsurableMonthlyEarnings);
  const annualTaxableIncomeBeforeRounding = Math.max(
    0,
    (taxableMonthlyEarnings - employeeSocialInsurance) * 12
      - rules.incomeTax.annualPersonalExemption,
  );
  const annualTaxableIncome = roundByRule(
    annualTaxableIncomeBeforeRounding,
    rules.incomeTax.taxableIncomeRounding.increment,
    rules.incomeTax.taxableIncomeRounding.mode,
  );
  const annualIncomeTax = calculateAnnualIncomeTax(annualTaxableIncome, rules);
  const totalMonthlyIncomeTax = annualIncomeTax / 12;
  const employeeAnnualTaxableIncomeBeforeRounding = Math.max(
    0,
    (employeeTaxableMonthlyEarnings - employeeSocialInsurance) * 12
      - rules.incomeTax.annualPersonalExemption,
  );
  const employeeAnnualTaxableIncome = roundByRule(
    employeeAnnualTaxableIncomeBeforeRounding,
    rules.incomeTax.taxableIncomeRounding.increment,
    rules.incomeTax.taxableIncomeRounding.mode,
  );
  const employeeAnnualIncomeTax = calculateAnnualIncomeTax(employeeAnnualTaxableIncome, rules);
  const monthlyIncomeTax = employeeAnnualIncomeTax / 12;
  const employerBorneIncomeTax = Math.max(0, totalMonthlyIncomeTax - monthlyIncomeTax);

  const martyrsFundEnabled = input.martyrsFundEnabled ?? rules.martyrsFund.defaultEnabled;
  const martyrsFundBase = martyrsFundEnabled
    ? sum(input.earnings.filter(({ subjectToMartyrsFund }) => subjectToMartyrsFund).map(({ amount }) => amount))
    : 0;
  const martyrsFundContribution = martyrsFundBase * rules.martyrsFund.employeeRate;
  const otherEmployeeDeductions = nonNegative(input.otherEmployeeDeductions ?? 0);
  const totalEmployeeDeductions = employeeSocialInsurance
    + monthlyIncomeTax
    + martyrsFundContribution
    + otherEmployeeDeductions;
  const net = gross - totalEmployeeDeductions;
  const employerBenefits = sum((input.employerBenefits ?? []).map(({ amount }) => amount));
  const employerCost = gross + employerSocialInsurance + employerBorneIncomeTax + employerBenefits;

  return {
    gross,
    taxableMonthlyEarnings,
    employeeTaxableMonthlyEarnings,
    insurableMonthlyEarnings,
    nonInsurableMonthlyEarnings,
    maximumNonInsurableMonthlyEarnings,
    nonInsurableEarningsExcess,
    insuranceContributionWage,
    employeeSocialInsurance,
    employerSocialInsurance,
    annualTaxableIncomeBeforeRounding,
    annualTaxableIncome,
    annualIncomeTax,
    totalMonthlyIncomeTax,
    monthlyIncomeTax,
    employerBorneIncomeTax,
    martyrsFundContribution,
    otherEmployeeDeductions,
    totalEmployeeDeductions,
    net,
    employerBenefits,
    employerCost,
  };
}

export function calculateNetToGross(
  targetMonthlyNet: number,
  createInput: (gross: number) => PayrollInput,
  rules: PayrollRules,
  tolerance = 0.01,
  maximumIterations = 100,
): NetToGrossResult {
  const target = nonNegative(targetMonthlyNet);
  let lower = 0;
  let upper = Math.max(target * 2, rules.socialInsurance.maximumMonthlyWage, 1);

  while (calculatePayroll(createInput(upper), rules).net < target) {
    upper *= 2;
    if (!Number.isFinite(upper) || upper > 1_000_000_000_000) {
      throw new Error('Unable to establish a finite gross salary range for the requested net salary.');
    }
  }

  let calculation = calculatePayroll(createInput(upper), rules);
  let iterations = 0;
  for (; iterations < maximumIterations; iterations += 1) {
    const gross = (lower + upper) / 2;
    calculation = calculatePayroll(createInput(gross), rules);
    const difference = calculation.net - target;

    if (Math.abs(difference) <= tolerance) break;
    if (difference < 0) lower = gross;
    else upper = gross;
  }

  return {
    calculation,
    iterations: iterations + 1,
    differenceFromTarget: calculation.net - target,
  };
}
