const Book = require('../models/book')
const fs = require('fs')

exports.createBook = (req, res, next) => {
  // Parse le corps de la requête en un objet book
  const bookObject = JSON.parse(req.body.book)

  // Supprime les propriétés inutiles de bookObject
  delete bookObject._id
  delete bookObject._userId

  // Crée une nouvelle instance de Book avec les propriétés de bookObject
  const book = new Book({
    ...bookObject,
    userId: req.auth.userId,
    imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.name}`,
  })

  // Sauvegarde le livre dans la base de données
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
  // Vérifie si un fichier a été téléchargé et met à jour l'objet book en conséquence
  const bookObject = req.file
    ? {
        ...JSON.parse(req.body.book),
        imageUrl: `${req.protocol}://${req.get('host')}/images/${
          req.file.name
        }`,
      }
    : { ...req.body }

  // Supprime la propriété _userId de bookObject
  delete bookObject._userId

  // Recherche le livre dans la base de données par son id
  Book.findOne({ _id: req.params.id })
    .then((book) => {
      // Vérifie si l'utilisateur qui essaie de modifier le livre est l'auteur du livre
      if (book.userId != req.auth.userId) {
        res.status(401).json({ message: 'Not authorized' })
      } else {
        // Supprime l'ancienne image du livre s'il y en a une
        if (req.file && book.imageUrl) {
          const imagePath = book.imageUrl.split('/images/')[1]
          fs.unlink(`images/${imagePath}`, (err) => {
            if (err) {
              console.error(err)
            }
          })
        }
        // Met à jour le livre avec les nouvelles informations
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
  // Recherche le livre dans la base de données par son id
  Book.findOne({ _id: req.params.id })
    .then((book) => {
      // Vérifie si l'utilisateur qui essaie de supprimer le livre est l'auteur du livre
      if (book.userId != req.auth.userId) {
        res
          .status(401)
          .json({ message: 'Compte non autorisé à supprimer ce livre' })
      } else {
        // Supprime le fichier image associé au livre
        const filename = book.imageUrl.split('/images/')[1]
        fs.unlink(`images/${filename}`, () => {
          // Supprime le livre de la base de données
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
  // Recherche le livre dans la base de données par son id
  Book.findOne({ _id: req.params.id })
    .then((book) => res.status(200).json(book))
    .catch((error) => res.status(404).json({ error }))
}

exports.getAllBook = (req, res, next) => {
  // Récupère tous les livres de la base de données
  Book.find()
    .then((books) => res.status(200).json(books))
    .catch((error) => res.status(400).json({ error }))
}

exports.ratingBook = (req, res, next) => {
  Book.findOne({ _id: req.params.id }).then((book) => {
    if (!book) {
      return res.status(404).json({ error: 'Livre non trouvé.' })
    }

    // Vérifie si l'utilisateur a déjà noté ce livre
    const userRating = book.ratings.find(
      (rating) => rating.userId === req.auth.userId
    )

    // Si l'utilisateur a déjà noté ce livre, renvoie une erreur
    if (userRating) {
      return res
        .status(400)
        .json({ error: 'Une note existe déjà pour cet utilisateur.' })
    }

    // Ajoute la nouvelle note à la liste des notes du livre
    book.ratings.push({
      userId: req.auth.userId,
      grade: req.body.rating,
    })

    // Calcule la nouvelle note moyenne du livre
    const totalRating = book.ratings.reduce((total, rating) => {
      return total + parseInt(rating.grade)
    }, 0)
    book.averageRating = totalRating / book.ratings.length
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
    // Récupère les trois livres avec la meilleure note moyenne
    const books = await Book.find().sort({ averageRating: -1 }).limit(3)
    res.status(200).json(books)
  } catch (err) {
    console.error(err)
    res.status(500).json({
      error: "Une erreur s'est produite lors de la récupération des livres",
    })
  }
}
