const express = require("express");
const multer = require("multer");
const path = require("path");
const CidController = require("../controllers/CidController");

const router = express.Router();

const upload = multer({
    dest: path.join(__dirname, "../uploads/tmp"),
    limits: {
        fileSize: 30 * 1024 * 1024
    }
});

router.get("/cids", CidController.search);
router.get("/cids/stats", CidController.stats);
router.post("/cids/import", upload.single("file"), CidController.importCsv);

module.exports = router;
