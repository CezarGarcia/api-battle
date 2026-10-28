# API Battle - FIFA

API de performances de jogadores na FIFA feita com [Bun](https://bun.sh) e SQLite.

Todo jogador é gravado no banco. As leituras são respondidas de uma cópia em memória, e as respostas grandes ficam prontas e compactadas com gzip. Ao iniciar, a API carrega tudo do banco.

## Rotas

Todas exigem o header `Authorization: Bearer <API_TOKEN>`.

| Método | Rota | O que faz |
|---|---|---|
| POST | `/fifa` | Insere um jogador (todos os campos do dataset) |
| GET | `/fifa/count` | Quantidade de jogadores |
| GET | `/fifa` | Todos os jogadores |
| GET | `/fifa/id/{id}` | Um jogador pelo `player_id` |
| GET | `/fifa/nat/{exp}` | Jogadores com `nationality = exp` (ex.: `Brazil`) |

A documentação (Swagger) fica em `/docs` e não exige token.

## Configuração (`.env`)

| Variável | Padrão | |
|---|---|---|
| `PORT` | `3000` | Porta da API |
| `API_TOKEN` | — | Token aceito no header `Authorization` (obrigatório) |
| `READ_MODE` | `memory` | `memory` lê da memória, `database` lê direto do SQLite |
| `DB_PATH` | `data/fifa.db` | Arquivo do banco |
| `API_URL` | `http://localhost:3000` | Usado pelo script de inserção |

## Rodando na VM (Docker)

```bash
cp .env.example .env   # troque o API_TOKEN
docker compose up -d --build
```

- O banco fica em `data/`, fora do container: rebuild e restart não apagam os dados.
- `restart: always`: se a API cair, o Docker sobe de novo.
- `network_mode: host`: a API usa a rede da VM direto. Só funciona em Linux; no Docker Desktop (Windows/Mac) troque por `ports: ["3000:3000"]`.

## Rodando local (sem Docker)

```bash
cp .env.example .env
bun run dev
```

## Inserção dos dados

O script lê `dataset/fifa_player_performance_market_value.csv` e insere os 2800 jogadores pelo `POST /fifa`, 50 requisições em paralelo.

```bash
docker compose exec api bun scripts/insert-batch.js            # pelo container
node scripts/insert-batch.js http://ip:porta token             # de qualquer máquina com Node 18+ ou Bun
```

## Estrutura

```
src/
  server.js           rotas, token e inicialização
  player.js           validação do jogador
  database.js         SQLite: tabela, insert e consultas
  memory-store.js     leituras pela memória (READ_MODE=memory)
  database-store.js   leituras pelo banco (READ_MODE=database)
  body.js             respostas prontas e gzip
```
