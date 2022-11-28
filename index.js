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

function verifyJWT(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).send("unauthorized access");
  }

  const token = authHeader.split(" ")[1];

  jwt.verify(token, process.env.ACCESS_TOKEN, function (err, decoded) {
    if (err) {
      return res.status(403).send({ message: "forbidden access" });
    }
    req.decoded = decoded;
    next();
  });
}

async function run() {
  try {
    const categoryCollecttion = client.db("reseller").collection("category");
    const productCollecttion = client.db("reseller").collection("products");
    const usersCollection = client.db("reseller").collection("users");
    const bookingsCollection = client.db("reseller").collection("booking");
    const wishlistCollection = client.db("reseller").collection("wishlist");

    /**
     * User API
     *
     * */

    app.post("/users", async (req, res) => {
      const user = req.body;
      
      const result = await usersCollection.insertOne(user);
      res.send(result);
    });

    app.get("/user", async (req, res) => {
      const email = req.query.email;
      const query = { email: email };
      const result = await usersCollection.count(query);
      res.send({ feedback: result });
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
    app.get("/booking",verifyJWT, async (req, res) => {

      const email = req.query.email;
      const decodedEmail = req.decoded.email;

      if (email !== decodedEmail) {
        return res.status(403).send({ message: "forbidden access" });
      }


      const query = { email: email };
      const result = await bookingsCollection.find(query).toArray();
      
      res.send(result);
    });

    app.put("/product/:id", async (req, res) => {
      const id = req.params.id;
      const filter = { _id: ObjectId(id) };

      const updatedDoc = {
        $set: {
          status: "booked",
        },
      };
      const updateResult = await productCollecttion.updateOne(
        filter,
        updatedDoc
      );

      res.send(updateResult);
    });

    /**
     * Seller API
     *
     * */

    app.get("/seller", async (req, res) => {
      const query = { role: "seller" };

      const result = await usersCollection.find(query).toArray();
      res.send(result);
    });

    app.get("/jwt", async (req, res) => {
      const email = req.query.email;
      const query = { email: email };
      const user = await usersCollection.findOne(query);
      if (user) {
        const token = jwt.sign({ email }, process.env.ACCESS_TOKEN, {
          expiresIn: "1h",
        });
        return res.send({ accessToken: token });
      }
      res.status(403).send({ accessToken: "" });
    });

    app.get("/buyer", verifyJWT, async (req, res) => {
      const email = req.query.email;
      const decodedEmail = req.decoded.email;

      if (email !== decodedEmail) {
        return res.status(403).send({ message: "forbidden access" });
      }

      const query = { role: "buyer" };
      const result = await usersCollection.find(query).toArray();
      res.send(result);
    });

    app.get("/seller/:email", async (req, res) => {
      const email = req.params.email;
      const query = { email: email };

      const result = await usersCollection.findOne(query);
      res.send(result);
    });
    app.put("/advertiseProduct/:id", async (req, res) => {
      const id = req.params.id;
      console.log(id)
      const filter = { _id: ObjectId(id) };
      const options = { upsert: true };
      const updatedDoc = {
        $set: {
          advertise: "true",
        },
      };
      const result = await productCollecttion.updateOne(
        filter,
        updatedDoc,
        options
      );
      res.send(result);
     
    });


    app.put("/seller/:id", async (req, res) => {
      const id = req.params.id;
      const filter = { _id: ObjectId(id) };
      const options = { upsert: true };
      const updatedDoc = {
        $set: {
          status: "verified",
        },
      };
      const result = await usersCollection.updateOne(
        filter,
        updatedDoc,
        options
      );
      res.send(result);
    });

    app.delete("/buyer/:id", async (req, res) => {
      const id = req.params.id;
      const filter = { _id: ObjectId(id) };
      const result = await usersCollection.deleteOne(filter);
      res.send(result);
    });

    app.post("/wishlist", async (req, res) => {
      const wishlist = req.body;
      const query = {
        productId: wishlist.productId,
        userEmail: wishlist.userEmail,
      };

      const alreadyBooked = await wishlistCollection.find(query).toArray();

      if (alreadyBooked.length) {
        const message = `Already  Wished ${wishlist.productId}`;
        return res.send({ acknowledged: false, message });
      }

      const result = await wishlistCollection.insertOne(wishlist);
      res.send(result);
    });

    app.get("/wishlist", async (req, res) => {
      const query = {};
      const result = await wishlistCollection.find(query).toArray();
      res.send(result);
    });
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
