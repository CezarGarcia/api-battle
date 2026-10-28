import { prepareBody } from "./body.js";

export function createDatabaseStore(db) {
  return {
    create: (player) => {
      db.insert(player);
      return player;
    },
    count: () => db.count(),
    findById: (id) => db.findById(id),
    listAll: () => prepareBody(db.allAsJson(), 1),
    findByNationality: (nationality) => prepareBody(db.byNationalityAsJson(nationality), 1),
  };
}
