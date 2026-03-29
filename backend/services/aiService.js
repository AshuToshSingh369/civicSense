
const fs = require('fs');
const path = require('path');


exports.analyzeReport = async (reportData) => {
    try {
        const { imageUrl } = reportData;

        
        
        let imageBuffer;

        if (imageUrl && imageUrl.startsWith('http')) {
            const response = await fetch(imageUrl);
            const arrayBuffer = await response.arrayBuffer();
            imageBuffer = Buffer.from(arrayBuffer);
        } else if (imageUrl && imageUrl.startsWith('/uploads/')) {
            
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

        
        const form = new FormData();
        
        
        const blob = new Blob([imageBuffer], { type: 'image/jpeg' });
        form.append('file', blob, 'image.jpg');

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 30000);

        const apiResponse = await fetch('http://localhost:8000/predict', {
            method: 'POST',
            body: form,
            signal: controller.signal
        });

        clearTimeout(timeoutId);

        if (!apiResponse.ok) {
            throw new Error(`FastAPI responded with ${apiResponse.status}`);
        }

        const result = await apiResponse.json();
        console.log('DEBUG: FastAPI Raw Result:', JSON.stringify(result));

        
        const categoryMap = {
            'pothole': 'Potholes',
            'garbage': 'Garbage',
            'manhole': 'Drainage',
            'electrical_issues': 'Electricity'
        };

        
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
            
            const list = result.predictions || result.detections || result.detectedObjects || result.objects || result.results || [];
            if (Array.isArray(list)) {
                detected = list.map(extract).filter(Boolean);
            } else {
                
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

