import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReleaseComponent } from './release.component';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
import { NotificationService } from '../../services/notification.service';
import { of } from 'rxjs';

describe('ReleaseComponent', () => {
  let component: ReleaseComponent;
  let fixture: ComponentFixture<ReleaseComponent>;
  let httpMock: HttpTestingController;
  let authServiceSpy: jasmine.SpyObj<AuthService>;
  let routerSpy: jasmine.SpyObj<Router>;
  let notificationServiceSpy: jasmine.SpyObj<NotificationService>;

  beforeEach(async () => {
    const authSpy = jasmine.createSpyObj('AuthService', ['getUser', 'isLoggedIn', 'logout']);
    const router = jasmine.createSpyObj('Router', ['navigate']);
    const notificationSpy = jasmine.createSpyObj('NotificationService', ['getNotifications', 'markAllAsRead']);

    await TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      declarations: [ReleaseComponent],
      providers: [
        { provide: AuthService, useValue: authSpy },
        { provide: Router, useValue: router },
        { provide: NotificationService, useValue: notificationSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ReleaseComponent);
    component = fixture.componentInstance;
    httpMock = TestBed.inject(HttpTestingController);
    authServiceSpy = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
    routerSpy = TestBed.inject(Router) as jasmine.SpyObj<Router>;
    notificationServiceSpy = TestBed.inject(NotificationService) as jasmine.SpyObj<NotificationService>;
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should create component', () => {
    expect(component).toBeTruthy();
  });

  it('should load recommended releases on init and apply filters', () => {
    const mockMovies = [
      { title: 'Movie 1', release_date: '2025-01-15', poster_path: '/img1.jpg', id: 1 },
      { title: 'Movie 2', release_date: '2025-01-20', poster_path: '/img2.jpg', id: 2 },
      { title: 'Movie 3', release_date: '2026-02-10', poster_path: '/img3.jpg', id: 3 }
    ];

    authServiceSpy.getUser.and.returnValue({ name: 'Test User', profile_photo: null });

    component.selectedYear = '2025';
    component.selectedMonth = 1;
    fixture.detectChanges();

    const req = httpMock.expectOne('http://localhost:8000/api/movies/popular');
    expect(req.request.method).toBe('GET');
    req.flush({ movies: mockMovies });

    expect(component.recommendedReleases.length).toBe(2);
    expect(component.loading).toBeFalse();
    expect(component.userName).toBe('Test User');
  });

  it('should return default guest user if no user info', () => {
    authServiceSpy.getUser.and.returnValue(null);
    component.setUserName();
    expect(component.userName).toBe('Invitado');
  });

  it('should log out and clear sessionStorage', () => {
    spyOn(sessionStorage, 'removeItem');

    sessionStorage.setItem('token', 'fake-token');
    authServiceSpy.logout.and.returnValue(of({}));

    component.logout();

    expect(authServiceSpy.logout).toHaveBeenCalled();
    expect(sessionStorage.removeItem).toHaveBeenCalledWith('token');
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/movies']);
  });

  it('should mark notifications as read', () => {
    notificationServiceSpy.markAllAsRead.and.returnValue(of({}));
    component.notifications = [
      { id: 1, read: false },
      { id: 2, read: false }
    ];

    component.markAllAsRead();
    expect(component.notifications.every(n => n.read)).toBeTrue();
  });

  it('should toggle mobile menu', () => {
    expect(component.mobileMenuOpen).toBeFalse();
    component.toggleMobileMenu();
    expect(component.mobileMenuOpen).toBeTrue();
    component.closeMobileMenu();
    expect(component.mobileMenuOpen).toBeFalse();
  });

  it('should call onFiltersChange and reload', () => {
    spyOn(component, 'getRecommendedReleases');
    component.onFiltersChange();
    expect(component.loading).toBeTrue();
    expect(component.getRecommendedReleases).toHaveBeenCalled();
  });
});
