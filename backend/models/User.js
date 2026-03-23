import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: [true, 'Name is required'],
    trim: true,
    minlength: [2, 'Name must be at least 2 characters'],
    maxlength: [50, 'Name cannot exceed 50 characters']
  },
  phone: { 
    type: String, 
    required: [true, 'Phone number is required'],
    unique: true,
    validate: {
      validator: function(v) {
        return /^[6-9]\d{9}$/.test(v);
      },
      message: 'Please enter a valid 10-digit Indian mobile number'
    }
  },
  // For scalability: store PDF path instead of BLOB
  pdf_path: { 
    type: String,
    required: [true, 'PDF path is required']
  },
  // Optional: Keep small thumbnail in DB for quick preview
  thumbnail_data: { 
    type: Buffer,
    maxlength: [10 * 1024, 'Thumbnail must be less than 10KB']
  }
}, {
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
});

const User = mongoose.model('User', userSchema);

export default User;
