import readXlsxFile from 'read-excel-file/universal';
import writeXlsxFile, { type Cell, type SheetData } from 'write-excel-file/browser';
import { getOrderOfSiblings, insertElementMarkupAccordingToOrderOfSiblings } from 'write-excel-file/utility';
import type { SalaryIncreaseScenarioResult } from './engine.ts';
import {
  MAX_EMPLOYEES,
  PERFORMANCE_RATING_OPTIONS,
  RELATIVE_WEIGHT_OPTIONS,
  type EmployeeSalaryInput,
} from './engine.ts';
import {
  validateSalaryRows,
  type RawSalaryRow,
  type SalaryDataIssue,
  type SalaryDataValidationResult,
} from './validation.ts';

const EMPLOYEE_ID_HEADERS = new Set(['employeeid', 'employee id', 'رقم الموظف', 'كود الموظف']);
const SALARY_HEADERS = new Set(['currentgrosssalary', 'current gross salary', 'إجمالي الراتب الحالي', 'الراتب الإجمالي الحالي']);
const WEIGHT_HEADERS = new Set(['relativeweight', 'relative weight', 'الوزن النسبي']);
const PERFORMANCE_HEADERS = new Set(['performancerating', 'performance rating', 'تقييم الأداء', 'نتيجة الأداء']);
const headerStyle = {
  backgroundColor: '#08706D', borderColor: '#DCE7E5', borderStyle: 'thin' as const,
  fontWeight: 'bold' as const, textColor: '#FFFFFF', align: 'center' as const,
};
const inputStyle = { backgroundColor: '#FFFF00', textColor: '#0000FF' };
const moneyFormat = '#,##0.00;[Red](#,##0.00);-';

export interface ParsedSalaryFile extends SalaryDataValidationResult {
  fileName: string;
}

function normalizeHeader(value: unknown) {
  return String(value ?? '').trim().replace(/[_-]+/g, ' ').replace(/\\s+/g, ' ').toLocaleLowerCase('en-US');
}

function findColumn(headerRow: readonly unknown[], acceptedHeaders: Set<string>) {
  const index = headerRow.findIndex((value) => acceptedHeaders.has(normalizeHeader(value)));
  return index >= 0 ? index : undefined;
}

function headerCell(value: string): Cell {
  return { value, ...headerStyle };
}

function formula(value: string, format?: string): Cell {
  return { value: value.replace(/^=/, ''), type: 'Formula', format };
}

export async function parseSalaryWorkbook(file: File): Promise<ParsedSalaryFile> {
  const sheets = await readXlsxFile(file);
  const sheet = sheets.find(({ sheet: name }) => name === 'Salary Input')
    ?? sheets.find(({ data }) => findColumn(data[0] ?? [], EMPLOYEE_ID_HEADERS) !== undefined)
    ?? sheets[0];
  const structuralIssues: SalaryDataIssue[] = [];

  if (!sheet) return { fileName: file.name, employees: [], issues: [{ code: 'noValidEmployees' }] };

  const headerRow = sheet.data[0] ?? [];
  const employeeIdColumn = findColumn(headerRow, EMPLOYEE_ID_HEADERS);
  const salaryColumn = findColumn(headerRow, SALARY_HEADERS);
  const weightColumn = findColumn(headerRow, WEIGHT_HEADERS);
  const performanceColumn = findColumn(headerRow, PERFORMANCE_HEADERS);
  if (employeeIdColumn === undefined) structuralIssues.push({ code: 'missingEmployeeIdColumn' });
  if (salaryColumn === undefined) structuralIssues.push({ code: 'missingSalaryColumn' });
  if (structuralIssues.length) return { fileName: file.name, employees: [], issues: structuralIssues };

  const rows: RawSalaryRow[] = [];
  sheet.data.slice(1).forEach((row, index) => {
    const employeeId = row[employeeIdColumn!];
    const currentGrossSalary = row[salaryColumn!];
    const relativeWeight = weightColumn === undefined ? undefined : row[weightColumn];
    const performanceRating = performanceColumn === undefined ? undefined : row[performanceColumn];
    const completelyEmpty = [employeeId, currentGrossSalary, relativeWeight, performanceRating]
      .every((value) => String(value ?? '').trim() === '');
    if (!completelyEmpty) rows.push({ row: index + 2, employeeId, currentGrossSalary, relativeWeight, performanceRating });
  });

  return { fileName: file.name, ...validateSalaryRows(rows) };
}

