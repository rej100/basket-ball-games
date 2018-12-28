import { callbackify } from 'util';

declare var $: any;

class player
{
    nameAndSurname: string;
    minutesPlayed: number;
    secondsPlayed: number;
    fieldGoalsMade: number;
    fieldGoalsAttempted: number;
    freeThrowsMade: number;
    freeThrowsAttempted: number;
    threePtsMade: number;
    threePtsAttempted: number;
    rebounds: number;
    assists: number;
    blocks: number;
    steals: number;
    turnovers: number;
    points: number;


}

class team
{
    players: player[];
    totalScore: number;
    shortName: string;
    fullName: string;
    retardedName: string;
    teamLogoURL: string;
}

class game
{
    winningTeam: team;
    losingTeam: team;
    draw: boolean;
    redditLink: string;
    date: Date;
}

var gameLinksAndDates = [];
var NBATeams =
[
    "Atlanta Hawks",
    "Boston Celtics",
    "Brooklyn Nets",
    "Charlotte Hornets",
    "Chicago Bulls",
    "Cleveland Cavaliers",
    "Dallas Mavericks",
    "Denver Nuggets",
    "Detroit Pistons",
    "Golden State Warriors",
    "Houston Rockets",
    "Indiana Pacers",
    "Los Angeles Clippers",
    "Los Angeles Lakers",
    "Memphis Grizzlies",
    "Miami Heat",
    "Milwaukee Bucks",
    "Minnesota Timberwolves",
    "New Orleans Pelicans",
    "New York Knicks",
    "Oklahoma City Thunder",
    "Orlando Magic",
    "Philadelphia 76ers",
    "Phoenix Suns",
    "Portland Trail Blazers",
    "Sacramento Kings",
    "San Antonio Spurs",
    "Toronto Raptors",
    "Utah Jazz",
    "Washington Wizards",
]

function getTeamLogoURL(teamName: string, debugBool: boolean)
{
    if(debugBool)
    {
        return "https://i.imgur.com/lb8oNvM.png";
    }
    else
    {
        return "https://i.imgur.com/ywZ2ItT.png"
    }
}

function convertTeamName(teamName: string)
{
    let fullName = "";
    teamName = teamName.toUpperCase();
    NBATeams.forEach(team =>
        {
            if(team.substring(0,4).toUpperCase().includes(teamName) && teamName.length < 4)
            {
                //console.log(team + "   " + teamName);
                fullName = team;
            }
            else if(team.toUpperCase().includes(teamName) && teamName.length > 3)
            {
                fullName = team;
            }
            else if(teamName === "LAC")
            {
                fullName = "Los Angeles Clippers";
            }
            else if(teamName === "NYK")
            {
                fullName = "New York Knicks";
            }
            else if(teamName === "LAL")
            {
                fullName = "Los Angeles Lakers";
            }
            else if(teamName === "BKN")
            {
                fullName = "Brooklyn Nets";
            }
            else if(teamName === "NOP")
            {
                fullName = "New Orleans Pelicans";
            }
            else if(teamName === "SAS")
            {
                fullName = "San Antonio Spurs";
            }
            else if(teamName === "PHX")
            {
                fullName = "Phoenix Suns";
            }
            else if(teamName === "OKC")
            {
                fullName = "Oklahoma City Thunder";
            }
            else if(teamName === "GSW")
            {
                fullName = "Golden State Warriors";
            }
        });
    return fullName;
}

