import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  phone: { type: String, required: true },
  photo_path: { type: String, required: true },
  pdf_path: { type: String },
});

const User = mongoose.model('User', userSchema);

export default User;
