import assert from 'node:assert/strict';
import test from 'node:test';

import {
  calculateAnnualIncomeTax,
  calculateNetToGross,
  calculatePayroll,
  type PayrollInput,
} from '../src/features/payroll/engine.ts';
import { egyptPayrollRules2026 } from '../src/features/payroll/rules/egypt/2026.ts';

const rules = egyptPayrollRules2026;

function fullBasicSalary(gross: number): PayrollInput {
  return {
    insured: true,
    martyrsFundEnabled: true,
    earnings: [{
      id: 'basic',
      amount: gross,
      taxable: true,
      insurable: true,
      subjectToMartyrsFund: true,
    }],
  };
}

test('2026 annual tax matches the statutory schedules at their boundaries', () => {
  const cases = [
    [40_000, 0],
    [55_000, 1_500],
    [70_000, 3_750],
    [200_000, 29_750],
    [400_000, 74_750],
    [600_000, 124_750],
    [600_010, 128_752.5],
    [700_000, 153_750],
    [700_010, 156_502.5],
    [800_000, 181_500],
    [800_010, 185_002.5],
    [900_000, 210_000],
    [900_010, 215_002.5],
    [1_200_000, 290_000],
    [1_200_010, 300_002.75],
  ] as const;

  for (const [income, expectedTax] of cases) {
    assert.equal(calculateAnnualIncomeTax(income, rules), expectedTax, `income ${income}`);
  }
});

test('payroll calculation applies the 2026 insurance bounds and taxable-income rounding', () => {
  const belowMinimum = calculatePayroll(fullBasicSalary(2_000), rules);
  assert.equal(belowMinimum.insuranceContributionWage, 2_700);
  assert.equal(belowMinimum.employeeSocialInsurance, 297);

  const aboveMaximum = calculatePayroll(fullBasicSalary(25_000), rules);
  assert.equal(aboveMaximum.insuranceContributionWage, 16_700);
  assert.equal(aboveMaximum.employeeSocialInsurance, 1_837);
  assert.equal(aboveMaximum.employerSocialInsurance, 3_131.25);
  assert.equal(aboveMaximum.annualTaxableIncome % 10, 0);
});

test('uninsured employees have no employee or employer social-insurance deduction', () => {
  const result = calculatePayroll({ ...fullBasicSalary(25_000), insured: false }, rules);
  assert.equal(result.insuranceContributionWage, 0);
  assert.equal(result.employeeSocialInsurance, 0);
  assert.equal(result.employerSocialInsurance, 0);
});

test('tax, insurance, martyrs-fund and employer-benefit treatments are independent', () => {
  const result = calculatePayroll({
    insured: true,
    earnings: [
      { id: 'basic', amount: 20_000, taxable: true, insurable: true, subjectToMartyrsFund: true },
      { id: 'genuine-non-insurable-allowance', amount: 2_000, taxable: true, insurable: false },
      { id: 'non-taxable-earning', amount: 1_000, taxable: false, insurable: false },
    ],
    otherEmployeeDeductions: 300,
    employerBenefits: [
      { id: 'medical', amount: 500 },
      { id: 'transport', amount: 250 },
    ],
  }, rules);

  assert.equal(result.gross, 23_000);
  assert.equal(result.taxableMonthlyEarnings, 22_000);
  assert.equal(result.insurableMonthlyEarnings, 20_000);
  assert.equal(result.insuranceContributionWage, 16_700);
  assert.equal(result.martyrsFundContribution, 10);
  assert.equal(result.otherEmployeeDeductions, 300);
  assert.equal(result.employerBenefits, 750);
  assert.equal(result.employerCost, 26_881.25);
});

test('Macro Full sample is reproduced as a 2026 full-insurance scenario', () => {
  const result = calculatePayroll(fullBasicSalary(31_992.079373019842), rules);
  assert.equal(result.insuranceContributionWage, 16_700);
  assert.equal(result.employeeSocialInsurance, 1_837);
  assert.ok(Math.abs(result.monthlyIncomeTax - 5_139.04) < 0.01);
  assert.ok(Math.abs(result.martyrsFundContribution - 15.996) < 0.001);
  assert.ok(Math.abs(result.net - 25_000) < 0.1);
});

