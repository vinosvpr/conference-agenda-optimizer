import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ConferenceAgendaComponent } from './conference-agenda/conference-agenda.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, ConferenceAgendaComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent {
  title = 'conference-agenda-optimizer';
}
