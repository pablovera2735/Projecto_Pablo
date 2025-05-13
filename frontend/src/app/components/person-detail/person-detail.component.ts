import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ActorService } from '../../services/actor.service';

@Component({
  selector: 'app-person-detail',
  templateUrl: './person-detail.component.html',
  styleUrls: ['./person-detail.component.css']
})
export class PersonDetailComponent implements OnInit {
  personId!: number;
  person: any;
  credits: any[] = [];
  isLoading = true;

  constructor(private route: ActivatedRoute, private actorService: ActorService) {}

  ngOnInit(): void {
    this.personId = +this.route.snapshot.paramMap.get('id')!;
    this.loadPerson();
  }

  loadPerson(): void {
    this.actorService.getPersonDetail(this.personId).subscribe({
      next: (data) => {
        this.person = data;
        this.actorService.getPersonCredits(this.personId).subscribe((creditsRes: any) => {
          this.credits = creditsRes.cast;
          this.isLoading = false;
        });
      },
      error: () => {
        this.isLoading = false;
      }
    });
  }

  getImage(path: string | null): string {
    return path ? `https://image.tmdb.org/t/p/w500${path}` : 'assets/img/no-image.png';
  }
}
