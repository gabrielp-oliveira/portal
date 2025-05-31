import { Injectable } from '@angular/core';
import { AuthService } from '../auth/auth.service';
import { DialogService } from '../dialog/dialog.service';
import { WorldDataService } from './dashboard/world-data.service';


@Injectable({
  providedIn: 'root'
})
export class ErrorService {
  
  constructor(private auth: AuthService, private dialog:DialogService, private wd: WorldDataService){ }
  errHandler(error: any) {
    console.error(error)
    this.wd.setLoading(false)
      if (error.status === 401 || error.status === 403) {
        this.auth.logOut();
        const infoDialog = {
          ...error,
          message: error.error.error ,
          status: 'error',
          header:"error with your authentication"
        }
        this.dialog.openInfoDialog(infoDialog)
        return
      }
      const infoDialog = {
        ...error,
        message: error.error.error ,
        status: 'error',
        header:"error"
      }
      this.dialog.openInfoDialog(infoDialog)
  } 
}
