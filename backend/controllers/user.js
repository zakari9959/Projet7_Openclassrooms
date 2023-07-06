const bcrypt = require('bcryptjs')
const User = require('../models/user')
const jwt = require('jsonwebtoken')

exports.signup = (req, res, next) => {
  bcrypt
    .hash(req.body.password, 10) // Utilise bcrypt pour hasher le mot de passe
    .then((hash) => {
      const user = new User({
        email: req.body.email,
        password: hash, // Utilise le mot de passe hashé pour créer un nouvel utilisateur
      })
      user
        .save() // Enregistre l'utilisateur dans la base de données
        .then(() => res.status(201).json({ message: 'Utilisateur créé' }))
        .catch((error) => res.status(400).json({ error }))
    })
    .catch((error) => res.status(500).json({ error }))
}

exports.login = (req, res, next) => {
  User.findOne({ email: req.body.email }) // Recherche l'utilisateur dans la base de données en utilisant l'e-mail
    .then((user) => {
      if (user === null) {
        res.status(401).json({ message: 'Identifiant/mot de passe incorrecte' }) // Si l'utilisateur n'est pas trouvé, renvoie une réponse avec un code d'erreur 401
      } else {
        bcrypt
          .compare(req.body.password, user.password) // Compare le mot de passe fourni avec le mot de passe stocké dans la base de données
          .then((valid) => {
            if (!valid) {
              res
                .status(401)
                .json({ message: 'Identifiant/mot de passe incorrect' }) // Si le mot de passe est incorrect, renvoie une réponse avec un code d'erreur 401
            } else {
              res.status(200).json({
                userId: user._id, // Si le mot de passe est correct, renvoie une réponse avec l'identifiant de l'utilisateur et un token d'authentification
                token: jwt.sign(
                  { userId: user._id },
                  process.env.RANDOM_TOKEN_SECRET,
                  {
                    expiresIn: '4h',
                  }
                ),
              })
            }
          })
          .catch((error) => {
            res.status(500).json({ error })
          })
      }
    })
    .catch((error) => {
      res.status(500).json({ error })
    })
}

exports.getAllUsers = (req, res, next) => {
  User.find() // Récupère tous les utilisateurs de la base de données
    .then((users) => {
      console.log(users)
      res.status(200).json(users) // Renvoie une réponse avec la liste des utilisateurs
    })
    .catch((error) => {
      console.log('Error fetching users:', error)
      res.status(500).json({ error })
    })
}
