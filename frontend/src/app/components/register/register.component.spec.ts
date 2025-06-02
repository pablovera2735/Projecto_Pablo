import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { RegisterComponent } from './register.component';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';

describe('RegisterComponent', () => {
  let component: RegisterComponent;
  let fixture: ComponentFixture<RegisterComponent>;
  let authServiceSpy: jasmine.SpyObj<AuthService>;
  let routerSpy: jasmine.SpyObj<Router>;

  beforeEach(async () => {
    const authSpy = jasmine.createSpyObj('AuthService', ['register', 'resendVerification']);
    const rSpy = jasmine.createSpyObj('Router', ['navigate']);

    await TestBed.configureTestingModule({
      declarations: [RegisterComponent],
      providers: [
        { provide: AuthService, useValue: authSpy },
        { provide: Router, useValue: rSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(RegisterComponent);
    component = fixture.componentInstance;
    authServiceSpy = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
    routerSpy = TestBed.inject(Router) as jasmine.SpyObj<Router>;
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should show error if passwords do not match', () => {
    component.name = 'Test';
    component.email = 'test@example.com';
    component.password = '1234';
    component.confirmPassword = '5678';

    component.register();

    expect(component.errorMessage).toBe('Las contraseñas no coinciden');
    expect(authServiceSpy.register).not.toHaveBeenCalled();
  });

  it('should call register and show success message on success', fakeAsync(() => {
    component.name = 'Test';
    component.email = 'test@example.com';
    component.password = '123456';
    component.confirmPassword = '123456';

    authServiceSpy.register.and.returnValue(of({}));

    component.register();

    expect(component.loading).toBeTrue();
    tick(); // simulate async

    expect(component.successMessage).toContain('Cuenta creada correctamente');
    expect(component.showResend).toBeTrue();
    expect(component.errorMessage).toBe('');
    expect(component.loading).toBeFalse();

    tick(4000);
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/login']);
  }));

  it('should show error message on registration error', () => {
    component.name = 'Test';
    component.email = 'test@example.com';
    component.password = '123456';
    component.confirmPassword = '123456';

    const error = new HttpErrorResponse({
      error: { message: 'Correo ya registrado' },
      status: 400
    });

    authServiceSpy.register.and.returnValue(throwError(() => error));

    component.register();

    expect(component.errorMessage).toBe('Correo ya registrado');
    expect(component.successMessage).toBe('');
    expect(component.loading).toBeFalse();
  });

  it('should resend verification email on success', () => {
    authServiceSpy.resendVerification.and.returnValue(of({}));

    component.resendVerification();

    expect(component.successMessage).toBe('Correo de verificación reenviado correctamente.');
    expect(component.errorMessage).toBe('');
  });

  it('should show error if resend verification fails', () => {
    authServiceSpy.resendVerification.and.returnValue(throwError(() => new Error('Error')));

    component.resendVerification();

    expect(component.errorMessage).toBe('Error al reenviar el correo de verificación.');
    expect(component.successMessage).toBe('');
  });
});
