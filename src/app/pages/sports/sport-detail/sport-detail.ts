import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { SportsService, Sport } from '../../../core/services/sports.service';
import {
  GoverningBodiesService,
  GoverningBody,
} from '../../../core/services/governing-bodies.service';
import { Breadcrumbs, BreadcrumbItem } from '../../../shared/components/breadcrumbs/breadcrumbs';

@Component({
  selector: 'app-sport-detail',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, Breadcrumbs],
  templateUrl: './sport-detail.html',
  styleUrl: './sport-detail.scss',
})
export class SportDetail implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly sportsService = inject(SportsService);
  private readonly gbService = inject(GoverningBodiesService);

  readonly sportId = signal<string>('');
  readonly sport = signal<Sport | null>(null);
  readonly governingBodies = signal<GoverningBody[]>([]);
  readonly isLoading = signal<boolean>(true);
  readonly errorMessage = signal<string>('');

  // Modale per aggiungere Governing Body
  readonly isCreateModalOpen = signal<boolean>(false);
  readonly gbName = signal<string>('');
  readonly gbDescription = signal<string>('');
  readonly gbLogoUrl = signal<string>('');
  readonly modalError = signal<string>('');
  readonly isSubmitting = signal<boolean>(false);

  // Breadcrumbs: Sports > [Nome Sport]
  readonly breadcrumbItems = computed<BreadcrumbItem[]>(() => {
    const currentSport = this.sport();
    return [
      { label: 'Sports', url: '/sports' },
      { label: currentSport ? currentSport.name : 'Sport Detail' },
    ];
  });

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('sportId');
    if (id) {
      this.sportId.set(id);
      this.loadSportData(id);
      this.loadGoverningBodies(id);
    }
  }

  loadSportData(id: string): void {
    this.sportsService.getById(id).subscribe({
      next: (data) => this.sport.set(data),
      error: () => this.errorMessage.set('Could not load sport details.'),
    });
  }

  loadGoverningBodies(sportId: string): void {
    this.isLoading.set(true);
    this.gbService.getBySportId(sportId).subscribe({
      next: (res) => {
        this.governingBodies.set(res.data || []);
        this.isLoading.set(false);
      },
      error: () => {
        this.isLoading.set(false);
      },
    });
  }

  openCreateModal(): void {
    this.gbName.set('');
    this.gbDescription.set('');
    this.gbLogoUrl.set('');
    this.modalError.set('');
    this.isCreateModalOpen.set(true);
  }

  closeCreateModal(): void {
    this.isCreateModalOpen.set(false);
  }

  createGoverningBody(): void {
    if (!this.gbName().trim()) {
      this.modalError.set('Governing Body name is required.');
      return;
    }

    this.isSubmitting.set(true);
    this.modalError.set('');

    this.gbService
      .create({
        sportId: this.sportId(),
        name: this.gbName().trim(),
        description: this.gbDescription().trim() || undefined,
        logoUrl: this.gbLogoUrl().trim() || undefined,
      })
      .subscribe({
        next: (created) => {
          this.governingBodies.update((list) => [created, ...list]);
          // Aggiornamento reattivo del conteggio padre
          this.sport.update((s) =>
            s ? { ...s, governingBodiesCount: (s.governingBodiesCount ?? 0) + 1 } : s,
          );
          this.isSubmitting.set(false);
          this.closeCreateModal();
        },
        error: (err) => {
          this.isSubmitting.set(false);
          this.modalError.set(err.error?.message || 'Error creating governing body.');
        },
      });
  }
}
