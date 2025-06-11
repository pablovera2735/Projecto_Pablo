import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PrivateMessageComponent } from './private-message.component';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { of } from 'rxjs';

describe('PrivateMessageComponent', () => {
  let component: PrivateMessageComponent;
  let fixture: ComponentFixture<PrivateMessageComponent>;
  let httpMock: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [PrivateMessageComponent],
      imports: [HttpClientTestingModule],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: {
            paramMap: of({ get: (key: string) => '123' }) // mock userId
          }
        },
        {
          provide: Router,
          useValue: jasmine.createSpyObj('Router', ['navigate'])
        }
      ]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PrivateMessageComponent);
    component = fixture.componentInstance;
    httpMock = TestBed.inject(HttpTestingController);

    sessionStorage.setItem('token', 'mock-token');

    fixture.detectChanges(); // triggers ngOnInit
  });

  afterEach(() => {
    httpMock.verify();
    sessionStorage.clear();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should load recipient name successfully', () => {
    const req = httpMock.expectOne('https://filmania.ddns.net:8000/api/user/123/public-profile');
    expect(req.request.method).toBe('GET');
    expect(req.request.headers.get('Authorization')).toBe('Bearer mock-token');

    req.flush({ name: 'John Doe' });

    expect(component.recipientName).toBe('John Doe');
  });

  it('should set recipientName to fallback on error', () => {
    const req = httpMock.expectOne('https://filmania.ddns.net:8000/api/user/123/public-profile');
    req.error(new ErrorEvent('Network error'));

    expect(component.recipientName).toBe('Usuario desconocido');
  });

  it('should send message successfully', () => {
    component.messageContent = 'Hola';

    component.sendMessage();

    const req = httpMock.expectOne('https://filmania.ddns.net:8000/api/messages/send');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({
      recipient_id: '123',
      message: 'Hola'
    });

    req.flush({});

    expect(component.sendSuccess).toBeTrue();
    expect(component.sendError).toBeFalse();
    expect(component.messageContent).toBe('');
  });

  it('should handle message send failure', () => {
    component.messageContent = 'Hola';

    component.sendMessage();

    const req = httpMock.expectOne('https://filmania.ddns.net:8000/api/messages/send');
    req.error(new ErrorEvent('Error al enviar'));

    expect(component.sendSuccess).toBeFalse();
    expect(component.sendError).toBeTrue();
  });

  it('should not send message if content is empty', () => {
    component.messageContent = '    ';
    component.sendMessage();

    httpMock.expectNone('https://filmania.ddns.net:8000/api/messages/send');
    expect(component.sendSuccess).toBeFalse();
  });
});
