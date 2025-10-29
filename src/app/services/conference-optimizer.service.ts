import { Injectable } from '@angular/core';
import { Session } from './conference-agenda.service';

@Injectable({
  providedIn: 'root',
})
export class ConferenceOptimizerService {
  optimize(sessions: Session[]) {
    // sort by start time
    const sorted = [...sessions].sort(
      (a, b) => new Date(a.start).getTime() - new Date(b.start).getTime()
    );

    const selected: Session[] = [];
    let totalPriority = 0;

    for (const s of sorted) {
      const hasConflict = selected.some(
        (sel) =>
          !(
            new Date(s.end).getTime() <= new Date(sel.start).getTime() ||
            new Date(s.start).getTime() >= new Date(sel.end).getTime()
          )
      );

      if (!hasConflict || s.mustInclude) {
        selected.push(s);
        totalPriority += s.priority;
      }
    }

    const excluded = sessions
      .filter((s) => !selected.includes(s))
      .map((s) => {
        const conflict = selected.find(
          (sel) =>
            !(
              new Date(s.end).getTime() <= new Date(sel.start).getTime() ||
              new Date(s.start).getTime() >= new Date(sel.end).getTime()
            )
        );
        return {
          ...s,
          excludedReason: conflict
            ? `Excluded: overlaps with higher-priority session ‘${conflict.title}’.`
            : '',
        };
      });

    // merge everything
    const allSessions = sessions.map(
      (s) => excluded.find((e) => e.id === s.id) ?? { ...s, excludedReason: '' } // keep selected clean
    );

    return { selected, totalPriority, allSessions };
  }
}
