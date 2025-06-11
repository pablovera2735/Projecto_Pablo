import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FavoritesComponent } from './favorites.component';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { AuthService } from '../../services/auth.service';
import { of } from 'rxjs';

describe('FavoritesComponent', () => {
  let component: FavoritesComponent;
  let fixture: ComponentFixture<FavoritesComponent>;
  let httpMock: HttpTestingController;
  let authServiceSpy: jasmine.SpyObj<AuthService>;

  beforeEach(async () => {
    const spy = jasmine.createSpyObj('AuthService', ['getUser']);

    await TestBed.configureTestingModule({
      declarations: [FavoritesComponent],
      imports: [HttpClientTestingModule],
      providers: [{ provide: AuthService, useValue: spy }]
    }).compileComponents();

    fixture = TestBed.createComponent(FavoritesComponent);
    component = fixture.componentInstance;
    httpMock = TestBed.inject(HttpTestingController);
    authServiceSpy = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;

    authServiceSpy.getUser.and.returnValue({ id: 1 });
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should load favorites and custom lists on init', () => {
    const mockFavorites = {
      favorites: [
        { id: 1, title: 'Movie A', poster_path: '/a.jpg' },
        { id: 2, title: 'Movie B', poster_path: '/b.jpg' }
      ]
    };

    const mockLists = {
      lists: [
        { name: 'Watch Later', movies: [{ id: 3, title: 'Movie C', poster_path: '/c.jpg' }] }
      ]
    };

    component.ngOnInit();

    const favReq = httpMock.expectOne('https://filmania.ddns.net:8000/api/users/1/favorites');
    expect(favReq.request.method).toBe('GET');
    favReq.flush(mockFavorites);

    const listReq = httpMock.expectOne('https://filmania.ddns.net:8000/api/users/1/lists');
    expect(listReq.request.method).toBe('GET');
    listReq.flush(mockLists);

    expect(component.userFavorites.length).toBe(2);
    expect(component.userFavorites[0].title).toBe('Movie A');

    expect(component.customLists.length).toBe(1);
    expect(component.customLists[0].name).toBe('Watch Later');
  });
});
