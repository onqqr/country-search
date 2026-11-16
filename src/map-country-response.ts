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

export function mapCountryResponse(_raw: unknown): CountryCard {
  throw new Error('Not implemented');
}
