import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MovieDetailComponent } from './movie-detail.component';
import { ActivatedRoute } from '@angular/router';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { DomSanitizer } from '@angular/platform-browser';
import { AuthService } from '../../services/auth.service';
import { NotificationService } from '../../services/notification.service';
import { of } from 'rxjs';
import { Router } from '@angular/router';

describe('MovieDetailComponent', () => {
  let component: MovieDetailComponent;
  let fixture: ComponentFixture<MovieDetailComponent>;
  let httpMock: HttpTestingController;
  let authServiceSpy: jasmine.SpyObj<AuthService>;
  let notificationServiceSpy: jasmine.SpyObj<NotificationService>;
  let routerSpy: jasmine.SpyObj<Router>;

  beforeEach(async () => {
    const authSpy = jasmine.createSpyObj('AuthService', ['getUser', 'isLoggedIn', 'logout']);
    const notifSpy = jasmine.createSpyObj('NotificationService', ['getNotifications', 'markAllAsRead']);
    const router = jasmine.createSpyObj('Router', ['navigate']);

    await TestBed.configureTestingModule({
      declarations: [MovieDetailComponent],
      imports: [HttpClientTestingModule],
      providers: [
        { provide: AuthService, useValue: authSpy },
        { provide: NotificationService, useValue: notifSpy },
        { provide: Router, useValue: router },
        {
          provide: ActivatedRoute,
          useValue: {
            paramMap: of({ get: (key: string) => '1' }) // mock id = 1
          }
        }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(MovieDetailComponent);
    component = fixture.componentInstance;
    httpMock = TestBed.inject(HttpTestingController);
    authServiceSpy = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
    notificationServiceSpy = TestBed.inject(NotificationService) as jasmine.SpyObj<NotificationService>;
    routerSpy = TestBed.inject(Router) as jasmine.SpyObj<Router>;

    fixture.detectChanges();
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('debería crear el componente', () => {
    expect(component).toBeTruthy();
  });

  it('debería inicializar y cargar película, elenco, reseñas y notificaciones', () => {
    const dummyMovie = {
      movie_details: {
        id: 1,
        title: 'Test Movie',
        trailer: 'https://youtube.com/embed/test',
        poster_path: '/poster.jpg'
      }
    };

    const dummyCast = { cast: [{ name: 'Actor 1' }, { name: 'Actor 2' }] };
    const dummyReviews = { reviews: [{ rating: 4, comment: 'Muy buena' }] };
    const dummyNotifications = [{ id: 1, message: 'Notificación', read: false }];

    // Simular respuestas HTTP
    const movieReq = httpMock.expectOne('http://filmania.ddns.net:8000/api/movies/1');
    movieReq.flush(dummyMovie);

    const castReq = httpMock.expectOne('http://filmania.ddns.net:8000/api/movies/1/cast');
    castReq.flush(dummyCast);

    const reviewReq = httpMock.expectOne('http://filmania.ddns.net:8000/api/movies/1/reviews');
    reviewReq.flush(dummyReviews);

    notificationServiceSpy.getNotifications.and.returnValue(of(dummyNotifications));
    component.loadNotifications();

    expect(component.movie.title).toBe('Test Movie');
    expect(component.cast.length).toBe(2);
    expect(component.reviews.length).toBe(1);
    expect(component.notifications.length).toBe(1);
  });

  it('debería establecer el nombre de usuario correctamente', () => {
    authServiceSpy.getUser.and.returnValue({
      name: 'Pablo',
      profile_photo: 'images/pablo.jpg'
    });

    component.setUserName();

    expect(component.userName).toBe('Pablo');
    expect(component.profilePhoto).toContain('http://filmania.ddns.net:8000/images/pablo.jpg');
  });

  it('debería marcar todas las notificaciones como leídas', () => {
    const mockNotifications = [
      { id: 1, message: 'n1', read: false },
      { id: 2, message: 'n2', read: false }
    ];

    component.notifications = [...mockNotifications];
    notificationServiceSpy.markAllAsRead.and.returnValue(of(null));

    component.markAllAsRead();

    expect(component.notifications.every(n => n.read)).toBeTrue();
  });

  it('debería decir si el usuario está autenticado', () => {
    authServiceSpy.isLoggedIn.and.returnValue(true);
    expect(component.isAuthenticated()).toBeTrue();
  });

  it('debería navegar a detalles de otra película', () => {
    component.goToDetails(999);
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/movies', 999, 'detail']);
  });

  it('debería vaciar sugerencias si el término de búsqueda es corto', () => {
    component.searchTerm = 'a';
    component.onSearchChange();
    expect(component.suggestions.length).toBe(0);
  });

  it('debería navegar a resultados de búsqueda', () => {
    component.searchTerm = 'batman';
    component.goToSearchResults();
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/busqueda'], { queryParams: { q: 'batman' } });
  });

  it('debería limpiar sesión y redirigir al cerrar sesión', () => {
    spyOn(sessionStorage, 'removeItem');
    component.logout();
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/movies']);
  });
});
