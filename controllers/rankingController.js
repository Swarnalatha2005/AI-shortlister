const Job = require('../models/Job');
const Candidate = require('../models/Candidate');
const { rankCandidate } = require('../services/rankingService');
const { createObjectCsvWriter } = require('csv-writer');
const path = require('path');
const fs = require('fs');

exports.rankCandidates = async (req, res) => {
  try {
    const { jobId } = req.body;

    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({ error: 'Job not found' });
    }

    const candidates = await Candidate.find();
    if (!candidates || candidates.length === 0) {
      return res.status(400).json({ error: 'No candidates available to rank' });
    }

    const rankedResults = [];

    // Rank each candidate
    for (const candidate of candidates) {
      const result = await rankCandidate(candidate, job);
      
      // Update DB with last rank data
      candidate.lastRankData = {
        jobId: job._id,
        finalScore: result.finalScore,
        semanticMatch: result.components.semanticMatch,
        skillsScore: result.components.skillsScore,
        experienceScore: result.components.experienceScore,
        careerGrowth: result.components.careerGrowth,
        behavioralScore: result.components.behavioralScore,
        reasons: result.reasons,
        matchingSkills: result.matchingSkills,
        missingSkills: result.missingSkills
      };
      await candidate.save();
      
      rankedResults.push({
        ...result,
        candidate
      });
    }

    // Sort by finalScore descending
    rankedResults.sort((a, b) => b.finalScore - a.finalScore);

    // Assign ranks
    rankedResults.forEach((res, index) => res.rank = index + 1);

    // Generate CSV
    const outputDir = path.join(__dirname, '../../output');
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    const csvPath = path.join(outputDir, 'ranked_candidates.csv');
    const csvWriter = createObjectCsvWriter({
      path: csvPath,
      header: [
        { id: 'candidate_id', title: 'candidate_id' },
        { id: 'candidate_name', title: 'candidate_name' },
        { id: 'final_score', title: 'final_score' },
        { id: 'semantic_score', title: 'semantic_score' },
        { id: 'skills_score', title: 'skills_score' },
        { id: 'experience_score', title: 'experience_score' },
        { id: 'career_score', title: 'career_score' },
        { id: 'behavior_score', title: 'behavior_score' },
        { id: 'rank', title: 'rank' }
      ]
    });

    const csvRecords = rankedResults.map(r => ({
      candidate_id: r.candidateId,
      candidate_name: r.candidateName,
      final_score: r.finalScore,
      semantic_score: r.components.semanticMatch,
      skills_score: r.components.skillsScore,
      experience_score: r.components.experienceScore,
      career_score: r.components.careerGrowth,
      behavior_score: r.components.behavioralScore,
      rank: r.rank
    }));

    await csvWriter.writeRecords(csvRecords);

    res.status(200).json({ 
      message: 'Candidates ranked successfully', 
      results: rankedResults,
      csvUrl: '/api/results/csv'
    });

  } catch (error) {
    console.error('Error ranking candidates:', error);
    res.status(500).json({ error: 'Failed to rank candidates' });
  }
};

exports.getResultsCsv = (req, res) => {
  const csvPath = path.join(__dirname, '../../output/ranked_candidates.csv');
  if (fs.existsSync(csvPath)) {
    res.download(csvPath);
  } else {
    res.status(404).json({ error: 'CSV not found' });
  }
};
