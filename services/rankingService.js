const { cosineSimilarity } = require('../utils/math');
const { generateExplanation, generateEmbedding } = require('./aiService');

/**
 * Calculates the hybrid score for a candidate against a job description.
 */
async function rankCandidate(candidate, job) {
  const candidateName = candidate.normalizedName || 'Unknown Candidate';
  
  // normalizedSkillsText contains the ENTIRE text of the candidate profile, 
  // ensuring we find related skills even if they are buried in descriptions.
  const candidateAllText = String(candidate.normalizedSkillsText || '').toLowerCase();
  
  const candidateExp = candidate.normalizedExperience || 0;
  const candidatePromos = candidate.normalizedPromotions || 0;
  
  // 1. Semantic Match (Cosine Similarity of overall embeddings)
  let semanticMatch = 0;
  if (candidate.embedding && job.embedding && candidate.embedding.length > 0) {
    semanticMatch = cosineSimilarity(candidate.embedding, job.embedding);
    semanticMatch = Math.max(0, semanticMatch);
  }

  // 2. Advanced Skills Match (Semantic + Broad Text Search)
  const jobSkills = [...(job.requiredSkills || []), ...(job.preferredSkills || [])].map(s => String(s).toLowerCase());
  let matchingSkills = [];
  let missingSkills = [];
  
  // Expanded keywords map for common stacks as fallback for "around" topics
  const techFamilies = {
    'full stack': ['react', 'node', 'html', 'css', 'javascript', 'express', 'frontend', 'backend', 'fullstack', 'database'],
    'frontend': ['react', 'vue', 'angular', 'html', 'css', 'javascript', 'ui', 'ux', 'dom'],
    'backend': ['node', 'python', 'java', 'sql', 'database', 'api', 'express', 'django', 'mongodb'],
    'machine learning': ['python', 'ai', 'tensorflow', 'pytorch', 'data', 'nlp']
  };

  for (const skill of jobSkills) {
    let matched = false;
    
    // Check if skill is mentioned ANYWHERE in the entire profile
    if (candidateAllText.includes(skill)) {
      matched = true;
    } else {
      // Check conceptual families
      for (const [family, children] of Object.entries(techFamilies)) {
        // If the JD asks for a specific skill (e.g., React), and the candidate says "Full Stack"
        if (children.includes(skill) && candidateAllText.includes(family)) {
          matched = true;
          break;
        }
        // Conversely, if the JD asks for "Full Stack", and candidate has "React" and "Node"
        if (skill === family) {
          // If candidate has at least 2 children of the family, we count it as a match
          const foundChildren = children.filter(c => candidateAllText.includes(c));
          if (foundChildren.length >= 2) {
            matched = true;
            break;
          }
        }
      }
    }

    // Semantic AI Match for edge cases
    if (!matched && candidateAllText.length > 0) {
      const skillEmb = await generateEmbedding(skill);
      // We embed a summarized version to avoid massive tensors
      const summaryEmb = await generateEmbedding(candidateAllText.substring(0, 1000));
      const sim = cosineSimilarity(skillEmb, summaryEmb);
      if (sim > 0.40) {
        matched = true;
      }
    }

    if (matched) {
      matchingSkills.push(skill);
    } else {
      missingSkills.push(skill);
    }
  }

  let skillsScore = 0;
  if (jobSkills.length > 0) {
    skillsScore = matchingSkills.length / jobSkills.length;
  } else {
    skillsScore = candidateAllText.length > 0 ? 1 : 0;
  }

  // 3. Experience Score
  let experienceScore = 0;
  if (job.experienceLevel) {
    experienceScore = Math.min(1, candidateExp / job.experienceLevel);
  } else {
    experienceScore = candidateExp > 0 ? 1 : 0;
  }

  // 4. Career Growth
  let careerGrowth = Math.min(1, candidatePromos / 3);

  // 5. Behavioral Score
  let bhvPoints = (candidate.certifications?.length || 0) + Number(candidate.communityContributions || 0);
  let behavioralScore = Math.min(1, bhvPoints / 5);

  const weights = { semantic: 40, skills: 25, experience: 15, growth: 10, behavioral: 10 };

  const finalScore = 
    (semanticMatch * weights.semantic) +
    (skillsScore * weights.skills) +
    (experienceScore * weights.experience) +
    (careerGrowth * weights.growth) +
    (behavioralScore * weights.behavioral);

  const scoreComponents = {
    semanticMatch,
    skillsScore: skillsScore * weights.skills,
    experienceScore: experienceScore * weights.experience,
    careerGrowth: careerGrowth * weights.growth,
    behavioralScore: behavioralScore * weights.behavioral
  };

  const reasons = generateExplanation(candidate, job, scoreComponents);

  return {
    candidateId: candidate._id || candidate.id || 'N/A',
    candidateName,
    finalScore: finalScore.toFixed(2),
    components: {
      semanticMatch: (semanticMatch * weights.semantic).toFixed(2),
      skillsScore: (skillsScore * weights.skills).toFixed(2),
      experienceScore: (experienceScore * weights.experience).toFixed(2),
      careerGrowth: (careerGrowth * weights.growth).toFixed(2),
      behavioralScore: (behavioralScore * weights.behavioral).toFixed(2)
    },
    matchingSkills,
    missingSkills,
    reasons
  };
}

module.exports = {
  rankCandidate
};
