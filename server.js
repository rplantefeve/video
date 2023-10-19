const express = require("express");
const app = express();
const fs = require("fs");

let broadcaster = "";
const port = 443;

const options = {
  cert: fs.readFileSync("certification/certificate.crt"),
  key: fs.readFileSync("certification/private.key"),
};

const https = require("https");
const server = https.createServer(options, app);

const io = require("socket.io")(server);

app.get("/", (req, res) => {
  res.status(200).json({ message: "hw" });
});

app.use(express.static(__dirname + "/public"));
try {
  io.sockets.on("error", (e) => log(e));
  io.sockets.on("connection", (socket) => {
    const clientIpAddress = socket.handshake.address; //adresse ip du client
    Personne(clientIpAddress);
    socket.on("broadcaster", () => {
      broadcaster = socket.id;
      socket.broadcast.emit("broadcaster");
    });

    socket.on("ip", () => {
      socket.to(id).emit("ip", clientIpAddress);
    });
    socket.on("watcher", () => {
      socket.to(broadcaster).emit("watcher", socket.id);
    });

    socket.on("offer", (id, message) => {
      socket.to(id).emit("offer", socket.id, message);
    });

    socket.on("answer", (id, message) => {
      socket.to(id).emit("answer", socket.id, message);
    });

    socket.on("candidate", (id, message) => {
      socket.to(id).emit("candidate", socket.id, message);
    });

    socket.on("disconnectPeer", () => {
      //socket.disconnect();
      socket.to(broadcaster).emit("disconnectPeer", socket.id);
    });
  });
  server.listen(port, () => log(`Server is running on port ${port}`));
} catch (error) {
  log(error.stack);
}

function log(error) {
  const now = new Date();
  const logString = `${now.toLocaleString()}: ${error}\n`;
  fs.appendFile("error.log", logString, (err) => {
    if (err) {
      console.error(
        `Erreur lors de l'enregistrement du fichier de log : ${err}`
      );
    }
  });
}
function Personne(adr) {
  const now = new Date();
  const logString = `${now.toLocaleString()}: ${adr}\n`;
  fs.appendFile("personne.txt", logString, (err) => {
    if (err) {
      console.error(
        `Erreur lors de l'enregistrement du fichier de log : ${err}`
      );
    }
  });
}
