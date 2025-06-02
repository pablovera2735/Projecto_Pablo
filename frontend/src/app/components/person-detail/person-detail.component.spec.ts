import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PersonDetailComponent } from './person-detail.component';
import { ActivatedRoute } from '@angular/router';
import { of, throwError } from 'rxjs';
import { ActorService } from '../../services/actor.service';

describe('PersonDetailComponent', () => {
  let component: PersonDetailComponent;
  let fixture: ComponentFixture<PersonDetailComponent>;
  let actorServiceMock: any;

  beforeEach(async () => {
    actorServiceMock = jasmine.createSpyObj('ActorService', ['getPersonDetail', 'getPersonCredits']);

    await TestBed.configureTestingModule({
      declarations: [PersonDetailComponent],
      providers: [
        { 
          provide: ActivatedRoute, 
          useValue: { snapshot: { paramMap: { get: () => '123' } } } 
        },
        { provide: ActorService, useValue: actorServiceMock }
      ]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PersonDetailComponent);
    component = fixture.componentInstance;
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should load person details and credits on init', () => {
    const mockPerson = { id: 123, name: 'Test Actor' };
    const mockCredits = { cast: [{ title: 'Test Movie' }] };

    actorServiceMock.getPersonDetail.and.returnValue(of(mockPerson));
    actorServiceMock.getPersonCredits.and.returnValue(of(mockCredits));

    fixture.detectChanges(); // triggers ngOnInit

    expect(component.personId).toBe(123);
    expect(actorServiceMock.getPersonDetail).toHaveBeenCalledWith(123);
    expect(actorServiceMock.getPersonCredits).toHaveBeenCalledWith(123);
    expect(component.person).toEqual(mockPerson);
    expect(component.credits).toEqual(mockCredits.cast);
    expect(component.isLoading).toBeFalse();
  });

  it('should handle error when person details fail to load', () => {
    actorServiceMock.getPersonDetail.and.returnValue(throwError(() => new Error('Error')));

    fixture.detectChanges();

    expect(component.isLoading).toBeFalse();
    expect(component.person).toBeUndefined();
    expect(component.credits.length).toBe(0);
  });

  it('should return correct image URL with getImage', () => {
    const path = '/test.jpg';
    expect(component.getImage(path)).toBe('https://image.tmdb.org/t/p/w500/test.jpg');
  });

  it('should return fallback image URL with getImage if path is null', () => {
    expect(component.getImage(null)).toBe('assets/img/no-image.png');
  });
});
