import { Component, DestroyRef, inject } from '@angular/core';
import { ApiService } from '../../../core/api.service';
import { AuthService } from '../../../core/auth/auth.service';
import { paper, world } from '../../../models/paperTrailTypes';
import { ErrorService } from '../../../core/error.service';
import { WorldDataService } from '../world-data.service';
import { DialogService } from '../../../dialog/dialog.service';
import { Observable } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  standalone: false,
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent {

  private destroyRef = inject(DestroyRef);

  constructor(
    private err: ErrorService,
    private api: ApiService,
    private auth: AuthService,
    private dialog: DialogService,
    private wd: WorldDataService,
  ) { }

  worldList: world[] = [];
  paperList: paper[] = [];

  Showloading: Observable<boolean> = this.wd.loading$;

  ngOnInit() {
    this.api.getWorldList()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (worldList) => {
          this.worldList = worldList;
        },
        error: (err) => {
          this.err.errHandler(err);
        },
        complete: () => {
          console.log('Operação concluída');
        }
      });
  }

  setreadName(name: String) {
    return name.split(' ').join('_');
  }

  logOut() {
    this.auth.logOut();
  }

  getPaperList(worldId: string) {
    this.api
      .getPaperList(worldId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (worldList) => {
          this.paperList = worldList;
        },
        error: (err) => {
          this.err.errHandler(err);
        },
        complete: () => {
          console.log('Operação concluída');
        }
      });
  }

  openDialog(enterAnimationDuration: string, exitAnimationDuration: string): void {
    this.dialog.openCreateWorldDialog(enterAnimationDuration, exitAnimationDuration);
  }
}


