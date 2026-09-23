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

    async validateBookingData(data: {
        searchKey: string;
        searchDestination: string;
        checkInDateOffset: number;
        checkOutDateOffset: number;
        booking: {
            rooms: number;
            adults: number;
            children: number;
            childAges: number[];
        };
    }): Promise<void> {
        const { booking } = data;

        if (!data.searchKey.trim() || !data.searchDestination.trim()) {
            throw new Error('searchKey and searchDestination must not be empty.');
        }

        if (!Number.isInteger(data.checkInDateOffset) || data.checkInDateOffset < 0) {
            throw new Error('checkInDateOffset must be a non-negative integer.');
        }

        if (
            !Number.isInteger(data.checkOutDateOffset) ||
            data.checkOutDateOffset <= data.checkInDateOffset
        ) {
            throw new Error('checkOutDateOffset must be greater than checkInDateOffset.');
        }

        if (booking.rooms < 1 || booking.adults < 1 || booking.children < 0) {
            throw new Error('rooms/adults must be at least 1; children must not be negative.');
        }

        if (booking.childAges.length !== booking.children) {
            throw new Error('childAges length must equal children.');
        }

        if (booking.childAges.some((age) => !Number.isInteger(age) || age < 0 || age > 17)) {
            throw new Error('Each child age must be an integer from 0 to 17.');
        }

    }
    async waitForLoadingSpinner(timeout = 30_000): Promise<void> {
        await this.elements.loadingSpinner().waitFor({ state: 'hidden', timeout });
    }
}
