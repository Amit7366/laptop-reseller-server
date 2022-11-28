const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const port = process.env.PORT || 5000;
const jwt = require("jsonwebtoken");
require("dotenv").config();

const app = express();

app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.7dm94fg.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1,
});

async function run() {
  try {
    const categoryCollecttion = client.db("reseller").collection("category");
    const productCollecttion = client.db("reseller").collection("products");
    const usersCollection = client.db("reseller").collection("users");
    const bookingsCollection = client.db("reseller").collection("booking");

    /**
     * User API
     *
     * */

    app.post("/users", async (req, res) => {
      const user = req.body;
      console.log(user);
      const result = await usersCollection.insertOne(user);
      res.send(result);
    });

    /**
     * Product API
     *
     * */
    app.post("/products", async (req, res) => {
      const product = req.body;
      const result = await productCollecttion.insertOne(product);
      res.send(result);
    });

    app.get("/products", async (req, res) => {
      const query = {};
      const result = await productCollecttion.find(query).toArray();
      res.send(result);
    });
    app.get("/advertised/products", async (req, res) => {
      const query = { advertise: "true" };
      const result = await productCollecttion.find(query).toArray();
      res.send(result);
    });

    /**
     * category API
     *
     * */

    app.post("/category", async (req, res) => {
      const category = req.body;
      const result = await categoryCollecttion.insertOne(category);
      res.send(result);
    });

    app.get("/category", async (req, res) => {
      const query = {};
      const result = await categoryCollecttion.find(query).toArray();
      res.send(result);
    });

    app.get("/category/:id", async (req, res) => {
      const id = req.params.id;
      const query = { category: id };
      const result = await productCollecttion.find(query).toArray();
      res.send(result);
    });

    app.get("/advertise", async (req, res) => {
      const query = {};
      const ad = await categoryCollecttion.find(query).toArray();
      res.send(doctors);
    });

    /**
     * Booking API
     *
     * */

    app.post("/booking", async (req, res) => {
      const booking = req.body;
      console.log(booking);
      const query = {
        productName: booking.productName,
      };

      const alreadyBooked = await bookingsCollection.find(query).toArray();

      if (alreadyBooked.length) {
        const message = `Already  booked ${booking.productName}`;
        return res.send({ acknowledged: false, message });
      }
      const result = await bookingsCollection.insertOne(booking);
      res.send(result);
    });

    app.get("/booking", async (req, res) => {
      const email = req.query.email;

      const query = { email: email };
      const result = await bookingsCollection.find(query).toArray();
      console.log(result);
      res.send(result);
    });

        /** 
     * Seller API
     * 
     * */ 

        app.get('/seller', async(req,res) =>{
          const query = {role: 'seller'};

          const result = await usersCollection.find(query).toArray();
          res.send(result);
        })




  } finally {
  }
}

run().catch(console.log);

app.get("/", (req, res) => {
  res.send("server is running");
});

app.listen(port, () => {
  console.log(`app listening on port ${port}`);
});
