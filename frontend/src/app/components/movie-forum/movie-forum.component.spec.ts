import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { MovieForumComponent } from './movie-forum.component';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { AuthService } from '../../services/auth.service';
import { NotificationService } from '../../services/notification.service';
import { RouterTestingModule } from '@angular/router/testing';
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';
import { NO_ERRORS_SCHEMA } from '@angular/core';

describe('MovieForumComponent', () => {
  let component: MovieForumComponent;
  let fixture: ComponentFixture<MovieForumComponent>;
  let httpMock: HttpTestingController;
  let authServiceMock: any;
  let notificationServiceMock: any;

  beforeEach(async () => {
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
      imports: [HttpClientTestingModule, RouterTestingModule],
      declarations: [MovieForumComponent],
      providers: [
        { provide: AuthService, useValue: authServiceMock },
        { provide: NotificationService, useValue: notificationServiceMock },
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: { paramMap: { get: () => '1' } }
          }
        }
      ],
      schemas: [NO_ERRORS_SCHEMA] // Ignorar componentes hijos desconocidos
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MovieForumComponent);
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

  it('should initialize movieId and call loadMovieDetails and loadThread', () => {
    const movieReq = httpMock.expectOne('https://filmania.ddns.net:8000/api/movies/1');
    expect(movieReq.request.method).toBe('GET');
    movieReq.flush({ movie_details: { id: 1, title: 'Test Movie' } });

    const threadReq = httpMock.expectOne('https://filmania.ddns.net:8000/api/threads/1');
    expect(threadReq.request.method).toBe('GET');
    threadReq.flush({ id: 1, comments: [] });

    expect(component.movie).toBeTruthy();
    expect(component.thread).toBeTruthy();
  });

  it('should post a comment', fakeAsync(() => {
    component.thread = { id: 1, comments: [] };
    component.movieId = '1';
    component.newComment = 'This is a test comment';
    sessionStorage.setItem('token', 'mock-token');

    component.postComment();

    const postReq = httpMock.expectOne('https://filmania.ddns.net:8000/api/comments');
    expect(postReq.request.method).toBe('POST');
    postReq.flush({});

    const threadReq = httpMock.expectOne('https://filmania.ddns.net:8000/api/threads/1');
    threadReq.flush({ id: 1, comments: [] });

    tick();
    expect(component.loading).toBeFalse();
    expect(component.newComment).toBe('');
  }));

  it('should toggle reply visibility', () => {
    const comment = { showReply: false, replyText: '' };
    component.toggleReply(comment);
    expect(comment.showReply).toBeTrue();

    component.toggleReply(comment);
    expect(comment.showReply).toBeFalse();
  });

  it('should reply to a comment', fakeAsync(() => {
    component.thread = { id: 1 };
    sessionStorage.setItem('token', 'mock-token');
    const comment = { id: 123, replyText: 'My reply' };

    component.replyTo(comment.id, comment.replyText);

    const postReq = httpMock.expectOne('https://filmania.ddns.net:8000/api/comments');
    expect(postReq.request.method).toBe('POST');
    postReq.flush({});

    const threadReq = httpMock.expectOne('https://filmania.ddns.net:8000/api/threads/1');
    threadReq.flush({ id: 1, comments: [] });

    tick();
  }));

  it('should call logout and clear session', () => {
    spyOn(component as any, 'clearLocalSession');
    component.logout();
    expect(authServiceMock.logout).toHaveBeenCalled();
    expect((component as any).clearLocalSession).toHaveBeenCalled();
  });

  it('should search movies and update suggestions', () => {
    component.searchTerm = 'test';
    component.onSearchChange();

    const req = httpMock.expectOne('https://filmania.ddns.net:8000/api/movies/search?q=test');
    req.flush({ results: [{ title: 'Test Movie' }] });

    expect(component.suggestions.length).toBeGreaterThan(0);
  });

});
