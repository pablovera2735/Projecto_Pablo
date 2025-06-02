import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FriendListComponent } from './friend-list.component';
import { FriendService } from '../../services/friend.service';
import { of, throwError } from 'rxjs';
import { FormsModule } from '@angular/forms';

describe('FriendListComponent', () => {
  let component: FriendListComponent;
  let fixture: ComponentFixture<FriendListComponent>;
  let friendServiceSpy: jasmine.SpyObj<FriendService>;

  beforeEach(async () => {
    const spy = jasmine.createSpyObj('FriendService', ['getFriends', 'addFriend', 'removeFriend']);

    await TestBed.configureTestingModule({
      declarations: [FriendListComponent],
      imports: [FormsModule],
      providers: [{ provide: FriendService, useValue: spy }]
    }).compileComponents();

    fixture = TestBed.createComponent(FriendListComponent);
    component = fixture.componentInstance;
    friendServiceSpy = TestBed.inject(FriendService) as jasmine.SpyObj<FriendService>;

    // Simula un usuario en localStorage
    localStorage.setItem('user', JSON.stringify({ id: 1 }));
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should load friends on init', () => {
    const mockFriends = [{ id: 2, name: 'Alice' }, { id: 3, name: 'Bob' }];
    friendServiceSpy.getFriends.and.returnValue(of(mockFriends));

    component.ngOnInit();

    expect(friendServiceSpy.getFriends).toHaveBeenCalledWith(1);
    expect(component.friends).toEqual(mockFriends);
    expect(component.message).toBe('');
  });

  it('should show error message if user not found in localStorage', () => {
    localStorage.removeItem('user');

    component.loadFriends();

    expect(component.message).toBe('Usuario no encontrado');
    expect(friendServiceSpy.getFriends).not.toHaveBeenCalled();
  });

  it('should show error message on failed friend load', () => {
    friendServiceSpy.getFriends.and.returnValue(throwError(() => new Error('Fail')));

    component.loadFriends();

    expect(component.message).toBe('Error al cargar amigos');
  });

  it('should add a friend and reload list', () => {
    component.newFriendId = 42;
    friendServiceSpy.addFriend.and.returnValue(of({}));
    friendServiceSpy.getFriends.and.returnValue(of([]));

    component.addFriend();

    expect(friendServiceSpy.addFriend).toHaveBeenCalledWith(42);
    expect(component.message).toBe('Amigo agregado');
    expect(component.newFriendId).toBeNull();
    expect(friendServiceSpy.getFriends).toHaveBeenCalled();
  });

  it('should show error message if addFriend fails', () => {
    component.newFriendId = 999;
    friendServiceSpy.addFriend.and.returnValue(throwError(() => new Error('Fail')));

    component.addFriend();

    expect(component.message).toBe('Error al agregar amigo');
  });

  it('should remove a friend and reload list', () => {
    friendServiceSpy.removeFriend.and.returnValue(of({}));
    friendServiceSpy.getFriends.and.returnValue(of([]));

    component.removeFriend(2);

    expect(friendServiceSpy.removeFriend).toHaveBeenCalledWith(2);
    expect(friendServiceSpy.getFriends).toHaveBeenCalled();
    expect(component.message).toBe('Amigo eliminado');
  });
});
