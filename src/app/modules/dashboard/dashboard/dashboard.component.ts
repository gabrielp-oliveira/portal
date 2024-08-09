import { Component } from '@angular/core';
import { ApiService } from '../../api.service';
import { AuthService } from '../../../auth/auth.service';
import { MatDialog } from '@angular/material/dialog';
import { FormGroup, FormBuilder, Validators, ReactiveFormsModule } from "@angular/forms";
import { world } from '../../../models/papperTrailTypes';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent  {

  constructor(private api:ApiService, private auth:AuthService, public dialog: MatDialog){}
  ngOnInit(){
    this.api.GetRootList().subscribe((worldList) => {
      console.log(worldList)
    })
  }

  logOut(){
    this.auth.logOut()
  }

  openDialog(enterAnimationDuration: string, exitAnimationDuration: string): void {
    this.dialog.open(createWorldPapperDialogComponent, {
      width: '350px',
      enterAnimationDuration,
      exitAnimationDuration,
    });
  }


}


@Component({
  selector: 'app-createPapperDialog',
  templateUrl: './dialogs/createWorldRootDialog.component.html',
  styleUrl: './dashboard.component.scss'
})
export class createWorldPapperDialogComponent  {
  worldForm: FormGroup;
  constructor(private fb: FormBuilder,private api:ApiService,){
    this.worldForm = this.fb.group({
      Name: ['', [Validators.required]],
    });
  }
  onSubmit(){
    this.api.Createworld(this.worldForm.value).subscribe((world) => {
      console.log(world)
    })
  }

}
