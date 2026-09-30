import type {
  GovernmentPayrollRules,
  GovernmentTaxSchedule,
} from './rules/egypt/2026';

export type GovernmentJobGrade = 'third-and-below' | 'first-and-second' | 'senior-and-excellent';

export interface GovernmentPayrollInput {
  functionalWage: number;
  complementaryWage: number;
  otherTaxableEarnings: number;
  nonInsurableAllowances: number;
  declaredInsuranceWage?: number;
  jobGrade: GovernmentJobGrade;
  insured: boolean;
  proportionalStampDutyEnabled: boolean;
  universalHealthInsurance: {
    enabled: boolean;
    nonWorkingSpouses: number;
    dependents: number;
  };
  martyrsFundEnabled: boolean;
  otherDeductions: number;
}

export interface GovernmentPayrollResult {
  totalEarnings: number;
  taxableMonthlyEarnings: number;
  calculatedInsuranceWage: number;
  insuranceContributionWage: number;
  employeeSocialInsuranceRate: number;
  employeeSocialInsurance: number;
  employeeUhiContribution: number;
  familyUhiContribution: number;
  totalUhiContribution: number;
  stampDutyBase: number;
  proportionalStampDuty: number;
  annualTaxableIncomeBeforeRounding: number;
  annualTaxableIncome: number;
  annualIncomeTax: number;
  monthlyIncomeTax: number;
  martyrsFundContribution: number;
  otherDeductions: number;
  totalDeductions: number;
  netSalary: number;
}

function nonNegative(value: number) {
  return Number.isFinite(value) ? Math.max(0, value) : 0;
}

function wholeNonNegative(value: number) {
  return Math.floor(nonNegative(value));
}

function clamp(value: number, minimum: number, maximum: number) {
  return Math.min(maximum, Math.max(minimum, value));
}

function roundUp(value: number, increment: number) {
  if (value <= 0 || increment <= 0) return Math.max(0, value);
  return Number((Math.ceil((value - Number.EPSILON) / increment) * increment).toFixed(10));
}

function calculateTaxFromSchedule(annualTaxableIncome: number, schedule: GovernmentTaxSchedule) {
  let tax = 0;
  let previousLimit = 0;
  for (const band of schedule.bands) {
    if (annualTaxableIncome <= previousLimit) break;
    const amountInBand = Math.min(annualTaxableIncome, band.upTo) - previousLimit;
    tax += amountInBand * band.rate;
    previousLimit = band.upTo;
  }
  return tax;
}

export function calculateGovernmentAnnualIncomeTax(
  annualTaxableIncome: number,
  rules: GovernmentPayrollRules,
) {
  const taxable = nonNegative(annualTaxableIncome);
  const schedule = rules.incomeTax.schedules.find(({ annualIncomeUpTo }) => taxable <= annualIncomeUpTo)
    ?? rules.incomeTax.schedules[rules.incomeTax.schedules.length - 1];
  return schedule ? calculateTaxFromSchedule(taxable, schedule) : 0;
}

export function calculateGovernmentStampDuty(
  grossDisbursement: number,
  exemptDeductions: number,
  rules: GovernmentPayrollRules,
) {
  const gross = nonNegative(grossDisbursement);
  const stampRules = rules.proportionalStampDuty;
  if (gross <= stampRules.exemptAmount) return 0;

  const chargeableBase = Math.max(0, gross - nonNegative(exemptDeductions) - stampRules.exemptAmount);
  if (chargeableBase <= 0) return 0;

  const finalBand = stampRules.bands[stampRules.bands.length - 1];
  if (!finalBand) return 0;

  let duty: number;
  if (gross <= finalBand.upTo) {
    const rate = stampRules.bands.find(({ upTo }) => gross <= upTo)?.rate ?? finalBand.rate;
    duty = chargeableBase * rate;
  } else {
    const regularBandBase = Math.max(0, finalBand.upTo - stampRules.exemptAmount);
    duty = Math.min(chargeableBase, regularBandBase) * finalBand.rate
      + Math.max(0, chargeableBase - regularBandBase) * stampRules.excessOverFinalBandRate;
  }

  return roundUp(duty, stampRules.roundingIncrement);
}

