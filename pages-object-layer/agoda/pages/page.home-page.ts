import type { Page } from '@playwright/test';
import { AgodaBasePage } from '../base/page.base-page';
import { DatePicker } from '../components/component.date-picker';

export class AgodaHomePage extends AgodaBasePage {
    datePicker: DatePicker;

    constructor(page: Page) {
        super(page);
        this.datePicker = new DatePicker(page);
    }

    get elements() {
        return {
            ...super.elements,
            // Add home page specific elements here
            searchBoxContainer: () => this.page.locator('#SearchBoxContainer'),
            searchTextBox: () => this.elements.searchBoxContainer().locator('#autocomplete-box input'),
            searchOption: (optionText: string) => this.page.locator('#search-box-autocomplete-id').getByRole('option', { name: optionText }),
            checkInDateButton: () => this.elements.searchBoxContainer().locator('#check-in-box'),
            checkOutDateButton: () => this.elements.searchBoxContainer().locator('#check-out-box'),
            occupancyBox: () => this.elements.searchBoxContainer().locator('#occupancy-box'),
            occupancyFocusTrap: () => this.elements.searchBoxContainer().locator('#FocusTrap'),

            // Room
            occupancyRooms: () => this.elements.occupancyFocusTrap().locator('//*[@data-selenium="occupancyRooms"]'),
            decreaseOccupancyButton: () => this.elements.occupancyRooms().locator('//*[@data-selenium="minus"]'),
            numberOfBookingRoomValue: () => this.elements.occupancyRooms().locator('//*[@data-component="desktop-occ-room-value"]'),
            increaseOccupancyButton: () => this.elements.occupancyRooms().locator('//*[@data-selenium="plus"]'),

            // Adults
            occupancyAdults: () => this.elements.occupancyFocusTrap().locator('//*[@data-selenium="occupancyAdults"]'),
            decreaseAdultsButton: () => this.elements.occupancyAdults().locator('//*[@data-selenium="minus"]'),
            numberOfAdultsValue: () => this.elements.occupancyAdults().locator('//*[@data-component="desktop-occ-adult-value"]'),
            increaseAdultsButton: () => this.elements.occupancyAdults().locator('//*[@data-selenium="plus"]'),

            // Children
            occupancyChildren: () => this.elements.occupancyFocusTrap().locator('//*[@data-selenium="occupancyChildren"]'),
            decreaseChildrenButton: () => this.elements.occupancyChildren().locator('//*[@data-selenium="minus"]'),
            numberOfChildrenValue: () => this.elements.occupancyChildren().locator('//*[@data-component="desktop-occ-children-value"]'),
            increaseChildrenButton: () => this.elements.occupancyChildren().locator('//*[@data-selenium="plus"]'),
            childrenAgeDropdown: (childIndex: number) =>
                this.elements
                    .occupancyFocusTrap()
                    .locator('[data-element-name="occ-child-age-dropdown"]')
                    .nth(childIndex - 1),
            childAgeOption: (age: number) => this.page.getByRole('listbox').getByText(age === 0 ? '<1 year old' : `${age} years old`, { exact: true }),
            childAgeOptionByRole: (age: number) =>
                this.page.getByRole('option', {
                    name: age === 0 ? '<1 year old' : `${age} years old`,
                    exact: true,
                }),
            selectedAgeDropdownValue: (childIndex: number) =>
                this.elements
                    .occupancyFocusTrap()
                    .locator('[data-element-name="occ-child-age-dropdown"]')
                    .nth(childIndex - 1),
            searchButton: () => this.elements.searchBoxContainer().getByRole('button', { name: 'SEARCH', exact: true }),
        };
    }

    async searchForDestination(keySearch: string, optionText: string) {
        await this.elements.searchTextBox().fill(keySearch);
        await this.elements.searchOption(optionText).click();
    }

    async clickSearchButton() {
        await this.elements.searchButton().click();
    }

    async clickOccupancyBox() {
        await this.elements.occupancyBox().click();
    }

    async openCheckInDatePicker() {
        await this.elements.checkInDateButton().click();
    }

    async openCheckOutDatePicker() {
        await this.elements.checkOutDateButton().click();
    }

    async increaseBookingRoom() {
        await this.elements.increaseOccupancyButton().click();
    }

    async decreaseBookingRoom() {
        await this.elements.decreaseOccupancyButton().click();
    }