export function scrapeGames(searchTerm: string, searchLimit: number, sortBy: string, after: string, callback)
{
    getGames(searchTerm, searchLimit, sortBy, after, (games) =>
    {
        for(let i = 0; i < games.length; ++i)
        {
            if(games[i].draw == undefined || games[i].draw == true)
            {
                games.splice(i, 1);
                i = 0;
            }
        }
        for(let i = 0; i < gameLinksAndDates.length; ++i)
        {
            var tempDate = new Date();
            tempDate.setTime(gameLinksAndDates[i].date * 1000);
            //console.log(gameLinksAndDates[i].date);
            //console.log(tempDate);
            gameLinksAndDates[i].date = tempDate
            //console.log(gameLinksAndDates[i].date);
        }

        for(let i = 0; i < games.length; ++i)
        {   
            //console.log(games[i].redditLink);
            for(let j = 0; j < gameLinksAndDates.length; ++j)
            {
                //console.log();
                if(games[i].redditLink.includes(gameLinksAndDates[j].link))
                {
                    games[i].date = gameLinksAndDates[j].date;
                }
            }
        }
        
        games.sort(function(a, b)
        {
            a = a.date
            b = b.date
            return a>b ? -1 : a<b ? 1 : 0;
        });

        for(let i = 0; i < games.length; ++i)
        {   
            games[i].winningTeam.players.sort(function(a, b)
            {
                a = a.points
                b = b.points
                return a>b ? -1 : a<b ? 1 : 0;
            });
            games[i].losingTeam.players.sort(function(a, b)
            {
                a = a.points
                b = b.points
                return a>b ? -1 : a<b ? 1 : 0;
            });
        }

        for(let i = 0; i < games.length; ++i)
        {   
            if(games[i].winningTeam.shortName !== undefined)
            {
                games[i].winningTeam.fullName = convertTeamName(games[i].winningTeam.shortName);
            }
            else if(games[i].winningTeam.retardedName !== undefined)
            {
                games[i].winningTeam.fullName = convertTeamName(games[i].winningTeam.retardedName);
            }

            if(games[i].losingTeam.shortName !== undefined)
            {
                games[i].losingTeam.fullName = convertTeamName(games[i].losingTeam.shortName);
            }
            else if(games[i].losingTeam.retardedName !== undefined)
            {
                games[i].losingTeam.fullName = convertTeamName(games[i].losingTeam.retardedName);
            }

            games[i].winningTeam.teamLogoURL = getTeamLogoURL("", true);
            games[i].losingTeam.teamLogoURL = getTeamLogoURL("", false);

        }

        //console.log(gameLinksAndDates);
        //console.log(games);
        callback(games);
        
    });
}

export function getGames(searchTerm: string, searchLimit: number, sortBy: string, after: string, callback)
{
    var games = [];
    var currafter = after;
    var boi = 3;
    getGameLinks(searchTerm, searchLimit, sortBy, after, (gameLinks, after) =>
    {
        var requests = 0;
        console.log(gameLinks, after);
        /*
        getStatsFromGame(gameLinks[0], (game) =>
        {
            console.log(game);
        });
        */
        for(var i = 0; i < gameLinks.length; ++i)
        {
            requests++;
            getStatsFromGame(gameLinks[i], (game) =>
            {
                games.push(game);
                requests--;
                console.log(game);
                console.log(requests);
                if(requests === 0)
                {
                    callback(games);
                }
            });
        }
    });
}

function getGameLinks(searchTerm: string, searchLimit: number, sortBy: string, after: string, callback)
{
    var gameLinks = [];
    var afterr;
    var searchstr = ("http://www.reddit.com/r/nba/search.json?q=" + searchTerm + "&sort=" + sortBy + "&limit=" + searchLimit + "&restrict_sr=1" + "&after=" + after);
    console.log(searchstr);
    var xd = null;
    fetch(searchstr)
    .then(res => res.json())
    .then(data =>
    {
        
        console.log(data);
        afterr = data.data.after;
        data.data.children.forEach(element =>
        {
            if(element.data.title.includes("Game Thread]"))
            {
                var tempObj = {link: element.data.url, date: element.data.created_utc};
                gameLinks.push(element.data.url);
                gameLinksAndDates.push(tempObj);
                //console.log(element.data.url);
            }
        });
    }).then(()=>
    {
        callback(gameLinks, afterr);
    });
}

function getHTML(url, callback)
{
    /*const proxyurl = "https://cors-anywhere.herokuapp.com/";
    //const url = "https://example.com"; // site that doesn’t send Access-Control-*
    fetch(proxyurl + url) // https://cors-anywhere.herokuapp.com/https://example.com
    .then(response => response.text())
    .then(contents => console.log(contents))
    .catch(() => console.log("Can’t access " + url + " response. Blocked by browser?"))*/
    
    const proxyurl = "https://cors-anywhere.herokuapp.com/";
    //const url = "https://example.com"; // site that doesn’t send Access-Control-*
    fetch(proxyurl + url) // https://cors-anywhere.herokuapp.com/https://example.com
    .then(response => response.text())
    .then(contents => {callback(contents)}).catch(err => console.log("wtf: " + err));
}

