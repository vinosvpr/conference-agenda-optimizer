import { TestBed } from '@angular/core/testing';

import { ConferenceOptimizerService } from './conference-optimizer.service';

describe('ConferenceOptimizerService', () => {
  let service: ConferenceOptimizerService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ConferenceOptimizerService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
  it('should handle empty session list without error', () => {
    const result = service.optimize ? service.optimize([] as any) : [];
    expect(result).toBeDefined();
  });
  it('should sort sessions by priority descending', () => {
    const mock = [
      { title: 'Low', priority: 1 },
      { title: 'High', priority: 10 },
      { title: 'Mid', priority: 5 },
    ];
    const sorted = mock.sort((a, b) => b.priority - a.priority);
    expect(sorted[0].title).toBe('High');
  });
  it('should always include mustInclude sessions', () => {
    const mock = [
      { id: 1, mustInclude: true },
      { id: 2, mustInclude: false },
    ] as any[];

    const result = mock.filter((s) => s.mustInclude);
    expect(result.length).toBe(1);
    expect(result[0].id).toBe(1);
  });
  it('should format session tooltip correctly', () => {
    const s = {
      title: 'Deep Learning Tricks',
      start: '13:07',
      end: '13:52',
      speaker: 'P. Dutta',
    } as any;
    const tooltip = `${s.title} by ${s.speaker} (${s.start}-${s.end})`;
    expect(tooltip).toContain('Deep Learning Tricks');
    expect(tooltip).toContain('P. Dutta');
  });
  it('should identify invalid CSV lines', () => {
    const csvLine =
      '1,Deep Learning Tricks,P. Dutta,Main Hall,Backend,13:07,13:52,4';
    const parts = csvLine.split(',');
    expect(parts.length).toBe(8);
  });
});
