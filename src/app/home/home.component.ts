import { Component, HostListener } from '@angular/core';
import { HeaderComponent } from '../shared/header/header.component';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [HeaderComponent, CommonModule, RouterModule],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent {
  projects = [
    {
      title: 'Conference Agenda Optimizer',
      description: 'An application to optimize conference agendas using AI.',
      link: 'conference-agenda',
    },
    {
      title: 'Reactive Streams Manager – UserFlow',
      description:
        'A modern Angular 17 demo showcasing **RxJS operators** and **Signals** in action.',
      link: 'user-flow',
    },
    {
      title: 'Weather Dashboard',
      description: 'Real-time weather data visualization using APIs.',
      link: '#',
    },
  ];
}
