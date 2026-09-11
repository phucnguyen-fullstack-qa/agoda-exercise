# Agoda Automation Exercise

Playwright end-to-end automation for the Agoda hotel search and booking flow.
The regression scenario searches for a hotel, fills the booking details, selects
an available room, books the second room group offer, and verifies the Payment
page.

## Technology Stack

- Playwright Test `1.63.0`
- TypeScript `7.0.2`
- Node.js with native ESM modules
- pnpm `11.x`
- ESLint `10.x`

## Requirements

- Node.js compatible with the installed TypeScript and Playwright versions
- pnpm `11.x`
- Git
- Chromium installed through Playwright

## Setup

Install dependencies:

```powershell
pnpm install
```

Install Playwright browsers:

```powershell
pnpm exec playwright install
```

The active environment is configured in `.env`:

```env
ENVIRONMENT=production
```

Supported environments are `local`, `development`, `staging`, and `production`.
Environment-specific Agoda paths are defined in
`pages-object-layer/agoda/path/path.ts`.

## Project Structure

```text
common/
	base/                 Shared page utilities and retry helpers
	date/                 Date calculation and formatting helpers
	fixtures/             Playwright fixtures
	report/               Custom report writer and reporter

pages-object-layer/
	agoda/
		base/               Agoda base page
		components/         Reusable Agoda components
		pages/              Agoda page objects
		path/               Environment-aware page paths

regression-test-layer/
	regression/           Regression test specifications

test-data-layer/
	agoda/                JSON test data

playwright.config.ts    Playwright configuration
```

## Run Tests

Run the full regression suite:

```powershell
pnpm exec playwright test
```

Run TC-001:

```powershell
pnpm exec playwright test --grep "@TC-001"
```

Run only Chromium:

```powershell
pnpm exec playwright test --project=chromium
```

Run in headed mode:

```powershell
pnpm exec playwright test --grep "@TC-001" --headed
```

Run with the Playwright Inspector:

```powershell
pnpm exec playwright test --grep "@TC-001" --debug
```

List discovered tests:

```powershell
pnpm exec playwright test --list
```

## Supported Browsers and Platforms

The configured projects support:

- Chromium

The project is configured for desktop browser profiles and is intended to run
on Windows, macOS, or Linux with Node.js and Playwright browser dependencies
installed.

## Reports and Artifacts

The test run produces:

- HTML report in `playwright-report/`
- Trace files for each run
- Video files for each run
- Test artifacts in `test-results/`
- CSV output from the custom report reporter

Open the HTML report:

```powershell
pnpm exec playwright show-report
```

## Test Data

TC-001 data is stored in
`test-data-layer/agoda/reg.TC-001.json`. Business inputs such as search text,
date offsets, occupancy, child ages, and room offer selection are kept in this
file. Selectors and workflow logic remain in the page objects.
