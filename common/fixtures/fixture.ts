import { test as base } from '@playwright/test';
import { createListOfPage } from './initiate';
import type { Ui } from '@common/types/ui.types';

interface UiFixtures {
  ui: Ui;
}

export const test = base.extend<UiFixtures>({
  ui: async ({ page }, use) => {
    await use({
      agoda: createListOfPage(page),
    });
  },
});

export { expect } from '@playwright/test';