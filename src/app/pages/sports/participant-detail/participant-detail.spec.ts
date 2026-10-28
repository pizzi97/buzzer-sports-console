import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, ActivatedRoute } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { ParticipantDetail } from './participant-detail';

describe('ParticipantDetail', () => {
  let component: ParticipantDetail;
  let fixture: ComponentFixture<ParticipantDetail>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ParticipantDetail],
      providers: [
        provideRouter([]),
        provideHttpClient(),
        provideHttpClientTesting(),
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              paramMap: {
                get: (key: string) => {
                  if (key === 'sportId') return 'sport-1';
                  if (key === 'gbId') return 'gb-1';
                  if (key === 'orgId') return 'org-1';
                  if (key === 'participantId') return 'player-1';
                  return null;
                },
              },
            },
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ParticipantDetail);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
