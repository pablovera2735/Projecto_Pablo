import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { MovieListComponent } from './movie-list.component';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { NotificationService } from '../../services/notification.service';
import { of } from 'rxjs';
import { NO_ERRORS_SCHEMA } from '@angular/core';

describe('MovieListComponent', () => {
  let component: MovieListComponent;
  let fixture: ComponentFixture<MovieListComponent>;
  let httpMock: HttpTestingController;
  let routerMock: any;
  let authServiceMock: any;
  let notificationServiceMock: any;

  beforeEach(async () => {
    routerMock = jasmine.createSpyObj('Router', ['navigate']);
    authServiceMock = {
      getUser: jasmine.createSpy().and.returnValue({ name: 'TestUser', profile_photo: '' }),
      isLoggedIn: jasmine.createSpy().and.returnValue(true),
      logout: jasmine.createSpy().and.returnValue(of({}))
    };
    notificationServiceMock = {
      getNotifications: jasmine.createSpy().and.returnValue(of([])),
      markAllAsRead: jasmine.createSpy().and.returnValue(of({}))
    };

    await TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      declarations: [MovieListComponent],
      providers: [
        { provide: Router, useValue: routerMock },
        { provide: AuthService, useValue: authServiceMock },
        { provide: NotificationService, useValue: notificationServiceMock }
      ],
      schemas: [NO_ERRORS_SCHEMA]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MovieListComponent);
    component = fixture.componentInstance;
    httpMock = TestBed.inject(HttpTestingController);
    fixture.detectChanges();
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should load genres and movies by genre on init', () => {
    const mockGenres = { genres: [{ id: 1, name: 'Action' }, { id: 2, name: 'Drama' }] };

    const req = httpMock.expectOne('https://filmania.ddns.net:8000/api/movies/genres');
    expect(req.request.method).toBe('GET');
    req.flush(mockGenres);

    const genreReq1 = httpMock.expectOne('https://filmania.ddns.net:8000/api/movies/genre/1?page=1');
    genreReq1.flush({ movies: [{ id: 101, title: 'Action Movie' }] });

    const genreReq2 = httpMock.expectOne('https://filmania.ddns.net:8000/api/movies/genre/2?page=1');
    genreReq2.flush({ movies: [{ id: 102, title: 'Drama Movie' }] });

    expect(component.genres.length).toBe(2);
    expect(component.moviesByGenre[1].length).toBe(1);
    expect(component.moviesByGenre[2].length).toBe(1);
  });

  it('should update suggestions when searchTerm is valid', () => {
    component.searchTerm = 'batman';
    component.onSearchChange();

    const req = httpMock.expectOne('https://filmania.ddns.net:8000/api/movies/search?q=batman');
    expect(req.request.method).toBe('GET');

    req.flush({ results: Array(10).fill({ title: 'Batman Movie' }) });

    expect(component.suggestions.length).toBe(8); // sliced to 8
  });

  it('should not search if searchTerm is too short', () => {
    component.searchTerm = 'a';
    component.onSearchChange();
    expect(component.suggestions).toEqual([]);
  });

  it('should call goToDetails', () => {
    component.goToDetails(1);
    expect(routerMock.navigate).toHaveBeenCalledWith(['/movies', 1, 'detail']);
  });

  it('should call goToForum', () => {
    component.goToForum(5);
    expect(routerMock.navigate).toHaveBeenCalledWith(['/movies', 5, 'forum']);
  });

  it('should clear session and call logout', () => {
    spyOn<any>(component, 'clearLocalSession');
    component.logout();
    expect(authServiceMock.logout).toHaveBeenCalled();
    expect(component['clearLocalSession']).toHaveBeenCalled();
    expect(routerMock.navigate).toHaveBeenCalledWith(['/foro']);
  });

  it('should mark all notifications as read', () => {
    component.notifications = [{ id: 1, read: false }, { id: 2, read: false }];
    component.markAllAsRead();
    expect(notificationServiceMock.markAllAsRead).toHaveBeenCalled();
    expect(component.notifications.every(n => n.read)).toBeTrue();
  });

  it('should set user name and profile photo from auth service', () => {
    component.setUserName();
    expect(component.userName).toBe('TestUser');
    expect(component.profilePhoto).toBe('assets/img/Perfil_Inicial.jpg');
  });

  it('should return correct image path', () => {
    const itemWithPoster = { poster_path: '/img.jpg' };
    const itemWithoutImage = {};
    expect(component.getItemImage(itemWithPoster)).toContain('/img.jpg');
    expect(component.getItemImage(itemWithoutImage)).toBe('assets/img/no-image.png');
  });

  it('should call goToSearchResults', () => {
    component.searchTerm = 'comedy';
    component.goToSearchResults();
    expect(routerMock.navigate).toHaveBeenCalledWith(['/busqueda'], { queryParams: { q: 'comedy' } });
  });
});
