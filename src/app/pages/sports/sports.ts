import { Component, OnInit, inject, signal, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { toObservable } from '@angular/core/rxjs-interop';
import { Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { SportsService, Sport } from '../../core/services/sports.service';
import { SearchService } from '../../core/services/search.service';

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

  private searchSub?: Subscription;

  // Set per gestire gli URL delle icone che falliscono il caricamento
  failedImages = signal<Set<string>>(new Set<string>());

  // Modale Aggiungi / Modifica
  isModalOpen = signal<boolean>(false);
  isEditing = signal<boolean>(false);
  currentEditingId = signal<string | null>(null);

  formName = '';
  formDescription = '';
  formIconUrl = '';
  formError = signal<string | null>(null);
  formSubmitting = signal<boolean>(false);

  // Modale Conferma Cancellazione
  deleteModalSport = signal<Sport | null>(null);

  ngOnInit(): void {
    // Caricamento iniziale del catalogo dal server
    this.sportsService.getSports().subscribe({
      error: (e: any) => console.error('Errore getSports:', e),
    });

    // Ricerca live server-side con debounce di 300ms
    this.searchSub = toObservable(this.searchService.searchTerm)
      .pipe(debounceTime(300), distinctUntilChanged())
      .subscribe((term) => {
        this.sportsService.getSports(term).subscribe();
      });
  }

  ngOnDestroy(): void {
    this.searchSub?.unsubscribe();
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

    const payload = {
      name: this.formName.trim(),
      description: this.formDescription.trim() || undefined,
      iconUrl: this.formIconUrl.trim() || undefined,
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
