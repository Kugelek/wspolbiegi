const express = require("express");
const cors = require("cors");
const app = express();
app.use(cors());
const http = require("http");
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = require("socket.io")(server, {
  cors: {
    origin: "http://127.0.0.1:5500",
    methods: ["GET", "POST"],
    extraHeaders: {
      "Access-Control-Allow-Credentials": "true",
    },
    credentials: true,
    transports: ["websocket", "polling"],
  },
  allowEIO3: true,
});

app.get("/", (req, res) => {
  res.send("<h1>Hello world</h1>");
});

let players = [];
let games = [];

io.on("connection", (socket) => {
  // console.log(socket.id);

  socket.on("joinQueue", (playerCandidate) => {
    players = players.filter(
      (player) => player.nickname !== playerCandidate.myNickname
    );
    players.push({
      nickname: playerCandidate.myNickname,
      points: 0,
      opponentName: "",
      id: socket.id,
    });

    // console.log(players);
  });

  socket.on("nextMove", (data) => {
    console.log("DATA");
    console.log(data);
    let wantedGame = games.filter((g) =>
      g.playerNames.includes(data.myNickname)
    )[0];
    if (wantedGame.turn === wantedGame.playerNames[0]) {
      wantedGame.turn = wantedGame.playerNames[1];
      if (data.isCorrect) wantedGame.p0.points += 1;
    } else {
      wantedGame.turn = wantedGame.playerNames[0];
      if (data.isCorrect) wantedGame.p1.points += 1;
    }
    if (data.isCorrect) {
      wantedGame.showedSquares = wantedGame.showedSquares.filter(
        (sq) => sq !== data.firstFieldId && sq !== data.secFieldId
      );
    }
    //nie podmienia arraya
    console.log("EDITED");
    console.log(
      games.filter((g) => g.playerNames.includes(data.myNickname))[0]
    );
    io.sockets.emit("gameStateUpdate", games);
  });

  // socket.emit("nextMove", {
  //   myNickname,
  //   firstFieldId: event.target.id * 1,
  //   secFieldId: lastRevealedSquare.id * 1,
  //   isCorrect: isCorrect,
  // });
});

server.listen(3000, () => {
  console.log("listening on *:3000");
});

const matchPlayersToGames = () => {
  if (players.length >= 2) {
    // console.log(players[0]);
    // console.log(players[1]);
    games.push({
      p0: players[0],
      p1: players[1],
      showedSquares: [
        0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19,
        20, 21, 22, 23,
      ],
      playerNames: [players[0].nickname, players[1].nickname],
      turn: players[0].nickname,
    });

    players.splice(0, 2);
    // console.log("P" + players);
    io.sockets.emit("gameStart", games);
    // console.log(...games);
    // console.log(io.sockets.filter((el) => el.id === players[0].id));
  }
};
setInterval(matchPlayersToGames, 3000);
