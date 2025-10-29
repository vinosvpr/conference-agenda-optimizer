import { TestBed } from '@angular/core/testing';

import { ConferenceAgendaService } from './conference-agenda.service';

describe('ConferenceAgendaService', () => {
  let service: ConferenceAgendaService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ConferenceAgendaService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
