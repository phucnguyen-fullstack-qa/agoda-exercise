import { DateHelper } from '@common/date/date';
import { expect, test } from '@common/fixtures/fixture';
import { AgodaPath, getAgodaPath } from '@pages-object-layer/agoda/path/path';
import hotelBookingData from '@test-data-layer/agoda/reg.TC-001.json' with { type: 'json' };

test('@TC-001 - Searches for a hotel and books a room through to the payment page', async ({ ui }) => {
    const booking = hotelBookingData.booking;
    const checkInDate = DateHelper.addDay(new Date(), hotelBookingData.checkInDateOffset);
    const checkOutDate = DateHelper.addDay(new Date(), hotelBookingData.checkOutDateOffset);
    const stayLength = hotelBookingData.checkOutDateOffset - hotelBookingData.checkInDateOffset;
    const selectedHotelName = hotelBookingData.searchDestination.split(',')[0]?.trim()
        ?? hotelBookingData.searchDestination;
    const expectedCheckInLabel = DateHelper.formatDateToAgodaLabel(checkInDate);
    const expectedCheckOutLabel = DateHelper.formatDateToAgodaLabel(checkOutDate);
    let selectedHotel: { name: string; price: string };
    let selectedRoom: {
        name: string;
        adults: string;
        children: string;
        offer: string;
        price: string;
    };

    await test.step('Step 1. Search for the keyword and select the exact hotel from the auto-suggest dropdown', async () => {
        await ui.agoda.homePage.goto(getAgodaPath(AgodaPath.home));
        await expect(ui.agoda.homePage.elements.searchBoxContainer()).toBeVisible();

        await ui.agoda.homePage.closeDiscountNotificationIfExisting();
        await ui.agoda.homePage.searchForDestination(hotelBookingData.searchKey, hotelBookingData.searchDestination);
    });

    await test.step('Step 2. Fill in the following booking information', async () => {
        await ui.agoda.homePage.datePicker.selectCheckInDate(checkInDate);
        await ui.agoda.homePage.datePicker.selectCheckOutDate(checkOutDate);

        await ui.agoda.homePage.setBookingRoomsTo(booking.rooms);
        await ui.agoda.homePage.setAdultsTo(booking.adults);
        await ui.agoda.homePage.setChildrenTo(booking.children);

        expect(await ui.agoda.homePage.getNumberOfBookingRooms()).toBe(booking.rooms);
        expect(await ui.agoda.homePage.getNumberOfAdults()).toBe(booking.adults);
        expect(await ui.agoda.homePage.getNumberOfChildren()).toBe(booking.children);

        for (const [index, age] of booking.childAges.entries()) {
            await ui.agoda.homePage.retry(
                async () => {
                    await ui.agoda.homePage.selectChildAge(index + 1, age);
                    await expect(ui.agoda.homePage.elements.selectedAgeDropdownValue(index + 1))
                        .toContainText(`${age} years old`);
                    return true;
                },
                (isSelected) => isSelected,
                10,
            );
        }
    });

    await test.step('Step 3. Click Search and verify that the selected hotel appears in the search results page', async () => {
        await ui.agoda.homePage.clickSearchButton();
        await ui.agoda.homePage.waitForLoadingSpinner();

        const hotelItems = ui.agoda.searchResultPage.elements.hotelItems();
        const matchingHotelName = ui.agoda.searchResultPage.elements.hotelNameByText(selectedHotelName);

        await expect(hotelItems.first()).toBeVisible();
        await expect(matchingHotelName).toBeVisible();
    });

    await test.step('Step 4. Select an available room option that displays a suggested price, then verify that the hotel price is displayed and the displayed hotel name matches the selected hotel', async () => {
        selectedHotel = await ui.agoda.searchResultPage.selectAvailableHotelWithSuggestedPrice(
            selectedHotelName,
        );

        ui.agoda.hotelDetailPage.setPage(ui.agoda.searchResultPage.getPage());
        await expect(ui.agoda.hotelDetailPage.elements.hotelHeaderName()).toContainText(selectedHotelName);
        expect(selectedHotel.price).toBeTruthy();
        expect(selectedHotel.name).toBeTruthy();
    });

    await test.step('Step 5. Scroll down to the booking details section. Select the second room type in the list and click its first “Book” button', async () => {
        selectedRoom = await ui.agoda.hotelDetailPage.selectRoomAndBook(
            booking.roomGroupIndex,
            booking.offerIndex,
        );

        ui.agoda.paymentPage.setPage(ui.agoda.hotelDetailPage.getPage());
    });

    await test.step('Step 6. Verify that the user is successfully navigated to the Payment page & verify that the key information on the Payment page matches your previous selections', async () => {
        await expect(ui.agoda.paymentPage.elements.bookingDetailsForm()).toBeVisible();
        await expect(ui.agoda.paymentPage.elements.pageHeader()).toBeVisible();

        await expect(ui.agoda.paymentPage.elements.propertyName())
            .toContainText(selectedHotel.name);

        await expect(ui.agoda.paymentPage.elements.roomHeading())
            .toContainText(`1 x ${selectedRoom.name}`);

        await expect(ui.agoda.paymentPage.elements.maxOccupancy()).toBeVisible();

        await expect(ui.agoda.paymentPage.elements.checkInDate())
            .toHaveText(expectedCheckInLabel);

        await expect(ui.agoda.paymentPage.elements.checkOutDate())
            .toHaveText(expectedCheckOutLabel);

        await expect(ui.agoda.paymentPage.elements.stayLength())
            .toContainText(String(stayLength));

        await expect(ui.agoda.paymentPage.elements.roomPrice())
            .toContainText(selectedRoom.price);

        await expect(ui.agoda.paymentPage.elements.totalPrice()).toBeVisible();
    });
});
