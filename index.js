const express = require('express')
const bodyParser = require('body-parser');
const cors = require('cors');
const admin = require('firebase-admin');
require('dotenv').config()

const MongoClient = require('mongodb').MongoClient;
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.f6j7z.mongodb.net/<burjAlArab>?retryWrites=true&w=majority`;

//console.log(process.env.DB_PASS);

const port = 5000

const app = express();

app.use(cors());
app.use(bodyParser.json());


var serviceAccount = require("./configs/burj-al-arab-861fc-firebase-adminsdk-tim7s-126a2e2e84.json");

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: process.env.FIRE_DB
});



const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
client.connect(err => {
    const bookingCollection = client.db("burjAlArab").collection("booking");


    app.post('/addBooking', (req, res) => {
        const newBooking = req.body;
        bookingCollection.insertOne(newBooking)
            .then(result => {

                res.send(result.insertedCount > 0);
            })
        console.log(newBooking);
    })

    app.get('/booking', (req, res) => {
        const bearer = req.headers.authorization;
        if (bearer && bearer.startsWith('Bearer ')) {
            const idToken = bearer.split(' ')[1];
            //console.log({ idToken });
            admin.auth().verifyIdToken(idToken)
                .then(function (decodedToken) {
                    const tokenEmail = decodedToken.email;
                    const queryEmail = req.query.email;
                   // console.log(tokenEmail ,queryEmail);
                    if (tokenEmail == queryEmail) {
                        bookingCollection.find({ email:queryEmail })
                            .toArray((err, document) => {
                                res.status(200).send(document);
                            })
                    }
                   else{
                       res.status(401).send('un-authorized access')
                   }

                })
                .catch((error) => {
                    res.status(401).send('un-authorized access')
                });

        }
        else {

            res.send('un-authorized access')
        }


    })

});


app.get('/', (req, res) => {
    res.send('Hello World!')
})

app.listen(port);