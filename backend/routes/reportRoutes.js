const express = require("express");
const { getFinancialReport } = require("../controllers/reportController");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

// Get Financial Report (Protected Route)
router.get("/", protect, getFinancialReport);

module.exports = router;