function getMinutes(minutesString: string)
{
    var length = minutesString.length;
    var colonIndex;
    var inNumber = 0;
    for(var i = 0; i < length; ++i)
    {
        //console.log(minutesString[i]);
        if(minutesString[i] == ":")
        {
            colonIndex = i;
            //console.log(colonIndex);
        }
    }
    var minuteString = "";

    for(var i = 0; i < length - colonIndex; ++i)
    {
        minuteString += minutesString[i];
    }
    inNumber = parseInt(minuteString)
    if(isNaN(inNumber))
    {
        return 0;
    }
    else
    {
        return inNumber;
    }
}

function getSeconds(minutesString: string)
{
    var length = minutesString.length;
    var colonIndex;
    var inNumber = 0;
    for(var i = 0; i < length; ++i)
    {
        //console.log(minutesString[i]);
        if(minutesString[i] == ":")
        {
            colonIndex = i;
            //console.log(colonIndex);
        }
    }
    var minuteString = "";

    for(let i = colonIndex + 1; i < length; ++i)
    {
        minuteString += minutesString[i];
    }
    inNumber = parseInt(minuteString);
    if(isNaN(inNumber))
    {
        return 0;
    }
    else
    {
        return inNumber;
    }
}

function getShotsMade(pointsString: string)
{
    var pointsNumber = 0;
    //console.log(pointsString.split("-").pop());
    pointsNumber = parseInt(pointsString.split("-")[0]);
    if(isNaN(pointsNumber))
    {
        return 0;
    }
    else
    {
        return pointsNumber;
    }
}

function getShotsAttempted(pointsString: string)
{
    var pointsNumber = 0;
    //console.log(pointsString.split("-").pop());
    pointsNumber = parseInt(pointsString.split("-")[1]);
    if(isNaN(pointsNumber))
    {
        return 0;
    }
    else
    {
        return pointsNumber;
    }
}

