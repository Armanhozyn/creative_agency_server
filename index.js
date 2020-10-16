const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const fileUpload = require('express-fileupload');
const MongoClient = require('mongodb').MongoClient;
require('dotenv').config();

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.rqp8q.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`;



const app = express()

app.use(bodyParser.json());
app.use(cors());
app.use(express.static('doctors'));
app.use(fileUpload());

const port = 5000;


const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
client.connect(err => {
    const ordersCollection = client.db("creative_agency").collection("orders");
    const reviewsCollection = client.db("creative_agency").collection("reviews");
    app.post('/addOrders', (req, res) => {
        const file = req.files.file;
        const name = req.body.name;
        const email = req.body.email;
        const price = req.body.price;
        const description = req.body.description;
        const service_name = req.body.service_name;
        const newImg = file.data;
        const encImg = newImg.toString('base64');

        var image = {
            contentType: file.mimetype,
            size: file.size,
            img: Buffer.from(encImg, 'base64')
        };

        ordersCollection.insertOne({ name, email,price,description,service_name, image })
            .then(result => {
                res.send(result.insertedCount > 0);
            })
    })

    app.post('/getServicesByEmail', (req, res) => {
        const email = req.body.email;
        ordersCollection.find({ email: email })
            .toArray((err, documents) => {
                res.send(documents);
            })
    })

    app.post('/addReview',(req,res)=>{
      const review =  req.body;
      reviewsCollection.insertOne(review)
      .then(result => {
          res.send(result.insertedCount > 0)
      })
    })

    app.get('/getReviews', (req, res) => {
        reviewsCollection.find({})
        .toArray((err, documents) => {
            res.send(documents);
        })
    })



});


app.listen(process.env.PORT || port)