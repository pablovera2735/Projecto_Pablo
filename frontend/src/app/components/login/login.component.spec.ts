import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LoginComponent } from './login.component';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { FormsModule } from '@angular/forms';

describe('LoginComponent', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;
  let authServiceSpy: jasmine.SpyObj<AuthService>;
  let routerSpy: jasmine.SpyObj<Router>;

  beforeEach(async () => {
    const authSpy = jasmine.createSpyObj('AuthService', ['login']);
    const router = jasmine.createSpyObj('Router', ['navigate']);

    await TestBed.configureTestingModule({
      declarations: [LoginComponent],
      imports: [FormsModule],
      providers: [
        { provide: AuthService, useValue: authSpy },
        { provide: Router, useValue: router }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    authServiceSpy = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
    routerSpy = TestBed.inject(Router) as jasmine.SpyObj<Router>;
  });

  it('should create component', () => {
    expect(component).toBeTruthy();
  });

  it('should login successfully and redirect if email is verified', () => {
    const mockResponse = {
      data: {
        accessToken: 'fake-token',
        user: { id: 1, name: 'Test User', email_verified_at: '2024-01-01' }
      }
    };

    authServiceSpy.login.and.returnValue(of(mockResponse));
    spyOn(sessionStorage, 'setItem');

    component.email = 'test@example.com';
    component.password = '123456';
    component.login();

    expect(authServiceSpy.login).toHaveBeenCalledWith('test@example.com', '123456');
    expect(sessionStorage.setItem).toHaveBeenCalledWith('token', 'fake-token');
    expect(sessionStorage.setItem).toHaveBeenCalledWith('user', JSON.stringify(mockResponse.data.user));
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/movies']);
    expect(component.errorMessage).toBe('');
    expect(component.loading).toBeFalse();
  });

  it('should show error if email is not verified', () => {
    const mockResponse = {
      data: {
        accessToken: 'fake-token',
        user: { id: 1, name: 'User', email_verified_at: null }
      }
    };

    authServiceSpy.login.and.returnValue(of(mockResponse));

    component.email = 'noverify@example.com';
    component.password = 'password';
    component.login();

    expect(component.errorMessage).toContain('verificar tu correo');
    expect(routerSpy.navigate).not.toHaveBeenCalled();
    expect(component.loading).toBeFalse();
  });

  it('should show error on invalid credentials', () => {
    const mockError = {
      error: { message: 'Credenciales incorrectas' }
    };

    authServiceSpy.login.and.returnValue(throwError(() => mockError));

    component.email = 'fail@example.com';
    component.password = 'wrongpass';
    component.login();

    expect(component.errorMessage).toBe('Credenciales incorrectas');
    expect(component.loading).toBeFalse();
  });

  it('should handle unknown login error', () => {
    authServiceSpy.login.and.returnValue(throwError(() => new Error('Unknown')));

    component.login();

    expect(component.errorMessage).toBe('Credenciales incorrectas');
    expect(component.loading).toBeFalse();
  });
});
