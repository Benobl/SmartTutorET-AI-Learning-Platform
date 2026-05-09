import http from 'http';

http.get('http://localhost:5000/api/courses', (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    const parsed = JSON.parse(data);
    if(parsed.data && parsed.data.length > 0) {
      console.log(JSON.stringify(parsed.data[0].lessons, null, 2));
    } else {
      console.log("No courses found or no lessons");
    }
  });
});
