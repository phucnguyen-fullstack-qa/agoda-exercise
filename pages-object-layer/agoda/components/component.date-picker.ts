import type { Locator, Page } from '@playwright/test';
import { BasePage } from '@common/base/base-page';

export interface DatePickerElements {
    calendar: () => Locator;
    months: () => Locator;
    month: (date: Date) => Locator;
    day: (date: Date) => Locator;
    previousMonthButton: () => Locator;
    nextMonthButton: () => Locator;
}

export class DatePicker extends BasePage {
    constructor(page: Page) {
        super(page);
    }

    get elements(): DatePickerElements {
        return {
            calendar: () => this.page.getByRole('dialog'),
            months: () => this.elements.calendar().locator('.DayPicker-Month'),
            month: (date: Date) => this.elements.months().filter({ hasText: this.formatMonth(date) }),
            day: (date: Date) => this.elements.calendar().locator(`//*[@data-selenium-date="${this.formatDate(date)}"]`),
            previousMonthButton: () => this.page.getByRole('button', { name: 'Previous Month', exact: true }),
            nextMonthButton: () => this.page.getByRole('button', { name: 'Next Month', exact: true }),
        };
    }

    async selectDate(date: Date) {
        this.validateDate(date);

        await this.retry(
            async () => {
                await this.elements.calendar().waitFor({ state: 'visible' });
                const visibleMonths = this.elements.months();
                const matchingMonth = this.elements.month(date);

                if (await matchingMonth.count() > 0 && await matchingMonth.first().isVisible()) {
                    await this.elements.day(date).click();
                    return true;
                }

                const firstVisibleMonth = await this.getDisplayedMonth(visibleMonths.first());
                const lastVisibleMonth = await this.getDisplayedMonth(visibleMonths.last());
                const targetMonth = this.getMonthIndex(date);

                if (targetMonth < firstVisibleMonth) {
                    await this.elements.previousMonthButton().click();
                } else if (targetMonth > lastVisibleMonth) {
                    await this.elements.nextMonthButton().click();
                } else {
                    throw new Error(`Could not find date ${date.toDateString()} in the displayed calendar`);
                }

                return false;
            },
            (dateSelected) => dateSelected,
            30,
        );
    }

    private formatMonth(date: Date) {
        return date.toLocaleDateString('en-US', {
            month: 'long',
            year: 'numeric',
        });
    }

    private formatDate(date: Date) {
        return `${date.getFullYear()}-${`${date.getMonth() + 1}`.padStart(2, '0')}-${`${date.getDate()}`.padStart(2, '0')}`;
    }

    private getMonthIndex(date: Date) {
        return date.getFullYear() * 12 + date.getMonth();
    }

    private async getDisplayedMonth(month: Locator) {
        const caption = await month.locator('.DayPicker-Caption').innerText();
        const parsedCaption = new Date(`${caption} 1`);

        if (Number.isNaN(parsedCaption.getTime())) {
            throw new Error(`Could not read displayed calendar month: ${caption}`);
        }

        return this.getMonthIndex(parsedCaption);
    }

    private validateDate(date: Date) {
        if (Number.isNaN(date.getTime())) {
            throw new Error('date must be a valid Date');
        }
    }


    async selectCheckInDate(date: Date) {
        this.validateDate(date);
        await this.selectDate(date);
    }

    async selectCheckOutDate(date: Date) {
        this.validateDate(date);
        await this.selectDate(date);
    }
}
