const express = require('express');
const { MongoClient } = require('mongodb');
const cors = require('cors');
const ObjectId = require('mongodb').ObjectId;
require('dotenv').config();

const app = express();

//middleware
app.use(cors());
app.use(express.json());

const port = process.env.PORT || 5000;


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.hgh42.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;

// console.log(uri);
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

async function run() {
    try {
        await client.connect();
        const database = client.db('productDB');
        const productCollection = database.collection('products');

        //GET API
        app.get('/products', async (req, res) => {
            const cursor = productCollection.find({});
            const products = await cursor.toArray();
            res.send(products);
        });
        //GET API for a single Product
        app.get('/products/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const product = await productCollection.findOne(query);
            res.send(product);
        });

        //POST  API
        app.post('/products', async (req, res) => {
            const product = req.body;
            const result = await productCollection.insertOne(product);
            console.log('added product', product);
            res.json(result);
        });

        //UPDATE API
        app.put('/products/:id', async (req, res) => {
            const id = req.params.id;
            const updatedProduct = req.body;
            console.log('updatign', updatedProduct);
            const filter = { _id: ObjectId(id) };
            const options = { upsert: true };
            const updateDoc = {
                $set: {
                    productName: updatedProduct.productName,
                    price: updatedProduct.price
                },
            };
            const result = await productCollection.updateOne(filter, updateDoc, options);
            console.log(result);
            res.json(result);
        });

        //DELETE API
        app.delete('/products/:id', async (req, res) => {
            const id = req.params.id;
            console.log('deleted product', id);
            const query = { _id: ObjectId(id) };
            const result = await productCollection.deleteOne(query);
            res.json(result);
        });

    }
    finally {
        //    await client.close();
    }
}
run().catch(console.dir);

app.get('/', (req, res) => {
    res.send('Hello!! From product management server side');
});

app.listen(port, () => {
    console.log('Listening from Port:', port);
});