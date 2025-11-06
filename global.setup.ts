import { test } from '@playwright/test';
import fs from 'fs';
import path from 'path';

const __dirname = path.resolve();

test('reset json db', async () => {
  const dbPath = `${__dirname}/src/__mocks__/response/e2e.json`;
  fs.writeFileSync(dbPath, JSON.stringify({ events: [] }, null, 2));
});
