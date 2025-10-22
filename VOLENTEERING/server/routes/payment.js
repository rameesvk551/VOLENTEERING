const express = require("express");
const { createPayment, verifyPayment } = require("../controller/payment");
const { isAuthenticated } = require("../middleware/auth");

const router = express.Router();

router.post("/create-order",createPayment);
router.post("/verify-payment",isAuthenticated,verifyPayment);

module.exports = router;
