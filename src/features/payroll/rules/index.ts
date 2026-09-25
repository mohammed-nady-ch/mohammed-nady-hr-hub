import { egyptPayrollRules2026 } from './egypt/2026';

export const payrollRulesRegistry = {
  [egyptPayrollRules2026.id]: egyptPayrollRules2026,
} as const;

export type PayrollRulesId = keyof typeof payrollRulesRegistry;

export function getPayrollRules(id: PayrollRulesId) {
  return payrollRulesRegistry[id];
}
