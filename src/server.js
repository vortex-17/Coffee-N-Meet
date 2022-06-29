import {createServer} from "http";
import app from "./index.js";

const port = process.env.port || 4000;
const server = createServer(app);

server.listen(port)