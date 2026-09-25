import type { PayrollRules } from '../../engine';

const infinityBand = (rate: number) => ({ upTo: Number.POSITIVE_INFINITY, rate });

export const egyptPayrollRules2026: PayrollRules = {
  id: 'eg-private-sector-2026-v1',
  countryCode: 'EG',
  year: 2026,
  effectiveFrom: '2026-01-01',
  calculationMode: 'monthly-annualized-estimate',
  socialInsurance: {
    minimumMonthlyWage: 2_700,
    maximumMonthlyWage: 16_700,
    employeeRate: 0.11,
    // Kept in the rules file because the applicable employer composition can
    // depend on the establishment's insurance and health coverage position.
    employerRate: 0.1875,
    // Product modelling constraint requested for non-insurable earnings. It
    // must not be presented as an automatic statutory exemption.
    nonInsurableEarningsCapRatio: 0.30,
  },
  incomeTax: {
    annualPersonalExemption: 20_000,
    taxableIncomeRounding: { increment: 10, mode: 'floor' },
    schedules: [
      {
        annualIncomeUpTo: 600_000,
        bands: [
          { upTo: 40_000, rate: 0 },
          { upTo: 55_000, rate: 0.10 },
          { upTo: 70_000, rate: 0.15 },
          { upTo: 200_000, rate: 0.20 },
          { upTo: 400_000, rate: 0.225 },
          infinityBand(0.25),
        ],
      },
      {
        annualIncomeUpTo: 700_000,
        bands: [
          { upTo: 55_000, rate: 0.10 },
          { upTo: 70_000, rate: 0.15 },
          { upTo: 200_000, rate: 0.20 },
          { upTo: 400_000, rate: 0.225 },
          infinityBand(0.25),
        ],
      },
      {
        annualIncomeUpTo: 800_000,
        bands: [
          { upTo: 70_000, rate: 0.15 },
          { upTo: 200_000, rate: 0.20 },
          { upTo: 400_000, rate: 0.225 },
          infinityBand(0.25),
        ],
      },
      {
        annualIncomeUpTo: 900_000,
        bands: [
          { upTo: 200_000, rate: 0.20 },
          { upTo: 400_000, rate: 0.225 },
          infinityBand(0.25),
        ],
      },
      {
        annualIncomeUpTo: 1_200_000,
        bands: [
          { upTo: 400_000, rate: 0.225 },
          infinityBand(0.25),
        ],
      },
      {
        annualIncomeUpTo: Number.POSITIVE_INFINITY,
        bands: [
          { upTo: 1_200_000, rate: 0.25 },
          infinityBand(0.275),
        ],
      },
    ],
  },
  martyrsFund: {
    defaultEnabled: true,
    employeeRate: 0.0005,
  },
  displayCurrencyDigits: 0,
  sources: [
    {
      title: 'National Organization for Social Insurance — 2026 contribution wage limits',
      url: 'https://www.nosi.gov.eg/ar/News/Pages/2025-11-30.aspx',
    },
    {
      title: 'Income Tax Law amendment no. 7 of 2024 — articles 8 and 13',
      url: 'https://www.eta.gov.eg/sites/default/files/2024-03/law_no.7-2024.pdf',
    },
    {
      title: 'Egyptian Tax Authority — Unified Payroll Calculation FAQ, March 2026',
      url: 'https://eta.gov.eg/sites/default/files/2026-05/faqs-payroll-system-v4.pdf',
    },
    {
      title: 'Social Insurance and Pensions Law no. 148 of 2019',
      url: 'https://www.nosi.gov.eg/ar/Lists/NOSILibrary/2-12-2019%20%D9%83%D8%AA%D8%A7%D8%A8%20%D8%A7%D9%84%D9%82%D8%A7%D9%86%D9%88%D9%86%20%D8%A7%D9%84%D8%AC%D8%AF%D9%8A%D8%AF.pdf',
      note: 'Employer rate remains configurable because its composition can vary by coverage status.',
    },
  ],
};
