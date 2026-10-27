import { ComponentFixture, TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';
import { of, throwError } from 'rxjs';
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

  let mockSportsService: any;
  let mockSearchService: any;

  beforeEach(async () => {
    mockSportsService = {
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

    mockSearchService = {
      searchTerm: signal<string>(''),
      setSearchTerm: vi.fn(),
    };

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

  it('should create and load initial data', () => {
    expect(component).toBeTruthy();
    expect(mockSportsService.loadSummaryStats).toHaveBeenCalled();
    expect(mockSportsService.getSports).toHaveBeenCalledWith('', 1, 10);
  });

  it('should resolve sport emoji correctly', () => {
    expect(component.getSportEmoji('Football')).toBe('⚽');
    expect(component.getSportEmoji('Basketball League')).toBe('🏀');
    expect(component.getSportEmoji('Unknown Game')).toBe('🏅');
  });

  it('should open and close the add modal with reset fields', () => {
    component.openAddModal();
    expect(component.isModalOpen()).toBe(true);
    expect(component.isEditing()).toBe(false);
    expect(component.formName).toBe('');

    component.closeModal();
    expect(component.isModalOpen()).toBe(false);
  });

  it('should populate fields when opening edit modal', () => {
    const fakeEvent = new MouseEvent('click');
    component.openEditModal(mockSports[0], fakeEvent);

    expect(component.isModalOpen()).toBe(true);
    expect(component.isEditing()).toBe(true);
    expect(component.currentEditingId()).toBe('1');
    expect(component.formName).toBe('Football');
  });

  it('should validate empty sport name on save', () => {
    component.openAddModal();
    component.formName = '   ';
    component.saveSport();

    expect(component.formError()).toBe('Name is required.');
    expect(mockSportsService.createSport).not.toHaveBeenCalled();
  });

  it('should call createSport with valid payload and close modal', () => {
    component.openAddModal();
    component.formName = 'Tennis';
    component.formDescription = 'Racket sport';
    component.formIconUrl = 'https://example.com/tennis.png';

    component.saveSport();

    expect(mockSportsService.createSport).toHaveBeenCalledWith({
      name: 'Tennis',
      description: 'Racket sport',
      iconUrl: 'https://example.com/tennis.png',
    });
    expect(component.isModalOpen()).toBe(false);
  });

  it('should handle HTTP 409 conflict when sport name exists', () => {
    mockSportsService.createSport.mockReturnValue(throwError(() => ({ status: 409 })));

    component.openAddModal();
    component.formName = 'Football';
    component.saveSport();

    expect(component.formError()).toBe('A sport with this name already exists.');
    expect(component.formSubmitting()).toBe(false);
    expect(component.isModalOpen()).toBe(true);
  });

  it('should prompt delete confirmation and trigger deleteSport', () => {
    const fakeEvent = new MouseEvent('click');
    component.promptDelete(mockSports[0], fakeEvent);

    expect(component.deleteModalSport()).toEqual(mockSports[0]);

    component.confirmDelete();
    expect(mockSportsService.deleteSport).toHaveBeenCalledWith('1');
    expect(component.deleteModalSport()).toBeNull();
  });
});
