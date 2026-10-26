import { Component, OnInit, inject, signal, OnDestroy } from '@angular/core';
import { CommonModule, NgOptimizedImage } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { toObservable } from '@angular/core/rxjs-interop';
import { Subscription } from 'rxjs';
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
  imports: [CommonModule, FormsModule, NgOptimizedImage],
  templateUrl: './sports.html',
  styleUrl: './sports.scss',
})
export class SportsComponent implements OnInit, OnDestroy {
  protected sportsService = inject(SportsService);
  protected searchService = inject(SearchService);

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

  ngOnInit(): void {
    this.sportsService.getSports().subscribe({
      error: (e: any) => console.error('Errore getSports:', e),
    });

    this.searchSub = toObservable(this.searchService.searchTerm)
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
    // Regex per verificare http/https evitando l'avviso 'HTTP links are not secure'
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

    const resolvedIcon = this.formIconUrl.trim() || this.getSportEmoji(this.formName);

    const payload = {
      name: this.formName.trim(),
      description: this.formDescription.trim() || undefined,
      iconUrl: resolvedIcon,
    };

    if (this.isEditing() && this.currentEditingId()) {
      this.sportsService.updateSport(this.currentEditingId()!, payload).subscribe({
        next: () => {
          this.formSubmitting.set(false);
          this.closeModal();
        },
        error: (err: any) => {
          this.formSubmitting.set(false);
          this.formError.set(err?.error?.message || 'Error updating sport.');
        },
      });
    } else {
      this.sportsService.createSport(payload).subscribe({
        next: () => {
          this.formSubmitting.set(false);
          this.closeModal();
        },
        error: (err: any) => {
          this.formSubmitting.set(false);
          this.formError.set(err?.error?.message || 'Error creating sport.');
        },
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
