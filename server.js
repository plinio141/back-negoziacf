const express = require('express')
const app = express()
const bodyParser = require('body-parser')
const morgan = require('morgan')
const cors = require('cors')
const mongoose = require('mongoose');
require('dotenv').config();

const User = require('./models/user');

const url = process.env.MONGODB_URI;

mongoose.connect(url, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(result => {    console.log('connected to MongoDB')  }) 
    .catch((error) => {    console.log('error connecting to MongoDB:', error.message)  })


// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))

// parse application/json
app.use(bodyParser.json())

app.use(cors())

morgan.token('host', function(req, res) {
	return req.hostname;
});

// define custom logging format
morgan.token('detailed', function (req, res, param) {                                    
    return JSON.stringify(req.body);
});  

// register logging middleware and use custom logging format
app.use(morgan('method :url :status :res[content-length] - :response-time ms :detailed'));

app.use(express.static('build'))

app.get('/api/user', (req, res) => {
    User.find().then((users)=> {
        res.json(users);
    }).catch(err => {
        console.log(err);
    });
});

app.post('/api/user', (req, res) => {
    const body = req.body;
    const user = new User(body);

    user.save()
        .then(user => {
            res.json(user)
        });
});

app.post('/api/user/:id', (req, res) => {
    const body = req.body;
    const id = req.params.id;
    User.update({_id: id}, body)
        .then(user => {
            res.json(user)
        });
    
});

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})