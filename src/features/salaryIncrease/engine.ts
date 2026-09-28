export const MAX_EMPLOYEES = 100;
export const RELATIVE_WEIGHT_OPTIONS = [0.5, 0.6, 0.7, 0.8, 0.9, 1, 1.1, 1.2, 1.3, 1.4, 1.5] as const;
export const PERFORMANCE_RATING_OPTIONS = [1, 2, 3, 4, 5] as const;

export type PerformanceRating = typeof PERFORMANCE_RATING_OPTIONS[number];
export type AllocationMethod = 'uniform' | 'weight' | 'performance' | 'combined';

export const PERFORMANCE_MULTIPLIERS: Record<PerformanceRating, number> = {
  1: 0.6,
  2: 0.8,
  3: 1,
  4: 1.2,
  5: 1.4,
};

export interface EmployeeSalaryInput {
  employeeId: string;
  currentGrossSalary: number;
  relativeWeight?: number;
  performanceRating?: PerformanceRating;
}

export interface SalaryIncreaseScenarioInput {
  id: string;
  name: string;
  percentage: number;
  allocationMethod: AllocationMethod;
}

export interface EmployeeSalaryResult extends EmployeeSalaryInput {
  appliedWeight: number;
  performanceMultiplier: number;
  allocationScore: number;
  increasePercentage: number;
  increaseAmount: number;
  newGrossSalary: number;
}

export interface SalaryIncreaseSummary {
  employeeCount: number;
  currentMonthlyPayroll: number;
  currentAnnualPayroll: number;
  monthlyIncreaseCost: number;
  annualIncreaseCost: number;
  newMonthlyPayroll: number;
  newAnnualPayroll: number;
  averageIncreaseAmount: number;
  increaseAsPercentageOfPayroll: number;
  minimumIncreasePercentage: number;
  maximumIncreasePercentage: number;
  annualBudget?: number;
  budgetRemaining?: number;
  budgetUtilization?: number;
}

export interface SalaryIncreaseScenarioResult {
  scenario: SalaryIncreaseScenarioInput;
  employees: EmployeeSalaryResult[];
  summary: SalaryIncreaseSummary;
}

