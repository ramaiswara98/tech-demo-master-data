const express = require('express');
const router = express.Router();

const userController = require('../controller/user')

router.post('/create-user',userController.createUser)

router.post('/login', userController.loginUser)

router.post('/get-user', userController.getUserById)

module.exports = router;