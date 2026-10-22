import { Component, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SearchService } from '../../services/search.service';

interface SportEntry {
  name: string;
  icon: string;
  mainEntities: number;
  competitions: number;
  participants: number;
}

@Component({
  selector: 'app-sports',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './sports.html',
  styleUrl: './sports.scss',
})
export class SportsComponent {
  // Iniettiamo il servizio di ricerca
  private searchService = inject(SearchService);

  private allSports: SportEntry[] = [
    { name: 'Football', icon: '⚽', mainEntities: 5, competitions: 12, participants: 86 },
    { name: 'Basketball', icon: '🏀', mainEntities: 5, competitions: 10, participants: 75 },
    { name: 'Baseball', icon: '⚾', mainEntities: 3, competitions: 14, participants: 92 },
    { name: 'Hockey', icon: '🏒', mainEntities: 6, competitions: 8, participants: 78 },
    { name: 'Tennis', icon: '🎾', mainEntities: 2, competitions: 20, participants: 68 },
    { name: 'Rugby', icon: '🏉', mainEntities: 7, competitions: 11, participants: 81 },
    { name: 'Volleyball', icon: '🏐', mainEntities: 4, competitions: 13, participants: 79 },
    { name: 'MMA', icon: '🥊', mainEntities: 5, competitions: 20, participants: 85 },
    { name: 'Snowboarding', icon: '🏂', mainEntities: 2, competitions: 9, participants: 74 },
    { name: 'Boxing', icon: '🥊', mainEntities: 4, competitions: 10, participants: 72 },
    { name: 'Golf', icon: '⛳', mainEntities: 5, competitions: 8, participants: 65 },
    { name: 'Swimming', icon: '🏊', mainEntities: 3, competitions: 12, participants: 80 },
    { name: 'Gymnastics', icon: '🤸', mainEntities: 2, competitions: 15, participants: 60 },
  ];

  // La lista filtrata ora legge in tempo reale il segnale globale del servizio
  sportsList = computed(() => {
    const query = this.searchService.searchTerm().toLowerCase().trim();
    if (!query) return this.allSports;
    return this.allSports.filter((s) => s.name.toLowerCase().includes(query));
  });
}
