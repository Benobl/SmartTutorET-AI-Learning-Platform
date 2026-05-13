const http = require('http');

const data = JSON.stringify({
    lessons_completed: 85,
    avg_assessment_score: 78,
    time_spent_hours: 120,
    attendance_rate: 0.95,
    previous_grade: 82
});

const options = {
    hostname: 'localhost',
    port: 8000,
    path: '/predict',
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Content-Length': data.length
    }
};

const req = http.request(options, (res) => {
    let responseData = '';
    res.on('data', (chunk) => {
        responseData += chunk;
    });
    res.on('end', () => {
        console.log('Success:', JSON.parse(responseData));
    });
});

req.on('error', (error) => {
    console.error('Error:', error.message);
});

req.write(data);
req.end();
