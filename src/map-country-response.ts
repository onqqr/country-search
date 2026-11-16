export type CountryCard = {
  name: string;
  flag: string;
  capital: string;
  region: string;
  population: number;
  languages: string[];
  area: number | null;
  borders: string[];
  currencies: string[];
  subregion: string | null;
};

type CountryLanguage = {
  name?: string;
};

type CountryCurrency = {
  name?: string;
};

type CountryFlags = {
  svg?: string;
  png?: string;
};

type CountryRaw = {
  name?: string;
  flag?: string;
  flags?: CountryFlags;
  capital?: string;
  region?: string;
  population?: number;
  area?: number;
  borders?: string[];
  languages?: CountryLanguage[];
  currencies?: CountryCurrency[];
  subregion?: string;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

export function mapCountryResponse(raw: unknown): CountryCard {
  const data = (isRecord(raw) ? raw : {}) as CountryRaw;

  const flag = data.flags?.svg ?? data.flags?.png ?? data.flag ?? '';

  return {
    name: data.name ?? '',
    flag,
    capital: data.capital ?? '',
    region: data.region ?? '',
    population: data.population ?? 0,
    languages: (data.languages ?? [])
      .map((language) => language.name)
      .filter((name): name is string => Boolean(name)),
    area: data.area ?? null,
    borders: data.borders ?? [],
    currencies: (data.currencies ?? [])
      .map((currency) => currency.name)
      .filter((name): name is string => Boolean(name)),
    subregion: data.subregion ?? null,
  };
}
