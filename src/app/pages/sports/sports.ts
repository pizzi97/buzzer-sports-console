import { Component, inject, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SearchService } from '../../core/services/search.service';

export interface SportEntry {
  id?: string;
  name: string;
  icon: string;
  mainEntities: number;
  competitions: number;
  participants: number;
}

@Component({
  selector: 'app-sports',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './sports.html',
  styleUrl: './sports.scss',
})
export class SportsComponent {
  // protected per consentire l'accesso dal template HTML
  protected searchService = inject(SearchService);

  // Lista reattiva di sport
  sports = signal<SportEntry[]>([
    { id: '1', name: 'Football', icon: '⚽', mainEntities: 5, competitions: 12, participants: 86 },
    {
      id: '2',
      name: 'Basketball',
      icon: '🏀',
      mainEntities: 5,
      competitions: 10,
      participants: 75,
    },
    { id: '3', name: 'Baseball', icon: '⚾', mainEntities: 3, competitions: 14, participants: 92 },
    { id: '4', name: 'Hockey', icon: '🏒', mainEntities: 6, competitions: 8, participants: 78 },
    { id: '5', name: 'Tennis', icon: '🎾', mainEntities: 2, competitions: 20, participants: 68 },
    { id: '6', name: 'Rugby', icon: '🏉', mainEntities: 7, competitions: 11, participants: 81 },
    {
      id: '7',
      name: 'Volleyball',
      icon: '🏐',
      mainEntities: 4,
      competitions: 13,
      participants: 79,
    },
    { id: '8', name: 'MMA', icon: '🥊', mainEntities: 5, competitions: 20, participants: 85 },
    {
      id: '9',
      name: 'Snowboarding',
      icon: '🏂',
      mainEntities: 2,
      competitions: 9,
      participants: 74,
    },
    { id: '10', name: 'Boxing', icon: '🥊', mainEntities: 4, competitions: 10, participants: 72 },
    { id: '11', name: 'Golf', icon: '⛳', mainEntities: 5, competitions: 8, participants: 65 },
    { id: '12', name: 'Swimming', icon: '🏊', mainEntities: 3, competitions: 12, participants: 80 },
    {
      id: '13',
      name: 'Gymnastics',
      icon: '🤸',
      mainEntities: 2,
      competitions: 15,
      participants: 60,
    },
  ]);

  // Modale Aggiungi / Modifica
  isModalOpen = signal<boolean>(false);
  isEditing = signal<boolean>(false);
  currentEditingIndex = signal<number | null>(null);

  formName = '';
  formIcon = '⚽';
  formMainEntities = 0;
  formCompetitions = 0;
  formParticipants = 0;

  // Statistiche dinamiche per le 4 card
  totalSports = computed(() => this.sports().length);
  totalMainEntities = computed(() =>
    this.sports().reduce((acc, s) => acc + (s.mainEntities || 0), 0),
  );
  totalCompetitions = computed(() =>
    this.sports().reduce((acc, s) => acc + (s.competitions || 0), 0),
  );
  totalParticipants = computed(() =>
    this.sports().reduce((acc, s) => acc + (s.participants || 0), 0),
  );

  // Lista filtrata tramite SearchService globale
  sportsList = computed(() => {
    const query = this.searchService.searchTerm().toLowerCase().trim();
    if (!query) return this.sports();
    return this.sports().filter((s) => s.name.toLowerCase().includes(query));
  });

  openAddModal(): void {
    this.isEditing.set(false);
    this.currentEditingIndex.set(null);
    this.formName = '';
    this.formIcon = '⚽';
    this.formMainEntities = 1;
    this.formCompetitions = 0;
    this.formParticipants = 0;
    this.isModalOpen.set(true);
  }

  openEditModal(item: SportEntry): void {
    const idx = this.sports().findIndex((s) => s.name === item.name);
    if (idx === -1) return;

    this.isEditing.set(true);
    this.currentEditingIndex.set(idx);
    this.formName = item.name;
    this.formIcon = item.icon;
    this.formMainEntities = item.mainEntities;
    this.formCompetitions = item.competitions;
    this.formParticipants = item.participants;
    this.isModalOpen.set(true);
  }

  closeModal(): void {
    this.isModalOpen.set(false);
  }

  saveSport(): void {
    if (!this.formName.trim()) return;

    const payload: SportEntry = {
      name: this.formName.trim(),
      icon: this.formIcon.trim() || '🏅',
      mainEntities: Number(this.formMainEntities) || 0,
      competitions: Number(this.formCompetitions) || 0,
      participants: Number(this.formParticipants) || 0,
    };

    if (this.isEditing() && this.currentEditingIndex() !== null) {
      this.sports.update((list) => {
        const copy = [...list];
        copy[this.currentEditingIndex()!] = payload;
        return copy;
      });
    } else {
      this.sports.update((list) => [payload, ...list]);
    }

    this.closeModal();
  }

  deleteSport(name: string): void {
    if (confirm(`Are you sure you want to delete ${name}?`)) {
      this.sports.update((list) => list.filter((s) => s.name !== name));
    }
  }
}

export { SportsComponent as Sports };
