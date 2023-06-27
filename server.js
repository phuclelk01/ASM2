// server.js
//console.log('May Node be with you')

const express = require('express');
const bodyParser = require('body-parser')
const app = express();
const mongodb = require('mongodb');


const MongoClient = require('mongodb').MongoClient

const connectionString = 'mongodb+srv://phucle:041203@cluster0.mgovzfe.mongodb.net/'

//(0) CONNECT: server -> connect -> MongoDB Atlas 
MongoClient.connect(connectionString, { useUnifiedTopology: true })
    .then(client => {
        console.log('Connected to Database')

        // (1a) CREATE: client -> create -> database -> 'star-wars-quotes'
        // -> create -> collection -> 'quotes'
        const db = client.db('star-wars-quotes')
        const quotesCollection = db.collection('quotes')

        // To tell Express to EJS as the template engine
        app.set('view engine', 'ejs')

        // Make sure you place body-parser before your CRUD handlers!
        app.use(bodyParser.urlencoded({ extended: true }))

        // To make the 'public' folder accessible to the public
        app.use(express.static('public'))

        // To teach the server to read JSON data 
        app.use(bodyParser.json())

        // (2) READ: client -> browser -> url 
        // -> server -> '/' -> collection -> 'quotes' -> find() 
        // -> results -> index.ejs -> client
        app.get('/', (req, res) => {
            db.collection('quotes').find().toArray()
                .then(results => {

                    // results -> server -> console
                    console.log(results)

                    // results -> index.ejs -> client -> browser 
                    // The file 'index.ejs' must be placed inside a 'views' folder BY DEFAULT
                    res.render('index.ejs', { quotes: results })
                })
                .catch(/* ... */)
        })

        // (3) DELETE: client -> browser -> url -> '/delete/:id'
        // -> server -> 'quotesCollection' -> deleteOne() -> result
        app.post('/delete/:id', (req, res) => {
            const id = req.params.id;
            const query = { _id: new mongodb.ObjectId(id) };
            quotesCollection.deleteOne(query)
                .then(result => {
                    console.log(`Deleted quote ${id}`);
                    res.redirect('/')
                })
                .catch(error => console.error(error))
        });

        app.get('/edit/:id', (req, res) => {
            const id = req.params.id;
            const query = { _id: new mongodb.ObjectId(id) };
            quotesCollection.findOne(query)
                .then(result => {
                    // result -> server -> console
                    console.log(result);
                    // result -> edit.ejs -> client -> browser
                    res.render('edit.ejs', { quote: result });
                })
                .catch(error => console.error(error));
        });
        
        app.post('/update/:id', (req, res) => {
            const id = req.params.id;
            const query = { _id: new mongodb.ObjectId(id) };
            const updatedQuote = {
                $set: {
                    name: req.body.name,
                    price: req.body.price,
                    image: req.body.image,
                    category: req.body.category,
                }
            };
            quotesCollection.updateOne(query, updatedQuote)
                .then(result => {
                    console.log(`Updated quote ${id}`);
                    res.redirect('/');
                })
                .catch(error => console.error(error));
        });
        
        

        
        // (1b) CREATE: client -> index.ejs -> data -> SUBMIT 
        // -> post -> '/quotes' -> collection -> insert -> result
        app.post('/quotes', (req, res) => {
            quotesCollection.insertOne(req.body)
                .then(result => {

                    // results -> server -> console
                    console.log(result)

                    // -> redirect -> '/'
                    res.redirect('/')
                })
                .catch(error => console.error(error))
        })

        // server -> listen -> port -> 3000
        app.listen(3000, function () {
            console.log('listening on 3000')
        })
    })