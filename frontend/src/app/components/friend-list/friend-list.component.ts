import { Component, OnInit } from '@angular/core';
import { FriendService } from '../../services/friend.service';

@Component({
  selector: 'app-friend-list',
  templateUrl: './friend-list.component.html',
  styleUrls: ['./friend-list.component.css']
})
export class FriendListComponent implements OnInit {
  friends: any[] = [];
  newFriendId: number | null = null;
  message = '';

  constructor(private friendService: FriendService) {}

  ngOnInit(): void {
    this.loadFriends();
  }

  loadFriends(): void {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    if (!user || !user.id) {
      this.message = 'Usuario no encontrado';
      return;
    }
  
    this.friendService.getFriends(user.id).subscribe({
      next: (res: any) => {
        this.friends = res;
      },
      error: () => {
        this.message = 'Error al cargar amigos';
      }
    });
  }

  addFriend(): void {
    if (!this.newFriendId) return;

    this.friendService.addFriend(this.newFriendId).subscribe({
      next: () => {
        this.message = 'Amigo agregado';
        this.newFriendId = null;
        this.loadFriends();
      },
      error: () => {
        this.message = 'Error al agregar amigo';
      }
    });
  }

  removeFriend(friendId: number): void {
    this.friendService.removeFriend(friendId).subscribe(() => {
      this.message = 'Amigo eliminado';
      this.loadFriends();
    });
  }
}
