const express = require("express");
const bodyParser = require('body-parser');
const cors = require("cors");
var mysql = require('mysql');
const { response } = require("express");
const shut =require('shutdown-computer');
 
const app = express();
const jwt =require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const http = require('http').createServer();
var path = require('path');


 
app.use(cors());
// parse application/json
app.use(bodyParser.json());
  
//create database connection
const conn = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'tbhcr'
});
 
//connect to database
conn.connect((err) =>{
  if(err) throw err;
  console.log('Mysql Connected...');
});
// var sql = "INSERT INTO tupen (id, name) VALUES ('', 'tupen shil')";  
// conn.query(sql, function (err, result) {  
// if (err) throw err;  
// console.log("1 record inserted");  });

//registation

// app.post('/register'),(req,res)=>{
//   conn.query('SELECT * FROM users WHERE LOWER(username) =LOWER(${conn.escape(req.body.email)} ');
// }



app.post('/register', (req, res) => {
  conn.query(
  `SELECT * FROM users WHERE LOWER(username) = LOWER(${conn.escape(
  req.body.username
  )});`,
  (err, result) => {
  if (result.length) {
  return res.status(409).send({
  msg: 'This user is already in use!'
  });
  } else {
  // username is available
  bcrypt.hash(req.body.password, 10, (err, hash) => {
  if (err) {
  return res.status(500).send({
  msg: err
  });
  } else {
  // has hashed pw => add to database
  conn.query(
  `INSERT INTO users (username, password) VALUES ('${req.body.username}', ${conn.escape(hash)})`,
  (err, result) => {
  if (err) {
  throw err;
  return res.status(400).send({
  msg: err
  });
  }
  return res.status(201).send({
  msg: 'The user has been registerd with us!'
  });
  }
  );
  }
  });
  }
  }
  );
  });
  app.post('/shutdown',(req,res)=>{
    conn.query(
      `SELECT * FROM users WHERE username = ${conn.escape(req.body.username)};`,
      (err, result)=>{
        if(err){
          throw err;
          return res.status(400).send({msg:err});
        }
        if(result.length){

              shut.shutDownComputer();

        }
        else{
          res.send({msg: "computer is on " })
        }
      }
    )
  })


//sigh in 
app.post('/login',  (req, res) => {
conn.query(
`SELECT * FROM users WHERE username = ${conn.escape(req.body.username)};`,
(err, result) => {
// user does not exists
if (err) {
throw err;
return res.status(400).send({
msg: err
});
}
if (!result.length) {
return res.status(401).send({
msg: 'Email or password is incorrect!'
});
}
// check password
bcrypt.compare(
req.body.password,
result[0]['password'],
(bErr, bResult) => {
// wrong password
if (bErr) {
throw bErr;
return res.status(401).send({
msg: 'Email or password is incorrect!'
});
}
if (bResult) {
const token = jwt.sign({id:result[0].id},'the-super-strong-secrect',{ expiresIn: '1h' });
conn.query(
`UPDATE users SET last_login = now() WHERE id = '${result[0].id}'`
);
return res.status(200).send({
msg: 'Logged in!',
token,
user: result[0]
});
}
return res.status(401).send({
msg: 'Username or password is incorrect!'
});
}
);
}
);
});






//fech ddata 
app.get('/getdata',(req,res)=>{
  
conn.query("SELECT * FROM tupen ", function(err, result){
  if(err) throw err;
 console.log(result);
 res.send(result);
// res.get(JSON.stringify({"status":200, "error": null, "response":result}));
});

});



 
//add new user
app.post('/store-data',(req, res) => {
  let data = {name: req.body.name};
 let sql = "INSERT INTO tupen SET ?";
//    let sql = "INSERT INTO employees (id, name, age, city) VALUES ('', 'Ajeet Kumar')";  
  let query = conn.query(sql, data,(err, results) => {
    if(err) throw err;
    res.send(JSON.stringify({"status": 200, "error": null, "response": results}));
  });
});
 
app.listen(3000, () => {
  
  console.log("Server running successfully on 3000");
});
