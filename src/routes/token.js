const express = require('express');
const router = express.Router();

const Token = require("../controller/token");

router.post('/create-token', Token.createToken);
router.post('/get-token-list', Token.getTokenList);
router.post('/mint-token',Token.mintingToken);
router.get('/get-available-token', Token.getAvailableTokenList);
router.post('/send-to-phantom',Token.sendTokenToPhantom)

module.exports = router;