import { prepareBody } from "./body.js";

const REBUILD_DELAY_MS = 200;
const EMPTY_LIST = prepareBody("[]");

export function createMemoryStore(db) {
  const players = new Map(db.findAll().map((player) => [player.player_id, player]));
  let allBody = null;
  let nationalityBodies = new Map();
  let rebuildTimer;

  function create(player) {
    db.insert(player);
    players.set(player.player_id, player);

    allBody = null;
    clearTimeout(rebuildTimer);
    rebuildTimer = setTimeout(listAll, REBUILD_DELAY_MS);

    return player;
  }

  function rebuild() {
    const sorted = [...players.values()].sort((a, b) => a.player_id - b.player_id);
    const byNationality = Map.groupBy(sorted, (player) => player.nationality);

    allBody = prepareBody(JSON.stringify(sorted));
    nationalityBodies = new Map();
    for (const [nationality, list] of byNationality) {
      nationalityBodies.set(nationality, prepareBody(JSON.stringify(list)));
    }
  }

  function listAll() {
    if (!allBody) rebuild();
    return allBody;
  }

  function findByNationality(nationality) {
    if (!allBody) rebuild();
    return nationalityBodies.get(nationality) ?? EMPTY_LIST;
  }

  rebuild();

  return {
    create,
    count: () => players.size,
    findById: (id) => players.get(id),
    listAll,
    findByNationality,
  };
}
