import { sendBody } from "./body.js";
import { openDatabase } from "./database.js";
import { createDatabaseStore } from "./database-store.js";
import { createMemoryStore } from "./memory-store.js";
import { parsePlayer } from "./player.js";

const PORT = Number(process.env.PORT ?? 3000);
const API_TOKEN = process.env.API_TOKEN;
const READ_MODE = process.env.READ_MODE ?? "memory";
const DB_PATH = process.env.DB_PATH ?? "data/fifa.db";

if (!API_TOKEN) throw new Error("API_TOKEN is not set");

const db = openDatabase(DB_PATH);
const store = READ_MODE === "database" ? createDatabaseStore(db) : createMemoryStore(db);

function authenticated(handler) {
  return (req) => {
    if (req.headers.get("authorization") !== `Bearer ${API_TOKEN}`) {
      return new Response(null, { status: 401 });
    }
    return handler(req);
  };
}

async function createPlayer(req) {
  const body = await req.json().catch(() => null);
  const { player, error } = parsePlayer(body);
  if (error) return Response.json({ error }, { status: 400 });

  if (store.findById(player.player_id)) {
    return Response.json({ error: "player_id already exists" }, { status: 409 });
  }

  return Response.json(store.create(player), { status: 201 });
}

function findById(req) {
  const id = Number(req.params.id);
  const player = Number.isInteger(id) ? store.findById(id) : undefined;
  if (!player) return Response.json({ error: "player not found" }, { status: 404 });

  return Response.json(player);
}

Bun.serve({
  port: PORT,
  maxRequestBodySize: 64 * 1024,
  idleTimeout: 10,
  routes: {
    "/fifa": {
      GET: authenticated((req) => sendBody(req, store.listAll())),
      POST: authenticated(createPlayer),
    },
    "/fifa/count": { GET: authenticated(() => Response.json({ count: store.count() })) },
    "/fifa/id/:id": { GET: authenticated(findById) },
    "/fifa/nat/:nationality": { GET: authenticated((req) => sendBody(req, store.findByNationality(req.params.nationality))) },
    "/docs": () => new Response(Bun.file("docs/index.html")),
    "/docs/openapi.json": () => new Response(Bun.file("docs/openapi.json")),
  },
  fetch: () => Response.json({ error: "route not found" }, { status: 404 }),
});

console.log(`API running on port ${PORT} | read mode: ${READ_MODE} | players: ${store.count()}`);
