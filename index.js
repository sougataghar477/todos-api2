const db =require("./mongo");
const express=require("express");
const cors=require("cors");
const session = require('express-session');
const MongoDBSession = require('connect-mongodb-session')(session);
const { v4 } = require('uuid');
const dbURI = 'mongodb+srv://sougataghar47:sitonmeloba69@cluster0.fllgfxo.mongodb.net/todos?retryWrites=true&w=majority';
require("dotenv").config()
// Configure MongoDBStore
// const store = new MongoDBSession({
//   uri: dbURI,
//   collection: 'sessions'
// });
let app = express();
app.use(cors({ origin: '*', credentials: true }));
app.use(express.json())
app.use(session({
    secret: 'sitonmeloba69',
    resave: false,
    saveUninitialized: false,
    store: new MongoDBSession({
      uri: dbURI,
      collection: 'sessions'
    }), // Use MongoDBStore for storing sessions
    cookie: {
      httpOnly: true,
        // path = where the cookie is valid
        path: "/",
        // domain = what domain the cookie is valid on
        // secure = only send cookie over https
        secure: false,
        // sameSite = only send cookie if the request is coming from the same origin
        sameSite: "lax", // "strict" | "lax" | "none" (secure must be true)
        // maxAge = how long the cookie is valid for in milliseconds
        maxAge: 3600000,
    }
  }));
  // User login route
  app.post('/api/login', express.json(), async (req, res) => {
    const { username, password } = req.body;
    let user = await db.collection("users").findOne({ name: username, password: password });
    if (user) {
      req.session.user = { name: user.name, id: user.id };
      res.json({ msg: 'Login successful', name: user.name, id: user.id });
    } else {
      res.status(403).json({ msg: "Invalid Name or Password" });
    }
  });
  app.get("/api/login",async function(req,res){
    if(req.session.user){
      let id=req.session.user.id;
      let tasks=await db.collection("tasks");
      let userTasks= await tasks.findOne({id})
      console.log(req.session);
      res.status(200).json({msg:{...req.session.user,tasks:userTasks.tasks}});

    }
    else{
      res.status(403).json({msg:"You are not authorized"})
    }
  })
  app.post("/api/register",async (req,res)=>{
    const {username,password}=req.body;
    const id=v4().split("-")[0];
    console.log(id)
    try {
      // Check if the user already exists
      let users=await db.collection("users");
      let tasks=await db.collection("tasks");

      const existingUser = await users.findOne({ name:username });
      if (existingUser) {
        return res.status(400).json({ msg: 'User with this email already exists' });
      }
      users.insertOne({name:username,password,id});
      tasks.insertOne({id,tasks:[]})
      // Create a new user
      res.status(201).json({ msg: 'User registered successfully' });
    } catch (err) {
      console.error(err);
      res.status(500).json({ erromsgr: 'Internal server error' });
    }
  })
app.get('/api/hello', (req, res) => {
    res.json({msg:'Hello, Express API!'});
  });
  app.post("/api/addTask",async function(req,res){
    let tasks=await db.collection("tasks");
    let userTasks= await tasks.findOne({id:req.body.id})
    let updatedTasks=[...userTasks.tasks,req.body.task]
    let c= await tasks.updateOne({id:req.body.id},{$set: { tasks: updatedTasks }});
    console.log(c);
    let b=await tasks.findOne({id:req.body.id})
    res.json({tasks:b.tasks})

  });
  app.post("/api/deleteTask",async function (req,res) {
    let tasks=await db.collection("tasks")
    let userTasks= await tasks.findOne({id:req.session.user.id})
    let updatedTasks=userTasks.tasks.filter(task => task !==req.body.taskToRemove );
    await tasks.updateOne({id:req.session.user.id},{$set: { tasks: updatedTasks }});
    console.log(updatedTasks);
    let b=await tasks.findOne({id:req.session.user.id})
    res.json({tasks:b.tasks})
  });
  app.get('/api/logout', (req, res) => {
    req.session.destroy(err => {
      if (err) {
        console.error('Error destroying session:', err);
        return res.status(500).send('Internal Server Error');
      }
      res.json({msg:"Logged Out"}) // Redirect to the homepage or any other page after logout
    });
  });
app.listen(process.env.PORT || 3001,()=>{
    console.log(`App running on ${process.env.PORT || 3001}`)
})