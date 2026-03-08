import { Injectable } from '@angular/core';

export interface GeoResult {
  country: 'BR' | 'US';
  currency: 'BRL' | 'USD';
}

const LS_KEY = 'geo-result';
const LS_EXP = 'geo-result-exp';
const TTL_MS = 24 * 60 * 60 * 1000; // 24h

/**
 * Fetches the user's country on app startup (root injector = runs immediately).
 * Product pages simply await `geo` instead of making their own sequential fetch.
 * On cache hit the promise resolves synchronously-fast; on miss the fetch runs
 * in parallel with routing + lazy-module loading, eliminating the sequential
 * ipapi.co → API dependency that was hurting LCP on store pages.
 */
@Injectable({ providedIn: 'root' })
export class GeoService {
  readonly geo: Promise<GeoResult>;

  constructor() {
    this.geo = this.resolve();
  }

  private resolve(): Promise<GeoResult> {
    try {
      const cached = localStorage.getItem(LS_KEY);
      const exp    = Number(localStorage.getItem(LS_EXP) ?? 0);
      if (cached && exp > Date.now()) {
        return Promise.resolve(JSON.parse(cached) as GeoResult);
      }
    } catch { /* ignore */ }

    return fetch('https://ipapi.co/json')
      .then(r => r.json())
      .then((data): GeoResult => {
        const result: GeoResult = data?.country === 'BR'
          ? { country: 'BR', currency: 'BRL' }
          : { country: 'US', currency: 'USD' };
        try {
          localStorage.setItem(LS_KEY, JSON.stringify(result));
          localStorage.setItem(LS_EXP, String(Date.now() + TTL_MS));
        } catch { /* ignore */ }
        return result;
      })
      .catch((): GeoResult => ({ country: 'US', currency: 'USD' }));
  }
}
