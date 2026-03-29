const http = require('http');

const PORT = 5000;
const BASE_URL = `http://localhost:${PORT}`;

const endpoints = [
    { name: 'Health Check', path: '/health' },
    { name: 'Public Stats', path: '/api/reports/public/stats' },
    { name: 'Recent Reports', path: '/api/reports/public/recent' },
    { name: 'Top Contributors', path: '/api/reports/public/top-contributors' }
];

function ping(endpoint) {
    return new Promise((resolve) => {
        const url = `${BASE_URL}${endpoint.path}`;
        http.get(url, (res) => {
            let data = '';
            res.on('data', (chunk) => data += chunk);
            res.on('end', () => {
                if (res.statusCode >= 200 && res.statusCode < 300) {
                    console.log(`✅ [${endpoint.name}]: SUCCESS (${res.statusCode})`);
                    resolve(true);
                } else {
                    console.error(`❌ [${endpoint.name}]: FAILED (${res.statusCode}) - ${data}`);
                    resolve(false);
                }
            });
        }).on('error', (err) => {
            console.error(`❌ [${endpoint.name}]: ERROR - ${err.message}`);
            resolve(false);
        });
    });
}

async function runVerification() {
    console.log('--- CivicSense Workflow Verification ---');
    console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`Checking backend at ${BASE_URL}...\n`);

    let allPassed = true;
    for (const endpoint of endpoints) {
        const passed = await ping(endpoint);
        if (!passed) allPassed = false;
    }

    console.log('\n--- Verification Result ---');
    if (allPassed) {
        console.log('🎉 All core workflows are operational.');
    } else {
        console.error('⚠️ Some workflow checks failed. Please check the backend logs.');
    }
}

runVerification();
