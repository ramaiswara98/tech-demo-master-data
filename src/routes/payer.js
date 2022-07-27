const express = require('express');
const router = express.Router();

const payerController = require('../controller/payer');

router.post('/create-payer', payerController.createPayer);
router.get('/payer-lists', payerController.getPayerList);
router.post('/airdrop',payerController.airdropPayer);

module.exports = router;