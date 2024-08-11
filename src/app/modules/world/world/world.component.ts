import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ApiService } from '../../api.service';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { basicWorld, world } from '../../../models/papperTrailTypes';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { WorldDataService } from '../../dashboard/world-data.service';
import { ErrorService } from '../../error.service';

@Component({
  selector: 'app-world',
  templateUrl: './world.component.html',
  styleUrl: './world.component.scss'
})
export class WorldComponent {

  constructor(
    private route: ActivatedRoute,
    private api: ApiService,
    private dialog: MatDialog,
    private wd: WorldDataService,
    private errorHandler: ErrorService
  ) { }

  pappers$ = this.wd.pappers$;
  world$ = this.wd.world$;

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const id = params.get('id') || '';
      if (id) {
        this.loadWorldData(id);
      }
    });

  }

  private loadWorldData(id: string): void {
    this.api.getWorldData(id).subscribe({
      next: (data) => this.wd.setWorldData(data),
      error: (err) =>this.errorHandler.errHandler(err)
    });
  }

  openDialog(enterAnimationDuration: string, exitAnimationDuration: string): void {
    this.dialog.open(createPapperDialogComponent, {
      width: '350px',
      enterAnimationDuration,
      exitAnimationDuration,
    });
  }

}


@Component({
  selector: 'app-createPapperDialog',
  templateUrl: '../dialogs/createPapperDialog.component.html',
  styleUrl: './world.component.scss'
})
export class createPapperDialogComponent  {
  worldForm: FormGroup;
  constructor(private fb: FormBuilder,private api:ApiService,){
    this.worldForm = this.fb.group({
      Name: ['', [Validators.required, Validators.minLength(3)]],
      description: ['', [Validators.required]],
    });
  }
  onSubmit(){
    console.log("world")
    const body = this.worldForm.value
    body.world_id = this.api.selectedWorld
    this.api.createPapper(this.worldForm.value).subscribe((world) => {
      console.log(world)
    })
  }

}
