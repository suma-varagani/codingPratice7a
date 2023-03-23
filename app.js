const express = require("express");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const path = require("path");
const dbPath = path.join(__dirname, "cricketMatchDetails.db");
const app = express();
app.use(express.json());
let db = null;

const intializeDataBaseAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });

    app.listen(3700, () => {
      console.log("Server started at http://localhost:3600/");
    });
  } catch (error) {
    console.log(`db error ${error.message}`);
  }
};
intializeDataBaseAndServer();
const convertDbResponseToObject = (dbObject) => {
  return {
    playerId: dbObject.player_id,
    playerName: dbObject.player_name,
  };
};
const convertDbResponseToObjectOfMatch = (dbObject) => {
  return {
    matchId: dbObject.match_id,
    match: dbObject.match,
    year: dbObject.year,
  };
};

const convertDbResponseToObjectListOfMatch = (dbObject) => {
  return {
    matchId: dbObject.match_id,
    match: dbObject.match,
    year: dbObject.year,
  };
};
const convertStatsArray = (dbObject) => {
  return {
    playerId: dbObject.playerId,
    playerName: dbObject.playerName,
    totalScore: dbObject.totalScore,
    totalFours: dbObject.totalFours,
    totalSixes: dbObject.totalSixes,
  };
};

// get players API
app.get("/players/", async (request, response) => {
  const GetPlayersQuery = `
     SELECT *
     FROM  player_details
     ORDER BY player_id;`;
  const playersArray = await db.all(GetPlayersQuery);
  response.send(
    playersArray.map((eachPlayer) => convertDbResponseToObject(eachPlayer))
  );
});

//get player API
app.get("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const GetPlayerQuery = ` SELECT *
     FROM  player_details
     WHERE player_id=${playerId};
    `;
  const playerArray = await db.get(GetPlayerQuery);
  response.send(convertDbResponseToObject(playerArray));
});

// put method API
app.put("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const playerDetails = request.body;
  const { playerName } = playerDetails;
  const updatePlayerQuery = `
  UPDATE player_details
  SET 
    player_name="${playerName}";`;

  await db.run(updatePlayerQuery);
  response.send("Player Details Updated");
});

// get match API

app.get("/matches/:matchId/", async (request, response) => {
  const { matchId } = request.params;
  const getMatchQuery = `
    SELECT * FROM match_details
    WHERE match_id=${matchId};`;
  const matchArray = await db.get(getMatchQuery);
  response.send(convertDbResponseToObjectOfMatch(matchArray));
});

// get list of matches API
app.get("/players/:playerId/matches", async (request, response) => {
  const { playerId } = request.params;
  console.log(playerId);
  const getListOfMatch = `
    SELECT *
     FROM player_match_score NATURAL JOIN match_details 
      
     WHERE player_id=${playerId};`;
  const listOfMatchArray = await db.all(getListOfMatch);
  response.send(
    listOfMatchArray.map((eachMatch) =>
      convertDbResponseToObjectListOfMatch(eachMatch)
    )
  );
});

//6 th Query
app.get("/matches/:matchId/players", async (request, response) => {
  const { matchId } = request.params;
  const API6thQuery = `
    SELECT *
    FROM player_details LEFT JOIN player_match_score
     ON player_details.player_id=player_match_score.player_id
     WHERE player_match_score.match_id=${matchId};`;
  const Array = await db.all(API6thQuery);
  console.log(Array);
  response.send(Array.map((eachone) => convertDbResponseToObject(eachone)));
});
// &th query
app.get("/players/:playerId/playerScores/", async (request, response) => {
  const { playerId } = request.params;
  const API7thquery = `
     SELECT
    player_details.player_id AS playerId,
    player_details.player_name AS playerName,
    SUM(player_match_score.score) AS totalScore,
    SUM(fours) AS totalFours,
    SUM(sixes) AS totalSixes FROM 
    player_details INNER JOIN player_match_score ON
    player_details.player_id = player_match_score.player_id
    WHERE player_details.player_id = ${playerId};`;
  const Array = await db.get(API7thquery);
  console.log(convertStatsArray(Array));
  response.send(convertStatsArray(Array));
});
module.exports = app;
