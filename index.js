const express = require('express');
const mongoose = require('mongoose');
const app =express();
const dotenv = require('dotenv');
var cors = require('cors');
const bodyParser = require('body-parser');

const user = require('./src/routes/user')
const payer = require('./src/routes/payer')
const token = require("./src/routes/token")
const request = require("./src/routes/request")
const task = require("./src/routes/task");

dotenv.config();

app.use((req,res,next) => {
    res.setHeader('Access-Control-Allow-Origin','*');
    res.setHeader('Access-Control-Allow-Methods', 'GET','POST', 'PUT');
    // res.setHeader('access-control-Allow-Headers', 'Content-Type','Authorization');

    next();
})
app.use(express.json());
app.use(cors());

  
  // BodyParser Middleware
  app.use(
    bodyParser.urlencoded({
      extended: false,
    }),
  );
  app.use(bodyParser.json());
  


app.use('/api/v1/user', user);
app.use('/api/v1/payer', payer);
app.use('/api/v1/token', token);
app.use('/api/v1/request', request);
app.use('/api/v1/task',task);

mongoose.connect('mongodb+srv://'+process.env.SERVER+':'+process.env.PASSWORD+'@production.1whchjx.mongodb.net/?retryWrites=true&w=majority')
.then(() => {
    app.listen(3001, () => console.log('database connected ;)'));
})
.catch(err => console.log(err));

