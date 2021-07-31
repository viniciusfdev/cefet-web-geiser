// importação de dependência(s)
import express from "express";
import path from "path";
import { loadData } from "./utils.js";

// variáveis globais deste módulo
const PORT = 3000;
const db = {};
const app = express();
const __dirname = path.resolve();

// EXERCÍCIO 2
// definir rota para página inicial --> renderizar a view index, usando os
// dados do banco de dados "data/jogadores.json" com a lista de jogadores
// dica: o handler desta função é bem simples - basta passar para o template
//       os dados do arquivo data/jogadores.json (~3 linhas)
loadData("jogadores").then((data) => (db["jogadores"] = data));
loadData("jogosPorJogador").then((data) => (db["jogosPorJogador"] = data));
app.set("view engine", "hbs");
app.set("views", "server/views");

app.get("/", (request, response) => {
  response.render("index", db);
});

// EXERCÍCIO 3
// definir rota para página de detalhes de um jogador --> renderizar a view
// jogador, usando os dados do banco de dados "data/jogadores.json" e
// "data/jogosPorJogador.json", assim como alguns campos calculados
// dica: o handler desta função pode chegar a ter ~15 linhas de código
app.get("/jogador/:id", (request, response) => {
  const id = request.params.id;
  const player = db["jogadores"]?.players.find((j) => j.steamid === id);
  if (!player) return response.status(404).end();

  const metrics = {};
  const rawMetrics = db["jogosPorJogador"]?.[id];

  metrics.mostPlayed = rawMetrics.games
    .sort((a, b) => b.playtime_forever - a.playtime_forever)
    .slice(0, 5)
    .map((game) => ({ ...game, playtime: `${Math.floor(game.playtime_forever / 60)}H` }));

  metrics.favoriteGame = metrics.mostPlayed[0];
  metrics.gameCount = rawMetrics.game_count;
  metrics.notPlayed = rawMetrics.games.filter((g) => !!g.playtime_forever).length;

  response.render("jogador", { player, metrics });
});

// EXERCÍCIO 1
// configurar para servir os arquivos estáticos da pasta "client"
// dica: 1 linha de código
app.use(express.static(`${__dirname}/client`));

// abrir servidor na porta 3000 (constante PORT)
// dica: 1-3 linhas de código
app.listen(PORT, () => console.log(`Server start listing on port ${PORT}`));
