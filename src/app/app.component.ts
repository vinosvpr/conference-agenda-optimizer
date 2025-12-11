import { Component, HostListener } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ConferenceAgendaComponent } from './conference-agenda/conference-agenda.component';
import { HeaderComponent } from './shared/header/header.component';
import { HomeComponent } from './home/home.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterOutlet,
    ConferenceAgendaComponent,
    HomeComponent,
    HeaderComponent,
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent {
  title = 'Everything About Vinoth';
  showScrollTop = false;

  @HostListener('window:scroll', [])
  onWindowScroll() {
    this.showScrollTop = window.scrollY > 300;
  }

  scrollToTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}
