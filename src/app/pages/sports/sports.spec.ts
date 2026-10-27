import { ComponentFixture, TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';
import { of } from 'rxjs';
import { provideRouter } from '@angular/router';
import { SportsComponent } from './sports';
import { SportsService, Sport } from '../../core/services/sports.service';
import { SearchService } from '../../core/services/search.service';

describe('SportsComponent', () => {
  let component: SportsComponent;
  let fixture: ComponentFixture<SportsComponent>;

  const mockSports: Sport[] = [
    {
      id: '1',
      name: 'Football',
      description: 'Association football',
      iconUrl: '⚽',
      governingBodiesCount: 2,
      organisationsCount: 10,
      participantsCount: 200,
    },
  ];

  const mockSportsService = {
    sports: signal<Sport[]>(mockSports),
    loading: signal<boolean>(false),
    currentPage: signal<number>(1),
    pageSize: signal<number>(10),
    totalPages: signal<number>(1),
    totalItems: signal<number>(1),
    stats: signal({
      totalSports: 1,
      totalGoverningBodies: 2,
      totalOrganisations: 10,
      totalParticipants: 200,
    }),
    getSports: vi.fn().mockReturnValue(
      of({
        success: true,
        data: mockSports,
        meta: { page: 1, limit: 10, total: 1, totalPages: 1 },
      }),
    ),
    loadSummaryStats: vi.fn(),
    createSport: vi.fn().mockReturnValue(of({ success: true })),
    updateSport: vi.fn().mockReturnValue(of({ success: true })),
    deleteSport: vi.fn().mockReturnValue(of({ success: true })),
  };

  const mockSearchService = {
    searchTerm: signal<string>(''),
    setSearchTerm: vi.fn(),
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SportsComponent],
      providers: [
        provideRouter([]),
        { provide: SportsService, useValue: mockSportsService },
        { provide: SearchService, useValue: mockSearchService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(SportsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize summary stats and load first page of sports', () => {
    expect(mockSportsService.loadSummaryStats).toHaveBeenCalled();
    expect(mockSportsService.getSports).toHaveBeenCalledWith('', 1, 10);
  });

  it('should correctly resolve emoji for sport names', () => {
    expect(component.getSportEmoji('Football')).toBe('⚽');
    expect(component.getSportEmoji('Basketball Pro')).toBe('🏀');
    expect(component.getSportEmoji('UnknownSport')).toBe('🏅');
  });
});
