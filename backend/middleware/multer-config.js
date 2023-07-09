const multer = require('multer')

// Configure le stockage en mémoire pour les fichiers téléchargés
const storage = multer.memoryStorage()
const upload = multer(storage)

module.exports = upload