function getStatsFromStandardGame(link: string, callback)
{

    getHTML(link, (html) =>
    {
        var team1 = new team();
        var team2 = new team();

        team1.players = [];
        team2.players = [];

        var title, div, table1, table2;
        //console.log(html);
        var xd = $(html);
        //console.log(xd);

        for(var i = 0; i < xd.length; i++)
        {
            if(xd[i].localName == "title")
            {
                title = xd[i];
            }
            else if(xd[i].localName == "div")
            {
                div = xd[i];
            }
        }

        //console.log(title);
        //console.log(div);
        //console.log($(div).find("table"));
        table1 = $(div).find("table")[0];
        table2 = $(div).find("table")[1];
        //console.log(table1);
        //console.log(table2);
        //console.log($(table1).find("thead tr th strong")[0].innerHTML);
        try
        {
            team1.shortName = $(table1).find("thead tr th strong")[0].innerHTML.split(" ").pop();
            team2.shortName = $(table2).find("thead tr th strong")[0].innerHTML.split(" ").pop();
        }
        catch (error)
        {
            console.log("IDK");
            console.log(link);
            callback(new game());
        }

        
        var eTempTable = $(table1).find("tbody tr");
        //console.log(eTempTable);
        for(var i = 0; i < eTempTable.length; ++i)
        {
            var tempPlayer = new player();
            var tempJqPlayer = $(eTempTable[i]).find("td");
            if(i == eTempTable.length - 1)
            {
                team1.totalScore = parseInt(tempJqPlayer[13].innerHTML);
            }
            else
            {
                //console.log(eTempTable[i]);
                tempPlayer.nameAndSurname = tempJqPlayer[0].innerHTML;
                //console.log(getMinutes(tempJqPlayer[1].innerHTML));
                //console.log(getSeconds(tempJqPlayer[1].innerHTML));
                tempPlayer.minutesPlayed = getMinutes(tempJqPlayer[1].innerHTML);
                tempPlayer.secondsPlayed = getSeconds(tempJqPlayer[1].innerHTML);
                //console.log(getShotsMade(tempJqPlayer[2].innerHTML));
                //console.log(getShotsAttempted(tempJqPlayer[2].innerHTML));
                tempPlayer.fieldGoalsMade = getShotsMade(tempJqPlayer[2].innerHTML);
                tempPlayer.fieldGoalsAttempted = getShotsAttempted(tempJqPlayer[2].innerHTML);
                tempPlayer.freeThrowsMade = getShotsMade(tempJqPlayer[3].innerHTML);
                tempPlayer.freeThrowsAttempted = getShotsAttempted(tempJqPlayer[3].innerHTML);
                tempPlayer.threePtsMade = getShotsMade(tempJqPlayer[4].innerHTML);
                tempPlayer.threePtsAttempted = getShotsAttempted(tempJqPlayer[4].innerHTML);
                tempPlayer.rebounds = parseInt(tempJqPlayer[7].innerHTML); //
                tempPlayer.assists = parseInt(tempJqPlayer[8].innerHTML); //
                tempPlayer.blocks = parseInt(tempJqPlayer[9].innerHTML); //
                tempPlayer.steals = parseInt(tempJqPlayer[10].innerHTML); //
                tempPlayer.turnovers = parseInt(tempJqPlayer[11].innerHTML); //
                tempPlayer.points = parseInt(tempJqPlayer[13].innerHTML); //

                if(isNaN(tempPlayer.rebounds))
                {
                    tempPlayer.rebounds = 0;
                }
                if(isNaN(tempPlayer.assists))
                {
                    tempPlayer.assists = 0;
                }
                if(isNaN(tempPlayer.blocks))
                {
                    tempPlayer.blocks = 0;
                }
                if(isNaN(tempPlayer.steals))
                {
                    tempPlayer.steals = 0;
                }
                if(isNaN(tempPlayer.turnovers))
                {
                    tempPlayer.turnovers = 0;
                }
                if(isNaN(tempPlayer.points))
                {
                    tempPlayer.points = 0;
                }

                team1.players.push(tempPlayer);

                //console.log(tempPlayer);
            }

        }

        var eTempTable2 = $(table2).find("tbody tr");

        for(var i = 0; i < eTempTable2.length; ++i)
        {
            //console.log(eTempTable2[i]);
            var tempPlayer = new player();
            var tempJqPlayer = $(eTempTable2[i]).find("td");

            if(i == eTempTable2.length - 1)
            {
                team2.totalScore = parseInt(tempJqPlayer[13].innerHTML);
            }
            else
            {
                tempPlayer.nameAndSurname = tempJqPlayer[0].innerHTML;
                //console.log(getMinutes(tempJqPlayer[1].innerHTML));
                //console.log(getSeconds(tempJqPlayer[1].innerHTML));
                tempPlayer.minutesPlayed = getMinutes(tempJqPlayer[1].innerHTML);
                tempPlayer.secondsPlayed = getSeconds(tempJqPlayer[1].innerHTML);
                //console.log(getShotsMade(tempJqPlayer[2].innerHTML));
                //console.log(getShotsAttempted(tempJqPlayer[2].innerHTML));
                tempPlayer.fieldGoalsMade = getShotsMade(tempJqPlayer[2].innerHTML);
                tempPlayer.fieldGoalsAttempted = getShotsAttempted(tempJqPlayer[2].innerHTML);
                tempPlayer.freeThrowsMade = getShotsMade(tempJqPlayer[3].innerHTML);
                tempPlayer.freeThrowsAttempted = getShotsAttempted(tempJqPlayer[3].innerHTML);
                tempPlayer.threePtsMade = getShotsMade(tempJqPlayer[4].innerHTML);
                tempPlayer.threePtsAttempted = getShotsAttempted(tempJqPlayer[4].innerHTML);
                tempPlayer.rebounds = parseInt(tempJqPlayer[7].innerHTML); //
                tempPlayer.assists = parseInt(tempJqPlayer[8].innerHTML); //
                tempPlayer.blocks = parseInt(tempJqPlayer[9].innerHTML); //
                tempPlayer.steals = parseInt(tempJqPlayer[10].innerHTML); //
                tempPlayer.turnovers = parseInt(tempJqPlayer[11].innerHTML); //
                tempPlayer.points = parseInt(tempJqPlayer[13].innerHTML); //

                if(isNaN(tempPlayer.rebounds))
                {
                    tempPlayer.rebounds = 0;
                }
                if(isNaN(tempPlayer.assists))
                {
                    tempPlayer.assists = 0;
                }
                if(isNaN(tempPlayer.blocks))
                {
                    tempPlayer.blocks = 0;
                }
                if(isNaN(tempPlayer.steals))
                {
                    tempPlayer.steals = 0;
                }
                if(isNaN(tempPlayer.turnovers))
                {
                    tempPlayer.turnovers = 0;
                }
                if(isNaN(tempPlayer.points))
                {
                    tempPlayer.points = 0;
                }

                team2.players.push(tempPlayer);

                //console.log(tempPlayer);
            }

        }


        //console.log(team1);
        //console.log(team2);
        var theGame = new game();
        if(team1.totalScore > team2.totalScore)
        {
            theGame.winningTeam = team1;
            theGame.losingTeam = team2;
            theGame.draw = false;
        }
        else if(team1.totalScore < team2.totalScore)
        {
            theGame.winningTeam = team2;
            theGame.losingTeam = team1;
            theGame.draw = false;
        }
        else
        {
            theGame.winningTeam = team1;
            theGame.losingTeam = team2;
            theGame.draw = true;
        }
        callback(theGame);
    });
}

