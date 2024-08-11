import { Component } from '@angular/core';
import { ApiService } from '../../api.service';
import { AuthService } from '../../../auth/auth.service';
import { MatDialog } from '@angular/material/dialog';
import { FormGroup, FormBuilder, Validators, ReactiveFormsModule } from "@angular/forms";
import { Papper, world } from '../../../models/papperTrailTypes';
import { ErrorService } from '../../error.service';
import { WorldDataService } from '../world-data.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent {

  constructor(
    private err: ErrorService,
    private api: ApiService,
    private auth: AuthService,
    public dialog: MatDialog,
    private wp:WorldDataService
  ) { }

  worldList: world[] = []
  papperList: Papper[] = []

  ngOnInit() {
    this.api.getWorldList().subscribe({
      next: (worldList) => {
        console.log(worldList);
        this.worldList = worldList
      },
      error: (err) => {
        this.err.errHandler(err)
      },
      complete: () => {
        console.log('Operação concluída');
      }
    });

  }

  logOut() {
    this.auth.logOut()
  }

  getPapperList(worldId: string) {
    this.api.getPapperList(worldId).subscribe({
      next: (worldList) => {
        console.log(worldList);
        this.papperList = worldList
      },
      error: (err) => {
        this.err.errHandler(err)
      },
      complete: () => {
        console.log('Operação concluída');
      }
    });
  }
  openDialog(enterAnimationDuration: string, exitAnimationDuration: string): void {
    this.dialog.open(createWorldDialogComponent, {
      width: '350px',
      enterAnimationDuration,
      exitAnimationDuration,
    });
  }


}


@Component({
  selector: 'app-createWorldDialog',
  templateUrl: './dialogs/createWorldRootDialog.component.html',
  styleUrl: './dashboard.component.scss'
})
export class createWorldDialogComponent {
  worldForm: FormGroup;
  constructor(private fb: FormBuilder, private api: ApiService,) {
    this.worldForm = this.fb.group({
      Name: ['', [Validators.required]],
    });
  }
  onSubmit() {
    this.api.Createworld(this.worldForm.value).subscribe((world) => {
      console.log(world)
    })
  }

}
