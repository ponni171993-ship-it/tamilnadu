import busboy from 'busboy';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, PutCommand, GetCommand } from '@aws-sdk/lib-dynamodb';
import PDFDocument from 'pdfkit';

// Initialize DynamoDB
const ddbClient = new DynamoDBClient({ region: process.env._AWS_REGION || 'eu-north-1' });
const docClient = DynamoDBDocumentClient.from(ddbClient);
const TABLE_NAME = 'users';

// Helper function to generate simple PNG badge (using hardcoded base64)
function generateSimpleBadgeBase64() {
  // Small voting badge PNG (blue square with text)
  return 'iVBORw0KGgoAAAANSUhEUgAAAAoAAAAKCAYAAACNMs+9AAAABGdBTUEAALGPC/xhBQAAAAlwSFlzAAALEwAACxMBAJqcGAAAAVlpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IlhNUCBDb3JlIDUuNC4wIj4KICAgPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4KICAgICAgPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIKICAgICAgICAgICAgeG1sbnM6dGlmZj0iaHR0cDovL25zLmFkb2JlLmNvbS90aWZmLzEuMC8iPgogICAgICAgICA8dGlmZjpPcmllbnRhdGlvbj4xPC90aWZmOk9yaWVudGF0aW9uPgogICAgICA8L3JkZjpEZXNjcmlwdGlvbj4KICAgPC9yZGY6UkRGPgo8L3g6eG1wbWV0YT4KTMInWQAAABxJREFUGBljZGBg+M9AAWCiIFgYBiiwAAG0BIBJgAAAAASUVORK5CYII=';
}

// Helper function to generate PDF buffer
async function generatePDFBuffer(name, phone) {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument();
      const chunks = [];

      doc.on('data', chunk => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);

      // Generate PDF content
      doc.fontSize(24).text('Registration Certificate', { align: 'center' });
      doc.fontSize(16).moveDown();
      doc.text(`Name: ${name}`);
      doc.text(`Phone: ${phone}`);
      doc.text(`Date: ${new Date().toLocaleDateString('en-IN')}`);
      doc.moveDown();
      doc.fontSize(12).text('Thank you for registering!', { align: 'center' });

      doc.end();
    } catch (error) {
      reject(error);
    }
  });
}

// Helper function to check duplicate in DynamoDB
async function checkDuplicatePhone(phone) {
  try {
    const command = new GetCommand({
      TableName: TABLE_NAME,
      Key: { phone }
    });
    const response = await docClient.send(command);
    return response.Item;
  } catch (error) {
    console.error('Error checking duplicate phone:', error);
    return null;
  }
}

// Helper function to save user to DynamoDB
async function saveUser(userData) {
  try {
    const command = new PutCommand({
      TableName: TABLE_NAME,
      Item: {
        phone: userData.phone,
        name: userData.name,
        registeredAt: userData.registeredAt.toISOString(),
        id: userData.id
      }
    });
    await docClient.send(command);
    console.log('✅ User saved to DynamoDB:', userData.phone);
    return true;
  } catch (error) {
    console.error('Error saving user:', error);
    return false;
  }
}

// Helper function to parse multipart form data
function parseMultipartForm(event) {
  return new Promise((resolve, reject) => {
    const fields = {};
    const files = {};
    
    const bb = busboy({ 
      headers: event.headers,
      limits: {
        fileSize: 5 * 1024 * 1024 // 5MB limit
      }
    });

    bb.on('field', (fieldname, val) => {
      console.log(`Field: ${fieldname} = ${val}`);
      fields[fieldname] = val;
    });

    bb.on('file', (fieldname, file, info) => {
      console.log(`File: ${fieldname}, name: ${info.filename}`);
      const chunks = [];
      
      file.on('data', data => {
        chunks.push(data);
      });

      file.on('end', () => {
        files[fieldname] = Buffer.concat(chunks);
      });

      file.on('error', reject);
    });

    bb.on('close', () => {
      console.log('Parse complete');
      resolve({ fields, files });
    });

    bb.on('error', reject);

    // Handle encoded body
    if (event.isBase64Encoded) {
      const buffer = Buffer.from(event.body, 'base64');
      bb.write(buffer);
    } else {
      bb.write(event.body);
    }
    bb.end();
  });
}