export function createSalaryTemplateSheets(ar: boolean) {
  const instructions: SheetData = [
    [{ value: ar ? 'تعليمات القالب' : 'Template Instructions', ...headerStyle, columnSpan: 2 }, null],
    [ar ? 'الخلايا المطلوب تعديلها' : 'Cells to edit', ar ? 'أدخل البيانات في ورقة Salary Input فقط.' : 'Enter data in the Salary Input sheet only.'],
    [ar ? 'الحد الأقصى' : 'Maximum records', MAX_EMPLOYEES],
    [ar ? 'تعريف الراتب' : 'Salary definition', ar ? 'إجمالي الراتب الشهري بالجنيه المصري.' : 'Monthly gross salary in Egyptian pounds.'],
    [ar ? 'الوزن النسبي' : 'Relative weight', ar ? 'اختياري. اختر من القائمة؛ القيمة الفارغة تُعامل كوزن 1.00.' : 'Optional. Choose from the dropdown; a blank value is treated as 1.00.'],
    [ar ? 'تقييم الأداء' : 'Performance rating', ar ? 'اختياري. اختر تقييمًا من 1 إلى 5. يلزم استكماله لكل الموظفين عند استخدام سيناريو الأداء.' : 'Optional. Choose a rating from 1 to 5. Complete it for every employee when using a performance scenario.'],
    [],
    [ar ? 'مثال رقم موظف' : 'Example Employee ID', 'EMP001'],
    [ar ? 'مثال راتب' : 'Example Gross Salary', { value: 18_000, format: moneyFormat }],
  ];
  const input: SheetData = [
    [headerCell('Employee ID'), headerCell('Current Gross Salary'), headerCell('Relative Weight'), headerCell('Performance Rating')],
    ...Array.from({ length: MAX_EMPLOYEES }, () => [
      { value: '', type: String, ...inputStyle },
      { value: undefined, type: Number, format: moneyFormat, ...inputStyle },
      { value: undefined, type: Number, format: '0.00', ...inputStyle },
      { value: undefined, type: Number, format: '0', ...inputStyle },
    ] as Cell[]),
  ];

  return [
    { data: instructions, sheet: 'Instructions', columns: [{ width: 30 }, { width: 48 }], rightToLeft: ar, showGridLines: false },
    { data: input, sheet: 'Salary Input', columns: [{ width: 24 }, { width: 28 }, { width: 22 }, { width: 22 }], stickyRowsCount: 1 },
  ];
}

export function createSalaryTemplateDataValidationFeature() {
  const weightList = RELATIVE_WEIGHT_OPTIONS.map((value) => value.toFixed(2)).join(',');
  const performanceList = PERFORMANCE_RATING_OPTIONS.join(',');
  return {
    files: {
      transform: {
        'xl/worksheets/sheet{id}.xml': {
          transform(content: string, options: { sheet?: string }) {
            if (options.sheet !== 'Salary Input') return content;
            const lastRow = MAX_EMPLOYEES + 1;
            const validation = (range: string, values: string) =>
              `<dataValidation type="list" allowBlank="1" showDropDown="0" showInputMessage="1" showErrorMessage="1" errorStyle="stop" errorTitle="Invalid value" error="Choose a value from the dropdown list." sqref="${range}"><formula1>"${values}"</formula1></dataValidation>`;
            const markup = `<dataValidations count="2">${validation(`C2:C${lastRow}`, weightList)}${validation(`D2:D${lastRow}`, performanceList)}</dataValidations>`;
            const order = getOrderOfSiblings('xl/worksheets/sheet{id}.xml', 'worksheet');
            if (!order) throw new Error('Unable to determine worksheet element order for Excel validation lists.');
            return insertElementMarkupAccordingToOrderOfSiblings(content, markup, order, 'worksheet');
          },
        },
      },
    },
  };
}

export function createSalaryTemplateOptions() {
  return { fontFamily: 'Arial', fontSize: 10, features: [createSalaryTemplateDataValidationFeature()] };
}

export async function downloadSalaryTemplate(ar: boolean) {
  await writeXlsxFile(createSalaryTemplateSheets(ar), createSalaryTemplateOptions())
    .toFile('salary-increase-template.xlsx');
}

function createScenarioSheet(result: SalaryIncreaseScenarioResult, index: number) {
  const sheetName = `Scenario ${String.fromCharCode(65 + index)}`;
  const data: SheetData = [
    ['Scenario Name', result.scenario.name],
    ['Allocation Method', result.scenario.allocationMethod],
    ['Target Payroll Increase', { value: result.scenario.percentage / 100, format: '0.00%', ...inputStyle }],
    [],
    ['Employee ID', 'Current Gross Salary', 'Relative Weight', 'Performance Rating', 'Performance Multiplier', 'Allocation Score', 'Increase %', 'Increase Amount', 'New Gross Salary'].map((value) => headerCell(value)),
    ...result.employees.map((employee, employeeIndex) => {
      const rowNumber = employeeIndex + 6;
      return [
        employee.employeeId,
        { value: employee.currentGrossSalary, format: moneyFormat },
        { value: employee.appliedWeight, format: '0.00' },
        employee.performanceRating ?? null,
        { value: employee.performanceMultiplier, format: '0.00' },
        { value: employee.allocationScore, format: '0.0000' },
        formula(`IFERROR(H${rowNumber}/B${rowNumber},0)`, '0.00%'),
        { value: employee.increaseAmount, format: moneyFormat },
        formula(`ROUND(B${rowNumber}+H${rowNumber},2)`, moneyFormat),
      ];
    }),
  ];
  return {
    data,
    sheet: sheetName,
    columns: [{ width: 22 }, { width: 24 }, { width: 18 }, { width: 20 }, { width: 24 }, { width: 20 }, { width: 18 }, { width: 22 }, { width: 22 }],
    stickyRowsCount: 5,
    showGridLines: false,
  };
}

