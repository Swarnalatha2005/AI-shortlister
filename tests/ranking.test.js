const { rankCandidate } = require('../services/rankingService');
const { cosineSimilarity } = require('../utils/math');

// Mock aiService locally for testing
jest.mock('../services/aiService', () => ({
  generateExplanation: jest.fn().mockReturnValue(['✓ Mock reason']),
}));

describe('Ranking Service & Math Utils', () => {

  test('Cosine Similarity calculates correctly', () => {
    const vecA = [1, 0, 0];
    const vecB = [1, 0, 0];
    expect(cosineSimilarity(vecA, vecB)).toBe(1);

    const vecC = [0, 1, 0];
    expect(cosineSimilarity(vecA, vecC)).toBe(0);
  });

  test('rankCandidate calculates hybrid score properly', () => {
    const mockJob = {
      requiredSkills: ['JavaScript', 'React'],
      experienceLevel: 3,
      embedding: [0.5, 0.5]
    };

    const mockCandidate = {
      _id: '123',
      name: 'Test Candidate',
      skills: ['JavaScript', 'React', 'Node.js'],
      experienceYears: 4, // Meets requirement
      promotions: 1,
      certifications: ['AWS'],
      embedding: [0.5, 0.5] // Perfect semantic match
    };

    const result = rankCandidate(mockCandidate, mockJob);

    // 1. Semantic Match: cosineSim([0.5, 0.5], [0.5, 0.5]) = 1.0 (40 pts)
    // 2. Skills Match: 2/2 = 1.0 (25 pts)
    // 3. Experience: 4/3 -> capped at 1.0 (15 pts)
    // 4. Growth: 1 promo / 3 = 0.333 (3.33 pts)
    // 5. Behavioral: 1 cert / 5 = 0.2 (2 pts)
    // Expected Total: 40 + 25 + 15 + 3.33 + 2 = 85.33

    expect(Number(result.finalScore)).toBeCloseTo(85.33, 1);
    expect(result.matchingSkills).toContain('javascript');
    expect(result.missingSkills.length).toBe(0);
  });
});
