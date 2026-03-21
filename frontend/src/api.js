// API utility for registration
export async function registerUser(form) {
  const data = new FormData();
  data.append('name', form.name);
  data.append('phone', form.phone);
  data.append('photo', form.photo);

  try {
    const res = await fetch('http://localhost:4000/register', {
      method: 'POST',
      body: data,
    });
    
    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(errorData.error || `HTTP ${res.status}: ${res.statusText}`);
    }
    
    return res.json();
  } catch (error) {
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      throw new Error('Network error - please check if the backend server is running');
    }
    throw error;
  }
}
