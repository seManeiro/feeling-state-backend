let express = require('express');
let mongoose = require('mongoose');
let cors = require('cors');
let bodyParser = require('body-parser');
let dbConfig = require('./configuration/config');

const passport = require("passport");



// Connecting mongoDB Database
mongoose.Promise = global.Promise;


mongoose.connect(dbConfig.cloudDb, {
  useUnifiedTopology: true, useNewUrlParser: true
}).then(() => {
  console.log('Database sucessfully connected!')
},
  error => {
    console.log('Could not connect to database : ' + error)
  }
)
require('./models/Feelings');
require('./models/Users');




// Express Route
const routes = require('./routes/routes')


const app = express();

app.use(bodyParser.json());

app.use(bodyParser.urlencoded({
  extended: true
}));

app.use(cors());
app.use("/", routes);


require("./configuration/passport")(passport);
app.use(passport.initialize());


// PORT
const port = process.env.PORT || 5000;
app.listen(port, () => {
  console.log('Connected to port ' + port)
})

// 404 Error
app.use((req, res, next) => {
  next({error:"404 not found."});
});

app.use(function (err, req, res, next) {
  console.error(err.message);
  if (!err.statusCode) err.statusCode = 500;
  res.status(err.statusCode).send(err.message);
});