const express = require('express');
const router = express.Router();
const userController = require('../controllers/user');

router.post('/register',userController.register);
router.post('/login',userController.login);
router.post('/update',userController.update);
router.get('/registerapprove/:uuid',userController.registerComplete);



module.exports = router;