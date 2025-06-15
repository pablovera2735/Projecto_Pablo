import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AboutComponent } from './about.component';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { AuthService } from '../../services/auth.service';
import { NotificationService } from '../../services/notification.service';
import { Router } from '@angular/router';
import { of } from 'rxjs';

describe('AboutComponent', () => {
  let component: AboutComponent;
  let fixture: ComponentFixture<AboutComponent>;
  let httpMock: HttpTestingController;
  let authServiceSpy: jasmine.SpyObj<AuthService>;
  let notificationServiceSpy: jasmine.SpyObj<NotificationService>;
  let routerSpy: jasmine.SpyObj<Router>;

  beforeEach(async () => {
    const authSpy = jasmine.createSpyObj('AuthService', ['getUser', 'isLoggedIn', 'logout']);
    const notifSpy = jasmine.createSpyObj('NotificationService', ['getNotifications', 'markAllAsRead']);
    const routeSpy = jasmine.createSpyObj('Router', ['navigate']);

    await TestBed.configureTestingModule({
      declarations: [AboutComponent],
      imports: [HttpClientTestingModule],
      providers: [
        { provide: AuthService, useValue: authSpy },
        { provide: NotificationService, useValue: notifSpy },
        { provide: Router, useValue: routeSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(AboutComponent);
    component = fixture.componentInstance;
    httpMock = TestBed.inject(HttpTestingController);
    authServiceSpy = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
    notificationServiceSpy = TestBed.inject(NotificationService) as jasmine.SpyObj<NotificationService>;
    routerSpy = TestBed.inject(Router) as jasmine.SpyObj<Router>;
  });

  it('should set user name and profile photo on init', () => {
    const mockUser = { name: 'Carlos', profile_photo: 'photos/me.jpg' };
    authServiceSpy.getUser.and.returnValue(mockUser);
    notificationServiceSpy.getNotifications.and.returnValue(of([]));

    component.ngOnInit();

    expect(component.userName).toBe('Carlos');
    expect(component.profilePhoto).toContain(mockUser.profile_photo);
  });

  it('should set userName as Invitado if no user', () => {
    authServiceSpy.getUser.and.returnValue(null);
    notificationServiceSpy.getNotifications.and.returnValue(of([]));

    component.ngOnInit();

    expect(component.userName).toBe('Invitado');
  });

  it('should search and return suggestions', () => {
    component.searchTerm = 'batman';
    component.onSearchChange();

    const req = httpMock.expectOne('http://filmania.ddns.net:8000/api/movies/search?q=batman');
    expect(req.request.method).toBe('GET');
    req.flush({ results: [{ title: 'Batman Begins' }, { title: 'The Batman' }] });

    expect(component.suggestions.length).toBe(2);
  });

  it('should clear suggestions if input too short', () => {
    component.searchTerm = 'b';
    component.onSearchChange();
    expect(component.suggestions).toEqual([]);
  });

  it('should navigate to movie details', () => {
    component.goToDetails(42);
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/movies', 42, 'detail']);
  });

  it('should toggle dropdown', () => {
    component.showDropdown = false;
    component.toggleDropdown();
    expect(component.showDropdown).toBeTrue();
  });

  it('should toggle and close mobile menu', () => {
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

  it('should call logout and clear session', () => {
    spyOn(localStorage, 'removeItem');
    localStorage.setItem('token', 'token');
    localStorage.setItem('user', 'user');
    authServiceSpy.logout.and.returnValue(of({}));

    component.logout();

    expect(localStorage.removeItem).toHaveBeenCalledWith('token');
    expect(localStorage.removeItem).toHaveBeenCalledWith('user');
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/movies']);
  });

  it('should return isAuthenticated state', () => {
    authServiceSpy.isLoggedIn.and.returnValue(true);
    expect(component.isAuthenticated()).toBeTrue();
  });
});
