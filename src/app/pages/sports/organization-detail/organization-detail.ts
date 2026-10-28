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
import { ParticipantsService, Participant } from '../../../core/services/participants.service';
import { Breadcrumbs, BreadcrumbItem } from '../../../shared/components/breadcrumbs/breadcrumbs';

@Component({
  selector: 'app-organization-detail',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, Breadcrumbs],
  templateUrl: './organization-detail.html',
  styleUrl: './organization-detail.scss',
})
export class OrganizationDetail implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly sportsService = inject(SportsService);
  private readonly gbService = inject(GoverningBodiesService);
  private readonly orgService = inject(OrganizationsService);
  private readonly participantService = inject(ParticipantsService);

  readonly sportId = signal<string>('');
  readonly gbId = signal<string>('');
  readonly orgId = signal<string>('');

  readonly sport = signal<Sport | null>(null);
  readonly governingBody = signal<GoverningBody | null>(null);
  readonly organization = signal<Organization | null>(null);
  readonly participants = signal<Participant[]>([]);
  readonly isLoading = signal<boolean>(true);
  readonly errorMessage = signal<string>('');

  // Modale per aggiungere Participant
  readonly isCreateModalOpen = signal<boolean>(false);
  readonly firstName = signal<string>('');
  readonly lastName = signal<string>('');
  readonly role = signal<string>('');
  readonly jerseyNumber = signal<number | null>(null);
  readonly photoUrl = signal<string>('');
  readonly modalError = signal<string>('');
  readonly isSubmitting = signal<boolean>(false);

  // Breadcrumbs: Sports > [Sport] > [Governing Body] > [Organisation]
  readonly breadcrumbItems = computed<BreadcrumbItem[]>(() => {
    const s = this.sport();
    const gb = this.governingBody();
    const org = this.organization();
    return [
      { label: 'Sports', url: '/sports' },
      { label: s ? s.name : 'Sport', url: `/sports/${this.sportId()}` },
      {
        label: gb ? gb.name : 'Governing Body',
        url: `/sports/${this.sportId()}/governing-bodies/${this.gbId()}`,
      },
      { label: org ? org.name : 'Organisation' },
    ];
  });

  ngOnInit(): void {
    const sportId = this.route.snapshot.paramMap.get('sportId');
    const gbId = this.route.snapshot.paramMap.get('gbId');
    const orgId = this.route.snapshot.paramMap.get('orgId');

    if (sportId && gbId && orgId) {
      this.sportId.set(sportId);
      this.gbId.set(gbId);
      this.orgId.set(orgId);

      this.loadParentSport(sportId);
      this.loadParentGoverningBody(gbId);
      this.loadOrganization(orgId);
      this.loadParticipants(orgId);
    }
  }

  loadParentSport(id: string): void {
    this.sportsService.getById(id).subscribe({
      next: (s) => this.sport.set(s),
      error: () => console.error('Could not load parent sport'),
    });
  }

  loadParentGoverningBody(id: string): void {
    this.gbService.getById(id).subscribe({
      next: (gb) => this.governingBody.set(gb),
      error: () => console.error('Could not load governing body'),
    });
  }

  loadOrganization(id: string): void {
    this.orgService.getById(id).subscribe({
      next: (org) => this.organization.set(org),
      error: () => this.errorMessage.set('Could not load organisation details.'),
    });
  }

  loadParticipants(orgId: string): void {
    this.isLoading.set(true);
    this.participantService.getByOrganizationId(orgId).subscribe({
      next: (res) => {
        this.participants.set(res.data || []);
        this.isLoading.set(false);
      },
      error: () => {
        this.isLoading.set(false);
      },
    });
  }

  openCreateModal(): void {
    this.firstName.set('');
    this.lastName.set('');
    this.role.set('');
    this.jerseyNumber.set(null);
    this.photoUrl.set('');
    this.modalError.set('');
    this.isCreateModalOpen.set(true);
  }

  closeCreateModal(): void {
    this.isCreateModalOpen.set(false);
  }

  createParticipant(): void {
    if (!this.firstName().trim() || !this.lastName().trim()) {
      this.modalError.set('First name and last name are required.');
      return;
    }

    this.isSubmitting.set(true);
    this.modalError.set('');

    this.participantService
      .create({
        organizationId: this.orgId(),
        firstName: this.firstName().trim(),
        lastName: this.lastName().trim(),
        role: this.role().trim() || undefined,
        jerseyNumber: this.jerseyNumber() ?? undefined,
        photoUrl: this.photoUrl().trim() || undefined,
      })
      .subscribe({
        next: (created) => {
          this.participants.update((list) => [created, ...list]);
          this.organization.update((org) =>
            org ? { ...org, participantsCount: (org.participantsCount ?? 0) + 1 } : org,
          );
          this.isSubmitting.set(false);
          this.closeCreateModal();
        },
        error: (err) => {
          this.isSubmitting.set(false);
          this.modalError.set(err.error?.message || 'Error creating participant.');
        },
      });
  }
}
