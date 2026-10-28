import { readFileSync } from "node:fs";

const API_URL = process.argv[2] ?? process.env.API_URL ?? "http://localhost:3000";
const API_TOKEN = process.argv[3] ?? process.env.API_TOKEN;
const CSV_FILE = new URL("../dataset/fifa_player_performance_market_value.csv", import.meta.url);
const CONCURRENCY = 50;

function readPlayers() {
  const [header, ...lines] = readFileSync(CSV_FILE, "utf-8").trim().split(/\r?\n/);
  const columns = header.split(",");

  return lines.map((line) => {
    const values = line.split(",");
    return Object.fromEntries(columns.map((column, i) => [column, toValue(values[i])]));
  });
}

function toValue(text) {
  const number = Number(text);
  return text !== "" && !Number.isNaN(number) ? number : text;
}

async function sendPlayer(player) {
  const res = await fetch(`${API_URL}/fifa`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "Authorization": `Bearer ${API_TOKEN}` },
    body: JSON.stringify(player),
  });
  return res.status;
}

const players = readPlayers();
const failures = {};
let next = 0;

async function worker() {
  while (next < players.length) {
    const status = await sendPlayer(players[next++]);
    if (status !== 201) failures[status] = (failures[status] ?? 0) + 1;
  }
}

const start = performance.now();
await Promise.all(Array.from({ length: CONCURRENCY }, worker));
const failed = Object.values(failures).reduce((sum, n) => sum + n, 0);

console.log(`Inserted ${players.length - failed} of ${players.length} players in ${(performance.now() - start).toFixed(0)} ms`);
if (failed) console.log("Failures by status code:", failures);
