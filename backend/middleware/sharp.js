const sharp = require('sharp')
const fs = require('fs')

// Middleware pour la compression et le redimensionnement de l'image
const sharpCompressResize = async (req, res, next) => {
  // Vérifie si le dossier "images" existe, sinon le crée
  fs.access('./images', (error) => {
    if (error) {
      fs.mkdirSync('./images')
    }
  })
  if (req.file) {
    // Récupère le tampon et le nom original de l'image
    const { buffer, originalname } = req.file

    // Génère un nom de fichier unique en utilisant la date et le nom original de l'image
    const timestamp = Date.now()
    const nameWithoutExtension = originalname.split('.')[0]
    const ref = `${timestamp}-${nameWithoutExtension}.webp`

    // Compression et redimensionnement de l'image en utilisant Sharp et l'enregistre dans le dossier "images"
    await sharp(buffer)
      .resize({ width: 400, height: 500 })
      .webp({ quality: 80 }) // Convertit l'image en format WebP avec une qualité de 80%
      .toFile('./images/' + ref)

    // Réinitialise le tampon de l'image et met à jour le nom de fichier de l'image dans la requête
    req.file.buffer = null
    req.file.name = ref
  }
  next()
}

module.exports = sharpCompressResize
