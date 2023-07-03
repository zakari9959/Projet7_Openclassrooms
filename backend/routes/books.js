const express = require('express')
const router = express.Router()
const fs = require('fs')

const auth = require('../middleware/auth')

const bookCtrl = require('../controllers/books')
const upload = require('../middleware/multer-config')
const sharp = require('../middleware/sharp')

router.get('/', bookCtrl.getAllBook)
router.get('/bestrating', bookCtrl.bestThreeBooks)
router.get('/:id', bookCtrl.getOneBook)
router.post('/', auth, upload.single('image'), sharp, bookCtrl.createBook)
router.put('/:id', auth, upload.single('image'), sharp, bookCtrl.modifyBook)
router.delete('/:id', auth, bookCtrl.deleteBook)
router.post('/:id/rating', auth, bookCtrl.ratingBook)

module.exports = router
