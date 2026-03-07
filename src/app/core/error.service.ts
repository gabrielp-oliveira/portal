import { Injectable } from '@angular/core';
import { AuthService } from './auth/auth.service';
import { WorldDataService } from '../features/dashboard/world-data.service';
import { ToastService } from './toast.service';


@Injectable({
  providedIn: 'root'
})
export class ErrorService {

  constructor(
    private auth: AuthService,
    private wd: WorldDataService,
    private toast: ToastService
  ) {}

  errHandler(error: any): void {
    console.error(error);
    this.wd.setLoading(false);

    const message: string =
      error?.error?.error ??
      error?.error?.message ??
      error?.message ??
      'Ocorreu um erro inesperado.';

    if (error.status === 401 || error.status === 403) {
      this.auth.logOut();
      this.toast.error('Sessão expirada. Faça login novamente.');
      return;
    }

    this.toast.error(message);
  }
}
