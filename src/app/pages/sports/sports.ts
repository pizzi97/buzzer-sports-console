import { Component, OnInit, inject, signal, OnDestroy, Injector, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject, Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { SportsService, Sport } from '../../core/services/sports.service';
import { SearchService } from '../../core/services/search.service';

const SPORT_EMOJIS: Record<string, string> = {
  football: '⚽',
  soccer: '⚽',
  calcio: '⚽',
  basketball: '🏀',
  basket: '🏀',
  baseball: '⚾',
  tennis: '🎾',
  padel: '🎾',
  padell: '🎾',
  boxing: '🥊',
  boxe: '🥊',
  mma: '🥊',
  cricket: '🏏',
  hockey: '🏒',
  golf: '⛳',
  volleyball: '🏐',
  pallavolo: '🏐',
  rugby: '🏉',
  swimming: '🏊',
  nuoto: '🏊',
  bow: '🏹',
  archery: '🏹',
  'table tennis': '🏓',
  pingpong: '🏓',
  badminton: '🏸',
  snowboard: '🏂',
  snowboarding: '🏂',
  ski: '🎿',
  gymnastics: '🤸',
  cycling: '🚴',
  running: '🏃',
};

@Component({
  selector: 'app-sports',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './sports.html',
  styleUrl: './sports.scss',
})
export class SportsComponent implements OnInit, OnDestroy {
  protected sportsService = inject(SportsService);
  protected searchService = inject(SearchService);

  private searchSubject = new Subject<string>();
  private searchSub?: Subscription;

  failedImages = signal<Set<string>>(new Set<string>());

  isModalOpen = signal<boolean>(false);
  isEditing = signal<boolean>(false);
  currentEditingId = signal<string | null>(null);

  formName = '';
  formDescription = '';
  formIconUrl = '';
  formError = signal<string | null>(null);
  formSubmitting = signal<boolean>(false);

  deleteModalSport = signal<Sport | null>(null);

  constructor() {
    // Si aggancia al segnale dell'header senza violare l'injection context
    effect(() => {
      const term = this.searchService.searchTerm();
      this.searchSubject.next(term);
    });
  }

  ngOnInit(): void {
    this.sportsService.getSports().subscribe({
      error: (e: any) => console.error('Errore getSports:', e),
    });

    this.searchSub = this.searchSubject
      .pipe(debounceTime(300), distinctUntilChanged())
      .subscribe((term) => {
        this.sportsService.getSports(term).subscribe();
      });
  }

  ngOnDestroy(): void {
    this.searchSub?.unsubscribe();
  }

  getSportEmoji(name: string): string {
    if (!name) return '🏅';
    const clean = name.toLowerCase().trim();
    for (const [key, emoji] of Object.entries(SPORT_EMOJIS)) {
      if (clean.includes(key)) {
        return emoji;
      }
    }
    return '🏅';
  }

  onNameInput(): void {
    if (!this.formIconUrl || !this.isImageUrl(this.formIconUrl)) {
      const match = this.getSportEmoji(this.formName);
      if (match !== '🏅') {
        this.formIconUrl = match;
      }
    }
  }

  isImageUrl(val?: string): boolean {
    if (!val) return false;
    return /^https?:\/\//i.test(val.trim());
  }

  onImageError(sportId: string): void {
    this.failedImages.update((set) => {
      const next = new Set(set);
      next.add(sportId);
      return next;
    });
  }

  openAddModal(): void {
    this.isEditing.set(false);
    this.currentEditingId.set(null);
    this.formName = '';
    this.formDescription = '';
    this.formIconUrl = '';
    this.formError.set(null);
    this.isModalOpen.set(true);
  }

  openEditModal(sport: Sport): void {
    this.isEditing.set(true);
    this.currentEditingId.set(sport.id);
    this.formName = sport.name;
    this.formDescription = sport.description || '';
    this.formIconUrl = sport.iconUrl || '';
    this.formError.set(null);
    this.isModalOpen.set(true);
  }

  closeModal(): void {
    this.isModalOpen.set(false);
  }

  saveSport(): void {
    if (!this.formName.trim()) {
      this.formError.set('Name is required.');
      return;
    }

    this.formSubmitting.set(true);
    this.formError.set(null);

    // Invia iconUrl SOLO se è un vero URL web http/https valido
    const trimmedIcon = this.formIconUrl.trim();
    const hasValidHttpUrl = /^https?:\/\/.+/i.test(trimmedIcon);

    const payload: { name: string; description?: string; iconUrl?: string } = {
      name: this.formName.trim(),
    };

    if (this.formDescription.trim()) {
      payload.description = this.formDescription.trim();
    }

    // Se non è un URL valido (es. emoji o vuoto), non inviare la proprietà
    if (hasValidHttpUrl) {
      payload.iconUrl = trimmedIcon;
    }

    const handleBackendError = (err: any) => {
      this.formSubmitting.set(false);

      // Estrae i dettagli di validazione annidati (es. details.iconUrl)
      const validationDetails = err?.error?.error?.details;
      if (validationDetails) {
        const messages = Object.entries(validationDetails)
          .map(([field, msgs]) => `${field}: ${(msgs as string[]).join(', ')}`)
          .join(' | ');
        this.formError.set(messages);
        return;
      }

      if (err?.status === 409) {
        this.formError.set('A sport with this name already exists.');
        return;
      }

      const fallbackMsg =
        err?.error?.error?.message || err?.error?.message || 'Error saving sport.';
      this.formError.set(fallbackMsg);
    };

    if (this.isEditing() && this.currentEditingId()) {
      this.sportsService.updateSport(this.currentEditingId()!, payload).subscribe({
        next: () => {
          this.formSubmitting.set(false);
          this.closeModal();
        },
        error: handleBackendError,
      });
    } else {
      this.sportsService.createSport(payload).subscribe({
        next: () => {
          this.formSubmitting.set(false);
          this.closeModal();
        },
        error: handleBackendError,
      });
    }
  }
  promptDelete(sport: Sport): void {
    this.deleteModalSport.set(sport);
  }

  cancelDelete(): void {
    this.deleteModalSport.set(null);
  }

  confirmDelete(): void {
    const sport = this.deleteModalSport();
    if (!sport) return;

    this.sportsService.deleteSport(sport.id).subscribe({
      next: () => this.cancelDelete(),
      error: () => this.cancelDelete(),
    });
  }
}

export { SportsComponent as Sports };
