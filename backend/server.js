// Importation des modules requis
const http = require('http')
const { app } = require('./app')

// Fonction pour normaliser le port
const normalizePort = (val) => {
  const port = parseInt(val, 10)

  if (isNaN(port)) {
    return val
  }
  if (port >= 0) {
    return port
  }
  return false
}

// Détermination du port à utiliser en se basant sur l'environnement ou le port par défaut 4000
const port = normalizePort(process.env.PORT || '4000')
app.set('port', port)

// Fonction de gestion des erreurs liées au serveur
const errorHandler = (error) => {
  if (error.syscall !== 'listen') {
    throw error
  }
  const address = server.address()
  const bind = typeof address === 'string' ? 'pipe ' + address : 'port: ' + port
  switch (error.code) {
    case 'EACCES':
      console.error(bind + ' nécessite des privilèges élevés.')
      process.exit(1)
      break
    case 'EADDRINUSE':
      console.error(bind + ' est déjà utilisé.')
      process.exit(1)
      break
    default:
      throw error
  }
}

// Création du serveur HTTP en utilisant l'application Express
const server = http.createServer(app)

// Gestionnaire d'erreur du serveur
server.on('error', errorHandler)

// Écoute de l'événement de démarrage du serveur
server.on('listening', () => {
  const address = server.address()
  const bind = typeof address === 'string' ? 'pipe ' + address : 'port ' + port
  console.log('Listening on ' + bind)
})

// Démarrage du serveur en écoutant le port spécifié
server.listen(port)
