import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';
import { SportDetail } from './sport-detail';
import { SportsService } from '../../../core/services/sports.service';
import { GoverningBodiesService } from '../../../core/services/governing-bodies.service';

describe('SportDetail', () => {
  let component: SportDetail;
  let fixture: ComponentFixture<SportDetail>;

  const mockSportsService = {
    getById: () => of({ id: '1', name: 'Football', description: 'Association football' }),
  };

  const mockGbService = {
    getBySportId: () =>
      of({
        data: [],
        meta: { total: 0, page: 1, limit: 10, totalPages: 1 },
      }),
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SportDetail],
      providers: [
        provideRouter([]),
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              paramMap: {
                get: (key: string) => (key === 'sportId' ? '1' : null),
              },
            },
          },
        },
        { provide: SportsService, useValue: mockSportsService },
        { provide: GoverningBodiesService, useValue: mockGbService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(SportDetail);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
