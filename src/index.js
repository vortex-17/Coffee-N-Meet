import express from "express";
import path from 'path';
import { fileURLToPath } from 'url';
import cookieParser from 'cookie-parser';
import logger from 'morgan';
import {Server} from "socket.io";
import {createServer} from "http";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.join(path.dirname(__filename), "../");


const app = express();
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, '/public')));

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

let numClients = {}

//socket programming

io.on("connection" ,(socket) => {

  console.log("Got a new connection: ", socket.id)

  socket.on("message", (message, room) => {
    console.log("message received by the server: ", message );
    socket.in(room).emit("message" , message, room);
  });

  socket.on("create or join", (room) => {
    // let clientsInRoom = io.sockets.adapter.rooms[room];
	  // let numClients = clientsInRoom!=undefined ? Object.keys(io.sockets.adapter.rooms[room]).length:0;
    // clientsInRoom = io.sockets.adapter.rooms[room]
    // numClients = io.in(room).engine.clientsCount;
    // console.log(typeof numClients);
    console.log("Number of clients in the room are, ", room, numClients[room], numClients);

    if(numClients[room] === undefined || numClients[room] === 0) {
      //We can join the room
      socket.join(room);
      socket.emit("create", room, socket.id);
      numClients[room] = 1;

    } else if (numClients[room] === 1) {
      console.log("Other client wants to join the room");
      io.sockets.in(room).emit("join", room);
      socket.join(room);
      socket.emit('joined', room, socket.id);
		  io.sockets.in(room).emit('ready');
      numClients[room]++;
    } else {
      socket.emit("full", room);
    }
  });
  socket.on('ipaddr', function() {
	  var ifaces = os.networkInterfaces();
	  for (var dev in ifaces) {
		ifaces[dev].forEach(function(details) {
		  if (details.family === 'IPv4' && details.address !== '127.0.0.1') {
			socket.emit('ipaddr', details.address);
		  }
		});
	  }
	});

});

httpServer.listen(app.get('port'),  () => {
  let port = httpServer.address().port;
  console.log('Running on : ', port);
});

export default app;
