const express = require('express');
const multer = require('multer');
const jobController = require('../controllers/jobController');
const candidateController = require('../controllers/candidateController');
const rankingController = require('../controllers/rankingController');

const router = express.Router();
const upload = multer({ dest: 'uploads/' }); // Temp storage for JSON uploads

// Job APIs
router.post('/job/analyze', jobController.analyzeJob);

// Candidate APIs
router.post('/candidates/upload', upload.single('file'), candidateController.uploadCandidates);

// Ranking APIs
router.post('/rank', rankingController.rankCandidates);
router.get('/results/csv', rankingController.getResultsCsv);

// For testing purposes, to fetch job/candidates lists
const Job = require('../models/Job');
const Candidate = require('../models/Candidate');
router.get('/jobs', async (req, res) => res.json(await Job.find({}, '-embedding')));
router.get('/candidates', async (req, res) => res.json(await Candidate.find({}, '-embedding')));

module.exports = router;
