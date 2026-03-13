import { Component, DestroyRef, OnInit, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../core/auth/auth.service';
import { ThemeService } from '../../core/theme.service';
import { ReadingPreferencesWizardComponent, ReadingPrefs, LANGUAGES, LENGTHS, MATURITY } from '../reading-preferences-wizard/reading-preferences-wizard.component';

export interface ProfileDetails {
  id?: string;
  name?: string;
  email?: string;
  source?: 'google' | 'meta' | 'email';
  onboarding_complete: boolean;
  profile_complete: boolean;
  created_at?: string;
  [key: string]: any;
}

export interface SessionItem {
  ID: string;
  Device: string;
  CreatedAt: string;
  ExpiresAt: string;
}

export interface ReadingPrefsResponse {
  configured: boolean;
  favorite_genres: string[];
  favorite_authors: { id: string; name: string; birth_year?: number; death_year?: number }[];
  preferred_lengths: string[];
  preferred_maturity: string[];
  preferred_languages: string[];
  updated_at?: string;
}

export interface PurchaseItem {
  id: string;
  paper_name: string;
  cover_url?: string;
  amount: number;
  currency: string;
  purchased_at: string;
  type: 'book' | 'universe';
}

const GENRE_SLUG_MAP: Record<string, string> = {
  'fantasy': 'Fantasy', 'sci-fi': 'Sci-Fi', 'romance': 'Romance',
  'mystery': 'Mystery', 'thriller': 'Thriller', 'horror': 'Horror',
  'historical': 'Historical', 'adventure': 'Adventure', 'biography': 'Biography',
  'self-help': 'Self-Help', 'literary-fiction': 'Literary Fiction',
  'young-adult': 'Young Adult', 'children': 'Children', 'poetry': 'Poetry',
  'graphic-novel': 'Graphic Novel',
};

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, ReadingPreferencesWizardComponent],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.scss'
})
export class ProfileComponent implements OnInit {
  readonly auth    = inject(AuthService);
  readonly theme   = inject(ThemeService);
  private destroyRef = inject(DestroyRef);

  isDark = this.theme.isDark;

  readonly languageMap: Record<string, string | undefined>                          = Object.fromEntries(LANGUAGES.map(l => [l.code, l.label]));
  readonly lengthMap:   Record<string, { label: string; icon: string } | undefined> = Object.fromEntries(LENGTHS.map(l => [l.value, { label: l.label, icon: l.icon }]));
  readonly maturityMap: Record<string, { label: string; icon: string } | undefined> = Object.fromEntries(MATURITY.map(m => [m.value, { label: m.label, icon: m.icon }]));

  // Profile data
  profile: ProfileDetails | null = null;
  profileLoading = true;
  profileError = false;

  // Reading preferences
  prefs: ReadingPrefsResponse | null = null;
  prefsLoading = true;
  prefsError = false;
  showPrefsModal = false;
  prefsForWizard: ReadingPrefs | null = null;

  // Personal info editing
  editingInfo = false;
  editName = '';
  savingInfo = false;
  infoError: string | null = null;
  infoSuccess = false;

  // Purchase history
  purchases: PurchaseItem[] = [];
  purchasesLoading = true;
  purchasesError = false;

  // Sessions
  sessions: SessionItem[] = [];
  sessionsLoading = true;
  sessionsError = false;
  revokingSessionId: string | null = null;
  currentSessionId = this.auth.getSessionId();

  ngOnInit(): void {
    this.theme.isDark$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(dark => { this.isDark = dark; });

    this.loadProfile();
    this.loadPrefs();
    this.loadPurchases();
    this.loadSessions();
  }

  private loadProfile(): void {
    this.auth.getProfileDetails().subscribe({
      next: data => { this.profile = data; this.profileLoading = false; },
      error: () => { this.profileLoading = false; this.profileError = true; }
    });
  }

  loadPrefs(): void {
    this.prefsLoading = true;
    this.prefsError   = false;
    this.auth.getReadingPreferences().subscribe({
      next: data => { this.prefs = data; this.prefsLoading = false; },
      error: () => { this.prefsLoading = false; this.prefsError = true; }
    });
  }

