import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PopularAuthorsComponent } from './popular-authors.component';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { ActorService } from '../../services/actor.service';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
import { NotificationService } from '../../services/notification.service';
import { of, throwError } from 'rxjs';

describe('PopularAuthorsComponent', () => {
  let component: PopularAuthorsComponent;
  let fixture: ComponentFixture<PopularAuthorsComponent>;
  let actorServiceSpy: jasmine.SpyObj<ActorService>;
  let authServiceSpy: jasmine.SpyObj<AuthService>;
  let notificationServiceSpy: jasmine.SpyObj<NotificationService>;
  let routerSpy: jasmine.SpyObj<Router>;

  beforeEach(async () => {
    const actorSpy = jasmine.createSpyObj('ActorService', ['getPopularPeople']);
    const authSpy = jasmine.createSpyObj('AuthService', ['getUser', 'isLoggedIn', 'logout']);
    const notifSpy = jasmine.createSpyObj('NotificationService', ['getNotifications', 'markAllAsRead']);
    const routerMock = jasmine.createSpyObj('Router', ['navigate']);

    await TestBed.configureTestingModule({
      declarations: [PopularAuthorsComponent],
      imports: [HttpClientTestingModule],
      providers: [
        { provide: ActorService, useValue: actorSpy },
        { provide: AuthService, useValue: authSpy },
        { provide: NotificationService, useValue: notifSpy },
        { provide: Router, useValue: routerMock }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(PopularAuthorsComponent);
    component = fixture.componentInstance;
    actorServiceSpy = TestBed.inject(ActorService) as jasmine.SpyObj<ActorService>;
    authServiceSpy = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
    notificationServiceSpy = TestBed.inject(NotificationService) as jasmine.SpyObj<NotificationService>;
    routerSpy = TestBed.inject(Router) as jasmine.SpyObj<Router>;
  });

  it('should initialize with user and authors', () => {
    const mockUser = { name: 'Lucía', profile_photo: 'photo.jpg' };
    authServiceSpy.getUser.and.returnValue(mockUser);
    actorServiceSpy.getPopularPeople.and.returnValue(of({ people: [], total_pages: 10 }));

    component.ngOnInit();

    expect(component.userName).toBe('Lucía');
    expect(actorServiceSpy.getPopularPeople).toHaveBeenCalledWith(1);
    expect(component.totalPages).toBe(10);
  });

  it('should handle actor loading errors', () => {
    actorServiceSpy.getPopularPeople.and.returnValue(throwError(() => new Error('Error')));

    component.loadPopularAuthors(1);

    expect(component.isLoading).toBeFalse();
    expect(component.errorMessage).toContain('No se pudieron cargar los actores');
  });

  it('should scroll to top', () => {
  spyOn(window, 'scrollTo');
  component.scrollToTop();
  expect(window.scrollTo).toHaveBeenCalledWith(jasmine.objectContaining({ top: 0, behavior: 'smooth' }));
});

  it('should return correct image URL or fallback', () => {
    expect(component.getImageUrl('/path.jpg')).toContain('/w300/path.jpg');
    expect(component.getImageUrl(null)).toContain('no-image.png');
  });

  it('should map known department correctly', () => {
    const person = { known_for_department: 'Directing' };
    expect(component.getKnownDepartment(person)).toBe('Director/a');
  });

  it('should set suggestions on search', () => {
    component.searchTerm = 'batman';

    const http = TestBed.inject(HttpTestingController);
    component.onSearchChange();

    const req = http.expectOne('http://filmania.ddns.net:8000/api/movies/search?q=batman');
    expect(req.request.method).toBe('GET');
    req.flush({ results: Array(10).fill({}) });

    expect(component.suggestions.length).toBe(8); // sliced
  });

  it('should clear suggestions on short search', () => {
    component.searchTerm = 'a';
    component.onSearchChange();
    expect(component.suggestions).toEqual([]);
  });

  it('should toggle dropdown and mobile menu', () => {
    component.showDropdown = false;
    component.toggleDropdown();
    expect(component.showDropdown).toBeTrue();

    component.mobileMenuOpen = false;
    component.toggleMobileMenu();
    expect(component.mobileMenuOpen).toBeTrue();
    component.closeMobileMenu();
    expect(component.mobileMenuOpen).toBeFalse();
  });

  it('should mark all notifications as read', () => {
    component.notifications = [
      { id: 1, read: false },
      { id: 2, read: false }
    ];
    notificationServiceSpy.markAllAsRead.and.returnValue(of({}));

    component.markAllAsRead();

    expect(component.notifications.every(n => n.read)).toBeTrue();
  });

  it('should logout and clear session', () => {
    spyOn(sessionStorage, 'clear');
    authServiceSpy.logout.and.returnValue(of({}));
    spyOn(window.location, 'reload');

    component.logout();

    expect(sessionStorage.clear).toHaveBeenCalled();
    expect(window.location.reload).toHaveBeenCalled();
  });

  it('should paginate and scroll to top on page change', () => {
    spyOn(component, 'loadPopularAuthors');
    spyOn(window, 'scrollTo');

    component.totalPages = 10;
    component.currentPage = 2;

    const event = new Event('click');
    component.goToPage(3, event);

    expect(component.loadPopularAuthors).toHaveBeenCalledWith(3);
    expect(window.scrollTo).toHaveBeenCalled();
  });

  it('should limit visible pagination range', () => {
    component.currentPage = 5;
    component.totalPages = 10;

    const pages = component.getLimitedPagesArray();
    expect(pages.length).toBeLessThanOrEqual(5);
    expect(pages).toContain(5);
  });

  it('should return isAuthenticated correctly', () => {
    authServiceSpy.isLoggedIn.and.returnValue(true);
    expect(component.isAuthenticated()).toBeTrue();
  });
});
