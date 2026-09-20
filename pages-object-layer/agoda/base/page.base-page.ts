import type { Page } from '@playwright/test';
import { BasePage } from '@common/base/base-page';

export class AgodaBasePage extends BasePage {
    constructor(page: Page) {
        super(page);
    }

    get elements() {
        return {
            discountNotification: () => this.page.getByRole('heading', { name: 'Save 10% on your 1st app' }),
            closeDiscountNotificationButton: () => this.page.getByRole('button', { name: 'Close' }),
            dismissCookieBannerButton: () => this.page.getByRole('button', { name: 'Dismiss' }),
            loadingSpinner: () => this.page.locator('#ModalLoadingSpinner'),
        };
    }

    async closeDiscountNotificationIfExisting() {
        if (
            await this.elements
                .dismissCookieBannerButton()
                .isVisible()
                .catch(() => false)
        ) {
            await this.elements.dismissCookieBannerButton().click();
        }

        if (
            await this.elements
                .discountNotification()
                .isVisible()
                .catch(() => false)
        ) {
            await this.elements.closeDiscountNotificationButton().click();
        }
    }

    async waitForLoadingSpinner(timeout = 30_000): Promise<void> {
        await this.elements.loadingSpinner().waitFor({ state: 'hidden', timeout });
    }
}
