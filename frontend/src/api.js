// Real API call to backend server - Your existing working implementation
export async function registerUser(form, onProgress) {
  console.log('🚀 Using Real Backend API - Your existing implementation');
  
  return new Promise((resolve, reject) => {
    const formData = new FormData();
    formData.append('name', form.name);
    formData.append('phone', form.phone);
    formData.append('photo', form.photo);

    const xhr = new XMLHttpRequest();
    
    // Progress tracking
    xhr.upload.addEventListener('progress', (e) => {
      if (e.lengthComputable && onProgress) {
        const percent = Math.round((e.loaded / e.total) * 100);
        onProgress(percent, e.loaded, e.total);
      }
    });

    xhr.addEventListener('load', () => {
      if (xhr.status === 200) {
        try {
          const response = JSON.parse(xhr.responseText);
          if (response.success) {
            resolve(response);
          } else {
            reject(new Error(response.error || 'Registration failed'));
          }
        } catch (error) {
          reject(new Error('Invalid response from server'));
        }
      } else {
        try {
          const errorResponse = JSON.parse(xhr.responseText);
          reject(new Error(errorResponse.error || `Server error: ${xhr.status}`));
        } catch {
          reject(new Error(`Server error: ${xhr.status}`));
        }
      }
    });

    xhr.addEventListener('error', () => {
      reject(new Error('Network error - failed to connect to server'));
    });

    // Use different URLs for local development vs AWS Amplify
    const apiUrl = window.location.hostname === 'localhost' 
      ? 'http://localhost:4000/register' 
      : '/api/registerUser'; // Amplify Function URL (matches function name)
    
    xhr.open('POST', apiUrl);
    xhr.send(formData);
  });
}
