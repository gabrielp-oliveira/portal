import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ApiService } from '../../modules/api.service';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';

import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { WorldDataService } from '../../modules/dashboard/world-data.service';
import { Chapter } from '../../models/papperTrailTypes';





@Component({
    selector: 'app-createPapperDialog',
    templateUrl: './createPapperDialog.component.html',
    styleUrl: './dialog.component.scss'
  })
  export class createPapperDialogComponent  {
    worldForm: FormGroup;
    
    constructor(private fb: FormBuilder,private api:ApiService, private wd: WorldDataService){
        this.worldForm = this.fb.group({
            Name: ['', [Validators.required, Validators.minLength(3)]],
            description: ['', [Validators.required]],
        });
    }
    world$ = this.wd.world$;
    onSubmit(){
      console.log("world")
      const body = this.worldForm.value
      body.world_id = this.api.selectedWorld
      this.api.createPapper(this.worldForm.value).subscribe((world) => {
        console.log(world)
      })
    }
  
  }
  @Component({
    selector: 'app-createPapperDialog',
    templateUrl: './createChapterDialog.component.html',
    styleUrl: './dialog.component.scss'
  })
  export class createChapterDialogComponent  {
    worldForm: FormGroup;
    worldId:string | undefined= ''
      errorHandler: any;
    constructor(private fb: FormBuilder,private api:ApiService, private wd: WorldDataService){
      this.worldForm = this.fb.group({
        name: ['', [Validators.required, Validators.minLength(3)]],
        description: ['', [Validators.required]],
        papper_id: ['', [Validators.required]],
      });

      this.wd.world$.subscribe((w) => {
        this.worldId = w?.id
      })
    }

    pappers$ = this.wd.pappers$;
    chapters$ = this.wd.chapters$;
    world$ = this.wd.world$;

    onSubmit(){
      const body = this.worldForm.value
      body.world_id = this.worldId

      this.api.createChapter(this.worldForm.value).subscribe(
        
        {
            next: (data) => this.addNewChapter(data),
            error: (err) =>this.errorHandler.errHandler(err)
          }


    )
    }
    addNewChapter(newChapter: Chapter){
        this.wd.addChapter(newChapter)
    }
  }
  

  @Component({
    selector: 'app-createWorldDialog',
    templateUrl: './createWorldRootDialog.component.html',
    styleUrl: './dialog.component.scss'
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


