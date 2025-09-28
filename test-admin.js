// Test script to fetch admin requests
fetch('http://localhost:3001/api/admin/requests')
  .then(res => res.json())
  .then(data => console.log('Requests:', JSON.stringify(data, null, 2)))
  .catch(err => console.error('Error:', err));