import { Component, OnInit } from '@angular/core';
import { scrapeGames } from "../scrape";

@Component({
  selector: 'app-games-page',
  templateUrl: './games-page.component.html',
  styleUrls: ['./games-page.component.css']
})
export class GamesPageComponent implements OnInit {

  constructor() { }

  games: [] = [];

  //getGames(searchTerm: string, searchLimit: number, sortBy: string, after: string)
 // {
 //   scrapeGames(searchTerm, searchLimit, sortBy, after);
 // }
  ngOnInit()
  {
    //getGames('%5BPost+Game+Thread%5D', 5, 'new', '');
    scrapeGames('%5BPost+Game+Thread%5D', 30, 'new', '', (gamesArray) =>
    {
      this.games = gamesArray;
      console.log(this.games);
    });
  }


}
