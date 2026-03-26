// No need for node-fetch in Node 18+, using global fetch
const fs = require('fs');
const path = require('path');

/**
 * Analyzes a report using the FastAPI YOLO service.
 * @param {Object} reportData - { title, description, imageUrl, imagePath }
 * @returns {Object} Analysis result
 */
exports.analyzeReport = async (reportData) => {
    try {
        const { imageUrl } = reportData;

        // If it's a local file, we can potentially send the file buffer
        // In this implementation, we assume we need to fetch the image or read it from disk
        let imageBuffer;

        if (imageUrl && imageUrl.startsWith('http')) {
            const response = await fetch(imageUrl);
            const arrayBuffer = await response.arrayBuffer();
            imageBuffer = Buffer.from(arrayBuffer);
        } else if (imageUrl && imageUrl.startsWith('/uploads/')) {
            // Read from local uploads directory
            const filename = path.basename(imageUrl);
            const localPath = path.join(__dirname, '..', 'uploads', filename);
            console.log('DEBUG: AI Service reading local file:', localPath);
            if (fs.existsSync(localPath)) {
                imageBuffer = fs.readFileSync(localPath);
            } else {
                console.error('DEBUG: AI Service file not found:', localPath);
            }
        }

        if (!imageBuffer) {
            console.warn('AI Service: No image found for analysis, falling back to mock.');
            return mockFallback(reportData);
        }

        // Send to FastAPI using native FormData (Node 18+)
        const form = new FormData();
        // Native FormData append takes a Blob/File or string. 
        // We can create a Blob from our buffer.
        const blob = new Blob([imageBuffer], { type: 'image/jpeg' });
        form.append('file', blob, 'image.jpg');

        const apiResponse = await fetch('http://localhost:8000/predict', {
            method: 'POST',
            body: form
        });

        if (!apiResponse.ok) {
            throw new Error(`FastAPI responded with ${apiResponse.status}`);
        }

        const result = await apiResponse.json();
        console.log('DEBUG: FastAPI Raw Result:', JSON.stringify(result));

        // --- Categorization Logic ---
        const categoryMap = {
            'pothole': 'Potholes',
            'garbage': 'Garbage',
            'manhole': 'Drainage',
            'electrical_issues': 'Electricity'
        };

        // 1. Robust extraction from ANY format
        let detected = [];
        const extract = (item) => {
            if (typeof item === 'string') return item;
            if (typeof item === 'object' && item !== null) {
                return item.name || item.class || item.label || item.category || item.obj;
            }
            return null;
        };

        if (Array.isArray(result)) {
            detected = result.map(extract).filter(Boolean);
        } else if (typeof result === 'object' && result !== null) {
            // Check common keys
            const list = result.predictions || result.detections || result.detectedObjects || result.objects || result.results || [];
            if (Array.isArray(list)) {
                detected = list.map(extract).filter(Boolean);
            } else {
                // Check every key in the object for arrays
                for (const key in result) {
                    if (Array.isArray(result[key])) {
                        const extracted = result[key].map(extract).filter(Boolean);
                        if (extracted.length > 0) {
                            detected = detected.concat(extracted);
                        }
                    }
                }
            }
        }

        console.log('DEBUG: AI Service Final Detections List:', detected);

        if (detected.length > 0) {
            for (const rawObj of detected) {
                const obj = rawObj.toLowerCase().replace(/[\s_]/g, '');

                // Extremely permissive match
                const match = Object.keys(categoryMap).find(key => {
                    const normKey = key.toLowerCase().replace(/[\s_]/g, '');
                    return obj.includes(normKey) || normKey.includes(obj);
                });

                if (match) {
                    result.assignedCategory = categoryMap[match];
                    console.log(`DEBUG: AI MATCH SUCCESS! Found "${rawObj}" -> mapped to "${result.assignedCategory}"`);
                    break;
                }
            }
        }

        // 2. Keyword fallback (More inclusive)
        if (!result.assignedCategory) {
            const text = ((reportData.title || '') + ' ' + (reportData.description || '')).toLowerCase();
            console.log('DEBUG: AI falling back to text keywords. Text:', text);

            if (text.includes('pothole') || text.includes('road')) result.assignedCategory = 'Potholes';
            else if (text.includes('garbage') || text.includes('trash') || text.includes('waste')) result.assignedCategory = 'Garbage';
            else if (text.includes('manhole') || text.includes('drain') || text.includes('sewer')) result.assignedCategory = 'Drainage';
            else if (text.includes('pole') || text.includes('wire') || text.includes('electricity')) result.assignedCategory = 'Electricity';
            else result.assignedCategory = 'UNCATEGORIZED';
        }

        console.log('AI Analysis Final Outcome:', result.assignedCategory);
        return result;

    } catch (error) {
        console.error('AI Service Error:', error.message);
        const fallback = mockFallback(reportData);

        const text = ((reportData.title || '') + ' ' + (reportData.description || '')).toLowerCase();
        if (text.includes('pothole') || text.includes('road')) fallback.assignedCategory = 'Potholes';
        else if (text.includes('garbage') || text.includes('trash') || text.includes('waste')) fallback.assignedCategory = 'Garbage';
        else if (text.includes('manhole') || text.includes('drain') || text.includes('sewer')) fallback.assignedCategory = 'Drainage';
        else if (text.includes('pole') || text.includes('wire') || text.includes('electricity')) fallback.assignedCategory = 'Electricity';
        else fallback.assignedCategory = 'UNCATEGORIZED';

        return fallback;
    }
};

const mockFallback = (data) => {
    return {
        threatLevel: 'Low',
        severityScore: 3,
        detectedObjects: ['ai_offline_fallback'],
        confidence: 0,
        flaggedForReview: true,
        isDuplicate: false,
        assignedCategory: 'General'
    };
};

