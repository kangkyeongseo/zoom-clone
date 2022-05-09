import http from "http";
import WebSocket from "ws";
import express from "express";

const app = express();
const PORT = 3000;

app.set("view engine", "pug");
app.set("views", __dirname + "/views");
app.use("/public", express.static(__dirname + "/public"));

app.get("/", (req, res) => res.render("home"));
app.get("/*", (req, res) => res.redirect("/"));

const handleListen = () => console.log(`Listening on http://localhost:${PORT}`);

const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

const sockets = [];

wss.on("connection", (socket) => {
  sockets.push(socket);
  socket["nickname"] = "Anon";
  console.log("Connected to Browser");
  socket.on("close", () => console.log("Disonnected from Browser"));
  socket.on("message", (message) => {
    const translateMessage = message.toString("utf8");
    const parsedMsg = JSON.parse(translateMessage);
    switch (parsedMsg.type) {
      case "new_message":
        sockets.forEach((aSocket) => {
          aSocket.send(`${socket.nickname}: ${parsedMsg.payload}`);
        });
        break;
      case "nickname":
        socket["nickname"] = parsedMsg.payload;
        break;
    }
  });
});

server.listen(PORT, handleListen);
