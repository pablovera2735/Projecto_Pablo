import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AdminPanelComponent } from './admin-panel.component';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
import { of } from 'rxjs';

describe('AdminPanelComponent', () => {
  let component: AdminPanelComponent;
  let fixture: ComponentFixture<AdminPanelComponent>;
  let httpMock: HttpTestingController;
  let authServiceSpy: jasmine.SpyObj<AuthService>;
  let routerSpy: jasmine.SpyObj<Router>;

  beforeEach(async () => {
    const authSpy = jasmine.createSpyObj('AuthService', ['isAdmin']);
    const routeSpy = jasmine.createSpyObj('Router', ['navigate']);

    await TestBed.configureTestingModule({
      declarations: [AdminPanelComponent],
      imports: [HttpClientTestingModule],
      providers: [
        { provide: AuthService, useValue: authSpy },
        { provide: Router, useValue: routeSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(AdminPanelComponent);
    component = fixture.componentInstance;
    httpMock = TestBed.inject(HttpTestingController);
    authServiceSpy = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
    routerSpy = TestBed.inject(Router) as jasmine.SpyObj<Router>;
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should redirect if user is not admin', () => {
    authServiceSpy.isAdmin.and.returnValue(false);
    component.ngOnInit();
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/movies']);
  });

  it('should load users if user is admin', () => {
    authServiceSpy.isAdmin.and.returnValue(true);
    sessionStorage.setItem('token', 'fake-token');

    component.ngOnInit();

    const req = httpMock.expectOne('http://localhost:8000/api/admin/users');
    expect(req.request.method).toBe('GET');
    expect(req.request.headers.get('Authorization')).toBe('Bearer fake-token');

    req.flush([{ id: 1, name: 'John Doe' }]);

    expect(component.users.length).toBe(1);
    expect(component.users[0].name).toBe('John Doe');
  });

  it('should promote a user to admin', () => {
    sessionStorage.setItem('token', 'fake-token');
    spyOn(component, 'loadUsers');

    component.promoteToAdmin(123);

    const req = httpMock.expectOne('http://localhost:8000/api/admin/users/123/make-admin');
    expect(req.request.method).toBe('PUT');
    req.flush({});

    expect(component.loadUsers).toHaveBeenCalled();
  });

  it('should delete user after confirmation', () => {
    spyOn(window, 'confirm').and.returnValue(true);
    spyOn(component, 'loadUsers');
    sessionStorage.setItem('token', 'fake-token');

    component.deleteUser(123);

    const req = httpMock.expectOne('http://localhost:8000/api/admin/users/123');
    expect(req.request.method).toBe('DELETE');
    req.flush({});

    expect(component.loadUsers).toHaveBeenCalled();
  });

  it('should not delete user if confirmation is canceled', () => {
    spyOn(window, 'confirm').and.returnValue(false);
    spyOn(component, 'loadUsers');

    component.deleteUser(123);

    httpMock.expectNone('http://localhost:8000/api/admin/users/123');
    expect(component.loadUsers).not.toHaveBeenCalled();
  });
});
