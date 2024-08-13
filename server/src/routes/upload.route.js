const { merge } = require('../controllers/upload.controllers');
const { upload, handleFilesProcessing } = require('../middleware/upload.middleware');

const express = require('express');

const uploadRoutes = express.Router();

uploadRoutes.post('/upload', upload , handleFilesProcessing  ,merge)

module.exports = uploadRoutes;