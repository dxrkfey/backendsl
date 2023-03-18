var express = require('express')
var cors = require('cors')
var app = express()
var bodyParser = require('body-parser')
var jsonParser = bodyParser.json()
const mysql = require('mysql2');
const bcrypt = require('bcrypt')
const saltRounds = 20
var jwt = require('jsonwebtoken');
const secret = 'Salad-login-project2023'

// create the connection to database
const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    database: 'saladdb'
  });
  

app.use(cors())
app.use(bodyParser.urlencoded({ extended: false }));

app.post('/register', jsonParser, function (req, res, next) {
  bcrypt.hash(req.body.password, saltRounds, function(err, hash) {
    connection.execute(
    'INSERT INTO user (email, password, fname, lname, number) VALUES (?,?,?,?,?)',
    [req.body.email, hash, req.body.fname, req.body.lname, req.body.number],
    function(err, results, fields) {
      if(err){
        res.json({status: 'error', message: err})
        return
      }
      res.json({status: 'ok'})
    }
   );
  });
})

app.post('/login', jsonParser, function (req, res, next) {
  connection.execute(
    'SELECT * FROM user WHERE email=?',
    [req.body.email],
    function(err, user, fields) {
      if(err){res.json({status: 'error', message: err});return}
      if(user.length == 0){res.json({status: 'error', message: 'no user found'}); return}
      bcrypt.compare(req.body.password, user[0].password, function(err, islogin) {
        if(islogin){ var token = jwt.sign({ email: user[0].email }, secret); res.json({status: 'ok', message: 'login success', token})}
        else{res.json({status: 'error', message: 'login failed'})}
     });
    }
   );
   console.log(req.body)
})

app.post('/authen', jsonParser, function (req, res, next) {
  try{
    const token = req.headers.authorization.split(' ')[1]
    var decoded = jwt.verify(token, secret)
    res.json({status: 'ok', decoded})
  }catch(err){
    res.json({status: 'error', message: err.message})
  }
})

app.post('/menu',jsonParser, function (req, res, next) {
  connection.execute(
    'SELECT * FROM menu WHERE menuID=?',
  [req.body.menuID ],
  function(err, results, fields) {
      if(err){
          res.json({status : 'error',message :err})
          return
      }
  res.json({status :'ok', results})
  }
  );
  console.log(req.body)
})

app.post('/order',jsonParser, function (req, res, next) {
  connection.execute(
    'INSERT INTO `order`(`orderID`, `quantity`, `TotalPrice`, `menuID`, `user_id`) VALUES (?,?,?,?,?)',
  [req.body.orderID,req.body.quantity ,req.body.TotalPrice,req.body.menuID,req.body.user_id],
  function(err, results, fields) {
      if(err){
          res.json({status : 'error',message :err})
          return
      }
  res.json({status :'ok'})
  }
  );
  console.log(req.body)
})


app.listen(3333, function () {
  console.log('CORS-enabled web server listening on port 3333')
})