  private loadPurchases(): void {
    // Purchase history endpoint — placeholder for when the API is available
    // this.storeService.getPurchaseHistory().subscribe(...)
    this.purchasesLoading = false;
  }

  loadSessions(): void {
    this.sessionsLoading = true;
    this.sessionsError   = false;
    this.auth.getSessions().subscribe({
      next: data => { this.sessions = data; this.sessionsLoading = false; },
      error: ()   => { this.sessionsLoading = false; this.sessionsError = true; }
    });
  }

  revokeSession(sessionId: string): void {
    this.revokingSessionId = sessionId;
    this.auth.revokeSession(sessionId).subscribe({
      next: () => {
        this.sessions = this.sessions.filter(s => s.ID !== sessionId);
        this.revokingSessionId = null;
      },
      error: () => { this.revokingSessionId = null; }
    });
  }

  parseDevice(ua: string): string {
    if (/iPhone|iPad|iPod/i.test(ua)) return 'iOS';
    if (/Android/i.test(ua)) return 'Android';
    if (/Windows/i.test(ua)) return 'Windows';
    if (/Mac OS X/i.test(ua)) return 'macOS';
    if (/Linux/i.test(ua)) return 'Linux';
    return ua.length > 40 ? ua.slice(0, 40) + '…' : ua;
  }

  parseBrowser(ua: string): string {
    if (/Edg\//i.test(ua)) return 'Edge';
    if (/OPR\//i.test(ua)) return 'Opera';
    if (/Chrome\//i.test(ua)) return 'Chrome';
    if (/Safari\//i.test(ua) && !/Chrome/i.test(ua)) return 'Safari';
    if (/Firefox\//i.test(ua)) return 'Firefox';
    return 'Browser';
  }

  // ── Personal info ──────────────────────────────────────────────────────────
  startEditInfo(): void {
    this.editName    = this.profile?.name ?? '';
    this.editingInfo = true;
    this.infoError   = null;
    this.infoSuccess = false;
  }

  cancelEditInfo(): void { this.editingInfo = false; this.infoError = null; }

  saveInfo(): void {
    // Will call PUT /logged/profile once the endpoint is available
    this.savingInfo = true;
    this.infoError  = null;
    setTimeout(() => {
      if (this.profile) this.profile = { ...this.profile, name: this.editName };
      this.savingInfo  = false;
      this.editingInfo = false;
      this.infoSuccess = true;
      setTimeout(() => { this.infoSuccess = false; }, 3000);
    }, 600);
  }

  // ── Reading preferences modal ──────────────────────────────────────────────
  openPrefsModal(): void {
    if (this.prefs) {
      this.prefsForWizard = {
        favorite_genres:     this.prefs.favorite_genres,
        favorite_author_ids: this.prefs.favorite_authors.map(a => a.id),
        favorite_authors:    this.prefs.favorite_authors,
        preferred_lengths:   this.prefs.preferred_lengths,
        preferred_maturity:  this.prefs.preferred_maturity,
        preferred_languages: this.prefs.preferred_languages,
      };
    } else {
      this.prefsForWizard = null;
    }
    this.showPrefsModal = true;
  }

  closePrefsModal(): void { this.showPrefsModal = false; }

  onPrefsSaved(): void {
    this.showPrefsModal = false;
    this.prefsLoading   = true;
    this.loadPrefs();
  }

  // ── Helpers ───────────────────────────────────────────────────────────────
  genreLabel(slug: string): string {
    return GENRE_SLUG_MAP[slug] ?? slug;
  }

  get initials(): string {
    const name = this.profile?.name ?? this.profile?.email ?? '?';
    return name.split(' ').slice(0, 2).map((w: string) => w[0]).join('').toUpperCase();
  }

  get memberSince(): string {
    const raw = this.profile?.created_at;
    if (!raw) return '';
    return new Date(raw).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  }

  formatDate(iso: string): string {
    return new Date(iso).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' });
  }

  formatCurrency(amount: number, currency: string): string {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(amount / 100);
  }
}
