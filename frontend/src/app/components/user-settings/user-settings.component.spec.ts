import { TestBed, ComponentFixture } from '@angular/core/testing';
import { UserSettingsComponent } from './user-settings.component';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';

describe('UserSettingsComponent', () => {
  let component: UserSettingsComponent;
  let fixture: ComponentFixture<UserSettingsComponent>;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [UserSettingsComponent],
      imports: [HttpClientTestingModule]
    });

    fixture = TestBed.createComponent(UserSettingsComponent);
    component = fixture.componentInstance;
    httpMock = TestBed.inject(HttpTestingController);
  });

  it('should show alert if email is invalid', () => {
    spyOn(window, 'alert');
    component.newEmail = 'invalid-email';
    component.updateEmail();
    expect(window.alert).toHaveBeenCalledWith('Por favor, introduce un correo válido.');
  });

  it('should send PUT request to update email', () => {
    spyOn(window, 'alert');
    component.newEmail = 'test@example.com';
    sessionStorage.setItem('token', 'fake-token');

    component.updateEmail();

    const req = httpMock.expectOne('http://localhost:8000/api/profile/update-email');
    expect(req.request.method).toBe('PUT');
    expect(req.request.body).toEqual({ email: 'test@example.com' });

    req.flush({});

    expect(window.alert).toHaveBeenCalledWith('Correo actualizado correctamente');
    expect(component.newEmail).toBe('');

    httpMock.verify();
  });
});