export function roundMoney(value: number) {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

function roundPercentage(value: number) {
  return Math.round((value + Number.EPSILON) * 10_000) / 10_000;
}

export function methodUsesWeight(method: AllocationMethod) {
  return method === 'weight' || method === 'combined';
}

export function methodUsesPerformance(method: AllocationMethod) {
  return method === 'performance' || method === 'combined';
}

function allocationFactors(employee: EmployeeSalaryInput, method: AllocationMethod) {
  const appliedWeight = methodUsesWeight(method) ? employee.relativeWeight ?? 1 : 1;
  const performanceMultiplier = methodUsesPerformance(method) && employee.performanceRating !== undefined
    ? PERFORMANCE_MULTIPLIERS[employee.performanceRating]
    : 1;
  return {
    appliedWeight,
    performanceMultiplier,
    allocationScore: appliedWeight * performanceMultiplier,
  };
}

function allocateRoundedIncreaseAmounts(
  employees: readonly EmployeeSalaryInput[],
  scores: readonly number[],
  targetMonthlyIncrease: number,
) {
  const denominator = employees.reduce(
    (total, employee, index) => total + employee.currentGrossSalary * scores[index],
    0,
  );
  if (denominator <= 0 || targetMonthlyIncrease <= 0) return employees.map(() => 0);

  const targetCents = Math.round(targetMonthlyIncrease * 100);
  const allocations = employees.map((employee, index) => {
    const rawCents = targetCents * employee.currentGrossSalary * scores[index] / denominator;
    const cents = Math.floor(rawCents);
    return { index, cents, remainder: rawCents - cents, employeeId: employee.employeeId };
  });
  let centsToDistribute = targetCents - allocations.reduce((total, allocation) => total + allocation.cents, 0);
  const priority = [...allocations].sort((left, right) =>
    right.remainder - left.remainder || left.employeeId.localeCompare(right.employeeId));
  for (let index = 0; index < centsToDistribute; index += 1) {
    priority[index % priority.length].cents += 1;
  }
  return allocations.sort((left, right) => left.index - right.index).map(({ cents }) => cents / 100);
}

export function calculateSalaryIncrease(
  employees: readonly EmployeeSalaryInput[],
  scenario: SalaryIncreaseScenarioInput,
  annualBudget?: number,
): SalaryIncreaseScenarioResult {
  const percentage = Math.max(0, scenario.percentage);
  const method = scenario.allocationMethod;
  const normalizedEmployees = employees.map((employee) => ({
    ...employee,
    currentGrossSalary: roundMoney(employee.currentGrossSalary),
  }));
  const factors = normalizedEmployees.map((employee) => allocationFactors(employee, method));
  const currentMonthlyPayroll = roundMoney(normalizedEmployees.reduce((total, employee) => total + employee.currentGrossSalary, 0));
  const targetMonthlyIncrease = roundMoney(currentMonthlyPayroll * percentage / 100);
  const increaseAmounts = allocateRoundedIncreaseAmounts(
    normalizedEmployees,
    factors.map(({ allocationScore }) => allocationScore),
    targetMonthlyIncrease,
  );
  const results = normalizedEmployees.map((employee, index) => {
    const increaseAmount = increaseAmounts[index];
    return {
      ...employee,
      ...factors[index],
      increasePercentage: employee.currentGrossSalary
        ? roundPercentage(increaseAmount / employee.currentGrossSalary * 100)
        : 0,
      increaseAmount,
      newGrossSalary: roundMoney(employee.currentGrossSalary + increaseAmount),
    };
  });

  const monthlyIncreaseCost = roundMoney(results.reduce((total, employee) => total + employee.increaseAmount, 0));
  const newMonthlyPayroll = roundMoney(results.reduce((total, employee) => total + employee.newGrossSalary, 0));
  const currentAnnualPayroll = roundMoney(currentMonthlyPayroll * 12);
  const annualIncreaseCost = roundMoney(monthlyIncreaseCost * 12);
  const newAnnualPayroll = roundMoney(newMonthlyPayroll * 12);
  const normalizedBudget = annualBudget !== undefined && annualBudget > 0 ? roundMoney(annualBudget) : undefined;
  const increasePercentages = results.map(({ increasePercentage }) => increasePercentage);

  return {
    scenario: { ...scenario, percentage, allocationMethod: method },
    employees: results,
    summary: {
      employeeCount: results.length,
      currentMonthlyPayroll,
      currentAnnualPayroll,
      monthlyIncreaseCost,
      annualIncreaseCost,
      newMonthlyPayroll,
      newAnnualPayroll,
      averageIncreaseAmount: results.length ? roundMoney(monthlyIncreaseCost / results.length) : 0,
      increaseAsPercentageOfPayroll: currentMonthlyPayroll
        ? monthlyIncreaseCost / currentMonthlyPayroll * 100
        : 0,
      minimumIncreasePercentage: increasePercentages.length ? Math.min(...increasePercentages) : 0,
      maximumIncreasePercentage: increasePercentages.length ? Math.max(...increasePercentages) : 0,
      annualBudget: normalizedBudget,
      budgetRemaining: normalizedBudget === undefined ? undefined : roundMoney(normalizedBudget - annualIncreaseCost),
      budgetUtilization: normalizedBudget === undefined ? undefined : annualIncreaseCost / normalizedBudget * 100,
    },
  };
}

export function calculateUniformIncrease(
  employees: readonly EmployeeSalaryInput[],
  scenario: Omit<SalaryIncreaseScenarioInput, 'allocationMethod'> | SalaryIncreaseScenarioInput,
  annualBudget?: number,
): SalaryIncreaseScenarioResult {
  return calculateSalaryIncrease(employees, { ...scenario, allocationMethod: 'uniform' }, annualBudget);
}

export function calculateScenarios(
  employees: readonly EmployeeSalaryInput[],
  scenarios: readonly SalaryIncreaseScenarioInput[],
  annualBudget?: number,
) {
  return scenarios.map((scenario) => calculateSalaryIncrease(employees, scenario, annualBudget));
}
