import { Component, computed, signal, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ScrollingModule } from '@angular/cdk/scrolling';
import { Router, ActivatedRoute } from '@angular/router';
import {
  ConferenceAgendaService,
  Session,
} from '../services/conference-agenda.service';
import { ConferenceOptimizerService } from '../services/conference-optimizer.service';

@Component({
  selector: 'app-conference-agenda',
  standalone: true,
  imports: [CommonModule, FormsModule, ScrollingModule],
  templateUrl: './conference-agenda.component.html',
  styleUrl: './conference-agenda.component.scss',
})
export class ConferenceAgendaComponent {
  filterTrack = signal<string>('');
  filterSpeaker = signal<string>('');
  minPriority = signal<number>(1);
  searchTerm = signal<string>('');
  optimizedSessions = signal<Session[]>([]);
  totalPriority = signal<number>(0);
  startTimeFilter = signal<string>('');
  endTimeFilter = signal<string>('');
  trackById = (_index: number, item: Session) => item.id;

  constructor(
    public agenda: ConferenceAgendaService,
    private optimizer: ConferenceOptimizerService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    // Restore filters from URL on load
    this.route.queryParams.subscribe((params) => {
      if (params['track']) this.filterTrack.set(params['track']);
      if (params['search']) this.searchTerm.set(params['search']);
      if (params['minPriority']) this.minPriority.set(+params['minPriority']);
    });

    // Keep URL updated whenever filters change
    effect(() => {
      this.router.navigate([], {
        queryParams: {
          track: this.filterTrack(),
          search: this.searchTerm(),
          minPriority: this.minPriority(),
        },
        queryParamsHandling: 'merge',
      });
    });
  }

  filteredSessions = computed(() => {
    return this.agenda.sessions().filter((s) => {
      // Always include mustInclude sessions
      if (s.mustInclude) return true;
      const matchTrack = !this.filterTrack() || s.track === this.filterTrack();
      const matchSpeaker =
        !this.filterSpeaker() || s.speaker === this.filterSpeaker();
      const matchPriority = s.priority >= this.minPriority();
      const term = this.searchTerm().toLowerCase();
      const matchSearch =
        s.title.toLowerCase().includes(term) ||
        s.speaker.toLowerCase().includes(term);
      return matchTrack && matchSpeaker && matchPriority && matchSearch;
    });
  });
  filteredCount = computed(() => this.filteredSessions().length);
  generateOptimizedAgenda() {
    const allSessions = this.agenda.sessions();
    const mustInclude = allSessions.filter((s) => s.mustInclude);
    const candidates = this.filteredSessions().filter(
      (s) => s.selected && !s.mustInclude
    );
    const result = this.optimizer.optimize(candidates);
    const nonConflictingMustInclude = mustInclude.filter((m) => {
      return !result.selected.some((r) => m.start < r.end && m.end > r.start);
    });

    const combined = [...nonConflictingMustInclude, ...result.selected].sort(
      (a, b) => a.start.localeCompare(b.start)
    );
    this.optimizedSessions.set(combined);
    this.totalPriority.set(
      combined.reduce((sum, s) => sum + (s.priority || 0), 0)
    );
  }
  getUniqueTracks(): string[] {
    return Array.from(
      new Set(this.agenda.sessions().map((s) => s.track))
    ).filter(Boolean);
  }
}
