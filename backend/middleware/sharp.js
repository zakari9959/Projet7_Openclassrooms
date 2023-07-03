const sharp = require('sharp')
const fs = require('fs')

const sharpCompressResize = async (req, res, next) => {
  fs.access('./images', (error) => {
    if (error) {
      fs.mkdirSync('./images')
    }
  })
  const { buffer, originalname } = req.file
  const timestamp = new Date().toISOString()
  const ref = `${timestamp}-${originalname}.webp`
  await sharp(buffer)
    .webp({ quality: 80 })
    .toFile('./images/' + ref)
  req.file.buffer = null
  req.file.name = ref
  next()
}

module.exports = sharpCompressResize
