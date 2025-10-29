import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ConferenceAgendaComponent } from './conference-agenda.component';
import { RouterTestingModule } from '@angular/router/testing';
import { ConferenceAgendaService } from '../services/conference-agenda.service';
import { ConferenceOptimizerService } from '../services/conference-optimizer.service';

// Mock Services
class MockAgendaService {
  sessions = jasmine.createSpy().and.returnValue([
    {
      id: 1,
      title: 'Deep Learning',
      speaker: 'Dr. Rao',
      track: 'AI',
      start: '09:00',
      end: '09:45',
      priority: 9,
      mustInclude: false,
      selected: true,
    },
    {
      id: 2,
      title: 'NodeJS Tricks',
      speaker: 'Alex',
      track: 'Backend',
      start: '10:00',
      end: '10:45',
      priority: 7,
      mustInclude: false,
      selected: false,
    },
    {
      id: 3,
      title: 'Security',
      speaker: 'Jane',
      track: 'Cyber',
      start: '11:00',
      end: '11:45',
      priority: 10,
      mustInclude: true,
      selected: true,
    },
  ]);
}

describe('ConferenceAgendaComponent', () => {
  let component: ConferenceAgendaComponent;
  let fixture: ComponentFixture<ConferenceAgendaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ConferenceAgendaComponent, RouterTestingModule],
      providers: [
        { provide: ConferenceAgendaService, useClass: MockAgendaService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ConferenceAgendaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should return unique track names', () => {
    const tracks = component.getUniqueTracks();
    expect(tracks).toEqual(['AI', 'Backend', 'Cyber']);
  });
});
