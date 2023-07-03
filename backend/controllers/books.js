const Book = require('../models/book')
const fs = require('fs')

exports.createBook = (req, res, next) => {
  const bookObject = JSON.parse(req.body.book)
  delete bookObject._id
  delete bookObject._userId
  const book = new Book({
    ...bookObject,
    userId: req.auth.userId,
    imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.name}`,
  })

  book
    .save()
    .then(() => {
      res.status(201).json({ message: 'Livre enregistré !' })
    })
    .catch((error) => {
      res.status(400).json({ error })
    })
}

exports.modifyBook = (req, res, next) => {
  const bookObject = req.file
    ? {
        ...JSON.parse(req.body.book),
        imageUrl: `${req.protocol}://${req.get('host')}/images/${
          req.file.name
        }`,
      }
    : { ...req.body }

  delete bookObject._userId
  Book.findOne({ _id: req.params.id })
    .then((book) => {
      if (book.userId != req.auth.userId) {
        res.status(401).json({ message: 'Not authorized' })
      } else {
        Book.updateOne(
          { _id: req.params.id },
          { ...bookObject, _id: req.params.id }
        )
          .then(() => res.status(200).json({ message: 'Livre modifié!' }))
          .catch((error) => res.status(401).json({ error }))
      }
    })
    .catch((error) => {
      res.status(400).json({ error })
    })
}

exports.deleteBook = (req, res, next) => {
  Book.findOne({ _id: req.params.id })
    .then((book) => {
      if (book.userId != req.auth.userId) {
        res
          .status(401)
          .json({ message: 'Compte non autorisé à supprimer ce livre' })
      } else {
        const filename = book.imageUrl.split('/images/')[1]
        fs.unlink(`images/${filename}`, () => {
          Book.deleteOne({ _id: req.params.id })
            .then(() => {
              res.status(200).json({ message: 'Livre supprimé !' })
            })
            .catch((error) => res.status(401).json({ error }))
        })
      }
    })
    .catch((error) => {
      res.status(500).json({ error })
    })
}

exports.getOneBook = (req, res, next) => {
  Book.findOne({ _id: req.params.id })
    .then((book) => res.status(200).json(book))
    .catch((error) => res.status(404).json({ error }))
}

exports.getAllBook = (req, res, next) => {
  Book.find()
    .then((books) => res.status(200).json(books))
    .catch((error) => res.status(400).json({ error }))
}

exports.ratingBook = (req, res, next) => {
  console.log(req.body)
  Book.findOne({ _id: req.params.id }).then((book) => {
    if (!book) {
      return res.status(404).json({ error: 'Livre non trouvé.' })
    }

    const userRating = book.ratings.find(
      (rating) => rating.userId === req.auth.userId
    )

    if (userRating) {
      return res
        .status(400)
        .json({ error: 'Une note existe déjà pour cet utilisateur.' })
    }

    book.ratings.push({
      userId: req.auth.userId,
      grade: req.body.rating,
    })
    console.log(book.ratings)
    const totalRating = book.ratings.reduce((total, rating) => {
      return total + parseInt(rating.grade)
    }, 0)
    console.log(totalRating)
    book.averageRating = totalRating / book.ratings.length
    console.log(book.ratings.length)
    book
      .save()
      .then((book) => res.status(200).json(book))
      .catch((error) => {
        res.status(400).json({ error })
      })
  })
}

exports.bestThreeBooks = async (req, res, next) => {
  try {
    const books = await Book.find().sort({ averageRating: -1 }).limit(3)
    res.status(200).json(books)
  } catch (err) {
    console.error(err)
    res.status(500).json({
      error: "Une erreur s'est produite lors de la récupération des livres",
    })
  }
}