function getStatsFromRetardedGame(link: string, callback)
{

    getHTML(link, (html) =>
    {
        var team1 = new team();
        var team2 = new team();

        team1.players = [];
        team2.players = [];

        var title, div, table1;
        //console.log(html);
        var xd = $(html);
        //console.log(xd);

        for(var i = 0; i < xd.length; i++)
        {
            if(xd[i].localName == "title")
            {
                title = xd[i];
            }
            else if(xd[i].localName == "div")
            {
                div = xd[i];
            }
        }
        //console.log(title);
        //console.log(div);
        //console.log($(div).find("table"));
        if($(div).find("table")[10] !== undefined)
        {
            table1 = $(div).find("table")[9];
        }
        else
        {
            table1 = $(div).find("table")[7];
            //console.log(link);
            //console.log(table1);
        }

        //console.log(table1);

        var tableRows = $(table1).find("tr");
        var secondTeamIndex = 0;

        for(let i = 2; i< tableRows.length; ++i)
        {
            var tempJqPlayer = $(tableRows[i]).find("td");
            var tempPlayer = new player();

            if(tempJqPlayer[0].innerHTML.includes("<strong"))
            {
                secondTeamIndex = i - 1;
            }
        }

        //console.log(secondTeamIndex);

        for(let i = 1; i< tableRows.length; ++i)
        {
            var tempJqPlayer = $(tableRows[i]).find("td");
            var tempPlayer = new player();

            //console.log(tempJqPlayer);

            if(tempJqPlayer[0].innerHTML.includes("<strong") && i < 3)
            {
                team1.retardedName = tempJqPlayer[0].innerText.split(" ")[1];
            }
            else if(tempJqPlayer[0].innerHTML.includes("<strong") && i > 3)
            {
                team2.retardedName = tempJqPlayer[0].innerText.split(" ")[1];
            }
            else
            {

                tempPlayer.nameAndSurname = tempJqPlayer[0].innerText;
                try
                {
                    tempPlayer.minutesPlayed = getMinutes(tempJqPlayer[1].innerHTML);
                    tempPlayer.secondsPlayed = getSeconds(tempJqPlayer[1].innerHTML);
                    tempPlayer.fieldGoalsMade = getShotsMade(tempJqPlayer[2].innerHTML);
                    tempPlayer.fieldGoalsAttempted = getShotsAttempted(tempJqPlayer[2].innerHTML);
                    tempPlayer.freeThrowsMade = getShotsMade(tempJqPlayer[4].innerHTML);
                    tempPlayer.freeThrowsAttempted = getShotsAttempted(tempJqPlayer[4].innerHTML);
                    tempPlayer.threePtsMade = getShotsMade(tempJqPlayer[3].innerHTML);
                    tempPlayer.threePtsAttempted = getShotsAttempted(tempJqPlayer[3].innerHTML);
                    tempPlayer.rebounds = parseInt(tempJqPlayer[7].innerHTML); //
                    tempPlayer.assists = parseInt(tempJqPlayer[8].innerHTML); //
                    tempPlayer.blocks = parseInt(tempJqPlayer[10].innerHTML); //
                    tempPlayer.steals = parseInt(tempJqPlayer[9].innerHTML); //
                    tempPlayer.turnovers = parseInt(tempJqPlayer[11].innerHTML); //
                    tempPlayer.points = parseInt(tempJqPlayer[14].innerHTML); //
                }
                catch (error)
                {
                    console.log("safasfasafasfafwfafafwfa");
                }
                


                if(isNaN(tempPlayer.rebounds))
                {
                    tempPlayer.rebounds = 0;
                }
                if(isNaN(tempPlayer.assists))
                {
                    tempPlayer.assists = 0;
                }
                if(isNaN(tempPlayer.blocks))
                {
                    tempPlayer.blocks = 0;
                }
                if(isNaN(tempPlayer.steals))
                {
                    tempPlayer.steals = 0;
                }
                if(isNaN(tempPlayer.turnovers))
                {
                    tempPlayer.turnovers = 0;
                }
                if(isNaN(tempPlayer.points))
                {
                    tempPlayer.points = 0;
                }

                if(i - 1 < secondTeamIndex)
                {
                    team1.players.push(tempPlayer);
                }
                else if(i - 1 > secondTeamIndex)
                {
                    team2.players.push(tempPlayer);
                }
            }
            //console.log(tempPlayer);

        }
        var tempTotal = 0;
        for(let i = 0; i < team1.players.length; ++i)
        {
            tempTotal += team1.players[i].points;
        }
        team1.totalScore = tempTotal;
        tempTotal = 0;
        for(let i = 0; i < team2.players.length; ++i)
        {
            tempTotal += team2.players[i].points;
        }
        team2.totalScore = tempTotal;
        
        //console.log(team1);
        //console.log(team2);

        var theGame = new game();

        if(team1.totalScore > team2.totalScore)
        {
            theGame.winningTeam = team1;
            theGame.losingTeam = team2;
            theGame.draw = false;
        }
        else if(team1.totalScore < team2.totalScore)
        {
            theGame.winningTeam = team2;
            theGame.losingTeam = team1;
            theGame.draw = false;
        }
        else
        {
            theGame.winningTeam = team1;
            theGame.losingTeam = team2;
            theGame.draw = true;
        }

        callback(theGame);
    });
}

