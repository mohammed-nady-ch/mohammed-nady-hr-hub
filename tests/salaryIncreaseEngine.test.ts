import assert from 'node:assert/strict';
import test from 'node:test';

import {
  calculateScenarios,
  calculateUniformIncrease,
  MAX_EMPLOYEES,
} from '../src/features/salaryIncrease/engine.ts';
import { validateSalaryRows } from '../src/features/salaryIncrease/validation.ts';

const employees = [
  { employeeId: 'EMP001', currentGrossSalary: 18_000 },
  { employeeId: 'EMP002', currentGrossSalary: 25_000 },
  { employeeId: 'EMP003', currentGrossSalary: 32_000 },
  { employeeId: 'EMP004', currentGrossSalary: 45_000 },
];

test('uniform increase calculates employee values and annualized payroll totals', () => {
  const result = calculateUniformIncrease(employees, {
    id: 'scenario-a', name: 'Scenario A', percentage: 15,
  });

  assert.deepEqual(result.employees[0], {
    employeeId: 'EMP001',
    currentGrossSalary: 18_000,
    appliedWeight: 1,
    performanceMultiplier: 1,
    allocationScore: 1,
    increasePercentage: 15,
    increaseAmount: 2_700,
    newGrossSalary: 20_700,
  });
  assert.equal(result.summary.employeeCount, 4);
  assert.equal(result.summary.currentMonthlyPayroll, 120_000);
  assert.equal(result.summary.currentAnnualPayroll, 1_440_000);
  assert.equal(result.summary.monthlyIncreaseCost, 18_000);
  assert.equal(result.summary.annualIncreaseCost, 216_000);
  assert.equal(result.summary.newMonthlyPayroll, 138_000);
  assert.equal(result.summary.newAnnualPayroll, 1_656_000);
  assert.equal(result.summary.averageIncreaseAmount, 4_500);
  assert.equal(result.summary.increaseAsPercentageOfPayroll, 15);
});

test('budget comparison reports remaining budget, overspend and utilization', () => {
  const withinBudget = calculateUniformIncrease(employees, {
    id: 'scenario-a', name: 'Scenario A', percentage: 10,
  }, 150_000);
  const overBudget = calculateUniformIncrease(employees, {
    id: 'scenario-b', name: 'Scenario B', percentage: 15,
  }, 200_000);

  assert.equal(withinBudget.summary.annualIncreaseCost, 144_000);
  assert.equal(withinBudget.summary.budgetRemaining, 6_000);
  assert.equal(withinBudget.summary.budgetUtilization, 96);
  assert.equal(overBudget.summary.budgetRemaining, -16_000);
  assert.equal(overBudget.summary.budgetUtilization, 108);
});

test('scenario comparison uses the same employee population and budget', () => {
  const results = calculateScenarios(employees, [
    { id: 'a', name: '10%', percentage: 10, allocationMethod: 'uniform' },
    { id: 'b', name: '12.5%', percentage: 12.5, allocationMethod: 'uniform' },
    { id: 'c', name: '15%', percentage: 15, allocationMethod: 'uniform' },
  ], 200_000);

  assert.equal(results.length, 3);
  assert.deepEqual(results.map(({ summary }) => summary.employeeCount), [4, 4, 4]);
  assert.deepEqual(results.map(({ summary }) => summary.annualBudget), [200_000, 200_000, 200_000]);
  assert.deepEqual(results.map(({ summary }) => summary.annualIncreaseCost), [144_000, 180_000, 216_000]);
});

test('money is rounded per employee to two decimal places before summaries', () => {
  const result = calculateUniformIncrease([
    { employeeId: 'A', currentGrossSalary: 100.01 },
    { employeeId: 'B', currentGrossSalary: 100.01 },
  ], { id: 'a', name: 'A', percentage: 12.5 });

  assert.equal(result.employees[0].increaseAmount, 12.5);
  assert.equal(result.employees[0].newGrossSalary, 112.51);
  assert.equal(result.summary.monthlyIncreaseCost, 25);
});

