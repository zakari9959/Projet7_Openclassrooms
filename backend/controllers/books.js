const book = require('../models/book');
const Book = require('../models/book');
const fs = require('fs');

exports.createBook = (req, res, next) => {
  const bookObject = JSON.parse(req.body.book);
  delete bookObject._id;
  delete bookObject._userId;
  const book = new Book({
      ...bookObject,
      userId: req.auth.userId,
      imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
  });

  if (bookObject.ratings && bookObject.ratings.length > 0) {
    let totalRating = 0;
    bookObject.ratings.forEach((rating) => {
      totalRating += rating.grade;
    });
    book.averageRating = totalRating / bookObject.ratings.length;
  }


  book.save()
  .then(() => { res.status(201).json({message: 'Livre enregistré !'})})
  .catch(error => { res.status(400).json( { error })})
};

exports.modifyBook = (req, res, next) => {
  const bookObject = req.file ? {
      ...JSON.parse(req.body.book),
      imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
  } : { ...req.body };

  delete bookObject._userId;
  Book.findOne({_id: req.params.id})
      .then((book) => {
          if (book.userId != req.auth.userId) {
              res.status(401).json({ message : 'Not authorized'});
          } else {
              Book.updateOne({ _id: req.params.id}, { ...bookObject, _id: req.params.id})
              .then(() => res.status(200).json({message : 'Objet modifié!'}))
              .catch(error => res.status(401).json({ error }));
          }
      })
      .catch((error) => {
          res.status(400).json({ error });
      });
};

exports.deleteBook = (req, res, next) => {
  Book.findOne({ _id: req.params.id})
      .then(book => {
          if (book.userId != req.auth.userId) {
              res.status(401).json({message: 'Not authorized'});
          } else {
              const filename = book.imageUrl.split('/images/')[1];
              fs.unlink(`images/${filename}`, () => {
                  Book.deleteOne({_id: req.params.id})
                      .then(() => { res.status(200).json({message: 'Objet supprimé !'})})
                      .catch(error => res.status(401).json({ error }));
              });
          }
      })
      .catch( error => {
          res.status(500).json({ error });
      });
};

  exports.getOneBook = (req, res, next) => {
    Book.findOne({ _id: req.params.id })
      .then(book => res.status(200).json(book))
      .catch(error => res.status(404).json({ error }));
  };

  exports.getAllBook = (req, res, next) => {
    Book.find()
      .then(books => res.status(200).json(books))
      .catch(error => res.status(400).json({ error }));
  };

  exports.bestThreeBooks = (req, res, next) => {
    Book.find()
    .sort({ averageRating: -1 })
    .limit(3)
    .exec((err, books) => {
      if (err) {
        return res.status(500).json({ error: err });
      }
      res.status(200).json({ books });
    });
  }

  exports.ratingBook = (req, res, next) => {
  
    Book.findOne ({ _id: req.params.id })
      .then(book => {
        if (!book) {
          return res.status(404).json({ error: 'Livre non trouvé.' });
        }
  
        const userRating = book.ratings.find(rating => rating.userId === req.auth.userId);
        if (userRating) {
          return res.status(400).json({ error: 'Une note existe déjà pour cet utilisateur.' });
        }
  
        book.ratings.push({
          userId: req.auth.userId,
          grade: req.body.grade
        });

        const totalRating = book.ratings.reduce((total, rating) => total + rating.grade, 0);
        book.averageRating = totalRating / book.ratings.length;

        return book.save();
      })
      .then(() => {
        res.status(200).json({ message: 'Note ajoutée avec succès.' });
      })
      .catch(error => {
        res.status(400).json({ error });
      });
  };