const FIELDS = {
  player_id: "integer",
  player_name: "text",
  age: "integer",
  nationality: "text",
  club: "text",
  position: "text",
  overall_rating: "integer",
  potential_rating: "integer",
  matches_played: "integer",
  goals: "integer",
  assists: "integer",
  minutes_played: "integer",
  market_value_million_eur: "number",
  contract_years_left: "integer",
  injury_prone: "text",
  transfer_risk_level: "text",
};

export function parsePlayer(body) {
  if (typeof body !== "object" || body === null || Array.isArray(body)) {
    return { error: "body must be a JSON object" };
  }

  const player = {};
  for (const [field, type] of Object.entries(FIELDS)) {
    if (!isValid(body[field], type)) return { error: `${field} must be ${describe(type)}` };
    player[field] = body[field];
  }

  return { player };
}

function isValid(value, type) {
  if (type === "text") return typeof value === "string" && value.trim().length > 0 && value.length <= 100;
  if (type === "integer") return Number.isInteger(value) && value >= 0;
  return Number.isFinite(value) && value >= 0;
}

function describe(type) {
  if (type === "text") return "a text with 1 to 100 characters";
  return `a non-negative ${type}`;
}
