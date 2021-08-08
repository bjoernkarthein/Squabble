import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';
import { AuthGuard } from 'src/guards/auth.guard';

const routes: Routes = [
  {
    path: 'home',
    loadChildren: () => import('./home/home.module').then(m => m.HomePageModule),
    canLoad: [AuthGuard]
  },
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full'
  },
  {
    path: 'login',
    loadChildren: () => import('./auth/login/login.module').then(m => m.LoginPageModule)
  },
  {
    path: 'logged-out',
    loadChildren: () => import('./auth/logged-out/logged-out.module').then(m => m.LoggedOutPageModule)
  },
  {
    path: 'mycourses/:cid',
    loadChildren: () => import('./course-detail/course-detail.module').then(m => m.CourseDetailPageModule),
    canLoad: [AuthGuard]
  },
  {
    path: 'mycourses/:cid/myquizzes/:qid',
    loadChildren: () => import('./quiz-detail/quiz-detail.module').then(m => m.QuizDetailPageModule),
    canLoad: [AuthGuard]
  },
  {
    path: 'mycourses/:cid/multi-player-overview/:gid',
    loadChildren: () => import('./multi-player-overview/multi-player-overview.module').then(m => m.MultiPlayerOverviewPageModule)
  },
  {
    path: 'mycourses/:cid/multi-player-overview/:gid/multi-player-round/:rid',
    loadChildren: () => import('./multi-player-round/multi-player-round.module').then(m => m.MultiPlayerRoundPageModule)
  },
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }
