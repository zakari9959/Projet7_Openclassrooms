const express = require('express');
const mongoose = require('mongoose');

const path = require('path');
const booksRoutes = require('./routes/books');
const userRoutes = require('./routes/user');

const app = express();
mongoose.connect('mongodb+srv://zakari99:zakari59@cluster0.oujdcbk.mongodb.net/?retryWrites=true&w=majority',
  { useNewUrlParser: true,
    useUnifiedTopology: true })
  .then(() => console.log('Connexion à MongoDB réussie !'))
  .catch(() => console.log('Connexion à MongoDB échouée !'));
app.use(express.json());

app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content, Accept, Content-Type, Authorization');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
    res.setHeader('Vary', 'Origin');
    next();
  });
  app.use('/images', express.static(path.join(__dirname, 'images')));
  app.use('/api/books', booksRoutes);
  app.use('/api/auth', userRoutes);
  

module.exports = app;