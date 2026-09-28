import React from 'react';
import { Link } from 'react-router-dom';
import {
  calculateScenarios,
  MAX_EMPLOYEES,
  methodUsesPerformance,
  methodUsesWeight,
  type AllocationMethod,
  type EmployeeSalaryInput,
  type SalaryIncreaseScenarioInput,
} from '../features/salaryIncrease/engine';
import type { SalaryDataIssue, SalaryDataIssueCode } from '../features/salaryIncrease/validation';
import { contactSearch, pagePaths } from '../types';

const PAGE_SIZE = 25;
const scenarioLetters = ['A', 'B', 'C'] as const;
const arabicScenarioLetters = ['أ', 'ب', 'ج'] as const;

const content = {
  en: {
    eyebrow: 'COMPENSATION TOOL · EGYPT',
    title: 'Salary Increase Budget Simulator',
    intro: 'Upload monthly gross salaries, compare up to three allocation methods, and see how the same target increase is distributed across employees and the annual budget.',
    privacyTitle: 'Your data stays on your device',
    privacyBody: 'Employee data is processed locally in your browser. It is not uploaded, stored, or sent to analytics tools.',
    template: 'Download Excel Template', upload: 'Upload completed Excel', replace: 'Replace file',
    uploadHint: `Use employee numbers only. Relative Weight and Performance Rating are optional dropdowns. Maximum ${MAX_EMPLOYEES} employees.`,
    validFile: 'File ready', employeesLoaded: 'employees loaded', validating: 'Checking file...',
    fileError: 'The file could not be read. Make sure it is a valid .xlsx workbook.',
    formatError: 'Only .xlsx files are supported.', validationTitle: 'Please correct the file before calculating',
    moreErrors: 'more issues are not shown.', contactLimit: `Need to process more than ${MAX_EMPLOYEES} employees?`, contactUs: 'Contact us',
    settings: 'Scenario settings', settingsBody: 'Each scenario sets a target payroll increase and a method for distributing the same pool across employees.',
    annualBudget: 'Optional annual budget (EGP)', annualBudgetHint: 'Used only to show remaining budget or overspend.', budgetInvalid: 'If entered, the annual budget must be greater than zero.',
    scenarioName: 'Scenario name', percentage: 'Target payroll increase', allocationMethod: 'Allocation method', addScenario: 'Add comparison scenario', remove: 'Remove scenario',
    uniform: 'Uniform', weight: 'Relative weight', performance: 'Performance', combined: 'Weight + performance',
    calculate: 'Calculate impact', scenarioInvalid: 'Enter a percentage greater than 0 and no more than 100 for every scenario.',
    performanceMissing: 'Performance and combined methods require a performance rating for every employee in the Excel file.',
    summary: 'Executive summary', comparison: 'Scenario comparison', employeeResults: 'Employee results',
    selectedScenario: 'Selected scenario', search: 'Search Employee ID', export: 'Export results to Excel',
    employees: 'Employees', currentMonthly: 'Current monthly payroll', currentAnnual: 'Current annual payroll',
    monthlyIncrease: 'Monthly increase cost', annualIncrease: 'Annualized increase cost', newMonthly: 'New monthly payroll',
    newAnnual: 'New annual payroll', averageIncrease: 'Average monthly increase', payrollPercentage: 'Increase % of payroll',
    budgetRemaining: 'Budget remaining', budgetOver: 'Over budget', budgetUse: 'Budget utilization', budgetStatus: 'Budget status', withinBudget: 'Within budget', noBudget: 'No budget entered', method: 'Method',
    minimumIncrease: 'Minimum employee increase', maximumIncrease: 'Maximum employee increase',
    employeeId: 'Employee ID', currentSalary: 'Current gross salary', relativeWeight: 'Weight', performanceRating: 'Rating', allocationScore: 'Allocation score', increasePercent: 'Increase %', increaseAmount: 'Increase amount', newSalary: 'New gross salary',
    noMatches: 'No employees match this search.', previous: 'Previous', next: 'Next', page: 'Page', of: 'of',
    methodology: 'Methodology and disclaimer',
    methodologyBody: 'Each scenario creates a monthly increase pool from current gross payroll and the target percentage. The pool is distributed using the selected method, then reconciled to cents so the total remains unchanged. Annual values use 12 months; taxes, social insurance, employer benefits, net salary and partial-year dates are excluded.',
    issueLabels: {
      missingEmployeeIdColumn: 'The Employee ID column is missing.',
      missingSalaryColumn: 'The Current Gross Salary column is missing.',
      missingEmployeeId: 'Employee ID is empty.',
      missingSalary: 'Current Gross Salary is empty.',
      invalidSalary: 'Current Gross Salary is not numeric.',
      nonPositiveSalary: 'Current Gross Salary must be greater than zero.',
      duplicateEmployeeId: 'Duplicate Employee ID.',
      invalidRelativeWeight: 'Relative Weight must be selected from the template dropdown.',
      invalidPerformanceRating: 'Performance Rating must be selected from 1 to 5.',
      tooManyEmployees: `The file exceeds the ${MAX_EMPLOYEES}-employee limit.`,
      noValidEmployees: 'The file contains no valid employee records.',
    },
  },
  ar: {
    eyebrow: 'أداة تعويضات · مصر',
    title: 'محاكي ميزانية زيادات الرواتب',
    intro: 'ارفع إجمالي الرواتب الشهرية، وقارن حتى ثلاث طرق لتوزيع الزيادة المستهدفة، واعرف أثر كل طريقة على الموظفين والميزانية السنوية.',
    privacyTitle: 'بياناتك تظل على جهازك',
    privacyBody: 'تُعالج بيانات الموظفين محليًا داخل المتصفح، ولا يتم رفعها أو تخزينها أو إرسالها إلى أدوات التحليل.',
    template: 'تحميل نموذج Excel', upload: 'رفع ملف Excel المكتمل', replace: 'استبدال الملف',
    uploadHint: `استخدم أرقام الموظفين فقط. الوزن النسبي وتقييم الأداء حقول اختيارية بقوائم جاهزة. الحد الأقصى ${MAX_EMPLOYEES} موظف.`,
    validFile: 'الملف جاهز', employeesLoaded: 'موظف تم تحميلهم', validating: 'جارٍ فحص الملف...',
    fileError: 'تعذرت قراءة الملف. تأكد من أنه ملف Excel صالح بصيغة .xlsx.',
    formatError: 'الملفات المدعومة بصيغة .xlsx فقط.', validationTitle: 'يرجى تصحيح الملف قبل إجراء الحساب',
    moreErrors: 'مشكلة إضافية غير معروضة.', contactLimit: `هل تحتاج إلى معالجة أكثر من ${MAX_EMPLOYEES} موظف؟`, contactUs: 'تواصل معنا',
    settings: 'إعدادات السيناريوهات', settingsBody: 'يحدد كل سيناريو نسبة مستهدفة لإجمالي الرواتب وطريقة توزيع نفس وعاء الزيادة على الموظفين.',
    annualBudget: 'الميزانية السنوية الاختيارية (جنيه)', annualBudgetHint: 'تُستخدم فقط لإظهار المتبقي أو التجاوز.', budgetInvalid: 'عند إدخال الميزانية، يجب أن تكون أكبر من صفر.',
    scenarioName: 'اسم السيناريو', percentage: 'الزيادة المستهدفة للرواتب', allocationMethod: 'طريقة التوزيع', addScenario: 'إضافة سيناريو للمقارنة', remove: 'حذف السيناريو',
    uniform: 'موحدة', weight: 'الوزن النسبي', performance: 'تقييم الأداء', combined: 'الوزن والأداء',
    calculate: 'حساب التأثير', scenarioInvalid: 'أدخل لكل سيناريو نسبة أكبر من صفر ولا تتجاوز 100.',
    performanceMissing: 'طريقة الأداء أو الوزن والأداء تتطلب إدخال تقييم أداء لكل الموظفين في ملف Excel.',
    summary: 'الملخص التنفيذي', comparison: 'مقارنة السيناريوهات', employeeResults: 'نتائج الموظفين',
    selectedScenario: 'السيناريو المختار', search: 'البحث برقم الموظف', export: 'تصدير النتائج إلى Excel',
    employees: 'عدد الموظفين', currentMonthly: 'الرواتب الشهرية الحالية', currentAnnual: 'الرواتب السنوية الحالية',
    monthlyIncrease: 'تكلفة الزيادة الشهرية', annualIncrease: 'تكلفة الزيادة السنوية', newMonthly: 'الرواتب الشهرية الجديدة',
    newAnnual: 'الرواتب السنوية الجديدة', averageIncrease: 'متوسط الزيادة الشهرية', payrollPercentage: 'نسبة الزيادة من الرواتب',
    budgetRemaining: 'المتبقي من الميزانية', budgetOver: 'تجاوز الميزانية', budgetUse: 'استخدام الميزانية', budgetStatus: 'حالة الميزانية', withinBudget: 'داخل الميزانية', noBudget: 'لم تُدخل ميزانية', method: 'الطريقة',
    minimumIncrease: 'أقل زيادة لموظف', maximumIncrease: 'أعلى زيادة لموظف',
    employeeId: 'رقم الموظف', currentSalary: 'إجمالي الراتب الحالي', relativeWeight: 'الوزن', performanceRating: 'التقييم', allocationScore: 'درجة التوزيع', increasePercent: 'نسبة الزيادة', increaseAmount: 'قيمة الزيادة', newSalary: 'إجمالي الراتب الجديد',
    noMatches: 'لا توجد نتائج مطابقة للبحث.', previous: 'السابق', next: 'التالي', page: 'صفحة', of: 'من',
    methodology: 'المنهجية وإخلاء المسؤولية',
    methodologyBody: 'ينشئ كل سيناريو وعاء زيادة شهريًا من إجمالي الرواتب الحالية والنسبة المستهدفة، ثم يوزعه وفق الطريقة المختارة مع تسوية فروق القروش حتى يظل الإجمالي ثابتًا. القيم السنوية على أساس 12 شهرًا ولا تشمل الضرائب أو التأمينات أو مزايا الشركة أو صافي الراتب أو تاريخ سريان جزئي.',
    issueLabels: {
      missingEmployeeIdColumn: 'عمود Employee ID غير موجود.',
      missingSalaryColumn: 'عمود Current Gross Salary غير موجود.',
      missingEmployeeId: 'رقم الموظف فارغ.',
      missingSalary: 'إجمالي الراتب الحالي فارغ.',
      invalidSalary: 'إجمالي الراتب الحالي ليس رقمًا صحيحًا.',
      nonPositiveSalary: 'يجب أن يكون إجمالي الراتب الحالي أكبر من صفر.',
      duplicateEmployeeId: 'رقم الموظف مكرر.',
      invalidRelativeWeight: 'يجب اختيار الوزن النسبي من القائمة الموجودة في النموذج.',
      invalidPerformanceRating: 'يجب اختيار تقييم الأداء من 1 إلى 5.',
      tooManyEmployees: `يتجاوز الملف الحد الأقصى وهو ${MAX_EMPLOYEES} موظف.`,
      noValidEmployees: 'لا يحتوي الملف على سجلات موظفين صالحة.',
    },
  },
} as const;

