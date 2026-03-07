import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { WorldDataService } from '../../features/dashboard/world-data.service';
import { Subway_Settings } from '../../models/paperTrailTypes';
import { Observable, Subject, takeUntil } from 'rxjs';
import { ApiService } from '../../core/api.service';
import { ErrorService } from '../../core/error.service';

@Component({
  standalone: false,
  selector: 'app-subwaySettingsDialog',
  templateUrl: './subwaySettingsDialog.component.html',
  styleUrl: './dialog.component.scss'
})
export class SettingsDialogComponent {
  worldForm: FormGroup;
  worldId: string | undefined = '';
  ss: Subway_Settings;
  destroy$ = new Subject<void>();
  Showloading: Observable<boolean> = this.wd.loading$;

  constructor(
    private fb: FormBuilder,
    private api: ApiService,
    private wd: WorldDataService,
    private errorHandler: ErrorService
  ) {
    this.wd.settings$.pipe(takeUntil(this.destroy$)).subscribe((ss) => {
      if (ss != null) { this.ss = ss; }
      this.worldForm = this.fb.group({
        chapter_names: [this.ss?.chapter_names, [Validators.required]],
        display_table_chapters: [this.ss?.display_table_chapters, [Validators.required]],
        storyline_update_chapter: [this.ss?.storyline_update_chapter, [Validators.required]],
        timeline_update_chapter: [this.ss?.timeline_update_chapter, [Validators.required]],
        group_connection_update_chapter: [this.ss?.group_connection_update_chapter, [Validators.required]],
      });
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  onSubmit() {
    this.wd.setLoading(true);
    const body: Subway_Settings = { ...this.ss, ...this.worldForm.value };
    this.api.updateSettings(body.id, body)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (ss) => {
          this.wd.setLoading(false);
          this.wd.setSettings(ss);
        },
        error: (e) => this.errorHandler.errHandler(e)
      });
  }
}
