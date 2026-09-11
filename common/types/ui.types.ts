import type {
  AgodaHomePage,
  AgodaHotelDetailPage,
  AgodaPaymentPage,
  AgodaSearchResultPage,
} from '@pages-object-layer/agoda/index';

/** Pages exposed under `ui.agoda.<pageName>`, sourced from the Agoda barrel. */
export interface AgodaUi {
  homePage: AgodaHomePage;
  searchResultPage: AgodaSearchResultPage;
  hotelDetailPage: AgodaHotelDetailPage;
  paymentPage: AgodaPaymentPage;
}

/**
 * Shape of the `ui` fixture: `ui.<systemName>.<pageName>`.
 * Add a new system by adding one entry here, backed by that system's own
 * `index.ts` barrel export.
 */
export interface Ui {
  agoda: AgodaUi;
}
