import { describe, expect, it } from 'vitest';
import { mapCountryResponse } from './map-country-response';

const spainRaw = {
  name: 'Spain',
  flag: '🇪🇸',
  flags: {
    png: 'https://flagcdn.com/w320/es.png',
    svg: 'https://flagcdn.com/es.svg',
  },
  capital: 'Madrid',
  region: 'Europe',
  population: 47351567,
  area: 505992,
  borders: ['AND', 'FRA', 'GIB', 'PRT', 'MAR'],
  languages: [
    {
      name: 'Spanish',
      iso639_1: 'es',
      iso639_2: 'spa',
      nativeName: 'Español',
    },
  ],
  currencies: [{ code: 'EUR', name: 'Euro', symbol: '€' }],
  subregion: 'Southern Europe',
};

describe('mapCountryResponse', () => {
  it('maps required card fields from api payload', () => {
    const result = mapCountryResponse(spainRaw);

    expect(result).toEqual({
      name: 'Spain',
      flag: 'https://flagcdn.com/es.svg',
      capital: 'Madrid',
      region: 'Europe',
      population: 47351567,
      languages: ['Spanish'],
      area: 505992,
      borders: ['AND', 'FRA', 'GIB', 'PRT', 'MAR'],
      currencies: ['Euro'],
      subregion: 'Southern Europe',
    });
  });

  it('falls back to emoji flag when flags urls are missing', () => {
    const result = mapCountryResponse({
      ...spainRaw,
      flags: undefined,
      flag: '🇪🇸',
    });

    expect(result.flag).toBe('🇪🇸');
  });

  it('uses empty defaults for missing optional collections', () => {
    const result = mapCountryResponse({
      name: 'Mysteryland',
      capital: 'Unknown',
      region: 'Nowhere',
      population: 0,
    });

    expect(result).toMatchObject({
      name: 'Mysteryland',
      capital: 'Unknown',
      region: 'Nowhere',
      population: 0,
      languages: [],
      borders: [],
      currencies: [],
      area: null,
      subregion: null,
    });
  });
});
