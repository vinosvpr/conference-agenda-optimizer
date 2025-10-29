import { Injectable, signal } from '@angular/core';
export interface Session {
  id: number;
  title: string;
  speaker: string;
  room: string;
  track: string;
  start: string;
  end: string;
  priority: number;
  mustInclude: boolean;
  selected: boolean;
  conflict?: boolean;
  formattedStart?: string;
  formattedEnd?: string;
  tooltip?: string;
}

@Injectable({
  providedIn: 'root',
})
export class ConferenceAgendaService {
  sessions = signal<Session[]>([]);
  parseErrors = signal<string[]>([]);

  constructor() {
    this.loadSampleCSV();
  }

  private loadSampleCSV() {
    fetch('assets/sample-sessions.csv')
      .then((res) => res.text())
      .then((data) => {
        const lines = data.trim().split('\n');

        let sessions: Session[] = lines.map((line) => {
          const [id, title, speaker, room, track, start, end, priority] =
            line.split(',');

          return {
            id: Number(id.trim()),
            title: title.trim(),
            speaker: speaker.trim(),
            room: room.trim(),
            track: track.trim(),
            start: start.trim(),
            end: end.trim(),
            priority: Number(priority),
            selected: false,
            mustInclude: false,
            tooltip: '',
          } as Session;
        });

        sessions = this.assignTooltipsForConflicts(sessions);

        this.sessions.set(sessions);
      })
      .catch((err) => {
        console.error('CSV load error:', err);
      });
  }
  private assignTooltipsForConflicts(sessions: Session[]): Session[] {
    return sessions.map((s, i) => {
      if (s.mustInclude) {
        return { ...s, tooltip: '' };
      }

      const overlapping = sessions.filter(
        (other, j) => i !== j && other.priority > s.priority
      );

      const conflict =
        overlapping.length > 0
          ? overlapping.sort((a, b) => b.priority - a.priority)[0]
          : null;

      return {
        ...s,
        tooltip: conflict
          ? `Excluded: Overlaps with higher-priority session “${conflict.title}”.`
          : '',
      };
    });
  }
  /** Toggle must-include (pinned) status */
  toggleMustInclude(session: Session) {
    this.sessions.update((list) =>
      list.map((s) =>
        s.id === session.id ? { ...s, mustInclude: !s.mustInclude } : s
      )
    );
  }

  /** Toggle include/exclude in optimization */
  toggleSelect(session: Session) {
    this.sessions.update((list) =>
      list.map((s) =>
        s.id === session.id ? { ...s, selected: !s.selected } : s
      )
    );
  }
}
