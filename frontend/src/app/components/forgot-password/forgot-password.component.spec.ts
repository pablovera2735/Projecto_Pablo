import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { ForgotPasswordComponent } from './forgot-password.component';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { FormsModule } from '@angular/forms';

describe('ForgotPasswordComponent', () => {
  let component: ForgotPasswordComponent;
  let fixture: ComponentFixture<ForgotPasswordComponent>;
  let authServiceSpy: jasmine.SpyObj<AuthService>;
  let routerSpy: jasmine.SpyObj<Router>;

  beforeEach(async () => {
    const authSpy = jasmine.createSpyObj('AuthService', ['recoverPassword']);
    const navSpy = jasmine.createSpyObj('Router', ['navigate']);

    await TestBed.configureTestingModule({
      declarations: [ForgotPasswordComponent],
      imports: [FormsModule],
      providers: [
        { provide: AuthService, useValue: authSpy },
        { provide: Router, useValue: navSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ForgotPasswordComponent);
    component = fixture.componentInstance;
    authServiceSpy = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
    routerSpy = TestBed.inject(Router) as jasmine.SpyObj<Router>;
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should call recoverPassword and show success message', fakeAsync(() => {
    const mockResponse = { message: 'Correo enviado' };
    authServiceSpy.recoverPassword.and.returnValue(of(mockResponse));

    component.email = 'test@example.com';
    component.recoverPassword();

    expect(authServiceSpy.recoverPassword).toHaveBeenCalledWith('test@example.com');
    tick(2000); // Simula el tiempo de espera para redirección

    expect(component.successMessage).toBe('Correo enviado');
    expect(component.loading).toBeFalse();
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/reset-password'], { queryParams: { email: 'test@example.com' } });
  }));

  it('should show error message on failed recoverPassword', () => {
    const error = { error: { message: 'Correo no encontrado' } };
    authServiceSpy.recoverPassword.and.returnValue(throwError(() => error));

    component.email = 'fail@example.com';
    component.recoverPassword();

    expect(authServiceSpy.recoverPassword).toHaveBeenCalledWith('fail@example.com');
    expect(component.errorMessage).toBe('Correo no encontrado');
    expect(component.loading).toBeFalse();
  });

  it('should clear success and error messages', () => {
    component.successMessage = 'Exito';
    component.errorMessage = 'Error';

    component.clearMessage('success');
    expect(component.successMessage).toBe('');

    component.clearMessage('error');
    expect(component.errorMessage).toBe('');
  });
});
