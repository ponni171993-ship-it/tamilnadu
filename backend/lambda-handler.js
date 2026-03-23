import { handler } from './index.js';

// AWS Lambda handler wrapper
export const lambdaHandler = async (event, context) => {
  try {
    // Set CORS headers for all responses
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Content-Type,Authorization',
      'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS',
      'Content-Type': 'application/json'
    };

    // Handle preflight OPTIONS requests
    if (event.httpMethod === 'OPTIONS') {
      return {
        statusCode: 200,
        headers: corsHeaders,
        body: ''
      };
    }

    // Parse event for Express compatibility
    const mockReq = {
      method: event.httpMethod,
      path: event.path,
      query: event.queryStringParameters || {},
      body: event.body ? JSON.parse(event.body) : {},
      headers: event.headers || {},
      file: event.isFileUpload ? event.file : null
    };

    const mockRes = {
      statusCode: 200,
      headers: {},
      body: '',
      
      status(code) {
        this.statusCode = code;
        return this;
      },
      
      json(data) {
        this.body = JSON.stringify(data);
        return this;
      },
      
      setHeader(name, value) {
        this.headers[name] = value;
        return this;
      }
    };

    // Your existing Express app logic will be called here
    // This is a simplified wrapper - you may need to adjust based on your actual Express setup
    
    return {
      statusCode: mockRes.statusCode,
      headers: { ...corsHeaders, ...mockRes.headers },
      body: mockRes.body
    };

  } catch (error) {
    console.error('Lambda handler error:', error);
    return {
      statusCode: 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        error: 'Internal server error',
        message: error.message
      })
    };
  }
};