test('Net to Gross solves the Macro Full target without encoding a fake allowance', () => {
  const result = calculateNetToGross(25_000, fullBasicSalary, rules);
  assert.ok(Math.abs(result.differenceFromTarget) <= 0.01);
  // The corrected statutory order (floor taxable annual income to the nearest
  // EGP 10 before tax) produces a small difference from the workbook, which
  // rounds annual tax instead.
  assert.ok(Math.abs(result.calculation.gross - 31_992.08) < 1);
});

test('employer-borne tax is removed from employee deductions and added to employer cost', () => {
  const employeePays = calculatePayroll({
    insured: true,
    earnings: [
      { id: 'basic', amount: 20_000, taxable: true, insurable: true, subjectToMartyrsFund: true },
      { id: 'allowance', amount: 5_000, taxable: true, insurable: true },
    ],
  }, rules);
  const employerPays = calculatePayroll({
    insured: true,
    earnings: [
      { id: 'basic', amount: 20_000, taxable: true, insurable: true, subjectToMartyrsFund: true },
      { id: 'allowance', amount: 5_000, taxable: true, insurable: true, employerBearsIncomeTax: true },
    ],
  }, rules);

  assert.equal(employerPays.totalMonthlyIncomeTax, employeePays.monthlyIncomeTax);
  assert.ok(employerPays.employerBorneIncomeTax > 0);
  assert.equal(
    employerPays.totalMonthlyIncomeTax,
    employerPays.monthlyIncomeTax + employerPays.employerBorneIncomeTax,
  );
  assert.ok(Math.abs((employerPays.net - employeePays.net) - employerPays.employerBorneIncomeTax) < 0.001);
  assert.ok(Math.abs((employerPays.employerCost - employeePays.employerCost) - employerPays.employerBorneIncomeTax) < 0.001);
});

test('termination exemptions are excluded without creating employer-borne tax', () => {
  const result = calculatePayroll({
    insured: true,
    earnings: [
      { id: 'basic', amount: 20_000, taxable: true, insurable: true, subjectToMartyrsFund: true },
      { id: 'end-of-service', amount: 20_000, taxable: false, insurable: false, excludedFromNonInsurableCap: true },
    ],
  }, rules);

  assert.equal(result.gross, 40_000);
  assert.equal(result.taxableMonthlyEarnings, 20_000);
  assert.equal(result.employerBorneIncomeTax, 0);
  assert.equal(result.nonInsurableMonthlyEarnings, 20_000);
  assert.equal(result.nonInsurableEarningsExcess, 0);
});

test('engine reports any non-insurable earnings above the 30% modelling cap', () => {
  const result = calculatePayroll({
    insured: true,
    earnings: [
      { id: 'basic', amount: 25_000, taxable: true, insurable: true, subjectToMartyrsFund: true },
      { id: 'non-insurable', amount: 6_000, taxable: true, insurable: false },
    ],
  }, rules);

  assert.equal(result.insuranceContributionWage, 16_700);
  assert.equal(result.maximumNonInsurableMonthlyEarnings, 5_010);
  assert.equal(result.nonInsurableEarningsExcess, 990);
});

test('earnings outside the insurance wage do not consume the variable-allowance modelling cap', () => {
  const result = calculatePayroll({
    insured: true,
    earnings: [
      { id: 'basic', amount: 15_000, taxable: true, insurable: true, subjectToMartyrsFund: true },
      { id: 'commission', amount: 10_000, taxable: true, insurable: false, excludedFromNonInsurableCap: true },
    ],
  }, rules);

  assert.equal(result.nonInsurableMonthlyEarnings, 10_000);
  assert.equal(result.maximumNonInsurableMonthlyEarnings, 4_500);
  assert.equal(result.nonInsurableEarningsExcess, 0);
});
