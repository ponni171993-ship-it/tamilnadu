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

    // Construct API URL based on current environment
    let apiUrl = import.meta.env.VITE_API_URL;
    
    if (!apiUrl) {
      if (window.location.hostname === 'localhost') {
        // Local development
        apiUrl = 'http://localhost:4000/api/register/';
      } else if (window.location.hostname.includes('amplifyapp.com')) {
        // Amplify deployed app - use current domain
        const domain = window.location.hostname;
        const protocol = window.location.protocol;
        apiUrl = `${protocol}//${domain}/api/register/`;
      } else {
        // Fallback for other environments
        apiUrl = `${window.location.protocol}//${window.location.host}/api/register/`;
      }
    }
    
    console.log('📡 API URL:', apiUrl);
    console.log('🌍 Current hostname:', window.location.hostname);
    
    xhr.open('POST', apiUrl);
    xhr.send(formData);
  });
}
