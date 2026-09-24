import type { Locator, Page } from '@playwright/test';

export class BasePage {
    constructor(protected page: Page) { }

    setPage(page: Page): void {
        this.page = page;
    }

    getPage(): Page {
        return this.page;
    }

    async performActionAndWaitForNewPage(action: () => Promise<void>, timeout = 30_000): Promise<Page> {
        const [newPage] = await Promise.all([this.page.waitForEvent('popup', { timeout }), action()]);

        await newPage.waitForLoadState('domcontentloaded');
        return newPage;
    }

    async retry<T>(action: () => Promise<T>, condition: (result: T) => boolean | Promise<boolean>, retrySeconds: number, intervalMs = 200): Promise<T> {
        let lastResult: T | undefined;
        let lastError: unknown;
        const deadline = Date.now() + retrySeconds * 1000;

        if (!Number.isFinite(retrySeconds) || retrySeconds <= 0) {
            throw new Error('retrySeconds must be a positive number');
        }

        if (!Number.isFinite(intervalMs) || intervalMs < 0) {
            throw new Error('intervalMs must be a non-negative number');
        }

        while (Date.now() <= deadline) {
            try {
                lastResult = await action();

                if (await condition(lastResult)) {
                    return lastResult;
                }
            } catch (error) {
                lastError = error;
            }

            const remainingMs = deadline - Date.now();
            if (remainingMs > 0 && intervalMs > 0) {
                await new Promise((resolve) => setTimeout(resolve, Math.min(intervalMs, remainingMs)));
            }
        }

        if (lastError) {
            throw lastError;
        }

        throw new Error(`Retry condition was not met within ${retrySeconds} seconds`);
    }

    async waitForLoadingSpinner(timeout = 30_000): Promise<void> {
        await this.page.locator('.ModalLoadingSpinner__content').first().waitFor({ state: 'hidden', timeout });
    }

    async scrollUntilVisible(locator: Locator, retrySeconds = 30, scrollDistance = 600): Promise<void> {
        await this.retry(
            async () => {
                if (await locator.isVisible().catch(() => false)) {
                    return true;
                }

                await this.page.mouse.wheel(0, scrollDistance);
                return false;
            },
            (isVisible) => isVisible,
            retrySeconds,
        );
    }

    async goto(url: string): Promise<void> {
        await this.page.goto(url);
    }
}
