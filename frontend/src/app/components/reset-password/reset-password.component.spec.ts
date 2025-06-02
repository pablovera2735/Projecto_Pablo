import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ResetPasswordComponent } from './reset-password.component';
import { ActivatedRoute, Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { AuthService } from '../../services/auth.service';
import { NO_ERRORS_SCHEMA } from '@angular/core';

describe('ResetPasswordComponent', () => {
  let component: ResetPasswordComponent;
  let fixture: ComponentFixture<ResetPasswordComponent>;
  let authServiceSpy: jasmine.SpyObj<AuthService>;
  let routerSpy: jasmine.SpyObj<Router>;

  beforeEach(async () => {
    const authSpy = jasmine.createSpyObj('AuthService', ['resetPasswordWithCode']);
    const routerMock = jasmine.createSpyObj('Router', ['navigate']);

    await TestBed.configureTestingModule({
      declarations: [ResetPasswordComponent],
      providers: [
        { provide: AuthService, useValue: authSpy },
        { provide: Router, useValue: routerMock },
        {
          provide: ActivatedRoute,
          useValue: {
            queryParams: of({ email: 'test@example.com' })
          }
        }
      ],
      schemas: [NO_ERRORS_SCHEMA] // Ignora errores de template
    }).compileComponents();

    fixture = TestBed.createComponent(ResetPasswordComponent);
    component = fixture.componentInstance;
    authServiceSpy = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
    routerSpy = TestBed.inject(Router) as jasmine.SpyObj<Router>;

    fixture.detectChanges(); // Ejecuta ngOnInit
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize email from query params', () => {
    expect(component.email).toBe('test@example.com');
  });

  it('should reset password successfully', () => {
    const mockResponse = { message: 'Contraseña actualizada correctamente' };
    authServiceSpy.resetPasswordWithCode.and.returnValue(of(mockResponse));

    component.code = '123456';
    component.newPassword = 'NewPass123';
    component.newPasswordConfirmation = 'NewPass123';

    component.resetPassword();

    expect(authServiceSpy.resetPasswordWithCode).toHaveBeenCalledWith({
      email: 'test@example.com',
      code: '123456',
      new_password: 'NewPass123',
      new_password_confirmation: 'NewPass123'
    });

    expect(component.successMessage).toBe('Contraseña actualizada correctamente');
    expect(component.errorMessage).toBe('');
    expect(component.loading).toBeFalse();
  });

  it('should handle reset password error', () => {
    authServiceSpy.resetPasswordWithCode.and.returnValue(
      throwError({ error: { message: 'Código inválido' } })
    );

    component.resetPassword();

    expect(component.errorMessage).toBe('Código inválido');
    expect(component.successMessage).toBe('');
    expect(component.loading).toBeFalse();
  });

  it('should clear messages correctly', () => {
    component.successMessage = 'Éxito';
    component.errorMessage = 'Error';

    component.clearMessages();

    expect(component.successMessage).toBe('');
    expect(component.errorMessage).toBe('');
  });

  it('should clear success message only', () => {
    component.successMessage = 'Éxito';
    component.clearMessage('success');
    expect(component.successMessage).toBe('');
  });

  it('should clear error message only', () => {
    component.errorMessage = 'Error';
    component.clearMessage('error');
    expect(component.errorMessage).toBe('');
  });
});
