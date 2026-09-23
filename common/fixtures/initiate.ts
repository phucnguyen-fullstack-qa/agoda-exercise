import type { Page } from '@playwright/test';
import { AgodaHomePage, AgodaHotelDetailPage, AgodaPaymentPage, AgodaSearchResultPage } from '@pages-object-layer/agoda/index';
import type { AgodaUi } from '@common/types/ui.types';

const pageClasses = {
    homePage: AgodaHomePage,
    searchResultPage: AgodaSearchResultPage,
    hotelDetailPage: AgodaHotelDetailPage,
    paymentPage: AgodaPaymentPage,
};

export function createListOfPage(page: Page): AgodaUi {
    const cache = new Map<keyof typeof pageClasses, AgodaUi[keyof AgodaUi]>();

    return new Proxy({} as AgodaUi, {
        get(_, prop: keyof typeof pageClasses) {
            if (prop in pageClasses) {
                if (!cache.has(prop)) {
                    const PageClass = pageClasses[prop];
                    cache.set(prop, new PageClass(page));
                }
                return cache.get(prop);
            }
            return undefined;
        },
    });
}
