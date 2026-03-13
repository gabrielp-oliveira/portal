import { Component, EventEmitter, Input, OnDestroy, OnInit, Output, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject, debounceTime, distinctUntilChanged, of, switchMap } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { AuthService } from '../../core/auth/auth.service';
import { environment } from '../../../environments/environment';

export const GENRES = [
  'Fantasy', 'Sci-Fi', 'Romance', 'Mystery', 'Thriller',
  'Horror', 'Historical', 'Adventure', 'Biography', 'Self-Help',
  'Literary Fiction', 'Young Adult', 'Children', 'Poetry', 'Graphic Novel'
];

export const LANGUAGES = [
  { code: 'pt', label: 'Português', flag: '🇧🇷' },
  { code: 'en', label: 'English',   flag: '🇺🇸' },
  { code: 'es', label: 'Español',   flag: '🇪🇸' },
  { code: 'fr', label: 'Français',  flag: '🇫🇷' },
  { code: 'de', label: 'Deutsch',   flag: '🇩🇪' },
];

export const LENGTHS = [
  { value: 'short',  label: 'Short',  desc: '< 200 pages',  icon: '📖' },
  { value: 'medium', label: 'Medium', desc: '200–400 pages', icon: '📚' },
  { value: 'long',   label: 'Long',   desc: '400+ pages',    icon: '📦' },
];

export const MATURITY = [
  { value: 'everyone', label: 'Everyone', desc: 'All ages',    icon: '🌟' },
  { value: 'teen',     label: 'Teen',     desc: '13+',         icon: '🎯' },
  { value: 'mature',   label: 'Mature',   desc: 'Adults only', icon: '🔒' },
];

export type Author = { id: string; name: string; birth_year?: number; death_year?: number };

export interface ReadingPrefs {
  favorite_genres:     string[];
  favorite_author_ids: string[];
  favorite_authors?:   Author[];
  preferred_lengths:   string[];
  preferred_maturity:  string[];
  preferred_languages: string[];
}

@Component({
  selector: 'app-reading-preferences-wizard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './reading-preferences-wizard.component.html',
  styleUrl: './reading-preferences-wizard.component.scss'
})
export class ReadingPreferencesWizardComponent implements OnInit, OnDestroy {
  private http     = inject(HttpClient);
  private auth     = inject(AuthService);
  private destroy$ = new Subject<void>();
  private readonly AUTH_BASE = environment.authUrl;

  /** 'page' = onboarding full-screen, 'modal' = dialog from profile */
  @Input() mode: 'page' | 'modal' = 'page';
  /** Pre-populate with existing preferences */
  @Input() initialPrefs: ReadingPrefs | null = null;
  /** Emitted after successful save */
  @Output() saved      = new EventEmitter<void>();
  /** Emitted when modal is dismissed without saving */
  @Output() cancelled  = new EventEmitter<void>();
  /** Emitted when user clicks "Skip setup" (only in page mode) */
  @Output() skipped    = new EventEmitter<void>();

  readonly genres    = GENRES;
  readonly languages = LANGUAGES;
  readonly lengths   = LENGTHS;
  readonly maturity  = MATURITY;

  step = 1;
  readonly totalSteps = 3;

  selectedGenres:    Set<string> = new Set();
  selectedLengths:   Set<string> = new Set();
  selectedMaturity:  Set<string> = new Set();
  selectedLanguages: Set<string> = new Set();
  selectedAuthors:   Author[]    = [];

  authorSearch    = '';
  authorResults:  Author[] = [];
  authorSearching = false;
  private authorSearch$ = new Subject<string>();

  loading      = false;
  errorMessage: string | null = null;

