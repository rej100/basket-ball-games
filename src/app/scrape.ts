
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
}

class game
{
    winningTeam: team;
    losingTeam: team;
    draw: boolean;
}

export function thingg(searchTerm: string, searchLimit: number, sortBy: string, after: string)
{
    var games = [];
    var currafter = after;
    var boi = 3;
    getGameLinks(searchTerm, searchLimit, sortBy, after, (gameLinks, after) =>
    {
        console.log(gameLinks, after);
        getStatsFromGame(gameLinks[2], (game) =>
        {
            console.log(game);
        });
        /*for(var i = 0; i < 3; ++i)
        {
            getStatsFromGame(gameLinks[i], (game) =>
            {
                console.log(game);
            });
        }*/
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
            if(element.data.title.includes("Post Game Thread"))
            {
                gameLinks.push(element.data.url);
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
    .then(contents => {callback(contents)});
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

    for(var i = colonIndex + 1; i < length; ++i)
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
        team1.shortName = $(table1).find("thead tr th strong")[0].innerHTML.split(" ").pop();
        team2.shortName = $(table2).find("thead tr th strong")[0].innerHTML.split(" ").pop();

        
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

        table1 = $(div).find("table")[9];

        console.log(table1);

        var theGame = new game();
        callback(theGame);
    });
}

function getStatsFromGame(link: string, callback)
{
    /*getStatsFromStandardGame(link, (game) =>
    {
        callback(game);
    });*/

    getStatsFromRetardedGame(link, (game) =>
    {
        callback(game);
    });
}