function issueText(issue: SalaryDataIssue, labels: Record<SalaryDataIssueCode, string>, ar: boolean) {
  const row = issue.row ? `${ar ? 'الصف' : 'Row'} ${issue.row}: ` : '';
  const employee = issue.employeeId ? ` (${issue.employeeId})` : '';
  return `${row}${labels[issue.code]}${employee}`;
}

export default function SalaryIncreasePage({ ar }: { ar: boolean }) {
  const labels = content[ar ? 'ar' : 'en'];
  const [employees, setEmployees] = React.useState<EmployeeSalaryInput[]>([]);
  const [issues, setIssues] = React.useState<SalaryDataIssue[]>([]);
  const [fileName, setFileName] = React.useState('');
  const [uploadError, setUploadError] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const [annualBudget, setAnnualBudget] = React.useState('');
  const [scenarios, setScenarios] = React.useState<SalaryIncreaseScenarioInput[]>([
    { id: 'scenario-a', name: ar ? 'السيناريو أ' : 'Scenario A', percentage: 10, allocationMethod: 'uniform' },
  ]);
  const [showResults, setShowResults] = React.useState(false);
  const [selectedScenarioId, setSelectedScenarioId] = React.useState('scenario-a');
  const [search, setSearch] = React.useState('');
  const [page, setPage] = React.useState(1);

  React.useEffect(() => {
    setScenarios((current) => current.map((scenario, index) => {
      const defaultNames = [`Scenario ${scenarioLetters[index]}`, `السيناريو ${arabicScenarioLetters[index]}`];
      return defaultNames.includes(scenario.name)
        ? { ...scenario, name: ar ? defaultNames[1] : defaultNames[0] }
        : scenario;
    }));
  }, [ar]);

  const parsedBudget = annualBudget.trim() === '' ? undefined : Number(annualBudget);
  const budgetInputValid = parsedBudget === undefined || (Number.isFinite(parsedBudget) && parsedBudget > 0);
  const scenarioInputsValid = scenarios.every(({ percentage }) => percentage > 0 && percentage <= 100);
  const performanceRatingsComplete = employees.length > 0
    && employees.every(({ performanceRating }) => performanceRating !== undefined);
  const scenarioDataValid = scenarios.every(({ allocationMethod }) =>
    !methodUsesPerformance(allocationMethod) || performanceRatingsComplete);
  const ready = employees.length > 0 && issues.length === 0 && !uploadError && scenarioInputsValid
    && scenarioDataValid && budgetInputValid;
  const results = React.useMemo(
    () => showResults ? calculateScenarios(employees, scenarios, parsedBudget) : [],
    [employees, parsedBudget, scenarios, showResults],
  );
  const selectedResult = results.find(({ scenario }) => scenario.id === selectedScenarioId) ?? results[0];
  const filteredEmployees = (selectedResult?.employees ?? []).filter(({ employeeId }) =>
    employeeId.toLocaleLowerCase().includes(search.trim().toLocaleLowerCase()));
  const pageCount = Math.max(1, Math.ceil(filteredEmployees.length / PAGE_SIZE));
  const visibleEmployees = filteredEmployees.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const showWeightColumn = selectedResult ? methodUsesWeight(selectedResult.scenario.allocationMethod) : false;
  const showPerformanceColumn = selectedResult ? methodUsesPerformance(selectedResult.scenario.allocationMethod) : false;

  const money = React.useMemo(() => new Intl.NumberFormat(ar ? 'ar-EG' : 'en-EG', {
    style: 'currency', currency: 'EGP', minimumFractionDigits: 2, maximumFractionDigits: 2,
  }), [ar]);
  const number = React.useMemo(() => new Intl.NumberFormat(ar ? 'ar-EG' : 'en-EG', {
    minimumFractionDigits: 0, maximumFractionDigits: 2,
  }), [ar]);
  const methodLabels: Record<AllocationMethod, string> = {
    uniform: labels.uniform,
    weight: labels.weight,
    performance: labels.performance,
    combined: labels.combined,
  };

  const invalidateResults = () => setShowResults(false);

  const handleFile = async (file?: File) => {
    if (!file) return;
    setUploadError('');
    setIssues([]);
    setEmployees([]);
    setFileName(file.name);
    setShowResults(false);
    if (!file.name.toLocaleLowerCase().endsWith('.xlsx')) {
      setUploadError(labels.formatError);
      return;
    }
    setLoading(true);
    try {
      const { parseSalaryWorkbook } = await import('../features/salaryIncrease/excel');
      const parsed = await parseSalaryWorkbook(file);
      setEmployees(parsed.employees);
      setIssues(parsed.issues);
    } catch {
      setUploadError(labels.fileError);
    } finally {
      setLoading(false);
    }
  };

  const updateScenario = (id: string, changes: Partial<SalaryIncreaseScenarioInput>) => {
    setScenarios((current) => current.map((scenario) => scenario.id === id ? { ...scenario, ...changes } : scenario));
    invalidateResults();
  };

  const addScenario = () => {
    if (scenarios.length >= 3) return;
    const index = scenarios.length;
    const id = `scenario-${crypto.randomUUID()}`;
    setScenarios((current) => [...current, {
      id,
      name: ar ? `السيناريو ${arabicScenarioLetters[index]}` : `Scenario ${scenarioLetters[index]}`,
      percentage: Math.min(100, current[current.length - 1].percentage + 2.5),
      allocationMethod: (['uniform', 'weight', 'performance'] as const)[index],
    }]);
    invalidateResults();
  };

  const removeScenario = (id: string) => {
    if (scenarios.length === 1) return;
    const next = scenarios.filter((scenario) => scenario.id !== id).map((scenario, index) => {
      const defaultNames = scenarioLetters.flatMap((letter, letterIndex) => [
        `Scenario ${letter}`,
        `السيناريو ${arabicScenarioLetters[letterIndex]}`,
      ]);
      return defaultNames.includes(scenario.name)
        ? { ...scenario, name: ar ? `السيناريو ${arabicScenarioLetters[index]}` : `Scenario ${scenarioLetters[index]}` }
        : scenario;
    });
    setScenarios(next);
    if (selectedScenarioId === id) setSelectedScenarioId(next[0].id);
    invalidateResults();
  };

  const calculate = () => {
    if (!ready) return;
    setSelectedScenarioId(scenarios[0].id);
    setSearch('');
    setPage(1);
    setShowResults(true);
  };

  const summaryCards = selectedResult ? [
    [labels.employees, number.format(selectedResult.summary.employeeCount)],
    [labels.currentMonthly, money.format(selectedResult.summary.currentMonthlyPayroll)],
    [labels.monthlyIncrease, money.format(selectedResult.summary.monthlyIncreaseCost)],
    [labels.annualIncrease, money.format(selectedResult.summary.annualIncreaseCost)],
    [labels.newMonthly, money.format(selectedResult.summary.newMonthlyPayroll)],
    [labels.newAnnual, money.format(selectedResult.summary.newAnnualPayroll)],
    [labels.averageIncrease, money.format(selectedResult.summary.averageIncreaseAmount)],
    [labels.payrollPercentage, `${number.format(selectedResult.summary.increaseAsPercentageOfPayroll)}%`],
    [labels.minimumIncrease, `${number.format(selectedResult.summary.minimumIncreasePercentage)}%`],
    [labels.maximumIncrease, `${number.format(selectedResult.summary.maximumIncreasePercentage)}%`],
  ] : [];

  return (
    <>
      <section className="pageHero salaryIncreaseHero">
        <small>{labels.eyebrow}</small><h1>{labels.title}</h1><p>{labels.intro}</p>
      </section>
      <section className="salaryIncreaseSection section">
        <div className="privacyNotice" role="note"><strong>{labels.privacyTitle}</strong><span>{labels.privacyBody}</span></div>

        <div className="salaryWorkflow">
          <section className="salaryUpload" aria-labelledby="salary-upload-title">
            <div className="salarySectionHeading"><span>1</span><div><h2 id="salary-upload-title">Excel</h2><p>{labels.uploadHint}</p></div></div>
            <div className="uploadActions">
              <button className="secondaryButton" onClick={() => void import('../features/salaryIncrease/excel').then(({ downloadSalaryTemplate }) => downloadSalaryTemplate(ar))} type="button">{labels.template}</button>
              <label className="primaryButton fileButton">
                {fileName ? labels.replace : labels.upload}
                <input accept=".xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" onChange={(event) => {
                  void handleFile(event.target.files?.[0]);
                  event.target.value = '';
                }} type="file" />
              </label>
            </div>
            {loading && <p className="fileStatus">{labels.validating}</p>}
            {!loading && fileName && !uploadError && issues.length === 0 && <p className="fileStatus success"><strong>{labels.validFile}:</strong> {fileName} · {employees.length} {labels.employeesLoaded}</p>}
            {uploadError && <div className="validationPanel" role="alert"><strong>{uploadError}</strong></div>}
            {issues.length > 0 && (
              <div className="validationPanel" role="alert">
                <strong>{labels.validationTitle}</strong>
                <ul>{issues.slice(0, 20).map((issue, index) => <li key={`${issue.code}-${issue.row ?? index}`}>{issueText(issue, labels.issueLabels, ar)}</li>)}</ul>
                {issues.length > 20 && <p>{issues.length - 20} {labels.moreErrors}</p>}
                {issues.some(({ code }) => code === 'tooManyEmployees') && <p><span>{labels.contactLimit}</span> <Link to={{ pathname: pagePaths.salaryIncrease, search: contactSearch }}>{labels.contactUs}</Link></p>}
              </div>
            )}
          </section>

          <section className="scenarioSettings" aria-labelledby="scenario-settings-title">
            <div className="salarySectionHeading"><span>2</span><div><h2 id="scenario-settings-title">{labels.settings}</h2><p>{labels.settingsBody}</p></div></div>
            <label className="salaryField budgetField"><span>{labels.annualBudget}</span><input dir="ltr" min="0" onChange={(event) => { setAnnualBudget(event.target.value); invalidateResults(); }} placeholder="0.00" step="0.01" type="number" value={annualBudget} /><small>{labels.annualBudgetHint}</small></label>
            {!budgetInputValid && <p className="inlineError">{labels.budgetInvalid}</p>}
            <div className="scenarioGrid">
              {scenarios.map((scenario, index) => (
                <article className="scenarioCard" key={scenario.id}>
                  <div className="scenarioCardHeader"><strong>{String.fromCharCode(65 + index)}</strong>{scenarios.length > 1 && <button aria-label={labels.remove} onClick={() => removeScenario(scenario.id)} title={labels.remove} type="button">×</button>}</div>
                  <label className="salaryField"><span>{labels.scenarioName}</span><input maxLength={30} onChange={(event) => updateScenario(scenario.id, { name: event.target.value })} type="text" value={scenario.name} /></label>
                  <label className="salaryField"><span>{labels.allocationMethod}</span><select onChange={(event) => updateScenario(scenario.id, { allocationMethod: event.target.value as AllocationMethod })} value={scenario.allocationMethod}>{(Object.keys(methodLabels) as AllocationMethod[]).map((method) => <option key={method} value={method}>{methodLabels[method]}</option>)}</select></label>
                  <label className="salaryField"><span>{labels.percentage}</span><div className="percentageInput"><input dir="ltr" max="100" min="0.01" onChange={(event) => updateScenario(scenario.id, { percentage: Number(event.target.value) })} step="0.01" type="number" value={scenario.percentage} /><b>%</b></div></label>
                </article>
              ))}
            </div>
            {scenarios.length < 3 && <button className="addScenarioButton" onClick={addScenario} type="button">+ {labels.addScenario}</button>}
            {!scenarioInputsValid && <p className="inlineError">{labels.scenarioInvalid}</p>}
            {!scenarioDataValid && employees.length > 0 && <p className="inlineError">{labels.performanceMissing}</p>}
            <button className="calculateImpactButton" disabled={!ready} onClick={calculate} type="button">{labels.calculate}</button>
          </section>
        </div>

        {selectedResult && (
          <div className="salaryResultsArea" aria-live="polite">
            <section className="salaryResultsSection">
              <div className="resultSectionHeader"><h2>{labels.summary}</h2><select aria-label={labels.selectedScenario} onChange={(event) => { setSelectedScenarioId(event.target.value); setPage(1); }} value={selectedResult.scenario.id}>{results.map(({ scenario }) => <option key={scenario.id} value={scenario.id}>{scenario.name} · {methodLabels[scenario.allocationMethod]} · {number.format(scenario.percentage)}%</option>)}</select></div>
              <div className="salaryKpiGrid">{summaryCards.map(([label, value]) => <article key={label}><span>{label}</span><strong>{value}</strong></article>)}</div>
              {selectedResult.summary.annualBudget !== undefined && (
                <div className={`budgetStatus ${selectedResult.summary.budgetRemaining! < 0 ? 'over' : 'within'}`}>
                  <div><span>{selectedResult.summary.budgetRemaining! < 0 ? labels.budgetOver : labels.budgetRemaining}</span><strong>{money.format(Math.abs(selectedResult.summary.budgetRemaining!))}</strong></div>
                  <div><span>{labels.budgetUse}</span><strong>{number.format(selectedResult.summary.budgetUtilization!)}%</strong></div>
                </div>
              )}
            </section>

            {results.length > 1 && (
              <section className="salaryResultsSection"><h2>{labels.comparison}</h2><div className="salaryTableWrap"><table className="comparisonTable"><thead><tr><th>{labels.comparison}</th>{results.map(({ scenario }) => <th key={scenario.id}>{scenario.name}<small>{number.format(scenario.percentage)}%</small></th>)}</tr></thead><tbody>
                <tr><th>{labels.method}</th>{results.map((result) => <td key={result.scenario.id}>{methodLabels[result.scenario.allocationMethod]}</td>)}</tr>
                {[
                  [labels.monthlyIncrease, 'monthlyIncreaseCost'], [labels.annualIncrease, 'annualIncreaseCost'], [labels.newMonthly, 'newMonthlyPayroll'], [labels.newAnnual, 'newAnnualPayroll'],
                ].map(([label, key]) => <tr key={label}><th>{label}</th>{results.map((result) => <td key={result.scenario.id}>{money.format(result.summary[key as 'monthlyIncreaseCost'])}</td>)}</tr>)}
                <tr><th>{labels.minimumIncrease}</th>{results.map((result) => <td key={result.scenario.id}>{number.format(result.summary.minimumIncreasePercentage)}%</td>)}</tr>
                <tr><th>{labels.maximumIncrease}</th>{results.map((result) => <td key={result.scenario.id}>{number.format(result.summary.maximumIncreasePercentage)}%</td>)}</tr>
                <tr><th>{labels.budgetStatus}</th>{results.map((result) => <td key={result.scenario.id}>{result.summary.annualBudget === undefined ? labels.noBudget : result.summary.budgetRemaining! < 0 ? `${labels.budgetOver}: ${money.format(Math.abs(result.summary.budgetRemaining!))}` : labels.withinBudget}</td>)}</tr>
              </tbody></table></div></section>
            )}

            <section className="salaryResultsSection">
              <div className="resultSectionHeader"><h2>{labels.employeeResults}</h2><button className="primaryButton" onClick={() => void import('../features/salaryIncrease/excel').then(({ exportSalaryResults }) => exportSalaryResults(employees, results, parsedBudget))} type="button">{labels.export}</button></div>
              <div className="employeeTableTools"><label><span>{labels.search}</span><input onChange={(event) => { setSearch(event.target.value); setPage(1); }} type="search" value={search} /></label><select aria-label={labels.selectedScenario} onChange={(event) => { setSelectedScenarioId(event.target.value); setPage(1); }} value={selectedResult.scenario.id}>{results.map(({ scenario }) => <option key={scenario.id} value={scenario.id}>{scenario.name}</option>)}</select></div>
              <div className="salaryTableWrap"><table><thead><tr><th>{labels.employeeId}</th><th>{labels.currentSalary}</th>{showWeightColumn && <th>{labels.relativeWeight}</th>}{showPerformanceColumn && <th>{labels.performanceRating}</th>}{(showWeightColumn || showPerformanceColumn) && <th>{labels.allocationScore}</th>}<th>{labels.increasePercent}</th><th>{labels.increaseAmount}</th><th>{labels.newSalary}</th></tr></thead><tbody>{visibleEmployees.map((employee) => <tr key={employee.employeeId}><td>{employee.employeeId}</td><td>{money.format(employee.currentGrossSalary)}</td>{showWeightColumn && <td>{number.format(employee.appliedWeight)}</td>}{showPerformanceColumn && <td>{employee.performanceRating ?? '—'}</td>}{(showWeightColumn || showPerformanceColumn) && <td>{number.format(employee.allocationScore)}</td>}<td>{number.format(employee.increasePercentage)}%</td><td>{money.format(employee.increaseAmount)}</td><td>{money.format(employee.newGrossSalary)}</td></tr>)}</tbody></table></div>
              {visibleEmployees.length === 0 ? <p className="emptyTable">{labels.noMatches}</p> : <div className="tablePagination"><button disabled={page <= 1} onClick={() => setPage((current) => Math.max(1, current - 1))} type="button">{labels.previous}</button><span>{labels.page} {page} {labels.of} {pageCount}</span><button disabled={page >= pageCount} onClick={() => setPage((current) => Math.min(pageCount, current + 1))} type="button">{labels.next}</button></div>}
            </section>
          </div>
        )}
      </section>
      <section className="salaryMethodology"><div><h2>{labels.methodology}</h2><p>{labels.methodologyBody}</p></div></section>
    </>
  );
}
