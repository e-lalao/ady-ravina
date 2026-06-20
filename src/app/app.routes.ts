import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home';
import { LobbyComponent } from './pages/lobby/lobby';
import { RoomComponent } from './pages/room/room';
import { CollectComponent } from './pages/collect/collect';
import { BattleComponent } from './pages/battle/battle';
import { ResultsComponent } from './pages/results/results';
import { JoinComponent } from './pages/join/join';

export const routes: Routes = [
  { path: '',              component: HomeComponent },
  { path: 'lobby',         component: LobbyComponent },
  { path: 'room/:code',    component: RoomComponent },
  { path: 'join/:code',    component: JoinComponent },
  { path: 'collect/:code', component: CollectComponent },
  { path: 'battle/:code',  component: BattleComponent },
  { path: 'results/:code', component: ResultsComponent },
  { path: '**', redirectTo: '' },
];
