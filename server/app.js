import express from "express";
import path from "path";
import { loadData, minToHours } from "./utils.js";

// variáveis globais deste módulo
const PORT = 3000;
const db = {};
const app = express();
const __dirname = path.resolve();

// set configuration
app.set("view engine", "hbs");
app.set("views", "server/views");
app.use(express.static(`${__dirname}/client`));

// routes
app.get("/", (request, response) => {
  response.render("index", db);
});

app.get("/jogador/:id", (request, response) => {
  const id = request.params.id;
  const player = db["jogadores"]?.players.find((j) => j.steamid === id);
  if (!player) return response.status(404).end();

  const metrics = {};
  const rawMetrics = db["jogosPorJogador"]?.[id];

  metrics.mostPlayed = rawMetrics.games
    .sort((a, b) => b.playtime_forever - a.playtime_forever)
    .slice(0, 5)
    .map((g) => ({ ...g, timePlayed: `${minToHours(g.playtime_forever)}H` }));

  metrics.favoriteGame = metrics.mostPlayed[0];
  metrics.gameCount = rawMetrics.game_count;
  metrics.notPlayed = rawMetrics.games.filter((g) => !!g.playtime_forever).length;

  response.render("jogador", { player, metrics });
});

Promise.all([loadData("jogadores"), loadData("jogosPorJogador")])
  .then(([jogadores, jogosPorJogador]) => {
    db["jogadores"] = jogadores;
    db["jogosPorJogador"] = jogosPorJogador;
    app.listen(PORT, () => console.log(`Server start listing on port ${PORT}`));
  })
  .catch((err) => {
    console.error("Server could not start due to errors");
    console.error(err);
  });
