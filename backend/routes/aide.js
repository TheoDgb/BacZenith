const express = require('express');
const router = express.Router();
const pool = require('../config');
const { auth, authorizeRoles } = require('../middlewares/auth');

module.exports = router;