    async increaseAdults() {
        await this.elements.increaseAdultsButton().click();
    }

    async decreaseAdults() {
        await this.elements.decreaseAdultsButton().click();
    }

    async increaseChildren() {
        await this.elements.increaseChildrenButton().click();
    }

    async decreaseChildren() {
        await this.elements.decreaseChildrenButton().click();
    }

    private childrenAgeDropdownByRole(childIndex: number) {
        return this.elements.occupancyFocusTrap().getByRole('combobox', {
            name: new RegExp(`^Age of Child ${childIndex}( \\(Required\\))?$`),
        });
    }

    private async getChildAgeDropdown(childIndex: number) {
        const attributeDropdowns = this.elements.occupancyFocusTrap().locator('[data-element-name="occ-child-age-dropdown"]');

        if ((await attributeDropdowns.count()) >= childIndex) {
            return attributeDropdowns.nth(childIndex - 1);
        }

        return this.childrenAgeDropdownByRole(childIndex);
    }

    async selectChildAge(childIndex: number, age: number) {
        if (!Number.isInteger(childIndex) || childIndex < 1) {
            throw new Error('childIndex must be a positive integer');
        }

        if (!Number.isInteger(age) || age < 0 || age > 17) {
            throw new Error('age must be an integer between 0 and 17');
        }

        const dropdown = await this.getChildAgeDropdown(childIndex);
        await dropdown.waitFor({ state: 'visible' });
        await dropdown.focus();
        await dropdown.press('Space');

        const roleOption = this.elements.childAgeOptionByRole(age);
        if ((await roleOption.count()) > 0) {
            await roleOption.click();
            return;
        }

        await this.elements.childAgeOption(age).click();
    }

    async selectChildrenAges(ages: number[]) {
        for (const [index, age] of ages.entries()) {
            await this.selectChildAge(index + 1, age);
        }
    }

    async getNumberOfBookingRooms() {
        return Number(await this.elements.numberOfBookingRoomValue().innerText());
    }

    async getNumberOfAdults() {
        return Number(await this.elements.numberOfAdultsValue().innerText());
    }

    async getNumberOfChildren() {
        return Number(await this.elements.numberOfChildrenValue().innerText());
    }

    async setBookingRoomsTo(targetNumber: number) {
        this.validateTargetNumber(targetNumber);

        while ((await this.getNumberOfBookingRooms()) < targetNumber) {
            await this.increaseBookingRoom();
        }

        while ((await this.getNumberOfBookingRooms()) > targetNumber) {
            await this.decreaseBookingRoom();
        }
    }

    async setAdultsTo(targetNumber: number) {
        this.validateTargetNumber(targetNumber);

        while ((await this.getNumberOfAdults()) < targetNumber) {
            await this.increaseAdults();
        }

        while ((await this.getNumberOfAdults()) > targetNumber) {
            await this.decreaseAdults();
        }
    }

    async setChildrenTo(targetNumber: number) {
        await this.validateTargetNumber(targetNumber);
        let currentNumberOfChildren = await this.getNumberOfChildren();
        while (currentNumberOfChildren < targetNumber) {
            await this.increaseChildren();
            currentNumberOfChildren = await this.getNumberOfChildren();
            await this.elements.childrenAgeDropdown(currentNumberOfChildren).waitFor({ state: 'visible' });
        }

        while (currentNumberOfChildren > targetNumber) {
            await this.decreaseChildren();
            currentNumberOfChildren = await this.getNumberOfChildren();
            await this.elements.childrenAgeDropdown(currentNumberOfChildren).waitFor({ state: 'hidden' });
        }

        const ageDropdowns = this.elements.occupancyFocusTrap().locator('[data-element-name="occ-child-age-dropdown"]');
        await this.retry(
            async () => await ageDropdowns.count(),
            (dropdownCount) => dropdownCount >= targetNumber,
            10,
            150,
        );

        for (let childIndex = 1; childIndex <= targetNumber; childIndex++) {
            await this.elements.childrenAgeDropdown(childIndex).waitFor({ state: 'visible' });
        }
    }

    async validateTargetNumber(targetNumber: number) {
        if (!Number.isInteger(targetNumber) || targetNumber < 0) {
            throw new Error('targetNumber must be a non-negative integer');
        }
        if (targetNumber === 0) {
            throw new Error('targetNumber must be greater than 0');
        }
    }
}
