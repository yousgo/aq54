import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { RouteTestComponent } from './components/route-test/route-test.component';
import { HomeComponent } from './components/home/home.component';

const routes: Routes = [
  { path: 'test', component: RouteTestComponent},
  { path: '', component: HomeComponent},
  { path: '**', component: HomeComponent}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
