const express = require('express');
const router = express.Router();

const RequestController = require("../controller/request");

router.post("/create-request", RequestController.createRequest);
router.get("/get-all-request",RequestController.getAllRequest);
router.post("/get-request-by-wallet",RequestController.getAllRequestByWallet);
router.post("/accept-request",RequestController.acceptRequestToken);
router.post("/accept-request-existing-token", RequestController.acceptRequestExistingToken);

module.exports = router;