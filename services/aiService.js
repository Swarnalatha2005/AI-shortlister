const { pipeline } = require('@xenova/transformers');

let extractor = null;

/**
 * Initializes the local Sentence Transformer model.
 * Using 'Xenova/all-MiniLM-L6-v2' which is lightweight and fast.
 */
async function getExtractor() {
  if (!extractor) {
    // Pipeline initialization (downloads model on first run)
    extractor = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2');
  }
  return extractor;
}

/**
 * Generates semantic embedding for a given text.
 * @param {string} text 
 * @returns {Promise<number[]>}
 */
async function generateEmbedding(text) {
  try {
    const fn = await getExtractor();
    const output = await fn(text, { pooling: 'mean', normalize: true });
    // Convert Tensor to standard JS array
    return Array.from(output.data);
  } catch (error) {
    console.error('Error generating embedding:', error);
    throw error;
  }
}

/**
 * Mock generator for explainable AI reasons to keep it fast and local.
 * In a production system, this could call an LLM with the structured data.
 */
function generateExplanation(candidate, job, scores) {
  const reasons = [];
  
  if (scores.semanticMatch > 0.8) {
    reasons.push('✓ Strong semantic alignment with job description');
  } else if (scores.semanticMatch > 0.6) {
    reasons.push('✓ Good semantic alignment with job description');
  } else {
    reasons.push('✗ Low semantic alignment');
  }

  const skillsMatchPercent = (scores.skillsScore / 25) * 100;
  if (skillsMatchPercent >= 80) {
    reasons.push(`✓ ${skillsMatchPercent.toFixed(0)}% required skills match`);
  } else {
    reasons.push(`! ${skillsMatchPercent.toFixed(0)}% required skills match (some missing)`);
  }

  if (candidate.experienceYears && job.experienceLevel) {
    reasons.push(`✓ ${candidate.experienceYears} years relevant experience`);
  }
  
  if (scores.careerGrowth > 6) {
    reasons.push('✓ Consistent career growth');
  }

  if (scores.behavioralScore > 5) {
    reasons.push('✓ Active certifications and community involvement');
  }

  return reasons;
}

module.exports = {
  generateEmbedding,
  generateExplanation
};
