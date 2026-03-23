// API utility for registration with progress and retry logic
export async function registerUser(form, onProgress) {
  const data = new FormData();
  data.append('name', form.name);
  data.append('phone', form.phone);
  data.append('photo', form.photo);

  const maxRetries = 3;
  let retryCount = 0;

  const attemptUpload = async () => {
    try {
      // Create XMLHttpRequest for progress tracking
      return await new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        
        // Track upload progress
        if (onProgress && typeof onProgress === 'function') {
          xhr.upload.addEventListener('progress', (event) => {
            if (event.lengthComputable) {
              const percentComplete = Math.round((event.loaded / event.total) * 100);
              onProgress(percentComplete, event.loaded, event.total);
            }
          });
        }

        xhr.addEventListener('load', () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            try {
              const response = JSON.parse(xhr.responseText);
              resolve(response);
            } catch (parseError) {
              reject(new Error('Invalid response format'));
            }
          } else {
            try {
              const errorData = JSON.parse(xhr.responseText);
              reject(new Error(errorData.error || `HTTP ${xhr.status}: ${xhr.statusText}`));
            } catch (parseError) {
              reject(new Error(`HTTP ${xhr.status}: ${xhr.statusText}`));
            }
          }
        });

        xhr.addEventListener('error', () => {
          reject(new Error('Network error - failed to connect to server'));
        });

        xhr.addEventListener('timeout', () => {
          reject(new Error('Request timeout - please try again'));
        });

        // Configure request
        xhr.timeout = 30000; // 30 seconds timeout
        xhr.open('POST', 'http://localhost:4000/register');
        xhr.send(data);
      });
    } catch (error) {
      // Retry logic for network errors
      if (retryCount < maxRetries && 
          (error.message.includes('Network') || 
           error.message.includes('timeout') || 
           error.message.includes('fetch'))) {
        retryCount++;
        console.log(`Retrying upload attempt ${retryCount}/${maxRetries}...`);
        
        // Wait before retry (exponential backoff)
        await new Promise(resolve => setTimeout(resolve, Math.pow(2, retryCount) * 1000));
        
        return attemptUpload();
      }
      
      throw error;
    }
  };

  try {
    return await attemptUpload();
  } catch (error) {
    // Enhanced error messages
    if (error.message.includes('Network')) {
      throw new Error('Network error - please check your internet connection and try again');
    } else if (error.message.includes('timeout')) {
      throw new Error('Request timed out - please try again');
    } else if (retryCount >= maxRetries) {
      throw new Error(`Failed after ${maxRetries} attempts - please try again later`);
    } else {
      throw error;
    }
  }
}
