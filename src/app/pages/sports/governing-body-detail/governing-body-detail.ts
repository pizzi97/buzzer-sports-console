import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { SportsService, Sport } from '../../../core/services/sports.service';
import {
  GoverningBodiesService,
  GoverningBody,
} from '../../../core/services/governing-bodies.service';
import { OrganizationsService, Organization } from '../../../core/services/organizations.service';
import { Breadcrumbs, BreadcrumbItem } from '../../../shared/components/breadcrumbs/breadcrumbs';

@Component({
  selector: 'app-governing-body-detail',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, Breadcrumbs],
  templateUrl: './governing-body-detail.html',
  styleUrl: './governing-body-detail.scss',
})
export class GoverningBodyDetail implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly sportsService = inject(SportsService);
  private readonly gbService = inject(GoverningBodiesService);
  private readonly orgService = inject(OrganizationsService);

  readonly sportId = signal<string>('');
  readonly gbId = signal<string>('');
  readonly sport = signal<Sport | null>(null);
  readonly governingBody = signal<GoverningBody | null>(null);
  readonly organizations = signal<Organization[]>([]);
  readonly isLoading = signal<boolean>(true);
  readonly errorMessage = signal<string>('');

  // Modale per aggiungere Organization
  readonly isCreateModalOpen = signal<boolean>(false);
  readonly orgName = signal<string>('');
  readonly orgDescription = signal<string>('');
  readonly orgLogoUrl = signal<string>('');
  readonly modalError = signal<string>('');
  readonly isSubmitting = signal<boolean>(false);

  // Breadcrumbs: Sports > [Sport] > [Governing Body]
  readonly breadcrumbItems = computed<BreadcrumbItem[]>(() => {
    const s = this.sport();
    const gb = this.governingBody();
    return [
      { label: 'Sports', url: '/sports' },
      { label: s ? s.name : 'Sport', url: `/sports/${this.sportId()}` },
      { label: gb ? gb.name : 'Governing Body' },
    ];
  });

  ngOnInit(): void {
    const sportId = this.route.snapshot.paramMap.get('sportId');
    const gbId = this.route.snapshot.paramMap.get('gbId');

    if (sportId && gbId) {
      this.sportId.set(sportId);
      this.gbId.set(gbId);
      this.loadParentSport(sportId);
      this.loadGoverningBody(gbId);
      this.loadOrganizations(gbId);
    }
  }

  loadParentSport(sportId: string): void {
    this.sportsService.getById(sportId).subscribe({
      next: (s) => this.sport.set(s),
      error: () => console.error('Could not load parent sport'),
    });
  }

  loadGoverningBody(id: string): void {
    this.gbService.getById(id).subscribe({
      next: (gb) => this.governingBody.set(gb),
      error: () => this.errorMessage.set('Could not load governing body details.'),
    });
  }

  loadOrganizations(gbId: string): void {
    this.isLoading.set(true);
    this.orgService.getByGoverningBodyId(gbId).subscribe({
      next: (res) => {
        this.organizations.set(res.data || []);
        this.isLoading.set(false);
      },
      error: () => {
        this.isLoading.set(false);
      },
    });
  }

  openCreateModal(): void {
    this.orgName.set('');
    this.orgDescription.set('');
    this.orgLogoUrl.set('');
    this.modalError.set('');
    this.isCreateModalOpen.set(true);
  }

  closeCreateModal(): void {
    this.isCreateModalOpen.set(false);
  }

  createOrganization(): void {
    if (!this.orgName().trim()) {
      this.modalError.set('Organization name is required.');
      return;
    }

    this.isSubmitting.set(true);
    this.modalError.set('');

    this.orgService
      .create({
        governingBodyId: this.gbId(),
        sportId: this.sportId(),
        name: this.orgName().trim(),
        description: this.orgDescription().trim() || undefined,
        logoUrl: this.orgLogoUrl().trim() || undefined,
      })
      .subscribe({
        next: (created) => {
          this.organizations.update((list) => [created, ...list]);
          this.governingBody.update((gb) =>
            gb ? { ...gb, organizationsCount: (gb.organizationsCount ?? 0) + 1 } : gb,
          );
          this.isSubmitting.set(false);
          this.closeCreateModal();
        },
        error: (err) => {
          this.isSubmitting.set(false);
          this.modalError.set(err.error?.message || 'Error creating organization.');
        },
      });
  }
}
