import { test as base } from '@playwright/test';

type Fixtures = {
  // 자동으로 시스템 시간이 설정된 page를 제공
};

export const test = base.extend<Fixtures>({
  page: async ({ page }, use) => {
    await page.clock.setSystemTime(new Date('2025-11-02T00:00:00Z'));
    await page.goto('');

    await use(page);
  },
});

export { expect } from '@playwright/test';
