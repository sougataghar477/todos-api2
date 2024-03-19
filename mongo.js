const {MongoClient} = require('mongodb');
const client = new MongoClient("mongodb+srv://sougataghar47:sitonmeloba69@cluster0.fllgfxo.mongodb.net/?retryWrites=true&w=majority");
client.connect();
let db = client.db("todos");
module.exports = db;