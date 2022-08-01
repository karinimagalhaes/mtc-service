const express = require('express');
const mongoose = require('mongoose');
require('dotenv').config();

// App
const app = express();

// Database
mongoose.connect(process.env.DATABASE_CONNECTION_STRING, {
    useUnifiedTopology: true,
    useNewUrlParser: true
});

const db = mongoose.connection;
  
db.on('connected', () => {
    console.log('Mongoose default connection is open');
});

db.on('error', err => {
    console.log(`Mongoose default connection has occured \n${err}`);
});

db.on('disconnected', () => {
    console.log('Mongoose default connection is disconnected');
});

process.on('SIGINT', () => {
    db.close(() => {
        console.log(
        'Mongoose default connection is disconnected due to application termination'
        );
        process.exit(0);
    });
});

// Load models
const Payment = require('./models/payment');

// Load routes
app.use(express.json())
const indexRoutes = require('./routes/index-routes');
app.use('/', indexRoutes);

const paymentRoutes = require('./routes/payment-routes');
app.use('/payment', paymentRoutes);

module.exports = app;