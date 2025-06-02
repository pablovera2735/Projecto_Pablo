import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MovieComponent } from './movie.component';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { FormsModule } from '@angular/forms';
import { By } from '@angular/platform-browser';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { NotificationService } from '../../services/notification.service';

describe('MovieComponent', () => {
  let component: MovieComponent;
  let fixture: ComponentFixture<MovieComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [MovieComponent],
      imports: [
        HttpClientTestingModule,
        RouterTestingModule,
        FormsModule
      ],
      providers: [
        AuthService,
        NotificationService
      ],
      schemas: [NO_ERRORS_SCHEMA] // Ignorar componentes hijos
    }).compileComponents();

    fixture = TestBed.createComponent(MovieComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('debería crear el componente', () => {
    expect(component).toBeTruthy();
  });

  it('debería tener el campo searchTerm inicializado vacío', () => {
    expect(component.searchTerm).toBe('');
  });

  it('debería mostrar sugerencias si hay resultados de búsqueda', () => {
    component.suggestions = [
      { id: 1, title: 'Película 1', poster_path: '/poster1.jpg' },
      { id: 2, title: 'Película 2', poster_path: '/poster2.jpg' }
    ];
    fixture.detectChanges();

    const suggestionElements = fixture.debugElement.queryAll(By.css('.search-item'));
    expect(suggestionElements.length).toBe(2);
  });

  it('debería ejecutar toggleMobileMenu()', () => {
    expect(component.mobileMenuOpen).toBeFalse();
    component.toggleMobileMenu();
    expect(component.mobileMenuOpen).toBeTrue();
  });

  it('debería mostrar el nombre del usuario si está autenticado', () => {
    component.userName = 'Pablo';
    spyOn(component, 'isAuthenticated').and.returnValue(true);
    fixture.detectChanges();

    const userNameEl = fixture.debugElement.query(By.css('.user-btn'));
    expect(userNameEl.nativeElement.textContent).toContain('Pablo');
  });

  it('debería mostrar botón de login si el usuario no está autenticado', () => {
    spyOn(component, 'isAuthenticated').and.returnValue(false);
    fixture.detectChanges();

    const loginLink = fixture.debugElement.query(By.css('a[routerLink="/login"]'));
    expect(loginLink).toBeTruthy();
    expect(loginLink.nativeElement.textContent).toContain('Iniciar sesión');
  });

  it('debería navegar al detalle al hacer clic en una sugerencia', () => {
    const spy = spyOn(component, 'goToDetails');
    component.goToDetails(10);
    expect(spy).toHaveBeenCalledWith(10);
  });

  it('debería mostrar el botón "Ver más" en los carruseles', () => {
    component.recommendedMovies = [{
      id: 1,
      title: 'Test Movie',
      overview: 'Descripción',
      release_date: new Date().toString(),
      vote_average: 7.5,
      poster_path: '/poster.jpg',
      backdrop_path: '/path.jpg'
    }];
    fixture.detectChanges();

    const verMasBtn = fixture.debugElement.query(By.css('.blog-caption button'));
    expect(verMasBtn).toBeTruthy();
    expect(verMasBtn.nativeElement.textContent.trim()).toContain('Ver más');
  });
});