test('weighted, performance and combined methods redistribute the same increase pool', () => {
  const scoredEmployees = [
    { employeeId: 'A', currentGrossSalary: 10_000, relativeWeight: 1.5, performanceRating: 5 as const },
    { employeeId: 'B', currentGrossSalary: 20_000, relativeWeight: 1, performanceRating: 3 as const },
    { employeeId: 'C', currentGrossSalary: 30_000, relativeWeight: 0.5, performanceRating: 1 as const },
  ];
  const results = calculateScenarios(scoredEmployees, [
    { id: 'uniform', name: 'Uniform', percentage: 10, allocationMethod: 'uniform' },
    { id: 'weight', name: 'Weight', percentage: 10, allocationMethod: 'weight' },
    { id: 'performance', name: 'Performance', percentage: 10, allocationMethod: 'performance' },
    { id: 'combined', name: 'Combined', percentage: 10, allocationMethod: 'combined' },
  ]);

  assert.deepEqual(results.map(({ summary }) => summary.monthlyIncreaseCost), [6_000, 6_000, 6_000, 6_000]);
  assert.deepEqual(results.map(({ summary }) => summary.annualIncreaseCost), [72_000, 72_000, 72_000, 72_000]);
  assert.equal(results[0].summary.minimumIncreasePercentage, 10);
  assert.equal(results[0].summary.maximumIncreasePercentage, 10);
  for (const result of results.slice(1)) {
    assert.ok(result.employees[0].increasePercentage > result.employees[1].increasePercentage);
    assert.ok(result.employees[1].increasePercentage > result.employees[2].increasePercentage);
    assert.ok(result.summary.minimumIncreasePercentage < 10);
    assert.ok(result.summary.maximumIncreasePercentage > 10);
  }
});

test('allocation reconciles employee rounding exactly to the scenario target', () => {
  const result = calculateScenarios([
    { employeeId: 'A', currentGrossSalary: 100.01, relativeWeight: 1.5 },
    { employeeId: 'B', currentGrossSalary: 100.02, relativeWeight: 1.1 },
    { employeeId: 'C', currentGrossSalary: 100.03, relativeWeight: 0.5 },
  ], [{ id: 'weighted', name: 'Weighted', percentage: 12.5, allocationMethod: 'weight' }])[0];

  assert.equal(result.summary.currentMonthlyPayroll, 300.06);
  assert.equal(result.summary.monthlyIncreaseCost, 37.51);
  assert.equal(result.employees.reduce((total, employee) => total + employee.increaseAmount, 0), 37.51);
});

test('validation blocks missing, invalid, non-positive and duplicate values', () => {
  const result = validateSalaryRows([
    { row: 2, employeeId: ' EMP001 ', currentGrossSalary: '18,000' },
    { row: 3, employeeId: 'emp001', currentGrossSalary: 20_000 },
    { row: 4, employeeId: '', currentGrossSalary: 22_000 },
    { row: 5, employeeId: 'EMP005', currentGrossSalary: '' },
    { row: 6, employeeId: 'EMP006', currentGrossSalary: 'salary' },
    { row: 7, employeeId: 'EMP007', currentGrossSalary: 0 },
  ]);

  assert.deepEqual(result.employees, [{ employeeId: 'EMP001', currentGrossSalary: 18_000 }]);
  assert.ok(result.issues.some(({ code, row }) => code === 'duplicateEmployeeId' && row === 3));
  assert.ok(result.issues.some(({ code, row }) => code === 'missingEmployeeId' && row === 4));
  assert.ok(result.issues.some(({ code, row }) => code === 'missingSalary' && row === 5));
  assert.ok(result.issues.some(({ code, row }) => code === 'invalidSalary' && row === 6));
  assert.ok(result.issues.some(({ code, row }) => code === 'nonPositiveSalary' && row === 7));
});

test('validation accepts dropdown values and rejects unsupported weight or performance entries', () => {
  const result = validateSalaryRows([
    { row: 2, employeeId: 'A', currentGrossSalary: 10_000, relativeWeight: 1.5, performanceRating: 5 },
    { row: 3, employeeId: 'B', currentGrossSalary: 10_000, relativeWeight: 1.25, performanceRating: 3 },
    { row: 4, employeeId: 'C', currentGrossSalary: 10_000, relativeWeight: 1, performanceRating: 6 },
  ]);

  assert.deepEqual(result.employees, [{ employeeId: 'A', currentGrossSalary: 10_000, relativeWeight: 1.5, performanceRating: 5 }]);
  assert.ok(result.issues.some(({ code, row }) => code === 'invalidRelativeWeight' && row === 3));
  assert.ok(result.issues.some(({ code, row }) => code === 'invalidPerformanceRating' && row === 4));
});

test('validation enforces the 100 employee limit', () => {
  const rows = Array.from({ length: MAX_EMPLOYEES + 1 }, (_, index) => ({
    row: index + 2,
    employeeId: `EMP${index + 1}`,
    currentGrossSalary: 10_000,
  }));
  const result = validateSalaryRows(rows);
  assert.ok(result.issues.some(({ code }) => code === 'tooManyEmployees'));
});
