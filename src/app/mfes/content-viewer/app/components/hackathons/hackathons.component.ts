import { CommonModule } from "@angular/common";
import { Component, OnInit } from "@angular/core";
import { Router } from "@angular/router";

@Component({
  selector: 'app-hackathons',
  standalone: true,
  imports: [CommonModule],
  template: `<h1>Hackathons</h1>`,
  styleUrls: []
})
export class HackathonsComponent implements OnInit{

  constructor(private router: Router){}

  ngOnInit(){
    this.router.navigateByUrl('/hackathon.html');
  }

}