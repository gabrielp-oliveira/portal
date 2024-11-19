import { Injectable } from '@angular/core';
import { loadGapiInsideDOM } from 'gapi-script';

@Injectable({
  providedIn: 'root',
})
export class GoogleApiService {
  private clientId = 'SUA_GOOGLE_CLIENT_ID'; // Substitua pelo seu CLIENT_ID
  private scope = 'https://www.googleapis.com/auth/drive.file';

  constructor() {}

  loadGapi(): Promise<void> {
    return new Promise((resolve) => {
      loadGapiInsideDOM(); // Carrega o gapi no DOM
      gapi.load('auth2', () => {
        gapi.auth2.init({
          client_id: this.clientId,
          scope: this.scope,
        }).then(() => resolve());
      });
    });
  }
}
