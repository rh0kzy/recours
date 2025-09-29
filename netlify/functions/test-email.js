const nodemailer = require('nodemailer');

const createTransporter = () => {
  return nodemailer.createTransporter({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_APP_PASSWORD
    }
  });
};

exports.handler = async (event, context) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS'
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  if (event.httpMethod !== 'GET' && event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  // Check email configuration
  if (!process.env.EMAIL_USER || !process.env.EMAIL_APP_PASSWORD) {
    return {
      statusCode: 500,
      headers: { ...headers, 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        error: 'Email configuration missing',
        hasEmailUser: !!process.env.EMAIL_USER,
        hasEmailPassword: !!process.env.EMAIL_APP_PASSWORD
      })
    };
  }

  try {
    const transporter = createTransporter();

    // Test the connection
    await transporter.verify();

    if (event.httpMethod === 'POST') {
      // Send a test email
      const { email } = JSON.parse(event.body || '{}');
      const testEmail = email || process.env.EMAIL_USER;

      await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: testEmail,
        subject: 'Test Email - USTHB System',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <h2 style="color: #2563eb;">Test Email Successful</h2>
            <p>This is a test email to verify the email service is working properly.</p>
            <p><strong>Timestamp:</strong> ${new Date().toISOString()}</p>
            <p><strong>Sent to:</strong> ${testEmail}</p>
            <p>The email service is configured and working correctly.</p>
          </div>
        `
      });

      return {
        statusCode: 200,
        headers: { ...headers, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          success: true,
          message: 'Test email sent successfully',
          sentTo: testEmail,
          timestamp: new Date().toISOString()
        })
      };
    } else {
      // Just verify connection for GET request
      return {
        statusCode: 200,
        headers: { ...headers, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          success: true,
          message: 'Email service is configured and ready',
          emailUser: process.env.EMAIL_USER,
          timestamp: new Date().toISOString()
        })
      };
    }

  } catch (error) {
    console.error('Email test failed:', error);
    return {
      statusCode: 500,
      headers: { ...headers, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        error: 'Email test failed',
        details: error.message,
        timestamp: new Date().toISOString()
      })
    };
  }
};