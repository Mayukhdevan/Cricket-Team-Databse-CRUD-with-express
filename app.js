// Import modules
const express = require("express");
const path = require("path");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");

const app = express();
app.use(express.json());

const port = 3000;
dbPath = path.join(__dirname, "cricketTeam.db");
let db = null;

const initializeDbAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });

    app.listen(port, () =>
      console.log("Server Listening at http://localhost:3000")
    );
  } catch (e) {
    console.log(e.message);
    process.exit(1);
  }
};
initializeDbAndServer();

// API 1: Returns a list of all players in the team
app.get("/players/", async (req, res) => {
  const getPlayersQuery = `
    SELECT
      * 
    FROM 
      cricket_team;`;

  const playerArray = await db.all(getPlayersQuery);
  const newPlayerArray = [];
  playerArray.forEach((eachObj) => {
    newPlayerArray.push({
      playerId: eachObj["player_id"],
      playerName: eachObj["player_name"],
      jerseyNumber: eachObj["jersey_number"],
      role: eachObj["role"],
    });
  });

  res.send(newPlayerArray);
});

// API 2: Creates a new player in the team (database)
app.post("/players/", async (req, res) => {
  const playerDetails = req.body;
  const { playerName, jerseyNumber, role } = playerDetails;

  const addPlayerQuery = `
    INSERT INTO
      cricket_team(player_name,jersey_number,role)
    VALUES
      ('${playerName}',
        ${jerseyNumber},
       '${role}');`;
  try {
    const dbResponse = await db.run(addPlayerQuery);
    const playerId = dbResponse.lastID;
    res.send("Player Added to Team");
  } catch (e) {
    console.log(e.message);
  }
});

//API 3: Returns a player based on a player ID
app.get("/players/:playerId/", async (req, res) => {
  const { playerId } = req.params;

  const getPlayerQuery = `
    SELECT
      *
    FROM
      cricket_team
    WHERE
      player_id = ${playerId};`;

  const playerObj = await db.get(getPlayerQuery);
  res.send({
    playerId: playerObj["player_id"],
    playerName: playerObj["player_name"],
    jerseyNumber: playerObj["jersey_number"],
    role: playerObj["role"],
  });
});

//API 4: Updates the details of a player based on the player ID
app.put("/players/:playerId/", async (req, res) => {
  const { playerId } = req.params;
  const playerDetails = req.body;
  const { playerName, jerseyNumber, role } = playerDetails;

  const updatePlayerQuery = `
    UPDATE
      cricket_team
    SET
      player_name = '${playerName}',
      jersey_number = ${jerseyNumber},
      role = '${role}'
    WHERE
      player_id = ${playerId};`;

  await db.run(updatePlayerQuery);
  res.send("Player Details Updated");
});

//API 5: Deletes a player from the team (database) based on the player ID
app.delete("/players/:playerId/", async (req, res) => {
  const { playerId } = req.params;

  const deletePlayerQuery = `
    DELETE FROM
      cricket_team
    WHERE
      player_id = ${playerId};`;

  await db.run(deletePlayerQuery);
  res.send("Player Removed");
});

module.exports = app;
