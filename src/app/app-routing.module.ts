import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { GamesPageComponent } from "./games-page/games-page.component"
import { SecondPageComponent } from "./second-page/second-page.component"

const routes: Routes =
[
  {path: "", redirectTo: "games", pathMatch: "full"},
  {path: "games", component: GamesPageComponent},
  {path: "sp", component: SecondPageComponent}
]

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
