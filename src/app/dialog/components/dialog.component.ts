import { Component, Inject, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ApiService } from '../../modules/api.service';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';

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
    worldId:string = ''
    constructor(private fb: FormBuilder,private api:ApiService, private wd: WorldDataService){
        this.worldForm = this.fb.group({
            Name: ['', [Validators.required, Validators.minLength(3)]],
            description: ['', [Validators.required]],
        });
        this.wd.world$.subscribe((w) => {
            this.worldId = String(w?.id)
          })

    }
    world$ = this.wd.world$;
    onSubmit(){
      const body = this.worldForm.value

      
      body.world_id = this.worldId
      this.api.createPapper(this.worldForm.value).subscribe((papper) => {
        if(!!papper.chapter){
          console.log(papper)
          this.wd.addChapter(papper.chapter[0])
        }
        delete papper.chapter
        this.wd.addPapper(papper)
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
    selector: 'app-updateChapterDialog',
    templateUrl: './updateChapterDialog.component.html',
    styleUrl: './dialog.component.scss'
  })
  export class UpdateChapterDialogComponent  {
    worldForm: FormGroup;
    worldId:string | undefined= ''
      errorHandler: any;
    constructor(private fb: FormBuilder,private api:ApiService, private wd: WorldDataService,
      @Inject(MAT_DIALOG_DATA) public data: { chapterId: string }
    ){
      this.worldForm = this.fb.group({
        name: ['', [Validators.required, Validators.minLength(3)]],
        description: ['', [Validators.required]],
        papper_id: ['', [Validators.required]],
        order: ['', [Validators.required]],
      });

      this.api.getChapteData(this.data.chapterId).subscribe((chapter) => {
        console.log(chapter)
        this.worldId = chapter.world_id
        this.worldForm.patchValue({
          name: chapter.name,
          description: chapter.description,
          order: chapter.order,
          papper_id: chapter.papper_id
        });

      })

    }

    pappers$ = this.wd.pappers$;
    chapters$ = this.wd.chapters$;
    world$ = this.wd.world$;

    onSubmit(){
      const body = this.worldForm.value
      body.world_id = this.worldId
      body.id = this.data.chapterId
      this.api.updateChapter(this.data.chapterId, this.worldForm.value).subscribe(
        
        {
            next: (data) => this.addNewChapter(data),
            error: (err) =>this.errorHandler.errHandler(err)
          }
      )
    }
    addNewChapter(newChapter: Chapter){
        this.wd.updateChapter(newChapter)
    }
  }
  @Component({
    selector: 'app-updatePapperDialog',
    templateUrl: './updatePapperDialog.component.html',
    styleUrl: './dialog.component.scss'
  })
  export class UpdatePapperDialogComponent  {
    worldForm: FormGroup;
    worldId:string | undefined= ''
      errorHandler: any;
    constructor(private fb: FormBuilder,private api:ApiService, private wd: WorldDataService,
      @Inject(MAT_DIALOG_DATA) public data: { papperId: string }
    ){
      this.worldForm = this.fb.group({
        name: ['', [Validators.required, Validators.minLength(3)]],
        description: ['', [Validators.required]],
        order: ['', [Validators.required]],
      });

      this.api.getPapperData(this.data.papperId).subscribe((papper) => {
        this.worldId = papper.world_id
        this.worldForm.patchValue({
          name: papper.name,
          description: papper.description,
          order: papper.order,
        });
      })

    }

    pappers$ = this.wd.pappers$;
    chapters$ = this.wd.chapters$;

    onSubmit(){
      const body = this.worldForm.value
      body.world_id = this.worldId
      body.id = this.data.papperId
      body.order = 2

      this.api.updatePapper(this.data.papperId, this.worldForm.value).subscribe(
        
        {
            next: (data) => this.wd.updatePapper(data),
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
    constructor(private fb: FormBuilder, private api: ApiService, private wd: WorldDataService) {
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


