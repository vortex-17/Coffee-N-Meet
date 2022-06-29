import express from "express";
import path from 'path';
import cookieParser from 'cookie-parser';
import logger from 'morgan';


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
})

export default app;
