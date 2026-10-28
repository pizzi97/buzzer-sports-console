import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, ActivatedRoute } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { GoverningBodyDetail } from './governing-body-detail';

describe('GoverningBodyDetail', () => {
  let component: GoverningBodyDetail;
  let fixture: ComponentFixture<GoverningBodyDetail>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GoverningBodyDetail],
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
                  return null;
                },
              },
            },
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(GoverningBodyDetail);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
