import { Component } from '@angular/core';
import { thingg } from "./scrape";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent
{
  title = 'basketballgames';
  thing(searchTerm: string, searchLimit: number, sortBy: string, after: string)
  {
    thingg(searchTerm, searchLimit, sortBy, after);
  }
}
