import { test as base } from '@playwright/test';

import { cleanupAllEvents } from './utils';

type Fixtures = Record<string, never>;

/* eslint-disable react-hooks/rules-of-hooks */
export const test = base.extend<Fixtures>({
  page: async ({ page, request }, use) => {
    await cleanupAllEvents(request);

    await page.clock.setSystemTime(new Date('2025-11-02T00:00:00Z'));
    await page.goto('');

    await use(page);
  },
});
/* eslint-enable react-hooks/rules-of-hooks */

export { expect } from '@playwright/test';
