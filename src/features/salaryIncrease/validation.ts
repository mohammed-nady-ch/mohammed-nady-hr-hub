import {
  MAX_EMPLOYEES,
  PERFORMANCE_RATING_OPTIONS,
  RELATIVE_WEIGHT_OPTIONS,
  roundMoney,
  type EmployeeSalaryInput,
  type PerformanceRating,
} from './engine.ts';

export type SalaryDataIssueCode =
  | 'missingEmployeeIdColumn'
  | 'missingSalaryColumn'
  | 'missingEmployeeId'
  | 'missingSalary'
  | 'invalidSalary'
  | 'nonPositiveSalary'
  | 'duplicateEmployeeId'
  | 'invalidRelativeWeight'
  | 'invalidPerformanceRating'
  | 'tooManyEmployees'
  | 'noValidEmployees';

export interface SalaryDataIssue {
  code: SalaryDataIssueCode;
  row?: number;
  employeeId?: string;
  maximum?: number;
}

export interface RawSalaryRow {
  row: number;
  employeeId: unknown;
  currentGrossSalary: unknown;
  relativeWeight?: unknown;
  performanceRating?: unknown;
}

export interface SalaryDataValidationResult {
  employees: EmployeeSalaryInput[];
  issues: SalaryDataIssue[];
}

function parseSalary(value: unknown) {
  if (typeof value === 'number') return value;
  if (typeof value !== 'string') return Number.NaN;
  const normalized = value.replace(/[,\s]/g, '');
  return normalized === '' ? Number.NaN : Number(normalized);
}

function parseOptionalNumber(value: unknown) {
  if (value === undefined || value === null || String(value).trim() === '') return undefined;
  if (typeof value === 'number') return value;
  return Number(String(value).replace(/[,%\s]/g, ''));
}

export function normalizeEmployeeId(value: unknown) {
  return String(value ?? '').trim();
}

export function validateSalaryRows(rows: readonly RawSalaryRow[]): SalaryDataValidationResult {
  const employees: EmployeeSalaryInput[] = [];
  const issues: SalaryDataIssue[] = [];
  const seenIds = new Map<string, number>();

  if (rows.length > MAX_EMPLOYEES) {
    issues.push({ code: 'tooManyEmployees', maximum: MAX_EMPLOYEES });
  }

  for (const row of rows) {
    const employeeId = normalizeEmployeeId(row.employeeId);
    const rawSalary = row.currentGrossSalary;
    const salaryMissing = rawSalary === undefined || rawSalary === null || String(rawSalary).trim() === '';

    if (!employeeId) issues.push({ code: 'missingEmployeeId', row: row.row });
    if (salaryMissing) issues.push({ code: 'missingSalary', row: row.row, employeeId: employeeId || undefined });

    const salary = parseSalary(rawSalary);
    if (!salaryMissing && !Number.isFinite(salary)) {
      issues.push({ code: 'invalidSalary', row: row.row, employeeId: employeeId || undefined });
    } else if (!salaryMissing && salary <= 0) {
      issues.push({ code: 'nonPositiveSalary', row: row.row, employeeId: employeeId || undefined });
    }

    const normalizedId = employeeId.toLocaleUpperCase('en-US');
    const relativeWeight = parseOptionalNumber(row.relativeWeight);
    const performanceRating = parseOptionalNumber(row.performanceRating);
    const validRelativeWeight = relativeWeight === undefined
      || RELATIVE_WEIGHT_OPTIONS.some((option) => Math.abs(option - relativeWeight) < 0.0001);
    const validPerformanceRating = performanceRating === undefined
      || PERFORMANCE_RATING_OPTIONS.includes(performanceRating as PerformanceRating);
    if (!validRelativeWeight) {
      issues.push({ code: 'invalidRelativeWeight', row: row.row, employeeId: employeeId || undefined });
    }
    if (!validPerformanceRating) {
      issues.push({ code: 'invalidPerformanceRating', row: row.row, employeeId: employeeId || undefined });
    }
    if (employeeId) {
      const firstRow = seenIds.get(normalizedId);
      if (firstRow !== undefined) {
        issues.push({ code: 'duplicateEmployeeId', row: row.row, employeeId });
      } else {
        seenIds.set(normalizedId, row.row);
      }
    }

    if (employeeId && Number.isFinite(salary) && salary > 0 && validRelativeWeight && validPerformanceRating) {
      const isDuplicate = seenIds.get(normalizedId) !== row.row;
      if (!isDuplicate) employees.push({
        employeeId,
        currentGrossSalary: roundMoney(salary),
        ...(relativeWeight === undefined ? {} : { relativeWeight }),
        ...(performanceRating === undefined ? {} : { performanceRating: performanceRating as PerformanceRating }),
      });
    }
  }

  if (employees.length === 0) issues.push({ code: 'noValidEmployees' });
  return { employees, issues };
}
