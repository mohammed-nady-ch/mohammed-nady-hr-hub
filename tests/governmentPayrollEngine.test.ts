import assert from 'node:assert/strict';
import test from 'node:test';

import {
  calculateGovernmentAnnualIncomeTax,
  calculateGovernmentPayroll,
  calculateGovernmentStampDuty,
  type GovernmentPayrollInput,
} from '../src/features/governmentPayroll/engine.ts';
import { egyptGovernmentPayrollRules2026 } from '../src/features/governmentPayroll/rules/egypt/2026.ts';

const rules = egyptGovernmentPayrollRules2026;

function standardInput(overrides: Partial<GovernmentPayrollInput> = {}): GovernmentPayrollInput {
  return {
    functionalWage: 12_000,
    complementaryWage: 8_000,
    otherTaxableEarnings: 0,
    nonInsurableAllowances: 0,
    jobGrade: 'first-and-second',
    insured: true,
    proportionalStampDutyEnabled: true,
    universalHealthInsurance: { enabled: false, nonWorkingSpouses: 0, dependents: 0 },
    martyrsFundEnabled: true,
    otherDeductions: 0,
    ...overrides,
  };
}

test('government tax schedules are isolated but reproduce the statutory 2026 boundaries', () => {
  assert.equal(calculateGovernmentAnnualIncomeTax(40_000, rules), 0);
  assert.equal(calculateGovernmentAnnualIncomeTax(200_000, rules), 29_750);
  assert.equal(calculateGovernmentAnnualIncomeTax(1_200_010, rules), 300_002.75);
});

test('government insurance uses the 2026 contribution limits', () => {
  const below = calculateGovernmentPayroll(standardInput({ functionalWage: 2_000, complementaryWage: 0 }), rules);
  assert.equal(below.insuranceContributionWage, 2_700);
  assert.equal(below.employeeSocialInsurance, 297);

  const above = calculateGovernmentPayroll(standardInput({ functionalWage: 30_000, complementaryWage: 0 }), rules);
  assert.equal(above.insuranceContributionWage, 16_700);
  assert.equal(above.employeeSocialInsurance, 1_837);
});

test('UHI replaces the sickness share and adds employee and family contributions separately', () => {
  const result = calculateGovernmentPayroll(standardInput({
    declaredInsuranceWage: 10_000,
    universalHealthInsurance: { enabled: true, nonWorkingSpouses: 1, dependents: 2 },
  }), rules);

  assert.equal(result.employeeSocialInsuranceRate, 0.10);
  assert.equal(result.employeeSocialInsurance, 1_000);
  assert.equal(result.employeeUhiContribution, 100);
  assert.equal(result.familyUhiContribution, 500);
  assert.equal(result.totalUhiContribution, 600);
});

test('UHI is not deducted for an uninsured employee even when selected', () => {
  const result = calculateGovernmentPayroll(standardInput({
    insured: false,
    universalHealthInsurance: { enabled: true, nonWorkingSpouses: 1, dependents: 2 },
  }), rules);
  assert.equal(result.employeeSocialInsurance, 0);
  assert.equal(result.totalUhiContribution, 0);
});

test('stamp duty uses the disbursement band, EGP 50 exemption and five-piaster rounding', () => {
  assert.equal(calculateGovernmentStampDuty(50, 0, rules), 0);
  assert.equal(calculateGovernmentStampDuty(250, 0, rules), 1.20);
  assert.equal(calculateGovernmentStampDuty(500, 0, rules), 2.95);
  assert.equal(calculateGovernmentStampDuty(1_000, 0, rules), 6.65);
  assert.equal(calculateGovernmentStampDuty(10_000, 0, rules), 79.60);
  assert.equal(calculateGovernmentStampDuty(15_000, 0, rules), 94.60);
});

test('stamp duty can be disabled for an officially exempt salary disbursement', () => {
  const result = calculateGovernmentPayroll(standardInput({ proportionalStampDutyEnabled: false }), rules);
  assert.equal(result.proportionalStampDuty, 0);
});

test('non-insurable allowances reduce only the calculated insurance wage and not taxable earnings', () => {
  const result = calculateGovernmentPayroll(standardInput({
    functionalWage: 8_000,
    complementaryWage: 4_000,
    nonInsurableAllowances: 3_000,
  }), rules);
  assert.equal(result.totalEarnings, 12_000);
  assert.equal(result.calculatedInsuranceWage, 9_000);
  assert.equal(result.insuranceContributionWage, 9_000);
  assert.equal(result.taxableMonthlyEarnings, 12_000);
});

test('government engine produces an auditable gross-to-net reconciliation', () => {
  const result = calculateGovernmentPayroll(standardInput(), rules);
  assert.ok(result.monthlyIncomeTax > 0);
  assert.ok(result.proportionalStampDuty > 0);
  assert.equal(
    result.netSalary,
    result.totalEarnings - result.totalDeductions,
  );
});
