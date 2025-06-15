import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AuthService } from '../../services/auth.service';

type BackendMessage = {
  id?: number;
  message: string;
  read: boolean;
  sender_id: number;
  created_at: string;
};

interface Message {
  id?: number;
  text: string;
  read: boolean;
  sender_id: number;
  created_at: string;
}

@Component({
  selector: 'app-private-message',
  templateUrl: './private-message.component.html',
  styleUrls: ['./private-message.component.css']
})
export class PrivateMessageComponent implements OnInit {
  userId!: string;
  recipientName: string = '';
  messageContent: string = '';
  sendSuccess: boolean = false;
  sendError: boolean = false;
  isOnline: boolean = false;
  messages: Message[] = [];
  currentUserId!: number;

  constructor(
    private route: ActivatedRoute,
    private authService: AuthService,
    private http: HttpClient,
  ) {}

  ngOnInit(): void {
    this.currentUserId = this.authService.getCurrentUserId();

    this.route.paramMap.subscribe(params => {
      const id = params.get('userId');
      if (id) {
        this.userId = id;
        this.loadRecipientName();
        this.loadMessages();
        this.checkIfRecipientOnline();

        // Verifica si está online cada 30s
        setInterval(() => this.checkIfRecipientOnline(), 30000);
      }
    });

    this.startPing(); // Marca al usuario actual como online cada minuto
  }

  isAuthenticated(): boolean {
    return this.authService.isLoggedIn();
  }

  startPing(): void {
    setInterval(() => {
      const token = sessionStorage.getItem('token');
      const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });

      this.http.post('http://filmania.ddns.net:8000/api/ping', {}, { headers }).subscribe();
    }, 60000);
  }

  checkIfRecipientOnline(): void {
    const token = sessionStorage.getItem('token');
    const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });

    this.http.get<{ is_online: boolean }>(
      `http://filmania.ddns.net:8000/api/is-online/${this.userId}`,
      { headers }
    ).subscribe({
      next: (res) => this.isOnline = res.is_online,
      error: () => this.isOnline = false
    });
  }

  loadRecipientName(): void {
    const token = sessionStorage.getItem('token');
    const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });

    this.http.get<any>(`http://filmania.ddns.net:8000/api/user/${this.userId}/public-profile`, { headers })
      .subscribe({
        next: (response) => {
          this.recipientName = response.name;
        },
        error: () => {
          this.recipientName = 'Usuario desconocido';
        }
      });
  }

  loadMessages(): void {
    const token = sessionStorage.getItem('token');
    const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });

    this.http.get<BackendMessage[]>(`http://filmania.ddns.net:8000/api/messages/conversation/${this.userId}`, { headers })
      .subscribe({
        next: (response) => {
          this.messages = response.map(m => ({
            text: m.message,
            read: m.read,
            sender_id: m.sender_id,
            created_at: m.created_at
          }));

          this.markMessagesAsRead();
        },
        error: () => {
          this.messages = [];
        }
      });
  }

  markMessagesAsRead(): void {
    const token = sessionStorage.getItem('token');
    const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });

    this.http.post('http://filmania.ddns.net:8000/api/messages/mark-as-read', { sender_id: this.userId }, { headers })
      .subscribe({
        next: () => {
          this.messages = this.messages.map(msg => {
            if (msg.sender_id === +this.userId) {
              return { ...msg, read: true };
            }
            return msg;
          });
        },
        error: (err) => {
          console.error('Error marcando mensajes como leídos', err);
        }
      });
  }

  sendMessage(): void {
  const trimmedMessage = this.messageContent.trim();
  if (!trimmedMessage) return;

  if (!this.currentUserId) {
    console.error('❌ currentUserId no está definido. No se puede enviar el mensaje.');
    return;
  }

  const token = sessionStorage.getItem('token');
  const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });

  const body = {
    recipient_id: this.userId,
    message: trimmedMessage
  };

  this.http.post('http://filmania.ddns.net:8000/api/messages/send', body, { headers })
    .subscribe({
      next: () => {
        this.sendSuccess = true;
        this.sendError = false;
        this.messageContent = '';

        this.loadMessages(); // Carga toda la conversación

        setTimeout(() => {
          this.sendSuccess = false;
        }, 3000);
      },
      error: () => {
        this.sendError = true;
        setTimeout(() => {
          this.sendError = false;
        }, 3000);
      }
    });
}

}