export function createSalaryResultsSheets(
  results: readonly SalaryIncreaseScenarioResult[],
  annualBudget: number | undefined,
) {
  const sheetNames = results.map((_, index) => `Scenario ${String.fromCharCode(65 + index)}`);
  const summary: SheetData = [
    [{ value: 'Salary Increase Budget Simulator', ...headerStyle, columnSpan: results.length + 1 }, ...results.map(() => null)],
    ['Annual Budget (EGP)', annualBudget === undefined ? null : { value: annualBudget, format: moneyFormat, ...inputStyle }],
    [],
    [headerCell('Metric'), ...results.map((result) => headerCell(result.scenario.name))],
  ];
  const metrics = [
    ['Employees', 'employeeCount'],
    ['Current Monthly Payroll', 'currentMonthlyPayroll'],
    ['Current Annual Payroll', 'currentAnnualPayroll'],
    ['Monthly Increase Cost', 'monthlyIncreaseCost'],
    ['Annual Increase Cost', 'annualIncreaseCost'],
    ['New Monthly Payroll', 'newMonthlyPayroll'],
    ['New Annual Payroll', 'newAnnualPayroll'],
    ['Average Monthly Increase', 'averageIncreaseAmount'],
    ['Increase % of Current Payroll', 'increaseAsPercentageOfPayroll'],
    ['Minimum Employee Increase %', 'minimumIncreasePercentage'],
    ['Maximum Employee Increase %', 'maximumIncreasePercentage'],
    ['Budget Remaining / (Over)', 'budgetRemaining'],
    ['Budget Utilization', 'budgetUtilization'],
  ] as const;

  summary.push(['Allocation Method', ...results.map((result) => result.scenario.allocationMethod)]);

  metrics.forEach(([label, key]) => {
    const cells: Cell[] = [label];
    results.forEach((result, index) => {
      const scenarioSheet = sheetNames[index];
      const lastRow = result.employees.length + 5;
      const formulas: Record<typeof key, string> = {
        employeeCount: `COUNTA('${scenarioSheet}'!A6:A${lastRow})`,
        currentMonthlyPayroll: `SUM('${scenarioSheet}'!B6:B${lastRow})`,
        currentAnnualPayroll: `SUM('${scenarioSheet}'!B6:B${lastRow})*12`,
        monthlyIncreaseCost: `SUM('${scenarioSheet}'!H6:H${lastRow})`,
        annualIncreaseCost: `SUM('${scenarioSheet}'!H6:H${lastRow})*12`,
        newMonthlyPayroll: `SUM('${scenarioSheet}'!I6:I${lastRow})`,
        newAnnualPayroll: `SUM('${scenarioSheet}'!I6:I${lastRow})*12`,
        averageIncreaseAmount: `AVERAGE('${scenarioSheet}'!H6:H${lastRow})`,
        increaseAsPercentageOfPayroll: `IFERROR(SUM('${scenarioSheet}'!H6:H${lastRow})/SUM('${scenarioSheet}'!B6:B${lastRow}),0)`,
        minimumIncreasePercentage: `MIN('${scenarioSheet}'!G6:G${lastRow})`,
        maximumIncreasePercentage: `MAX('${scenarioSheet}'!G6:G${lastRow})`,
        budgetRemaining: `IF($B$2="","",$B$2-SUM('${scenarioSheet}'!H6:H${lastRow})*12)`,
        budgetUtilization: `IFERROR(SUM('${scenarioSheet}'!H6:H${lastRow})*12/$B$2,0)`,
      };
      const format = key === 'employeeCount' ? '0'
        : key === 'increaseAsPercentageOfPayroll' || key === 'minimumIncreasePercentage' || key === 'maximumIncreasePercentage' || key === 'budgetUtilization' ? '0.00%'
          : moneyFormat;
      cells.push(formula(formulas[key], format));
    });
    summary.push(cells);
  });
  summary.push([]);
  summary.push([
    'Methodology',
    { value: 'The target payroll increase is distributed by the selected method and reconciled to cents. Blank relative weights are treated as 1.00. Performance and combined scenarios require a rating for every employee. Annual values are annualized over 12 months; taxes, social insurance and employer benefits are excluded.', columnSpan: Math.max(1, results.length), wrap: true },
    ...results.slice(1).map(() => null),
  ]);

  return [
    { data: summary, sheet: 'Summary', columns: [{ width: 34 }, ...results.map(() => ({ width: 22 }))], stickyRowsCount: 4, showGridLines: false },
    ...results.map(createScenarioSheet),
  ];
}

export async function exportSalaryResults(
  employees: readonly EmployeeSalaryInput[],
  results: readonly SalaryIncreaseScenarioResult[],
  annualBudget: number | undefined,
) {
  await writeXlsxFile(createSalaryResultsSheets(results, annualBudget), { fontFamily: 'Arial', fontSize: 10 })
    .toFile(`salary-increase-results-${employees.length}-employees.xlsx`);
}
