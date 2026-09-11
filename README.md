# Agoda Playwright Automation Exercise

End-to-end test automation for the Agoda hotel booking journey, implemented with Playwright and TypeScript. The project uses a Page Object Model, fixture-based setup, externalized JSON data, CSV reporting, and GitHub Actions execution.

## Test Scenario

The regression test automates the following real-user journey on [Agoda](https://www.agoda.com/):

1. Search for `Muong Thanh` and choose `Muong Thanh Luxury Khanh Hoa, Nha Trang` from the suggestion list.
2. Select check-in at current date plus 30 days and check-out at current date plus 31 days, with 1 room, 2 adults, and 2 children aged 3 and 12.
3. Search and verify that the requested hotel is present in the results.
4. Select a hotel with an available suggested price and verify its name and price.
5. Select the configured room group and its first available Book action.
6. Verify the Payment page, including property, room, dates, stay length, room price, and total price visibility.

Availability and prices are controlled by Agoda. When the requested hotel has no available rooms, the test selects the next suitable result with a suggested price and continues the flow.

## Technology Stack

- Node.js 24
- pnpm 11
- TypeScript 7
- Playwright Test 1.63
- ESLint 10 with `eslint-plugin-playwright`
- GitHub Actions

## Prerequisites

Install the following before running locally:

- Node.js 24 or later
- pnpm 11
- Git

Playwright installs its Chromium binary as part of the setup steps below. The configured browser project is `chromium` with the Desktop Chrome device profile.

## Setup

Clone the repository and move to the project folder:

```powershell
git clone <repository-url>
Set-Location automation_exercise
```

Install locked dependencies and the configured Playwright browser:

```powershell
pnpm install --frozen-lockfile
pnpm exec playwright install chromium
```

### Environment Configuration

Create a local `.env` file at the repository root:

```dotenv
T=production
```

Supported values are `local`, `development`, `staging`, and `production`. They are validated by the Agoda path configuration. All currently resolve to the public Agoda site; the environment boundary is retained so environment-specific URLs can be introduced without changing test code.

The `.env` file is intentionally excluded from Git. In GitHub Actions, `ENVIRONMENT` is supplied by the workflow rather than from a file.

## Project Structure

```text
common/
	base/                         Shared Playwright helpers and retry logic
	constants/                    Shared constants
	date/                         Date calculation and Agoda date formatting
	fixtures/                     Playwright UI fixture and page-object factory
	report/                       Custom CSV reporter and writer
	types/                        Shared UI contract types

pages-object-layer/
	agoda/
		base/                       Agoda-specific base page behavior
		components/                 Reusable components, including the date picker
		pages/                      Home, results, hotel details, and payment POMs
		path/                       Environment-aware Agoda paths and URL patterns

regression-test-layer/
	regression/                   Regression specifications

test-data-layer/
	agoda/                        JSON business data for each Agoda test case

.github/workflows/              Manual GitHub Actions workflow
playwright.config.ts             Playwright projects, reporters, and artifacts
eslint.config.mjs                ESLint and Playwright rules
```

## Test Design

The specification owns business intent and assertions. Page objects own locators and UI actions. This separation keeps selectors out of test specs and lets new scenarios reuse page-level behavior.

Test inputs live in `test-data-layer/agoda/reg.TC-001.json`, including search terms, date offsets, guest counts, child ages, and room/offer indexes. This allows data changes without rewriting the workflow.

The child-age control is a dynamic Agoda component. The page object waits for all requested age dropdowns to render, targets each child by index, opens the control through keyboard interaction, and supports both semantic option and text option markup. This covers Agoda variants with and without a visible `(Required)` label.

## Run Tests

Run the complete configured suite:

```powershell
pnpm exec playwright test
```

Run only the exercise scenario:

```powershell
pnpm exec playwright test --grep "@TC-001"
```

Run the configured browser project explicitly:

```powershell
pnpm exec playwright test --project=chromium
```

Run with a visible browser:

```powershell
pnpm exec playwright test --grep "@TC-001" --headed
```

Run with Playwright Inspector:

```powershell
pnpm exec playwright test --grep "@TC-001" --debug
```

List test discovery without executing tests:

```powershell
pnpm exec playwright test --list
```

## Code Quality

ESLint is configured for TypeScript and Playwright-specific rules. It rejects raw fixed waits, requires assertions in specs, and prevents direct `page.locator()` calls in test specs so interactions remain in page objects.

Run the configured lint command:

```powershell
pnpm lint
```

The project uses strict TypeScript compiler settings, including `strict`, `noUncheckedIndexedAccess`, and `exactOptionalPropertyTypes`. The current TypeScript 7 and `@typescript-eslint` versions have an upstream compatibility limitation, so ESLint and `tsc --noEmit` should be revalidated after aligning those package versions.

## CI/CD

The manual workflow is defined in `.github/workflows/manual-playwright.yml` and is started from **GitHub Actions > Playwright Manual Automation Suite > Run workflow**.

Workflow inputs:

| Input | Purpose | Current options |
| --- | --- | --- |
| `environment` | Sets `ENVIRONMENT` for the run | `production` |
| `test_folder` | Test folder or spec file path | Defaults to `regression-test-layer` |
| `browser` | Playwright project to execute | `chromium` |

The workflow checks out the source, installs pnpm 11 and Node 24, restores the pnpm cache, installs dependencies from the lockfile, installs Chromium with Linux dependencies, and runs the requested Playwright command. It uploads both `playwright-report/` and `test-results/` for passed and failed runs, retaining them for 14 days.

## Reports and Artifacts

Each run produces:

- HTML report: `playwright-report/`
- CSV summary: `playwright-report/report-sheet.csv`
- Trace and video artifacts: `test-results/`

Open the local HTML report:

```powershell
pnpm exec playwright show-report
```

Use a failing trace locally:

```powershell
pnpm exec playwright show-trace test-results/<test-result-folder>/trace.zip
```

Reports, traces, videos, local environment files, and dependencies are excluded from version control through `.gitignore`.

## Known Constraints

This suite runs against a public third-party website. Prices, room inventory, page markup, overlays, and response time can change without notice. Assertions are intentionally focused on critical business checkpoints, while page objects use Playwright auto-waiting and condition-based waits rather than fixed delays.

Only Chromium is enabled in the current Playwright configuration and manual workflow. Add Firefox and WebKit projects to `playwright.config.ts` before advertising cross-browser coverage.

## Planned Enhancements

- Add Husky and lint-staged hooks to run formatting, ESLint, and targeted checks before commits.
- Extend GitHub Actions with pull-request and branch triggers, then run the complete regression suite as a required quality gate.
- Add browser matrix execution after Firefox and WebKit projects are enabled and verified.
