export type Lang = 'en' | 'ar';
export type Page = 'home' | 'about' | 'tools' | 'grossNet' | 'salaryIncrease';

export const pagePaths: Record<Page, string> = {
  home: '/',
  about: '/about',
  tools: '/tools',
  grossNet: '/tools/gross-net',
  salaryIncrease: '/tools/salary-increase',
};

export const contactSearch = '?section=contact';

export function pageFromPath(pathname: string): Page {
  const match = (Object.entries(pagePaths) as [Page, string][]).find(([, path]) => path === pathname);
  return match?.[0] ?? 'home';
}
