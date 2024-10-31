import { Component, Inject, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ApiService } from '../../modules/api.service';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';

import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { WorldDataService } from '../../modules/dashboard/world-data.service';
import { Chapter, Event, StoryLine, Timeline } from '../../models/paperTrailTypes';
import { combineLatest } from 'rxjs';





@Component({
    selector: 'app-createPaperDialog',
    templateUrl: './createPaperDialog.component.html',
    styleUrl: './dialog.component.scss'
  })
  export class createPaperDialogComponent  {
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
      this.api.createPaper(this.worldForm.value).subscribe((paper) => {
        if(!!paper.chapter){
          this.wd.addChapter(paper.chapter[0])
        }
        delete paper.chapter
        this.wd.addPaper(paper)
      })
    }
  
  }
  @Component({
    selector: 'app-createPaperDialog',
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
        paper_id: ['', [Validators.required]],
      });

      this.wd.world$.subscribe((w) => {
        this.worldId = w?.id
      })
    }

    papers$ = this.wd.papers$;
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
      tl: Timeline[]
      selectedTl: Timeline = {
        range: 0,
        id: '',
        WorldsID: '',
        name: '',
        description: '',
        order: 0,
        created_at: '',

      }
    constructor(private fb: FormBuilder,private api:ApiService, private wd: WorldDataService,
      @Inject(MAT_DIALOG_DATA) public data: { chapterId: string }
    ){

      this.timelines$.subscribe((tl) => {
        this.tl = tl
      })
      this.worldForm = this.fb.group({
        name: ['', [Validators.required, Validators.minLength(3)]],
        description: ['', [Validators.required]],
        paper_id: ['', [Validators.required]],
        order: ['', [Validators.required]],
        timeline_id: ['', [Validators.required]],
        storyline_id: ['', [Validators.required]],
        range: [0, [Validators.required]],
      });

      this.chapters$.subscribe((cpList) => {
        const chapter = cpList.filter((cp) => cp.id == this.data.chapterId)[0]
        const e = {target: {value: chapter.timeline_id}}
        this.getTimeLineDetails(e)
        this.worldId = chapter.world_id
        this.worldForm.patchValue({
          name: chapter.name,
          description: chapter.description,
          order: chapter.order,
          paper_id: chapter.paper_id,
          timeline_id: chapter?.timeline_id,
          storyline_id: chapter?.storyline_id,
          range: chapter?.range,
        });
      })



    }

    papers$ = this.wd.papers$;
    timelines$ = this.wd.timelines$;
    storylines$ = this.wd.storylines$;
    chapters$ = this.wd.chapters$;
    world$ = this.wd.world$;
    range:number = 1

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
    formatLabel(value: number): string {
      this.range = value
      return `${value}`;
    }


    getTimeLineDetails(e:any){
      const val:string = e.target.value
      if( val != null &&val.trim() != ""){
        const result = this.tl.filter((t) => t.id == val)
        this.selectedTl = result[0]
      }
    }
  }
  @Component({
    selector: 'app-updateTimelineDialog',
    templateUrl: './updateTimelineDialog.component.html',
    styleUrl: './dialog.component.scss'
  })
  export class UpdateTimelineDialogComponent  {
    worldForm: FormGroup;
    worldId:string | undefined= ''
      errorHandler: any;

    constructor(private fb: FormBuilder,private api:ApiService, private wd: WorldDataService,
      @Inject(MAT_DIALOG_DATA) public data: Timeline
    ){

 
      this.worldForm = this.fb.group({
        name: ['', [Validators.required, Validators.minLength(3)]],
        description: ['', [Validators.required]],
        paper_id: ['', [Validators.required]],
        range: [0, [Validators.required]],
      });

        this.worldForm.patchValue({
          name: data.name,
          description: data.description,
          range: data?.range
        });



    }



    range:number = 1
    

    onSubmit(){
      const body = {...this.data, ...this.worldForm.value, }
      this.api.updateTimeline(body).subscribe(
        
        {
            next: (tl) => this.wd.updateTimeline(tl),
            error: (err) =>this.errorHandler.errHandler(err)
          }
      )
    }

    formatLabel(value: number): string {
      this.range = value
      return `${value}`;
    }



  }
  @Component({
    selector: 'app-deleteTimelineDialog',
    templateUrl: './deleteTimelineDialog.component.html',
    styleUrl: './dialog.component.scss'
  })
  export class deleteTimelineDialogComponent  {
    worldForm: FormGroup;

    errorHandler: any;

    constructor(private api:ApiService, private wd: WorldDataService, private fb: FormBuilder,
      @Inject(MAT_DIALOG_DATA) public data: {timeline: Timeline, timelines: Timeline[], chapters: Chapter[]}
    ){
      this.worldForm = this.fb.group({
        confirm: [false, [Validators.required]],
      });
    }


    range:number = 1

    onSubmit(){

      if(this.worldForm.value.confirm){
        if(this.data.timelines.length > 1 ) {
  this.api.deleteTimeline(this.data.timeline.id)
        .subscribe(
          
          {
            next: (results) => {





              const chaptersToUpdate = this.data.chapters.filter((c) => c.timeline_id == this.data.timeline.id)
              const nextTimeline = this.data.timelines.filter((t) => t.order == this.data.timeline.order +1 )[0]
              const prevTimeline = this.data.timelines.filter((t) => t.order == this.data.timeline.order -1 )[0] 
              const newTimeline = nextTimeline || prevTimeline

              const unsubscribeLater = chaptersToUpdate.map((e) => {
                if(!newTimeline){
      
                  e.storyline_id = ""
                  e.timeline_id = ""
                  return this.api.updateChapter(e.id, e).subscribe((c) => this.wd.updateChapter(c))
                }else {
                  e.timeline_id = newTimeline.id
                  return this.api.updateChapter(e.id, e).subscribe((c) => this.wd.updateChapter(c))
                  
                }
              })

              this.wd.removeTimeline(results.id)

              const unsubscribeLater2 = this.data.timelines.map((tl) => {
                if(tl.order > this.data.timeline.order) {
                  tl.order -= 1
                  return this.api.updateTimeline(tl).subscribe((tl) => this.wd.updateTimeline(tl))
                }
                return undefined
                
              })
            },
            error: (err) =>this.errorHandler.errHandler(err)
          }
        )
      }else {
        alert("you must have at least one timeline")
      }
    }
    }
    addNewChapter(newChapter: Chapter){
        this.wd.updateChapter(newChapter)
    }
    formatLabel(value: number): string {
      this.range = value
      return `${value}`;
    }



  }

  @Component({
    selector: 'app-createTimelineDialog',
    templateUrl: './createTimelineDialog.component.html',
    styleUrl: './dialog.component.scss'
  })
  export class createTimelineDialogComponent  {
    worldForm: FormGroup;
    worldId:string | undefined= ''
      errorHandler: any;

    constructor(private fb: FormBuilder,private api:ApiService, private wd: WorldDataService,
      @Inject(MAT_DIALOG_DATA) public data: { chapterId: string }
    ){


      this.worldForm = this.fb.group({
        name: ['', [Validators.required, Validators.minLength(3)]],
        description: ['', [Validators.required]],
        range: [0, [Validators.required]],
      });




    }



    onSubmit(){
      const body = this.worldForm.value
      body.world_id = this.wd.worldId

      this.api.createTimeline(body).subscribe(
        
        {
            next: (data) => this.wd.addTimeline(data),
            error: (err) =>this.errorHandler.errHandler(err)
          }
      )
    }





  }
  @Component({
    selector: 'app-createStorylineDialog',
    templateUrl: './createStorylineDialog.component.html',
    styleUrl: './dialog.component.scss'
  })
  export class createStorylineDialogComponent  {
    worldForm: FormGroup;
    worldId:string | undefined= ''
      errorHandler: any;
      sl: StoryLine[]

    constructor(private fb: FormBuilder,private api:ApiService, private wd: WorldDataService,
      @Inject(MAT_DIALOG_DATA) public data: { chapterId: string }
    ){

      this.worldForm = this.fb.group({
        name: ['', [Validators.required, Validators.minLength(3)]],
        description: ['', [Validators.required]],
      });

    }

    onSubmit(){
      const body = this.worldForm.value
      body.world_id = this.wd.worldId

      this.api.createStoryLine(this.worldForm.value).subscribe(
        {
            next: (data) =>         this.wd.addStoryline(data)
            ,
            error: (err) =>this.errorHandler.errHandler(err)
          }
      )
    }

  }


  @Component({
    selector: 'app-createEventsDialog',
    templateUrl: './createEventsDialog.component.html',
    styleUrl: './dialog.component.scss'
  })
  export class createEventsDialogComponent  {
    worldForm: FormGroup;
      errorHandler: any;

    constructor(private fb: FormBuilder,private api:ApiService, private wd: WorldDataService,
      @Inject(MAT_DIALOG_DATA) private data: string
    ){

      this.worldForm = this.fb.group({
        name: ['', [Validators.required, Validators.minLength(3)]],
        description: ['', [Validators.required]],
      });

      this.worldForm.value.range = 20
      this.worldForm.value.startRange = 0

    }


    onSubmit(){
      const body :Event= this.worldForm.value
      body.world_id =  this.data
      body.range = 20
      body.startRange = 0
      this.api.createEvent(body).subscribe(
        
        {
            next: (data) => this.addEvent(data),
            error: (err) =>this.errorHandler.errHandler(err)
          }
      )
    }
    addEvent(event: Event){
        // this.wd.updateChapter(newChapter)
    }


  }


  @Component({
    selector: 'app-updatePaperDialog',
    templateUrl: './updatePaperDialog.component.html',
    styleUrl: './dialog.component.scss'
  })
  export class UpdatePaperDialogComponent  {
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

      console.log(this.data)
      this.api.getPaperData(this.data.papperId).subscribe((paper) => {
        this.worldId = paper.world_id
        this.worldForm.patchValue({
          name: paper.name,
          description: paper.description,
          order: paper.order,
        });
      })

    }

    papers$ = this.wd.papers$;
    chapters$ = this.wd.chapters$;

    onSubmit(){
      const body = this.worldForm.value
      body.world_id = this.worldId
      body.id = this.data.papperId

      this.api.updatePaper(this.data.papperId, this.worldForm.value).subscribe(
        
        {
            next: (data) => this.wd.updatePaper(data),
            error: (err) =>this.errorHandler.errHandler(err)
          }
      )
    }
    addNewChapter(newChapter: Chapter){
        this.wd.addChapter(newChapter)
    }
  }
  
  @Component({
    selector: 'app-updateEventDialog',
    templateUrl: './updateEventDialog.component.html',
    styleUrl: './dialog.component.scss'
  })
  export class UpdateEventDialogComponent  {
    worldForm: FormGroup;
    worldId:string | undefined= ''
      errorHandler: any;
    constructor(private fb: FormBuilder,private api:ApiService, private wd: WorldDataService,
      @Inject(MAT_DIALOG_DATA) public data: Event
    ){
      this.worldForm = this.fb.group({
        name: ['', [Validators.required, Validators.minLength(3)]],
        description: ['', [Validators.required]],
      });

        this.worldForm.patchValue({
          name: data.name,
          description: data.description,
          
        });

    }


    onSubmit(){
      const event:Event = this.data
      event.name = this.worldForm.value.name
      event.description = this.worldForm.value.description
      this.api.updateEvent(event).subscribe(
        
        {
            next: (data) => this.wd.updateEvent(data),
            error: (err) =>this.errorHandler.errHandler(err)
          }
      )
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
      })
    }
  
  }

  @Component({
    selector: 'app-dataPickerDialog',
    templateUrl: './dataPickerDialog.component.html',
    styleUrl: './dialog.component.scss'
  })
  export class DataPickerDialogComponent {

    selected: Date | null;  
  }
  @Component({
    selector: 'app-chapterDescriptionDialog',
    templateUrl: './chapterDescriptionDialog.component.html',
    styleUrl: './dialog.component.scss'
  })
  export class chapteDescriptionDialogComponent {

    constructor(@Inject(MAT_DIALOG_DATA) public data: Chapter ){
  }
  }

  
  @Component({
    selector: 'app-strEdit',
    templateUrl: './strEditDialog.component.html',
    styleUrl: './dialog.component.scss'
  })
  export class strEditDialogComponent  {
    worldForm: FormGroup;
    worldId:string | undefined= ''
      errorHandler: any;

    constructor(private fb: FormBuilder,private api:ApiService, private wd: WorldDataService,
      @Inject(MAT_DIALOG_DATA) public data: StoryLine
    ){

 
      this.worldForm = this.fb.group({
        name: ['', [Validators.required, Validators.minLength(3)]],
        description: ['', [Validators.required]],
      });

        this.worldForm.patchValue({
          name: data.name,
          description: data.description,
        });



    }

    

    onSubmit(){
      const body = {...this.data, ...this.worldForm.value, }
      // this.api.updateTimeline(body).subscribe(
        
      //   {
      //       next: (tl) => this.wd.updateTimeline(tl),
      //       error: (err) =>this.errorHandler.errHandler(err)
      //     }
      // )
    }





  }
  

