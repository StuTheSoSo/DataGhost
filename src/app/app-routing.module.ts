import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'intro',
    pathMatch: 'full'
  },
  {
    path: 'intro',
    loadChildren: () => import('./game/intro/intro-module').then(m => m.IntroPageModule)
  },
  {
    path: 'identity',
    loadChildren: () => import('./game/identity/identity-module').then(m => m.IdentityPageModule)
  },
  {
    path: 'hub',
    loadChildren: () => import('./game/hub/hub-module').then(m => m.HubPageModule)
  },
  {
    path: 'job-board',
    loadChildren: () => import('./game/job-board/job-board-module').then(m => m.JobBoardPageModule)
  },
  {
    path: 'hack/:contractId',
    loadChildren: () => import('./game/hack/hack-module').then(m => m.HackPageModule)
  },
  {
    path: 'rig',
    loadChildren: () => import('./game/rig/rig-module').then(m => m.RigPageModule)
  },
  {
    path: 'factions',
    loadChildren: () => import('./game/factions/factions-module').then(m => m.FactionsPageModule)
  },
  {
    path: 'inbox',
    loadChildren: () => import('./game/inbox/inbox-module').then(m => m.InboxPageModule)
  },
  {
    path: 'settings',
    loadChildren: () => import('./game/settings/settings-module').then(m => m.SettingsPageModule)
  },
  {
    path: 'achievements',
    loadChildren: () => import('./game/achievements/achievements-module').then(m => m.AchievementsPageModule)
  },
  {
    path: 'leaderboard',
    loadChildren: () => import('./game/leaderboard/leaderboard-module').then(m => m.LeaderboardPageModule)
  },
  {
    path: 'events',
    loadChildren: () => import('./game/events/events-module').then(m => m.EventsPageModule)
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })],
  exports: [RouterModule]
})
export class AppRoutingModule {}
