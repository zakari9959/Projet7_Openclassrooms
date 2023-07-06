const jwt = require('jsonwebtoken')

module.exports = (req, res, next) => {
  try {
    // Récupère le token d'authentification depuis les en-têtes de la requête
    const token = req.headers.authorization.split(' ')[1]

    // Vérifie et décode le token en utilisant la clé secrète
    const decodedToken = jwt.verify(token, process.env.RANDOM_TOKEN_SECRET)

    // Extrayez l'identifiant d'utilisateur à partir du token décodé
    const userId = decodedToken.userId

    // Ajoute l'objet d'authentification à l'objet de requête pour une utilisation ultérieure
    req.auth = {
      userId: userId,
    }

    // Passe à la prochaine fonction middleware
    next()
  } catch (error) {
    // En cas d'erreur lors de la vérification du token, renvoie une réponse avec un code d'erreur 401
    res.status(401).json({ error })
  }
}
