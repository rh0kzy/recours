// Test admin API
fetch('http://localhost:3002/api/admin/requests')
  .then(res => {
    console.log('Response status:', res.status);
    return res.text();
  })
  .then(text => {
    console.log('Raw response:', text);
    try {
      const data = JSON.parse(text);
      console.log('✅ Admin API Response:');
      console.log(`📊 Total requests: ${data.length}`);
      data.forEach((req, index) => {
        console.log(`${index + 1}. ${req.prenom} ${req.nom} (${req.matricule}) - Status: ${req.status}`);
      });
    } catch (e) {
      console.log('❌ Not JSON response');
    }
  })
  .catch(err => console.error('❌ Error:', err));