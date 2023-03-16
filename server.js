const express = require("express");
const app = express();
const server = require("http").Server(app);
const io = require('socket.io')(server);

app.set("view engine","ejs");
//app.use(express.static("public"), express.static("node_modules"));

// app.use('/scripts', express.static(__dirname + '/node_modules/bootstrap/dist/'));


app.get("/",(req,res)=>{
    res.send('Hello app');
})

app.get("/:room",(req,res)=>{
    //res.render("Room :" + {roomId: req.params.room});
    res.render("room",{roomId: req.params.room});
});

io.on("connection",(socket) => {
    socket.on("join-room", (roomId,userId)=>{
        socket.join(roomId);
        socket.to(roomId).broadcast.emit("user-connected",userId);
    });
})

server.listen("3000");
