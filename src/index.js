import express from "express";
import path from 'path';
import cookieParser from 'cookie-parser';
import logger from 'morgan';
import {Server} from "socket.io";
import {createServer} from "http";

const app = express();
app.use(logger("combined"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

//handling CORS error
app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header(
      "Access-Control-Allow-Headers",
      "Origin, X-Requested-With, Content-Type, Accept, Authorization"
    );
    if (res.method === "OPTIONS") {
      res.header("Access-Control-Allow-Methods", "POST,PUT,GET,DELETE,PATCH");
      res.status(200).json({});
    }
  
    next();
}); 

app.get("/", (req,res,next) => {
    res.status(200).json({message : "Welcome to Coffee-N-Meet"});
});

app.get("/meet", (req,res) => {
  res.render("index.ejs");
});

app.set('port', process.env.PORT || 4000);

const port = process.env.port || 4000;
const httpServer = createServer(app);

const io = new Server(httpServer, { cors: { origin: '*' } });

//socket programming

io.sockets.on("connection" ,(socket) => {

  socket.on("connect", () => {
    console.log("Got a new connection: ", socket.id);
  })

  socket.on("message", (message, room) => {
    console.log("message received by the server: ", message );
    socket.to(room).emit("message" , message, room);
  });


});

httpServer.listen(app.get('port'), function () {
  var port = httpServer.address().port;
  console.log('Running on : ', port);
});

export default app;
