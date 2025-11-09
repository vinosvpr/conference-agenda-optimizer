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
      track: 'Data',
      start: '13:07',
      room: 'Main Hall',
      end: '13:52',
      priority: 4,
      mustInclude: false,
      selected: true,
    },
    {
      id: 2,
      title: 'AI Ethics',
      speaker: 'R. Sharma',
      track: 'Keynote',
      start: '15:58',
      room: 'Main Hall',
      end: '16:28',
      priority: 5,
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