// Lambda handler
export const handler = async (event) => {
  console.log('🚀 Registration handler called');
  console.log('Event method:', event.requestContext?.http?.method);
  console.log('Event path:', event.rawPath);

  // CORS headers
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };

  try {
    const method = event.requestContext?.http?.method;

    // Handle OPTIONS (preflight)
    if (method === 'OPTIONS') {
      return {
        statusCode: 200,
        headers: corsHeaders,
      };
    }

    // Handle GET (health check)
    if (method === 'GET') {
      return {
        statusCode: 200,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: 'Registration endpoint is ready',
          timestamp: new Date().toISOString()
        })
      };
    }

    // Handle POST
    if (method === 'POST') {
      console.log('Processing POST request');

      // Parse multipart form data
      let fields, files;
      try {
        ({ fields, files } = await parseMultipartForm(event));
        console.log('Parsed fields:', Object.keys(fields));
        console.log('Parsed files:', Object.keys(files));
      } catch (parseError) {
        console.error('Form parse error:', parseError);
        return {
          statusCode: 400,
          headers: corsHeaders,
          body: JSON.stringify({ error: 'Failed to parse form data' })
        };
      }

      const { name, phone } = fields;
      const photoBuffer = files.photo;

      // Validation
      if (!name || !phone) {
        return {
          statusCode: 400,
          headers: corsHeaders,
          body: JSON.stringify({ error: 'Name and phone are required' })
        };
      }

      if (name.length < 2 || name.length > 50) {
        return {
          statusCode: 400,
          headers: corsHeaders,
          body: JSON.stringify({ error: 'Name must be between 2 and 50 characters' })
        };
      }

      // Validate Indian phone number
      if (!/^[6-9]\d{9}$/.test(phone)) {
        return {
          statusCode: 400,
          headers: corsHeaders,
          body: JSON.stringify({ error: 'Invalid Indian mobile number' })
        };
      }

      // Check for duplicate
      const existingUser = await checkDuplicatePhone(phone);
      if (existingUser) {
        return {
          statusCode: 409,
          headers: corsHeaders,
          body: JSON.stringify({ error: 'This phone number is already registered' })
        };
      }

      // Generate PDF
      console.log('Generating PDF...');
      let pdfBase64 = '';
      try {
        const pdfBuffer = await generatePDFBuffer(name, phone);
        pdfBase64 = pdfBuffer.toString('base64');
        console.log('✅ PDF generated');
      } catch (pdfError) {
        console.error('PDF generation error:', pdfError);
      }

      // Generate badge (simple base64)
      const badgeBase64 = generateSimpleBadgeBase64();
      console.log('✅ Badge generated');

      // Save to DynamoDB
      const userId = `REG${Date.now()}${Math.floor(Math.random() * 1000)}`;
      const userData = {
        id: userId,
        name,
        phone,
        registeredAt: new Date()
      };

      const saved = await saveUser(userData);
      if (!saved) {
        return {
          statusCode: 500,
          headers: corsHeaders,
          body: JSON.stringify({ error: 'Failed to save user data' })
        };
      }

      // Return success response
      return {
        statusCode: 200,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          success: true,
          id: userId,
          name,
          phone,
          pdf: `data:application/pdf;base64,${pdfBase64}`,
          badge: `data:image/png;base64,${badgeBase64}`,
          message: 'Registration successful'
        })
      };
    }

    // Method not allowed
    return {
      statusCode: 405,
      headers: corsHeaders,
      body: JSON.stringify({ error: 'Method not allowed' })
    };

  } catch (error) {
    console.error('Handler error:', error);
    return {
      statusCode: 500,
      headers: corsHeaders,
      body: JSON.stringify({ error: 'Internal server error', details: error.message })
    };
  }
};