export function calculateGovernmentPayroll(
  input: GovernmentPayrollInput,
  rules: GovernmentPayrollRules,
): GovernmentPayrollResult {
  const functionalWage = nonNegative(input.functionalWage);
  const complementaryWage = nonNegative(input.complementaryWage);
  const otherTaxableEarnings = nonNegative(input.otherTaxableEarnings);
  const totalEarnings = functionalWage + complementaryWage + otherTaxableEarnings;
  const taxableMonthlyEarnings = totalEarnings;
  const nonInsurableAllowances = Math.min(totalEarnings, nonNegative(input.nonInsurableAllowances));
  const calculatedInsuranceWage = Math.max(0, totalEarnings - nonInsurableAllowances);
  const rawInsuranceWage = input.declaredInsuranceWage === undefined
    ? calculatedInsuranceWage
    : nonNegative(input.declaredInsuranceWage);
  const insuranceContributionWage = input.insured && rawInsuranceWage > 0
    ? clamp(
        rawInsuranceWage,
        rules.socialInsurance.minimumMonthlyWage,
        rules.socialInsurance.maximumMonthlyWage,
      )
    : 0;

  const uhiEnabled = input.universalHealthInsurance.enabled && input.insured;
  const employeeSocialInsuranceRate = uhiEnabled
    ? rules.socialInsurance.employeeRateWithUhi
    : rules.socialInsurance.employeeRateWithoutUhi;
  const employeeSocialInsurance = insuranceContributionWage * employeeSocialInsuranceRate;
  const employeeUhiContribution = uhiEnabled
    ? insuranceContributionWage * rules.universalHealthInsurance.employeeRate
    : 0;
  const familyUhiRate = uhiEnabled
    ? wholeNonNegative(input.universalHealthInsurance.nonWorkingSpouses)
        * rules.universalHealthInsurance.nonWorkingSpouseRate
      + wholeNonNegative(input.universalHealthInsurance.dependents)
        * rules.universalHealthInsurance.dependentRate
    : 0;
  const familyUhiContribution = insuranceContributionWage * familyUhiRate;
  const totalUhiContribution = employeeUhiContribution + familyUhiContribution;

  const stampDutyBase = Math.max(
    0,
    totalEarnings - employeeSocialInsurance - totalUhiContribution,
  );
  const proportionalStampDuty = input.proportionalStampDutyEnabled
    ? calculateGovernmentStampDuty(
        totalEarnings,
        employeeSocialInsurance + totalUhiContribution,
        rules,
      )
    : 0;

  const monthlyTaxableAfterDeductions = Math.max(
    0,
    taxableMonthlyEarnings
      - employeeSocialInsurance
      - totalUhiContribution
      - proportionalStampDuty,
  );
  const annualTaxableIncomeBeforeRounding = Math.max(
    0,
    monthlyTaxableAfterDeductions * 12 - rules.incomeTax.annualPersonalExemption,
  );
  const increment = rules.incomeTax.taxableIncomeRoundingIncrement;
  const annualTaxableIncome = increment > 0
    ? Math.floor(annualTaxableIncomeBeforeRounding / increment) * increment
    : annualTaxableIncomeBeforeRounding;
  const annualIncomeTax = calculateGovernmentAnnualIncomeTax(annualTaxableIncome, rules);
  const monthlyIncomeTax = annualIncomeTax / 12;
  const martyrsFundContribution = input.martyrsFundEnabled
    ? totalEarnings * rules.martyrsFund.employeeRate
    : 0;
  const otherDeductions = nonNegative(input.otherDeductions);
  const totalDeductions = employeeSocialInsurance
    + totalUhiContribution
    + proportionalStampDuty
    + monthlyIncomeTax
    + martyrsFundContribution
    + otherDeductions;

  return {
    totalEarnings,
    taxableMonthlyEarnings,
    calculatedInsuranceWage,
    insuranceContributionWage,
    employeeSocialInsuranceRate,
    employeeSocialInsurance,
    employeeUhiContribution,
    familyUhiContribution,
    totalUhiContribution,
    stampDutyBase,
    proportionalStampDuty,
    annualTaxableIncomeBeforeRounding,
    annualTaxableIncome,
    annualIncomeTax,
    monthlyIncomeTax,
    martyrsFundContribution,
    otherDeductions,
    totalDeductions,
    netSalary: totalEarnings - totalDeductions,
  };
}
