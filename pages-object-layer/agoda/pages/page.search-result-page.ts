import type { Locator } from '@playwright/test';
import { AgodaBasePage } from '@pages-object-layer/agoda/base/page.base-page';

export interface SelectedHotel {
  name: string;
  price: string;
}

export class AgodaSearchResultPage extends AgodaBasePage {

  get elements() {
    return {
      ...super.elements,
      hotelItems: () => this.page.locator('[data-selenium="hotel-item"]'),
      hotelName: (hotel: Locator) => hotel.locator('[data-selenium="hotel-name"]'),
      hotelNameByText: (hotelName: string) =>
        this.elements.hotelItems().locator('[data-selenium="hotel-name"]').filter({ hasText: hotelName }).first(),
      price: (hotel: Locator) =>
        hotel.locator('[data-element-name="final-price"] [data-selenium="display-price"]'),
      soldOut: (hotel: Locator) => hotel.getByText('Sold out on your dates!', { exact: true }),
      sortBy: () => this.page.getByText('Sort by:', { exact: false }),
      propertyCount: () => this.page.getByText(/properties in/i),
    };
  }

  async getHotelList(): Promise<Locator[]> {
    await this.elements.hotelItems().first().waitFor({ state: 'visible' });
    return this.elements.hotelItems().all();
  }

  async selectAvailableHotelWithSuggestedPrice(expectedHotelName?: string): Promise<SelectedHotel> {
    const hotels = await this.getHotelList();

    for (const hotel of hotels) {
      const soldOut = await this.elements.soldOut(hotel).count() > 0;
      const name = (await this.elements.hotelName(hotel).textContent())?.trim() ?? '';
      const price = (await this.elements.price(hotel).textContent())?.trim() ?? '';

      if (soldOut || !name || !price) {
        continue;
      }

      if (expectedHotelName && name !== expectedHotelName) {
        continue;
      }

      const newPage = await this.performActionAndWaitForNewPage(
        () => hotel.click(),
      );
      this.setPage(newPage);
      return { name, price };
    }

    if (expectedHotelName) {
      return this.selectAvailableHotelWithSuggestedPrice();
    }

    throw new Error('Could not find an available hotel with a suggested price');
  }
}
