// API utility for registration
export async function registerUser(form) {
  const data = new FormData();
  data.append('name', form.name);
  data.append('phone', form.phone);
  data.append('photo', form.photo);

  const res = await fetch('http://localhost:4000/register', {
    method: 'POST',
    body: data,
  });
  if (!res.ok) throw new Error('Registration failed');
  return res.json();
}
