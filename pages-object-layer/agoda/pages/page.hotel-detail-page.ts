import { AgodaBasePage } from '@pages-object-layer/agoda/base/page.base-page';

export class AgodaHotelDetailPage extends AgodaBasePage {
    get elements() {
        return {
            ...super.elements,
            hotelHeaderName: () => this.page.locator('[data-selenium="hotel-header-name"]'),
            roomList: () => this.page.locator('//*[@data-element-name="mob-room-group"]'),
            roomByIndex: (index: number) => this.elements.roomList().nth(index),
            roomOfferList: (roomIndex: number) => this.elements.roomByIndex(roomIndex).locator('//*[@data-element-name="mob-room-offer"]'),
            roomOfferByIndex: (roomIndex: number, offerIndex: number) => this.elements.roomOfferList(roomIndex).nth(offerIndex),
            bookButton: (roomIndex: number, offerIndex: number) =>
                this.elements.roomOfferByIndex(roomIndex, offerIndex).locator('[data-element-name="mob-room-tile-book-now"]').first(),
        };
    }

    async selectRoomAndBook(
        roomIndex: number,
        offerIndex: number,
    ): Promise<{
        name: string;
        adults: string;
        children: string;
        offer: string;
        price: string;
    }> {
        const room = this.elements.roomByIndex(roomIndex);
        const offer = this.elements.roomOfferByIndex(roomIndex, offerIndex);
        const roomName = room.getByTestId('room-name');

        await this.scrollUntilVisible(roomName);

        const name = (await roomName.innerText()).trim();
        const occupancy = offer.locator('[data-element-name="mob-room-offer-occupancy-info"]');

        const adults = (await occupancy.getAttribute('data-adults')) ?? '';
        const children = (await occupancy.getAttribute('data-children')) ?? '';
        const offerName = (await offer.getByTestId('offer-order').innerText()).trim();
        const price = (await offer.getByTestId('room-offer-final-price').innerText()).trim();

        const currentPage = this.getPage();
        await Promise.all([
            currentPage
                .waitForNavigation({
                    waitUntil: 'domcontentloaded',
                    timeout: 30_000,
                })
                .catch(() => undefined),
            this.elements.bookButton(roomIndex, offerIndex).click(),
        ]);
        this.setPage(currentPage);

        return {
            name,
            adults,
            children,
            offer: offerName,
            price,
        };
    }
}
