import type { Page } from '@playwright/test';
import { AgodaBasePage } from '@pages-object-layer/agoda/base/page.base-page';

export class AgodaPaymentPage extends AgodaBasePage {
  private readonly pagesWithDropOffHandler = new WeakSet<Page>();

  constructor(page: Page) {
    super(page);
    this.registerDropOffModalHandler(page);
  }

  override setPage(page: Page): void {
    super.setPage(page);
    this.registerDropOffModalHandler(page);
  }

  private registerDropOffModalHandler(page: Page): void {
    if (this.pagesWithDropOffHandler.has(page)) {
      return;
    }

    const modal = page.getByTestId('bf-user-drop-off-alert-modal');
    page.addLocatorHandler(modal, async () => {
      await modal.getByRole('button', { name: 'Close', exact: true }).click();
    });
    this.pagesWithDropOffHandler.add(page);
  }

  get elements() {
    return {
      ...super.elements,
      pageHeader: () => this.page.getByText('Who’s the lead guest?'),
      bookingDetailsForm: () => this.page.getByTestId('booking-details-form'),
      propertyName: () => this.page.getByTestId('property-name-id'),
      roomHeading: () => this.page.getByTestId('room-heading'),
      maxOccupancy: () => this.page.getByTestId('max-occupancy').first(),
      checkInDate: () => this.page.getByTestId('checkin-date').locator('p'),
      checkOutDate: () => this.page.getByTestId('checkout-date').locator('p'),
      stayLength: () => this.page.getByTestId('stay-length'),
      roomPrice: () => this.page.locator('[data-element-name="fpc-room-price"]'),
      selectedPaymentOption: () => this.page.locator('input[name="payNowPayLater"]:checked'),
      totalPrice: () => this.page.locator('[data-element-name="fpc-total-price"]'),
    };
  }

}
