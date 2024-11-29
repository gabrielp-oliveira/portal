import { Component, ErrorHandler, Inject, inject, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ApiService } from '../../modules/api.service';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';

import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { WorldDataService } from '../../modules/dashboard/world-data.service';
import { Chapter, Connection, createWorld, description, Event, GroupConnection, info, infoDialog, paper, StoryLine, Subway_Settings, Timeline, world } from '../../models/paperTrailTypes';
import { combineLatest, Observable, Subject, takeUntil } from 'rxjs';
import { UtilsService } from '../../utils.service';
import { TxtEditorComponent } from '../../standAlone/txt-editor/txt-editor.component';
import { ErrorService } from '../../modules/error.service';
import { DialogService } from '../dialog.service';
import { tree } from 'd3';





@Component({
    selector: 'app-createPaperDialog',
    templateUrl: './createPaperDialog.component.html',
    styleUrl: './dialog.component.scss'
  })
  export class createPaperDialogComponent  {
    worldForm: FormGroup;
      destroy$ = new Subject<void>();
worldId:string = ''
Showloading: Observable<boolean> = this.wd.loading$
    
constructor(private fb: FormBuilder,private api:ApiService,
      private errorHandler:ErrorService,
      private wd: WorldDataService){
        this.worldForm = this.fb.group({
            name: ['', [Validators.required, Validators.minLength(3)]],
            description: ['', [Validators.required]],
        });
        this.wd.world$
        .pipe(takeUntil(this.destroy$))
        .subscribe((w) =>  this.worldId = String(w?.id))

    }
   
     ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  } world$ = this.wd.world$;
    onSubmit(){
      this.wd.setLoading(true)
    
      const body = this.worldForm.value
      
      body.world_id = this.worldId
      this.api.createPaper(this.worldForm.value)
      .pipe(takeUntil(this.destroy$))
      .subscribe(
        {
          next: (paper) => {
            this.wd.setLoading(false)

            if(!!paper.chapter){
              this.wd.addChapter(paper.chapter[0])
            }
            delete paper.chapter
            this.wd.addPaper(paper)
          },
          error: (err) =>this.errorHandler.errHandler(err)

        }
      )
    }
  
  }
  @Component({
    selector: 'app-createPaperDialog',
    templateUrl: './createChapterDialog.component.html',
    styleUrl: './dialog.component.scss'
  })
  export class createChapterDialogComponent  {
    worldForm: FormGroup;
    description:description
    @ViewChild(TxtEditorComponent) txtEditor!: TxtEditorComponent;

    worldId:string | undefined= ''
      destroy$ = new Subject<void>();
      Showloading: Observable<boolean> = this.wd.loading$

      constructor(private fb: FormBuilder,private api:ApiService,
        private dialog: DialogService,
        private utils:UtilsService,private errorHandler:ErrorService,
        private wd: WorldDataService){
          this.worldForm = this.fb.group({
            name: ['', [Validators.required, Validators.minLength(3)]],
            description: ['', [Validators.required]],
            paper_id: ['', [Validators.required]],
          });
          

      
      this.description = {
        id: '',
        resource_type: 'chapter',
        resource_id: ''
      }
      

      this.wd.world$
      .pipe(takeUntil(this.destroy$))
      .subscribe((w) =>  this.worldId = w?.id)
    }

    papers$ = this.wd.papers$;
    chapters$ = this.wd.chapters$;
    world$ = this.wd.world$;

    onDescriptionChange(value: string): void {
      this.description.description_data = value;
    }
    
    chapterBackgroundColor(pp:paper) {    
    return {
      'background-color': pp.color || this.utils.numberToHex(pp.id),
    }
  }

    ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
    onSubmit(){
      this.wd.setLoading(true)
    
      const body = this.worldForm.value
      body.world_id = this.worldId
      
      body.description = this.description.description_data
      
      this.api.createChapter(body)
      .pipe(takeUntil(this.destroy$))
      .subscribe(
        {
          next: (data) => {
            this.wd.setLoading(false)
            this.addNewChapter(data)
            },
            error: (err) =>this.errorHandler.errHandler(err)
          }
    )
    }
    addNewChapter(newChapter: Chapter){
      const info :infoDialog= {
        status: 'success',
        action: "CreateChapter",
        message:"you successfully create chapter " + newChapter.name,
        header: "chapter created"
      }
      this.dialog.openInfoDialog(info)
      
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
    description:description

    worldId:string | undefined= ''
      tl: Timeline[]
      selectedTl: Timeline = {
        range: 0,
        id: '',
        world_id: '',
        name: '',
        description: '',
        order: 0,
        created_at: '',
      }
      destroy$ = new Subject<void>();
    Showloading: Observable<boolean> = this.wd.loading$

      constructor(private fb: FormBuilder,
      private api:ApiService, 
      private errorHandler:ErrorService,
      private wd: WorldDataService, private utils:UtilsService,
      @Inject(MAT_DIALOG_DATA) public data: { chapterId: string }
    ){

      const d = {
        id: '',
        resource_type: 'chapter',
        resource_id: data.chapterId
      }

      this.api.getDescription(d)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (desc) => {
          this.wd.setLoading(false)

          this.description = desc
          console.log(this.description)
        },
        error: (err) => this.errorHandler.errHandler(err)
      })
      
      this.timelines$
      .pipe(takeUntil(this.destroy$))
      .subscribe((tl) =>  this.tl = tl)
      this.worldForm = this.fb.group({
        name: ['', [Validators.required, Validators.minLength(3)]],
        description: ['', [Validators.required]],
        paper_id: ['', [Validators.required]],
        order: ['', [Validators.required]],
        timeline_id: ['', [Validators.required]],
        storyline_id: ['', [Validators.required]],
      });

      this.chapters$
      .pipe(takeUntil(this.destroy$))
      .subscribe((cpList) => {
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
    
    onDescriptionChange(value: string): void {
      this.description.description_data = value;
    }
    
    chapterBackgroundColor(pp:paper) {    
      return {
        'background-color': pp.color || this.utils.numberToHex(pp.id),
      }
    }
  


    papers$ = this.wd.papers$;
    timelines$ = this.wd.timelines$;
    storylines$ = this.wd.storylines$;
    chapters$ = this.wd.chapters$;
    world$ = this.wd.world$;
    range:number = 1


      ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
    onSubmit(){
      this.wd.setLoading(true)
    
      const body = this.worldForm.value
      body.world_id = this.worldId
      body.id = this.data.chapterId
      this.api.updateChapter(this.data.chapterId, this.worldForm.value)
      .pipe(takeUntil(this.destroy$))
      .subscribe(
        {
            next: (data) => {
              this.wd.setLoading(false)
              this.addNewChapter(data)
            },
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
      
  destroy$ = new Subject<void>();

  Showloading: Observable<boolean> = this.wd.loading$
  description:description

  constructor(private fb: FormBuilder,private api:ApiService, private wd: WorldDataService,
      @Inject(MAT_DIALOG_DATA) public data: Timeline,private errorHandler:ErrorService
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

    onDescriptionChange(value: string): void {
      this.description.description_data = value;
    }

    range:number = 1
    

      ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
      }
    onSubmit(){
      this.wd.setLoading(true)
    
      const body = {...this.data, ...this.worldForm.value, }
      this.api.updateTimeline(body)
      .pipe(takeUntil(this.destroy$))
      .subscribe(
        
        {
          next: (tl) => {
            this.wd.setLoading(false)

            
              this.wd.updateTimeline(tl)
            },
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

  destroy$ = new Subject<void>();

  Showloading: Observable<boolean> = this.wd.loading$
  
  constructor(private api:ApiService, private fb: FormBuilder,
      private errorHandler:ErrorService, private dialog:DialogService,private wd: WorldDataService,
      @Inject(MAT_DIALOG_DATA) public data: {timeline: Timeline, timelines: Timeline[], chapters: Chapter[]}
    ){
      this.worldForm = this.fb.group({
        confirm: [false, [Validators.required]],
      });
    }


    range:number = 1

      ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
    onSubmit(){
      this.wd.setLoading(true)

  
  if(this.worldForm.value.confirm){
    if(this.data.timelines.length > 1 ) {
      this.api.deleteTimeline(this.data.timeline.id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (results) => {
          this.wd.setLoading(false)

              const chaptersToUpdate = this.data.chapters.filter((c) => c.timeline_id == this.data.timeline.id)
              const nextTimeline = this.data.timelines.filter((t) => t.order == this.data.timeline.order +1 )[0]
              const prevTimeline = this.data.timelines.filter((t) => t.order == this.data.timeline.order -1 )[0] 
              const newTimeline = nextTimeline || prevTimeline

              chaptersToUpdate.map((e) => {
                if(!newTimeline){
      
                  e.storyline_id = ""
                  e.timeline_id = ""
                  return this.api.updateChapter(e.id, e)
                  .pipe(takeUntil(this.destroy$))
                  .subscribe({
                    next: (c) => {
                      this.wd.setLoading(false)
                      this.wd.updateChapter(c)},
                    error: (e) => this.errorHandler.errHandler(e)
                  })
                }else {
                  e.timeline_id = newTimeline.id
                  return this.api.updateChapter(e.id, e)
                  .pipe(takeUntil(this.destroy$))
                  .subscribe({
                    next: (c) => {
                      this.wd.setLoading(false)
                      this.wd.updateChapter(c)},
                    error: (e) => this.errorHandler.errHandler(e)
                  })
                  
                }
              })

              this.wd.removeTimeline(results.id)

              this.data.timelines.map((tl) => {
                if(tl.order > this.data.timeline.order) {
                  tl.order -= 1
                  return this.api.updateTimeline(tl)
                  .pipe(takeUntil(this.destroy$))
                  .subscribe({
                    next: (tl) => {
                      this.wd.setLoading(false)
                      this.wd.updateTimeline(tl)},
                    error: (e) => this.errorHandler.errHandler(e)
                  })
                }
                return undefined
                
              })
            },
            error: (err) =>this.errorHandler.errHandler(err)
          }
        )
      }else {
        const info :infoDialog= {
          status: 'warning',
          action: "Delete Timeline",
          message:"you must have at least one timeline",
          header: "fail to delete timeline"
        }
        this.dialog.openInfoDialog(info)
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
      
  destroy$ = new Subject<void>();

  Showloading: Observable<boolean> = this.wd.loading$
  
  constructor(private fb: FormBuilder,private api:ApiService,
       private wd: WorldDataService, private errorHandler:ErrorService,
    ){
      this.worldForm = this.fb.group({
        name: ['', [Validators.required, Validators.minLength(3)]],
        description: ['', [Validators.required]],
      });

   
    }
    ngOnDestroy(): void {
   this.destroy$.next();
   this.destroy$.complete();
 }
    onSubmit(){
      this.wd.setLoading(true)
    
      const body: Timeline= this.worldForm.value
      body.range = 20
      body.world_id = this.wd.worldId
      
      this.api.createTimeline(body)
      .pipe(takeUntil(this.destroy$))
      .subscribe(
        {
          next: (data) => {
              this.wd.setLoading(false)
              this.wd.addTimeline(data)
            },
            error: (err) =>this.errorHandler.errHandler(err)
          }
      )
    }
  }
  @Component({
    selector: 'app-subwaySettingsDialog',
    templateUrl: './subwaySettingsDialog.component.html',
    styleUrl: './dialog.component.scss'
  })
  export class SettingsDialogComponent  {
    worldForm: FormGroup;
    worldId:string | undefined= ''
      ss: Subway_Settings
  destroy$ = new Subject<void>();

  Showloading: Observable<boolean> = this.wd.loading$
  
  constructor(private fb: FormBuilder,private api:ApiService,
       private wd: WorldDataService, private errorHandler:ErrorService){

      this.wd.settings$
      .pipe(takeUntil(this.destroy$))
      .subscribe((ss) => {
        if(ss != null){
          this.ss = ss

        }
        this.worldForm = this.fb.group({
          chapter_names: [this.ss?.chapter_names, [Validators.required]],
          display_table_chapters: [this.ss?.display_table_chapters, [Validators.required]],
          storyline_update_chapter: [this.ss?.storyline_update_chapter, [Validators.required]],
          timeline_update_chapter: [this.ss?.timeline_update_chapter, [Validators.required]],
          group_connection_update_chapter: [this.ss?.group_connection_update_chapter, [Validators.required]],
        });
      })

   
    }
    ngOnDestroy(): void {
   this.destroy$.next();
   this.destroy$.complete();
 } 
    onSubmit(){
      this.wd.setLoading(true)
    
      const body = this.worldForm.value
      body.id = this.ss?.id
      this.api.updateSettings(body.id, body)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (ss) => {
          this.wd.setLoading(false)

          this.wd.setSettings(ss)
        },
        error: (e) => this.errorHandler.errHandler(e)
      })
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
      
      sl: StoryLine[]
  destroy$ = new Subject<void>();

  Showloading: Observable<boolean> = this.wd.loading$
  
  constructor(private fb: FormBuilder,private api:ApiService,
      private wd: WorldDataService, private errorHandler:ErrorService,
      @Inject(MAT_DIALOG_DATA) public data: { chapterId: string }
    ){

      this.worldForm = this.fb.group({
        name: ['', [Validators.required, Validators.minLength(3)]],
        description: ['', [Validators.required]],
      });

    }

      ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
    onSubmit(){
      this.wd.setLoading(true)
    
      const body = this.worldForm.value
      body.world_id = this.wd.worldId
      this.api.createStoryLine(this.worldForm.value)
      .pipe(takeUntil(this.destroy$))
      .subscribe(
        {
          next: (data) => {
              this.wd.setLoading(false)
              this.wd.addStoryline(data)
            }
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

      destroy$ = new Subject<void>();

    Showloading: Observable<boolean> = this.wd.loading$

      constructor(private fb: FormBuilder,private api:ApiService,
      private wd: WorldDataService, private errorHandler:ErrorService,
      @Inject(MAT_DIALOG_DATA) private data: string
    ){

      this.worldForm = this.fb.group({
        name: ['', [Validators.required, Validators.minLength(3)]],
        description: ['', [Validators.required]],
      });

      this.worldForm.value.range = 20
      this.worldForm.value.startRange = 0

    }


      ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
    onSubmit(){
      this.wd.setLoading(true)
    
      const body :Event= this.worldForm.value
      body.world_id =  this.data
      body.range = 20
      body.startRange = 0
      this.api.createEvent(body)
      .pipe(takeUntil(this.destroy$))
      .subscribe(
        
        {
          next: (data) => {
              this.wd.setLoading(false)
              this.addEvent(data)
            },
            error: (err) =>this.errorHandler.errHandler(err)
          }
      )
    }
    addEvent(event: Event){
        this.wd.addEvent(event)
    }


  }


  @Component({
    selector: 'app-updatePaperDialog',
    templateUrl: './updatePaperDialog.component.html',
    styleUrl: './dialog.component.scss'
  })
  export class UpdatePaperDialogComponent  {
    worldForm: FormGroup;
      destroy$ = new Subject<void>();
worldId:string | undefined= ''
Showloading: Observable<boolean> = this.wd.loading$
    
constructor(private fb: FormBuilder,private api:ApiService, private wd: WorldDataService,
      private utils:UtilsService,private errorHandler:ErrorService,
      @Inject(MAT_DIALOG_DATA) public data: { papperId: string }
    ){
      this.worldForm = this.fb.group({
        name: ['', [Validators.required, Validators.minLength(3)]],
        description: ['', [Validators.required]],
        order: ['', [Validators.required]],
        color: ['', [Validators.required]],
      });

      console.log(this.data)
      this.api.getPaperData(this.data.papperId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (paper) => {
          this.wd.setLoading(false)

          this.worldId = paper.world_id
          this.worldForm.patchValue({
            name: paper.name,
            description: paper.description,
            order: paper.order,
            color: paper.color,
          });
        },
        error: (e) => this.errorHandler.errHandler(e)
      })

    }

    papers$ = this.wd.papers$;
    chapters$ = this.wd.chapters$;

    chapterBackgroundColor() {    
      return {
        'background-color': this.worldForm.value.color || this.utils.numberToHex(this.data.papperId),
      }
   
    }
    ngOnDestroy(): void {
   this.destroy$.next();
   this.destroy$.complete();
 }
    onSubmit(){
      this.wd.setLoading(true)
    
      const body = this.worldForm.value
      body.world_id = this.worldId
      body.id = this.data.papperId
      body.color = this.worldForm.value.color
      console.log(this.worldForm.value.color)
      this.api.updatePaper(this.data.papperId, this.worldForm.value)
      .pipe(takeUntil(this.destroy$))
      .subscribe(
        
        {
            next: (data) => {
              this.wd.setLoading(false)
              this.wd.updatePaper(data)
            },
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
      destroy$ = new Subject<void>();
  
    Showloading: Observable<boolean> = this.wd.loading$

      constructor(private fb: FormBuilder,private api:ApiService,
      @Inject(MAT_DIALOG_DATA) public data: Event, private errorHandler:ErrorService,private wd: WorldDataService
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


      ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
    onSubmit(){
      this.wd.setLoading(true)
    
      const event:Event = this.data
      event.name = this.worldForm.value.name
      event.description = this.worldForm.value.description
      this.api.updateEvent(event)
      .pipe(takeUntil(this.destroy$))
      .subscribe(
        
        {
            next: (data) => {
              this.wd.setLoading(false)
              this.wd.updateEvent(data)}
              ,
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
      destroy$ = new Subject<void>();
description:description
Showloading: Observable<boolean> = this.wd.loading$
    
constructor(private fb: FormBuilder,
       private api: ApiService,
      private wd: WorldDataService,
      private dialog: DialogService,
      private errorHandler: ErrorService,
      ) {
      this.worldForm = this.fb.group({
        name: ['', [Validators.required]],
      });
      this.description = {
        id: '',
        resource_type: 'world',
      }
    }
    
  onDescriptionChange(value: string): void {
    this.description.description_data = value;
  }


    onSubmit() {
      this.wd.setLoading(true)
      const body = this.worldForm.value
      const desc:string =this.description.description_data??"" 
      body.description = desc
      
      this.api.Createworld(body)
      .pipe(takeUntil(this.destroy$))
      .subscribe(      {
        next: (w:createWorld) => {
          const info :infoDialog= {...w}
          this.dialog.openInfoDialog(info)
          this.wd.setLoading(false)
          setTimeout(() => {
            const url = `/world/${w.world.id}}`;
            window.open(url, '_blank');
          }, 2000);
        },
        error: (err) =>this.errorHandler.errHandler(err)
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

      destroy$ = new Subject<void>();
description:description
Showloading: Observable<boolean> = this.wd.loading$
    
constructor(@Inject(MAT_DIALOG_DATA) public data: Chapter, private api:ApiService, private errorHandler:ErrorService,
private wd: WorldDataService ){
      this.description = {
        id: '',
        resource_type: 'chapter',
        resource_id: data.id
      }
  }

  onDescriptionChange(value: string): void {
    this.description.description_data = value;
  }

  updateDescription(){
    this.api.updateDescription(this.description)
    .pipe(takeUntil(this.destroy$))
      .subscribe({
      next: (d) => {
        this.wd.setLoading(false)
        this.description = d
      },
      error: (e) => this.errorHandler.errHandler(e)
    })
  }

  }
  @Component({
    selector: 'app-updateConnectionDialog',
    templateUrl: './updateConnectionDialog.component.html',
    styleUrl: './dialog.component.scss'
  })
  export class updateConnectionDialogComponent {
    worldForm: FormGroup;
    gc:GroupConnection[]
  destroy$ = new Subject<void>();

  Showloading: Observable<boolean> = this.wd.loading$
  
  constructor(
      private fb: FormBuilder,private api:ApiService, private wd: WorldDataService, private utils:UtilsService,
      private errorHandler :ErrorService,
      @Inject(MAT_DIALOG_DATA) public cnn: Connection ){
        this.wd.groupConnection$
        .pipe(takeUntil(this.destroy$))
        .subscribe((c) => this.gc = c)
        
        this.worldForm = this.fb.group({
          groupConnection: ['', [Validators.required, Validators.minLength(3)]],
      });

        this.worldForm.patchValue({
          groupConnection: this.cnn.group_id
        });

     }

       ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
     onSubmit(){
      this.wd.setLoading(true)
      
      const body:GroupConnection = this.worldForm.value
      body.world_id = this.wd.worldId
      // this.cnn.group_id = 
      body.color =  this.utils.numberToHex(this.cnn.id)

      this.cnn.group_id = this.worldForm.value.groupConnection

      this.api.updateConnection(this.cnn)
      .pipe(takeUntil(this.destroy$))
      .subscribe(
        {
            next: (gcs) => {
              this.wd.setLoading(false)
              this.wd.updateConnection(gcs)},
            error: (err) =>this.errorHandler.errHandler(err)
          }
      )
    }
    
  }
  @Component({
    selector: 'app-createGroupConnectionDialog',
    templateUrl: './createGroupConnectionDialog.component.html',
    styleUrl: './dialog.component.scss'
  })
  export class createGroupConnectionDialogComponent {
    worldForm: FormGroup;
    gc:GroupConnection

      destroy$ = new Subject<void>();
errorHandler:any
Showloading: Observable<boolean> = this.wd.loading$
    
constructor(
      private fb: FormBuilder,private api:ApiService, private wd: WorldDataService, private utils:UtilsService,
      
      ){
        
        this.worldForm = this.fb.group({
          name: ['', [Validators.required, Validators.minLength(3)]],
          description: ['', [Validators.required, Validators.minLength(3)]],
      });

     }

       ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
     onSubmit(){
      this.wd.setLoading(true)
      
      const body:GroupConnection = this.worldForm.value
      body.world_id = this.wd.worldId
      body.color = 'red'
      // this.cnn.group_id = 


      this.api.createGroupConnection(body)
      .pipe(takeUntil(this.destroy$))
      .subscribe(
        {
            next: (gc) => {
              this.wd.addGroupConnection(gc)
              this.wd.setLoading(false)

            },
            error: (err) =>this.errorHandler.errHandler(err)
          }
      )
    }
    
  }
  @Component({
    selector: 'app-updateGroupConnection',
    templateUrl: './updateGroupConnectionDialog.component.html',
    styleUrl: './dialog.component.scss'
  })
  export class updateGroupConnectionDialogComponent {
    worldForm: FormGroup;

      destroy$ = new Subject<void>();
errorHandler:any
Showloading: Observable<boolean> = this.wd.loading$
    
constructor(
      private fb: FormBuilder,private api:ApiService, private wd: WorldDataService, private utils:UtilsService,
      @Inject(MAT_DIALOG_DATA) public data: GroupConnection
  
    ){
        
        this.worldForm = this.fb.group({
          name: ['', [Validators.required, Validators.minLength(3)]],
          description: ['', [Validators.required, Validators.minLength(3)]],
          color: ['', [Validators.required, Validators.minLength(3)]],
      });

      console.log(data.color)
      this.worldForm.patchValue({
        name: data.name,
        description: data.description,
        color: data.color, // Define um valor inicial para o input de cor
      });

     }

     chapterBackgroundColor(color:string) {    
      return {
        'background-color': color
      }
      }

        ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
     onSubmit(){
      this.wd.setLoading(true)
      
      const body:GroupConnection = { ...this.data,...this.worldForm.value}
      // this.cnn.group_id = 

      console.log(body)

      this.api.updateGroupConnection(body)
      .pipe(takeUntil(this.destroy$))
      .subscribe(
        {
            next: (gc) => {
              this.wd.setLoading(false)
              this.wd.updateGroupConnection(gc)},
            error: (err) =>this.errorHandler.errHandler(err)
          }
      )
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
      
  destroy$ = new Subject<void>();

  Showloading: Observable<boolean> = this.wd.loading$
  
  constructor(private fb: FormBuilder,private api:ApiService,
      @Inject(MAT_DIALOG_DATA) public data: StoryLine,private errorHandler:ErrorService,private wd: WorldDataService
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

    

      ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
    onSubmit(){
      this.wd.setLoading(true)
    
      const body = {...this.data, ...this.worldForm.value, }
      body.world_id = this.wd.worldId
      this.api.updateStoryLine(body)
      .pipe(takeUntil(this.destroy$))
      .subscribe(
        
        {
            next: (str) => {
              this.wd.setLoading(false)
              this.wd.updateStoryline(str)},
            error: (err) =>this.errorHandler.errHandler(err)
          }
      )
    }





  }
  

  
  @Component({
    selector: 'app-infoDialog',
    templateUrl: './infoDialog.component.html',
    styleUrl: './dialog.component.scss'
  })
  export class InfoDialogComponent  {

    icon:string
      destroy$ = new Subject<void>();
color:string
Showloading: Observable<boolean> = this.wd.loading$
    
constructor( @Inject(MAT_DIALOG_DATA) public data: infoDialog,private wd: WorldDataService
    ){

      console.log(data)
      if(data.status == 'error'){
        this.icon = "crisis_alert"
        this.color = "red"

      }else if (data.status == 'success'){
        this.icon = "task_alt"
        this.color = "green"

      }else if (data.status == 'warning'){
        this.icon = "warning"
        this.color = "orange"

      }

    }
  }
  

