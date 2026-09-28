import assert from 'node:assert/strict';
import { File } from 'node:buffer';
import test from 'node:test';

import writeXlsxFile from 'write-excel-file/node';
import {
  createSalaryResultsSheets,
  createSalaryTemplateDataValidationFeature,
  createSalaryTemplateOptions,
  createSalaryTemplateSheets,
  parseSalaryWorkbook,
} from '../src/features/salaryIncrease/excel.ts';
import { calculateScenarios } from '../src/features/salaryIncrease/engine.ts';

test('Excel parser reads the Salary Input sheet and validates its rows', async () => {
  const buffer = await writeXlsxFile([
    { data: [['Instructions'], ['This sheet is intentionally first.']], sheet: 'Instructions' },
    {
      data: [
        ['Employee ID', 'Current Gross Salary', 'Relative Weight', 'Performance Rating'],
        ['EMP001', 18_000, 1.5, 5],
        ['EMP002', 25_000.25, null, 3],
      ],
      sheet: 'Salary Input',
    },
  ]).toBuffer();
  const file = new File([buffer], 'salary-input.xlsx', {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  });

  const result = await parseSalaryWorkbook(file);
  assert.equal(result.fileName, 'salary-input.xlsx');
  assert.deepEqual(result.issues, []);
  assert.deepEqual(result.employees, [
    { employeeId: 'EMP001', currentGrossSalary: 18_000, relativeWeight: 1.5, performanceRating: 5 },
    { employeeId: 'EMP002', currentGrossSalary: 25_000.25, performanceRating: 3 },
  ]);
});

test('template and result workbooks are generated with the required sheets', async () => {
  const templateBuffer = await writeXlsxFile(createSalaryTemplateSheets(false), createSalaryTemplateOptions()).toBuffer();
  const templateSheets = await (await import('read-excel-file/node')).default(templateBuffer);
  assert.deepEqual(templateSheets.map(({ sheet }) => sheet), ['Instructions', 'Salary Input']);
  assert.deepEqual(templateSheets[1].data[0], ['Employee ID', 'Current Gross Salary', 'Relative Weight', 'Performance Rating']);

  const employees = [
    { employeeId: 'EMP001', currentGrossSalary: 18_000 },
    { employeeId: 'EMP002', currentGrossSalary: 25_000 },
  ];
  const results = calculateScenarios(employees, [
    { id: 'a', name: 'Scenario A', percentage: 10, allocationMethod: 'uniform' },
    { id: 'b', name: 'Scenario B', percentage: 12.5, allocationMethod: 'weight' },
  ], 100_000);
  const resultSheetDefinitions = createSalaryResultsSheets(results, 100_000);
  const firstEmployeePercentage = resultSheetDefinitions[1].data[5][6];
  assert.equal(typeof firstEmployeePercentage, 'object');
  assert.equal(firstEmployeePercentage && 'value' in firstEmployeePercentage ? firstEmployeePercentage.value : undefined, 'IFERROR(H6/B6,0)');
  const resultsBuffer = await writeXlsxFile(resultSheetDefinitions).toBuffer();
  const resultSheets = await (await import('read-excel-file/node')).default(resultsBuffer);
  assert.deepEqual(resultSheets.map(({ sheet }) => sheet), ['Summary', 'Scenario A', 'Scenario B']);
  assert.equal(resultSheets[1].data[0][1], 'Scenario A');
  assert.equal(resultSheets[1].data[1][1], 'uniform');
  assert.equal(resultSheets[1].data[2][1], 0.1);
});

test('template feature adds dropdown validation to weight and performance columns', () => {
  const feature = createSalaryTemplateDataValidationFeature();
  const transform = feature.files.transform['xl/worksheets/sheet{id}.xml'].transform;
  const xml = '<?xml version="1.0"?><worksheet><sheetData/></worksheet>';
  const unchanged = transform(xml, { sheet: 'Instructions' });
  const transformed = transform(xml, { sheet: 'Salary Input' });

  assert.equal(unchanged, xml);
  assert.match(transformed, /<dataValidations count="2">/);
  assert.match(transformed, /sqref="C2:C101"/);
  assert.match(transformed, /sqref="D2:D101"/);
  assert.match(transformed, /"0\.50,0\.60,0\.70/);
  assert.match(transformed, /"1,2,3,4,5"/);
  assert.equal(createSalaryTemplateOptions().features.length, 1);
});
