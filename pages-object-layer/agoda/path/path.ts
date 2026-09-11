export type Environment = 'local' | 'development' | 'staging' | 'production';

type EnvironmentPath = Record<Environment, string>;

const pathsByEnvironment = {
  home: {
    local: 'https://www.agoda.com/',
    development: 'https://www.agoda.com/',
    staging: 'https://www.agoda.com/',
    production: 'https://www.agoda.com/',
  },
  searchResult: {
    local: '/search',
    development: '/search',
    staging: '/search',
    production: '/search',
  },
  hotelDetail: {
    local: '/hotel/',
    development: '/hotel/',
    staging: '/hotel/',
    production: '/hotel/',
  },
  payment: {
    local: '/booking',
    development: '/booking',
    staging: '/booking',
    production: '/booking',
  },
} satisfies Record<string, EnvironmentPath>;

export const AgodaPath = {
  ...pathsByEnvironment,
  SEARCH_RESULT_URL_PATTERN: /\/search/i,
  HOTEL_DETAIL_URL_PATTERN: /\/hotel\//i,
  PAYMENT_URL_PATTERN: /\/booking/i,
} as const;

export function getAgodaEnvironment(): Environment {
  const environment = process.env.ENVIRONMENT ?? 'production';

  if (!(environment in pathsByEnvironment.home)) {
    throw new Error(`Unsupported ENVIRONMENT: ${environment}`);
  }

  return environment as Environment;
}

export function getAgodaPath(path: EnvironmentPath): string {
  return path[getAgodaEnvironment()];
}