  ngOnInit(): void {
    if (this.initialPrefs) {
      this.populateFromPrefs(this.initialPrefs);
    } else {
      const browserLang = navigator.language?.slice(0, 2) ?? 'en';
      const match = LANGUAGES.find(l => l.code === browserLang);
      if (match) this.selectedLanguages.add(match.code);
    }

    this.authorSearch$
      .pipe(
        debounceTime(350),
        distinctUntilChanged(),
        switchMap(q => {
          if (q.trim().length < 2) {
            this.authorResults = []; this.authorSearching = false; return of(null);
          }
          this.authorSearching = true;
          return this.auth.getAuthors(q);
        }),
        takeUntil(this.destroy$)
      )
      .subscribe({
        next: res => {
          this.authorSearching = false;
          if (res) {
            const selectedIds = new Set(this.selectedAuthors.map(a => a.id));
            this.authorResults = (res.authors ?? []).filter(a => !selectedIds.has(a.id));
          }
        },
        error: () => { this.authorSearching = false; }
      });
  }

  ngOnDestroy(): void { this.destroy$.next(); this.destroy$.complete(); }

  private populateFromPrefs(prefs: ReadingPrefs): void {
    // Genres come as slugs (e.g. 'sci-fi'), convert back to display label
    const genreSlugToLabel: Record<string, string> = {};
    GENRES.forEach(g => { genreSlugToLabel[g.toLowerCase().replace(/ /g, '-')] = g; });
    prefs.favorite_genres.forEach(slug => {
      const label = genreSlugToLabel[slug] ?? slug;
      this.selectedGenres.add(label);
    });
    prefs.preferred_lengths.forEach(l => this.selectedLengths.add(l));
    prefs.preferred_maturity.forEach(m => this.selectedMaturity.add(m));
    prefs.preferred_languages.forEach(l => this.selectedLanguages.add(l));
    // Authors may come as full objects (from GET) or just IDs
    if (prefs.favorite_authors?.length) {
      this.selectedAuthors = [...prefs.favorite_authors];
    }
  }

  next(): void { this.errorMessage = null; if (this.step < this.totalSteps) this.step++; }
  back(): void { this.errorMessage = null; if (this.step > 1) this.step--; }

  toggle(set: Set<string>, value: string): void {
    set.has(value) ? set.delete(value) : set.add(value);
  }
  isSelected(set: Set<string>, value: string): boolean { return set.has(value); }

  onAuthorInput(): void { this.authorSearch$.next(this.authorSearch); }

  addAuthor(author: Author): void {
    if (!this.selectedAuthors.find(a => a.id === author.id)) {
      this.selectedAuthors = [...this.selectedAuthors, author];
    }
    this.authorResults = this.authorResults.filter(a => a.id !== author.id);
    this.authorSearch  = '';
  }

  removeAuthor(id: string): void {
    this.selectedAuthors = this.selectedAuthors.filter(a => a.id !== id);
  }

  save(): void {
    if (this.selectedLanguages.size === 0) {
      this.errorMessage = 'Please select at least one language.';
      return;
    }
    this.loading = true;
    this.errorMessage = null;

    const body = {
      favorite_genres:     Array.from(this.selectedGenres).map(g => g.toLowerCase().replace(/ /g, '-')),
      favorite_author_ids: this.selectedAuthors.map(a => a.id),
      preferred_lengths:   Array.from(this.selectedLengths),
      preferred_maturity:  Array.from(this.selectedMaturity),
      preferred_languages: Array.from(this.selectedLanguages),
    };

    this.http.put(`${this.AUTH_BASE}/logged/profile/reading-preferences`, body).subscribe({
      next: () => { this.loading = false; this.saved.emit(); },
      error: err => {
        this.loading = false;
        this.errorMessage = err.error?.error ?? 'Something went wrong. Please try again.';
      }
    });
  }

  skip(): void {
    this.loading = true;
    this.http.post(`${this.AUTH_BASE}/logged/profile/reading-preferences/skip`, {}).subscribe({
      next:  () => { this.loading = false; this.skipped.emit(); },
      error: () => { this.loading = false; this.skipped.emit(); }
    });
  }

  get progressPct(): number { return Math.round((this.step / this.totalSteps) * 100); }
}
