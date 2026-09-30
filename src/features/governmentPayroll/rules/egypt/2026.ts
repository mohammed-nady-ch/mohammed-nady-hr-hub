export interface GovernmentTaxBand {
  upTo: number;
  rate: number;
}

export interface GovernmentTaxSchedule {
  annualIncomeUpTo: number;
  bands: readonly GovernmentTaxBand[];
}

export interface GovernmentPayrollRules {
  id: string;
  year: number;
  effectiveFrom: string;
  socialInsurance: {
    minimumMonthlyWage: number;
    maximumMonthlyWage: number;
    employeeRateWithoutUhi: number;
    employeeRateWithUhi: number;
  };
  universalHealthInsurance: {
    employeeRate: number;
    nonWorkingSpouseRate: number;
    dependentRate: number;
  };
  incomeTax: {
    annualPersonalExemption: number;
    taxableIncomeRoundingIncrement: number;
    schedules: readonly GovernmentTaxSchedule[];
  };
  proportionalStampDuty: {
    exemptAmount: number;
    roundingIncrement: number;
    bands: readonly GovernmentTaxBand[];
    excessOverFinalBandRate: number;
  };
  martyrsFund: {
    employeeRate: number;
  };
  sources: readonly { title: string; url: string; note?: string }[];
}

const infinityBand = (rate: number) => ({ upTo: Number.POSITIVE_INFINITY, rate });

export const egyptGovernmentPayrollRules2026: GovernmentPayrollRules = {
  id: 'eg-government-civil-service-2026-v1',
  year: 2026,
  effectiveFrom: '2026-01-01',
  socialInsurance: {
    minimumMonthlyWage: 2_700,
    maximumMonthlyWage: 16_700,
    // 9% old-age/disability/death + 1% reward system. The separate 1%
    // sickness contribution remains in the non-UHI status only.
    employeeRateWithoutUhi: 0.11,
    employeeRateWithUhi: 0.10,
  },
  universalHealthInsurance: {
    employeeRate: 0.01,
    nonWorkingSpouseRate: 0.03,
    dependentRate: 0.01,
  },
  incomeTax: {
    annualPersonalExemption: 20_000,
    taxableIncomeRoundingIncrement: 10,
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
  proportionalStampDuty: {
    exemptAmount: 50,
    roundingIncrement: 0.05,
    bands: [
      { upTo: 250, rate: 0.006 },
      { upTo: 500, rate: 0.0065 },
      { upTo: 1_000, rate: 0.007 },
      { upTo: 5_000, rate: 0.0075 },
      { upTo: 10_000, rate: 0.008 },
    ],
    excessOverFinalBandRate: 0.003,
  },
  martyrsFund: { employeeRate: 0.0005 },
  sources: [
    {
      title: 'Egyptian Tax Authority — 2026 government and public-sector monthly payroll model',
      url: 'https://eta.gov.eg/sites/default/files/2026-03/nmwdhj_alqta_alam_walqta_alhkwmy_2026.xlsx',
    },
    {
      title: 'Egyptian Tax Authority — Unified Payroll Calculation FAQ, March 2026',
      url: 'https://www.eta.gov.eg/sites/default/files/2026-05/faqs-payroll-system-v4.pdf',
    },
    {
      title: 'National Organization for Social Insurance — 2026 contribution wage limits',
      url: 'https://www.nosi.gov.eg/ar/News/Pages/2025-11-30.aspx',
    },
    {
      title: 'Universal Health Insurance Authority — contribution rates',
      url: 'https://uhia.gov.eg/تفاصيل-حساب-الإشتراكات/',
    },
    {
      title: 'Stamp Duty Law no. 111 of 1980 — article 79',
      url: 'https://manshurat.org/node/11789',
      note: 'The calculator models regular salary disbursements, not other government payments under article 80.',
    },
  ],
};
