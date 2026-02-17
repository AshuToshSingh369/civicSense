/**
 * Analyzes a report using Mock AI logic.
 * OpenAI integration has been removed temporarily due to API key issues.
 * @param {Object} reportData - { title, description, imageUrl }
 * @returns {Object} Analysis result
 */
exports.analyzeReport = async (reportData) => {
    // console.warn('⚠️ OpenAI Integration disabled. Using MOCK AI response.');
    return mockAnalysis(reportData);
};

const mockAnalysis = (data) => {
    const text = (data.title + " " + data.description).toLowerCase();

    // Simple keyword-based logic for demonstration
    let severity = 3;
    let threat = 'Low';

    if (text.includes('fire') || text.includes('explosion') || text.includes('blood') || text.includes('accident')) {
        severity = 9;
        threat = 'Critical';
    } else if (text.includes('pothole') || text.includes('crack')) {
        severity = 4;
        threat = 'Medium';
    } else if (text.includes('garbage') || text.includes('litter')) {
        severity = 2;
        threat = 'Low';
    } else if (text.includes('water') || text.includes('leak') || text.includes('flood')) {
        severity = 6;
        threat = 'High';
    }

    return {
        threatLevel: threat,
        severityScore: severity,
        detectedObjects: ['simulated_object'],
        confidence: 85,
        flaggedForReview: false,
        isDuplicate: false
    };
};

