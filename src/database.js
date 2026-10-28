import { Database } from "bun:sqlite";
import { mkdirSync } from "node:fs";
import { dirname } from "node:path";

const COLUMNS = `
  player_id, player_name, age, nationality, club, position, overall_rating, potential_rating,
  matches_played, goals, assists, minutes_played, market_value_million_eur, contract_years_left,
  injury_prone, transfer_risk_level
`;

const PLAYER_AS_JSON = `json_object(
  'player_id', player_id, 'player_name', player_name, 'age', age, 'nationality', nationality,
  'club', club, 'position', position, 'overall_rating', overall_rating, 'potential_rating', potential_rating,
  'matches_played', matches_played, 'goals', goals, 'assists', assists, 'minutes_played', minutes_played,
  'market_value_million_eur', market_value_million_eur, 'contract_years_left', contract_years_left,
  'injury_prone', injury_prone, 'transfer_risk_level', transfer_risk_level
)`;

export function openDatabase(path) {
  mkdirSync(dirname(path), { recursive: true });
  const db = new Database(path, { create: true, strict: true });
  db.run("PRAGMA journal_mode = WAL");
  db.run("PRAGMA synchronous = NORMAL");
  db.run("PRAGMA cache_size = -64000");

  db.run(`
    CREATE TABLE IF NOT EXISTS players (
      player_id INTEGER PRIMARY KEY,
      player_name TEXT NOT NULL,
      age INTEGER NOT NULL,
      nationality TEXT NOT NULL,
      club TEXT NOT NULL,
      position TEXT NOT NULL,
      overall_rating INTEGER NOT NULL,
      potential_rating INTEGER NOT NULL,
      matches_played INTEGER NOT NULL,
      goals INTEGER NOT NULL,
      assists INTEGER NOT NULL,
      minutes_played INTEGER NOT NULL,
      market_value_million_eur REAL NOT NULL,
      contract_years_left INTEGER NOT NULL,
      injury_prone TEXT NOT NULL,
      transfer_risk_level TEXT NOT NULL
    )
  `);
  db.run("CREATE INDEX IF NOT EXISTS players_nationality ON players (nationality)");

  const insert = db.query(`
    INSERT INTO players (${COLUMNS}) VALUES (
      $player_id, $player_name, $age, $nationality, $club, $position, $overall_rating, $potential_rating,
      $matches_played, $goals, $assists, $minutes_played, $market_value_million_eur, $contract_years_left,
      $injury_prone, $transfer_risk_level
    )
  `);
  const selectAll = db.query(`SELECT ${COLUMNS} FROM players ORDER BY player_id`);
  const selectById = db.query(`SELECT ${COLUMNS} FROM players WHERE player_id = ?`);
  const count = db.query("SELECT count(*) AS total FROM players");
  const allAsJson = db.query(`SELECT json_group_array(${PLAYER_AS_JSON}) AS json FROM players`);
  const byNationalityAsJson = db.query(`SELECT json_group_array(${PLAYER_AS_JSON}) AS json FROM players WHERE nationality = ?`);

  return {
    insert: (player) => insert.run(player),
    findAll: () => selectAll.all(),
    findById: (id) => selectById.get(id),
    count: () => count.get().total,
    allAsJson: () => allAsJson.get().json,
    byNationalityAsJson: (nationality) => byNationalityAsJson.get(nationality).json,
  };
}
