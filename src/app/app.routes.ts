import { Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { ConferenceAgendaComponent } from './conference-agenda/conference-agenda.component';
import { UsersComponent } from './users/users.component';
import { OnboardingWizardComponent } from './onboarding-wizard/onboarding-wizard.component';
import { UsersGridComponent } from './users-grid/users-grid.component';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'conference-agenda', component: ConferenceAgendaComponent },
  { path: 'user-flow', component: UsersComponent },
  { path: 'onboarding', component: OnboardingWizardComponent },
  { path: 'AG-Grid', component: UsersGridComponent },
  //   { path: 'contact', component: ContactComponent },
  { path: '**', redirectTo: '' },
];
