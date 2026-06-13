const fs = require('fs');
const Candidate = require('../models/Candidate');
const { generateEmbedding } = require('../services/aiService');

function findValueByRegex(obj, regex) {
  for (const key of Object.keys(obj)) {
    if (regex.test(key.toLowerCase())) {
      return obj[key];
    }
  }
  return null;
}

function calculateTotalExperience(obj) {
  let totalYears = 0;

  // Find any property that might be an array of jobs
  for (const key of Object.keys(obj)) {
    if (/exp|work|employ|history/i.test(key)) {
      const val = obj[key];
      if (Array.isArray(val)) {
        // Iterate through companies/roles
        for (const role of val) {
          let roleYears = 0;
          let roleText = JSON.stringify(role).toLowerCase();

          // Check for explicit duration fields
          for (const rKey of Object.keys(role)) {
            const rVal = String(role[rKey]).toLowerCase();
            if (/year|yr/i.test(rKey) && !isNaN(parseFloat(rVal))) {
              roleYears += parseFloat(rVal);
            } else if (/month|mo/i.test(rKey) && !isNaN(parseFloat(rVal))) {
              roleYears += parseFloat(rVal) / 12;
            } else if (/duration/i.test(rKey)) {
              const match = rVal.match(/(\d+)\s*(year|yr)/i);
              if (match) roleYears += parseFloat(match[1]);
              const moMatch = rVal.match(/(\d+)\s*(month|mo)/i);
              if (moMatch) roleYears += parseFloat(moMatch[1]) / 12;
            }
          }

          // Fallback: Date extraction (e.g. "2018 to 2021" or "2018 - Present")
          if (roleYears === 0) {
            const yearMatches = roleText.match(/\b(19|20)\d{2}\b/g);
            if (yearMatches && yearMatches.length >= 2) {
              const sorted = yearMatches.map(Number).sort();
              roleYears = sorted[sorted.length - 1] - sorted[0];
              if (roleYears === 0) roleYears = 0.5; // same year defaults to 6 months
            } else if (roleText.match(/present|current|now/i) && yearMatches && yearMatches.length === 1) {
              roleYears = new Date().getFullYear() - Number(yearMatches[0]);
              if (roleYears === 0) roleYears = 0.5;
            }
          }

          totalYears += roleYears;
        }
      } else if (typeof val === 'number') {
        totalYears += val;
      } else if (typeof val === 'string') {
        const match = val.match(/(\d+(\.\d+)?)/);
        if (match) totalYears += parseFloat(match[0]);
      }
    }
  }

  // Ultimate Fallback: if total is still 0, search the entire JSON string for "5 years experience" etc
  if (totalYears === 0) {
    const allText = JSON.stringify(obj).toLowerCase();
    const fallbackMatch = allText.match(/(\d+(\.\d+)?)\s*(?:\+|plus)?\s*(?:years?|yrs?).*?(?:exp|experience)/i) || 
                          allText.match(/(?:exp|experience).*?(?:is|:)?\s*(\d+(\.\d+)?)/i);
    if (fallbackMatch && !isNaN(parseFloat(fallbackMatch[1]))) {
      totalYears = parseFloat(fallbackMatch[1]);
    }
  }

  return totalYears;
}

function extractAllText(obj) {
  let text = [];
  if (typeof obj === 'string') return obj;
  if (Array.isArray(obj)) {
    obj.forEach(item => text.push(extractAllText(item)));
  } else if (typeof obj === 'object' && obj !== null) {
    for (const val of Object.values(obj)) {
      text.push(extractAllText(val));
    }
  }
  return text.join(' ');
}

exports.uploadCandidates = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const fileContent = fs.readFileSync(req.file.path, 'utf-8');
    const candidatesData = JSON.parse(fileContent);

    const savedCandidates = [];

    // Process each candidate
    for (const data of candidatesData) {
      const rawName = findValueByRegex(data, /name|candidate|first/i) || 'Unknown Candidate';
      
      // Calculate experience by summing up array durations
      const totalExp = calculateTotalExperience(data);

      // Extract literally all text to perform broad semantic matching
      const allText = extractAllText(data);
      
      const rawPromo = findValueByRegex(data, /promo|growth/i) || 0;
      const parsedPromo = parseInt(String(rawPromo).match(/\d+/)?.[0] || 0);

      // We overwrite the raw properties with normalized ones for the ranking engine
      const normalizedData = {
        ...data,
        normalizedName: rawName,
        normalizedSummary: allText.substring(0, 500) + '...', // used for display
        normalizedSkillsText: allText, // Send all text to ranking engine for broad semantic match
        normalizedExperience: parseFloat(totalExp.toFixed(1)),
        normalizedPromotions: parsedPromo
      };

      // Create a summary for embedding
      const summaryText = `${rawName}. Experience: ${totalExp} years. Content: ${allText.substring(0, 1000)}`;
      const embedding = await generateEmbedding(summaryText);

      const candidate = new Candidate({
        ...normalizedData,
        embedding
      });

      await candidate.save();
      savedCandidates.push(candidate._id);
    }

    // Cleanup temp file
    fs.unlinkSync(req.file.path);

    res.status(201).json({ message: 'Candidates uploaded and processed', count: savedCandidates.length });
  } catch (error) {
    console.error('Error uploading candidates:', error);
    res.status(500).json({ error: 'Failed to process candidates dataset' });
  }
};
