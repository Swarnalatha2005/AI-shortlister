const Job = require('../models/Job');
const { generateEmbedding } = require('../services/aiService');

exports.analyzeJob = async (req, res) => {
  try {
    const { title, description, requiredSkills, preferredSkills, experienceLevel } = req.body;

    // Generate text for embedding
    const textToEmbed = `${title}. ${description}. Required Skills: ${(requiredSkills || []).join(', ')}`;
    
    // Call local AI service
    const embedding = await generateEmbedding(textToEmbed);

    const job = new Job({
      title,
      description,
      requiredSkills,
      preferredSkills,
      experienceLevel,
      embedding
    });

    await job.save();

    res.status(201).json({ message: 'Job analyzed and saved successfully', jobId: job._id });
  } catch (error) {
    console.error('Error analyzing job:', error);
    res.status(500).json({ error: 'Failed to analyze job description' });
  }
};
