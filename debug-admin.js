// Test admin API with detailed error logging
async function testAdminAPI() {
  try {
    console.log('🔍 Testing simple API first...');
    const testResponse = await fetch('http://localhost:3000/api/test');

    console.log(`📊 Test API Status: ${testResponse.status}`);

    if (testResponse.ok) {
      const testData = await testResponse.json();
      console.log('✅ Test API works:', testData);
    } else {
      console.log('❌ Test API failed');
      return;
    }

    console.log('🔍 Testing admin API...');
    const response = await fetch('http://localhost:3000/api/admin/requests');

    console.log(`📊 Admin API Status: ${response.status}`);
    console.log(`📝 Status Text: ${response.statusText}`);

    if (!response.ok) {
      const errorText = await response.text();
      console.log('❌ Error Response:', errorText);
      return;
    }

    const data = await response.json();
    console.log('✅ Success! Found', data.length, 'requests');

    if (data.length > 0) {
      console.log('📋 Sample request:', {
        id: data[0].id,
        name: `${data[0].prenom} ${data[0].nom}`,
        matricule: data[0].matricule,
        status: data[0].status
      });
    }
  } catch (error) {
    console.error('💥 Network Error:', error.message);
  }
}

testAdminAPI();

testAdminAPI();