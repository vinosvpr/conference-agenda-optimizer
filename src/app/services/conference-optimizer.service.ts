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
          // ✅ Overlaps in time
          !(
            new Date(s.end).getTime() <= new Date(sel.start).getTime() ||
            new Date(s.start).getTime() >= new Date(sel.end).getTime()
          ) &&
          // ✅ AND same room or same speaker
          (s.room === sel.room || s.speaker === sel.speaker)
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
            // ✅ Conflict = time overlap + same room/speaker
            !(
              new Date(s.end).getTime() <= new Date(sel.start).getTime() ||
              new Date(s.start).getTime() >= new Date(sel.end).getTime()
            ) &&
            (s.room === sel.room || s.speaker === sel.speaker)
        );
        return {
          ...s,
          excludedReason: conflict
            ? `Excluded: overlaps with higher-priority session '${conflict.title}' (${conflict.room}, ${conflict.speaker}).`
            : '',
        };
      });

    // merge everything
    const allSessions = sessions.map(
      (s) => excluded.find((e) => e.id === s.id) ?? { ...s, excludedReason: '' }
    );

    return { selected, totalPriority, allSessions };
  }
}
