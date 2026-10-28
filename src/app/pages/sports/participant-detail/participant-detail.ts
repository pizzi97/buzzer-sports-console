import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { SportsService, Sport } from '../../../core/services/sports.service';
import {
  GoverningBodiesService,
  GoverningBody,
} from '../../../core/services/governing-bodies.service';
import { OrganizationsService, Organization } from '../../../core/services/organizations.service';
import { ParticipantsService, Participant } from '../../../core/services/participants.service';
import { Breadcrumbs, BreadcrumbItem } from '../../../shared/components/breadcrumbs/breadcrumbs';

@Component({
  selector: 'app-participant-detail',
  standalone: true,
  imports: [CommonModule, RouterModule, Breadcrumbs],
  templateUrl: './participant-detail.html',
  styleUrl: './participant-detail.scss',
})
export class ParticipantDetail implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly sportsService = inject(SportsService);
  private readonly gbService = inject(GoverningBodiesService);
  private readonly orgService = inject(OrganizationsService);
  private readonly participantService = inject(ParticipantsService);

  readonly sportId = signal<string>('');
  readonly gbId = signal<string>('');
  readonly orgId = signal<string>('');
  readonly participantId = signal<string>('');

  readonly sport = signal<Sport | null>(null);
  readonly governingBody = signal<GoverningBody | null>(null);
  readonly organization = signal<Organization | null>(null);
  readonly participant = signal<Participant | null>(null);
  readonly isLoading = signal<boolean>(true);
  readonly errorMessage = signal<string>('');

  // Breadcrumbs: Sports > [Sport] > [Governing Body] > [Organisation] > [Participant]
  readonly breadcrumbItems = computed<BreadcrumbItem[]>(() => {
    const s = this.sport();
    const gb = this.governingBody();
    const org = this.organization();
    const p = this.participant();
    return [
      { label: 'Sports', url: '/sports' },
      { label: s ? s.name : 'Sport', url: `/sports/${this.sportId()}` },
      {
        label: gb ? gb.name : 'Governing Body',
        url: `/sports/${this.sportId()}/governing-bodies/${this.gbId()}`,
      },
      {
        label: org ? org.name : 'Organisation',
        url: `/sports/${this.sportId()}/governing-bodies/${this.gbId()}/organizations/${this.orgId()}`,
      },
      { label: p ? `${p.firstName} ${p.lastName}` : 'Participant Detail' },
    ];
  });

  ngOnInit(): void {
    const sportId = this.route.snapshot.paramMap.get('sportId');
    const gbId = this.route.snapshot.paramMap.get('gbId');
    const orgId = this.route.snapshot.paramMap.get('orgId');
    const participantId = this.route.snapshot.paramMap.get('participantId');

    if (sportId && gbId && orgId && participantId) {
      this.sportId.set(sportId);
      this.gbId.set(gbId);
      this.orgId.set(orgId);
      this.participantId.set(participantId);

      this.sportsService.getById(sportId).subscribe({
        next: (s) => this.sport.set(s),
      });

      this.gbService.getById(gbId).subscribe({
        next: (gb) => this.governingBody.set(gb),
      });

      this.orgService.getById(orgId).subscribe({
        next: (org) => this.organization.set(org),
      });

      this.participantService.getById(participantId).subscribe({
        next: (p) => {
          this.participant.set(p);
          this.isLoading.set(false);
        },
        error: () => {
          this.errorMessage.set('Could not load participant details.');
          this.isLoading.set(false);
        },
      });
    }
  }
}
