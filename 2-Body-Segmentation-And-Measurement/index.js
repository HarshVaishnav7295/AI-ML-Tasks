const express = require('express')
const cors = require('cors')
const multer = require('multer')
const path = require("path");
const mongoose = require('mongoose');
const db = require("./models");
const bodyParser = require('body-parser');
const AppRouter= require('./routes/app.routes')
const cluster = require('cluster')
const totalCpuCount = require("os").cpus().length
console.log("cpu count : ",totalCpuCount)
require("dotenv").config();

if(cluster.isMaster){
  console.log(`Master with id : ${process.pid} is running.`)
  // creating workers(child process) as max as cpu cores.
  for(let i=0;i<totalCpuCount;i++){
    cluster.fork()
  }
  // checking if cluster dies. and then creating new
  cluster.on('exit',(worker, code, signal) => {
    console.log(`worker ${worker.process.pid} died`);
    console.log("Creating new worker.");
    cluster.fork();
  })
}else{
  const app = express()
  app.set('view engine', 'ejs');
  app.use(cors())
  app.use(express.json())
  app.use(bodyParser.urlencoded({ extended: true }));
  
  const publicDir = path.join(__dirname, "./uploads");
  app.use(express.static(publicDir));
  
  app.use('/api',AppRouter)
  
  app.listen(process.env.BACKEND_PORT,async()=>{
      db.mongoose
      .connect(db.url, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        dbName:"Training"
      })
      .then(() => {
        console.log("Connected to the database!");
      })
      .catch((err) => {
        console.log("Cannot connect to the database!", err);
        process.exit();
      });
      console.log("App listening on port : ",process.env.BACKEND_PORT)
  })
}

// d1 - 145 cm
// d2 - 220 cm
// d3 - 295 cm