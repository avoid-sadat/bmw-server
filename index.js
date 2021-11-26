const express =require('express')
const app = express()
const cors = require('cors');
require('dotenv').config();
const { MongoClient } = require('mongodb');
const ObjectId = require('mongodb').ObjectId;
const port = process.env.PORT || 5000;


//Middleweare
app.use(cors());
app.use(express.json());


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.9dzrk.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

async function run() {
    try {
      await client.connect();
      const database = client.db("car_shop");
      const usersCollection = database.collection('users');
      const productCollection = database.collection('products');
      const ordersCollection = database.collection('orders');
      const reviewCollection = database.collection('review');

      //get Product
      app.get('/products', async(req,res)=>{
        const cursor = productCollection.find({});
        const products= await cursor.toArray();
        res.send(products);
      });
      //get review
      app.get('/review', async(req,res)=>{
        const cursor = reviewCollection.find({});
        const reviews= await cursor.toArray();
        res.send(reviews);
      });
      //PURCHASE Item
   app.get('/products/:_id',async(req,res)=>{
     const id = req.params._id;
     const query ={_id:ObjectId(id)};
     const product =await productCollection.findOne(query);
     res.json(product);
   });
   //Get order
   app.get('/orders', async(req,res)=>{
    const cursor = ordersCollection.find({});
    const orders= await cursor.toArray();
    res.send(orders);
  });
  //Delete Orders
  app.delete('/orders/:id',async(req,res)=>{
    const id =req.params.id
    const query ={_id:ObjectId(id)};
    const result = await ordersCollection.deleteOne(query);
    // console.log('delete',id);
    res.json(result);
  });
  //Delete Products
  app.delete('/products/:id',async(req,res)=>{
    const id =req.params.id
    const query ={_id:ObjectId(id)};
    const result = await productCollection.deleteOne(query);
    // console.log('delete',id);
    res.json(result);
  });

   //Oredr Product
   app.post('/orders', async (req, res) => {
    const order = req.body;
    const result = await ordersCollection.insertOne(order);
    res.json(result)
});
//Review order
app.post('/review', async (req, res) => {
  const review = req.body;
  const result = await reviewCollection.insertOne(review);
  res.json(result)
});
//add Product
app.post('/products',async(req,res)=>{
    const product = req.body;
    const result= await productCollection.insertOne(product);
    res.json(result);
  })


//make Admin
        app.get('/users/:email', async (req, res) => {
            const email = req.params.email;
            const query = { email: email };
            const user = await usersCollection.findOne(query);
            let isAdmin = false;
            if (user.role === 'admin') {
                isAdmin = true;
            }
            res.json({ admin: isAdmin });
        })

      app.post('/users', async (req, res) => {
        const user = req.body;
        const result = await usersCollection.insertOne(user);
        console.log(result);
        res.json(result);
    });

    app.put('/users', async (req, res) => {
        const user = req.body;
        const filter = { email: user.email };
        const options = { upsert: true };
        const updateDoc = { $set: user };
        const result = await usersCollection.updateOne(filter, updateDoc, options);
        res.json(result);
    });
    app.put('/users/admin', async (req, res) => {
        const user = req.body;
        const filter = { email: user.email };
        const updateDoc = { $set: {role:'admin'} };
        const result = await usersCollection.updateOne(filter, updateDoc);
        res.json(result);
    });
    //update status
    app.put('/orders/:id',(req, res) => {
      const id = req.params.id;
      const status = req.body.status;
      const filter = { _id: ObjectId(id) };
      console.log(filter)
      // const updateDoc = { $set: {status:status} };
      ordersCollection.updateOne(filter, { $set: {status:status} })
      .then((result)=>{
        res.send(result);
      })
      
  });
    } finally {
    //   await client.close();
    }
  }
  run().catch(console.dir);

app.get('/',(req,res)=>{
    res.send('Hello World')
})
app.listen(port,()=>{
    console.log(`http://localhost:${port}`)
})