import {
  Component,
  computed,
  signal,
  effect,
  ViewChild,
  AfterViewInit,
  ChangeDetectorRef,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  CdkVirtualScrollViewport,
  ScrollingModule,
} from '@angular/cdk/scrolling';
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
export class ConferenceAgendaComponent implements AfterViewInit {
  @ViewChild(CdkVirtualScrollViewport) viewport!: CdkVirtualScrollViewport;

  filterTrack = signal<string>('');
  filterSpeaker = signal<string>('');
  minPriority = signal<number>(1);
  searchTerm = signal<string>('');
  optimizedSessions = signal<Session[]>([]);
  totalPriority = signal<number>(0);
  sortField = signal<string>('start');
  sortDirection = signal<'asc' | 'desc'>('asc');

  trackById = (_index: number, item: Session) => item.id;
  hoveredSession: number | null = null;
  constructor(
    public agenda: ConferenceAgendaService,
    private optimizer: ConferenceOptimizerService,
    private router: Router,
    private route: ActivatedRoute,
    private cdr: ChangeDetectorRef
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

  ngAfterViewInit() {
    // Trigger viewport refresh whenever filtered list changes
    effect(() => {
      const _ = this.filteredSessions();
      setTimeout(() => {
        if (this.viewport) {
          this.viewport.checkViewportSize();
          this.viewport.scrollToIndex(0);
        }
        this.cdr.detectChanges(); // ensure Angular updates view
      }, 0);
    });
  }

  filteredSessions = computed(() => {
    let list = this.agenda.sessions().filter((s) => {
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

    // Apply sorting logic
    const field = this.sortField();
    const direction = this.sortDirection();

    list = [...list].sort((a, b) => {
      let result = 0;
      if (field === 'start') {
        result = a.start.localeCompare(b.start);
      } else if (field === 'priority') {
        result = a.priority - b.priority;
      }
      return direction === 'asc' ? result : -result;
    });

    return list;
  });

  filteredCount = computed(() => this.filteredSessions().length);

  setSort(field: string) {
    if (this.sortField() === field) {
      this.sortDirection.set(this.sortDirection() === 'asc' ? 'desc' : 'asc');
    } else {
      this.sortField.set(field);
      this.sortDirection.set('asc');
    }
  }

  getUniqueTracks(): string[] {
    return Array.from(
      new Set(this.agenda.sessions().map((s) => s.track))
    ).filter(Boolean);
  }

  generateOptimizedAgenda() {
    const allSessions = this.agenda.sessions();
    // Collect mustInclude sessions
    const mustInclude = allSessions.filter((s) => s.mustInclude);
    // Collect all selected sessions (don’t limit by filters)
    const selectedSessions = allSessions.filter(
      (s) => s.selected && !s.mustInclude
    );
    // Run optimizer on selected sessions
    const result = this.optimizer.optimize(selectedSessions);
    // Filter optimizer output to remove conflicts with mustInclude sessions
    const nonConflictingOptimized = result.selected.filter((r) => {
      return !mustInclude.some(
        (m) =>
          new Date(m.start).getTime() < new Date(r.end).getTime() &&
          new Date(m.end).getTime() > new Date(r.start).getTime()
      );
    });
    // Merge mustInclude + non-conflicting optimized sessions
    const combined = [...mustInclude, ...nonConflictingOptimized];
    // Remove duplicates by ID
    const uniqueCombined = Array.from(
      new Map(combined.map((s) => [s.id, s])).values()
    );
    // Sort by start time
    const sortedCombined = uniqueCombined.sort(
      (a, b) => new Date(a.start).getTime() - new Date(b.start).getTime()
    );
    // Update signals
    this.optimizedSessions.set(sortedCombined);
    this.totalPriority.set(
      sortedCombined.reduce((sum, s) => sum + (s.priority || 0), 0)
    );
  }
}
