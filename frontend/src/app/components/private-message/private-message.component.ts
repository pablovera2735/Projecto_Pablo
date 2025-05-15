import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';

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

  constructor(
    private route: ActivatedRoute,
    private http: HttpClient,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const id = params.get('userId');
      if (id) {
        this.userId = id;
        this.loadRecipientName();
      }
    });
  }

  loadRecipientName(): void {
    const token = sessionStorage.getItem('token');
    const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });

    this.http.get<any>(`http://localhost:8000/api/user/${this.userId}/public-profile`, { headers })
      .subscribe({
        next: (response) => {
          this.recipientName = response.name;
        },
        error: () => {
          this.recipientName = 'Usuario desconocido';
        }
      });
  }

  sendMessage(): void {
    if (!this.messageContent.trim()) return;

    const token = sessionStorage.getItem('token');
    const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });

    const body = {
      recipient_id: this.userId,
      message: this.messageContent.trim()
    };

    this.http.post('http://localhost:8000/api/messages/send', body, { headers })
      .subscribe({
        next: () => {
          this.sendSuccess = true;
          this.sendError = false;
          this.messageContent = '';
        },
        error: () => {
          this.sendSuccess = false;
          this.sendError = true;
        }
      });
  }
}
