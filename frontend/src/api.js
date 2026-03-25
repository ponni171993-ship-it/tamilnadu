// Mock API for AWS Amplify deployment
export async function registerUser(form, onProgress) {
  // Simulate progress tracking
  if (onProgress && typeof onProgress === 'function') {
    const progressSteps = [10, 25, 50, 75, 90, 100];
    for (let i = 0; i < progressSteps.length; i++) {
      await new Promise(resolve => setTimeout(resolve, 300));
      onProgress(progressSteps[i], progressSteps[i] * 1000, 10000);
    }
  }

  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 2000));

  // Mock successful response
  return {
    success: true,
    registrationId: `REG${Date.now()}${Math.floor(Math.random() * 1000)}`,
    name: form.name,
    phone: form.phone,
    pdf: 'data:application/pdf;base64,JVBERi0xLjQKJeLjz9MKMSAwIG9iago8PC9UeXBlL0NhdGFsb2cvUGFnZXMgMiAwIFI+PgplbmRvYmoKMiAwIG9iago8PC9UeXBlL1BhZ2UvUGFyZW50IDMgMCBSL1Jlc291cmNlczw8L0ZvbnQ8PC9GMSA0IDAgUj4+Pj4vTWVkaWFCb3hbWCAwIDAgNjEyIDc5Ml0+Pj4KZW5kb2JqCjMgMCBvYmoKPDwvVHlwZS9QYWdlcy9Db3VudCAxL0tpZHNbMiAwIF0+PgplbmRvYmoKNCAwIG9iago8PC9UeXBlL0ZvbnQvU3VidHlwZS9UeXBlMS9CYXNlRm9udC9IZWx2ZXRpY2E+PgplbmRvYmoKeHJlZgowIDUKJSVFT0Y=',
    badge: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==',
    message: 'Registration successful (mock data for Amplify)'
  };
}
