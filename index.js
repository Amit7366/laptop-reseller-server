const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const port = process.env.PORT || 5000;
const jwt = require("jsonwebtoken");
require("dotenv").config();

const app = express();

app.use(cors());
app.use(express.json());




const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.7dm94fg.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });


async function run(){
  try{
    const categoryCollecttion = client.db('reseller').collection('category');
    const usersCollection = client.db('reseller').collection('users');


    app.post('/users', async (req,res) =>{

      const user = req.body;
      console.log(user);
      const result = await usersCollection.insertOne(user);


      res.send(result);
    })


  }
  finally{

  }
}

run().catch(console.log);

app.get("/", (req, res) => {
  res.send('server is running');
});

app.listen(port, () => {
  console.log(`app listening on port ${port}`);
});
