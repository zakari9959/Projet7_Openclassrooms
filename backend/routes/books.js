const express = require('express');
const router = express.Router();

const auth = require('../middleware/auth');
const multer = require('../middleware/multer-config');

const bookCtrl = require('../controllers/books');

router.get('/', bookCtrl.getAllBook);
router.get('/:id', bookCtrl.getOneBook);
router.get('/bestrating', bookCtrl.bestThreeBooks);
router.post('/',auth, multer, bookCtrl.createBook);
router.put('/:id',auth, multer, bookCtrl.modifyBook);
router.delete('/:id',auth, bookCtrl.deleteBook);
router.post('/:id/rating', auth, bookCtrl.ratingBook);

module.exports = router;