function getStatsFromGame(link: string, callback)
{
    getHTML(link, (html) =>
    {
        var title, div, table1;
        var xd = $(html);

        for(var i = 0; i < xd.length; i++)
        {
            if(xd[i].localName == "title")
            {
                title = xd[i];
            }
            else if(xd[i].localName == "div")
            {
                div = xd[i];
            }
        }

        var divTable = $(div).find("table")
        //console.log(div);
        //console.log(divTable);
        //console.log("tablel: " + divTableLength);
        //console.log(link); // 3 '12 9 11
        var referenceArray = $(divTable[1]).find("thead tr th");
        //console.log(referenceArray);
        if(referenceArray.length > 6)
        {
            getStatsFromStandardGame(link, (game) =>
            {
                console.log("standard");
                game.redditLink = link;
                callback(game);
            });
        }
        else if(referenceArray.length > 0)
        {
            getStatsFromRetardedGame(link, (game) =>
            {
                console.log("retarded");
                game.redditLink = link;
                callback(game);
            });
        }
        else
        {
            console.log("WHAT THE ACTUAL FUCK " + link);
            callback(new game());
        }
    });
    /*getStatsFromStandardGame(link, (game) =>
    {
        callback(game);
    });

    getStatsFromRetardedGame(link, (game) =>
    {
        callback(game);
    });*/
}


