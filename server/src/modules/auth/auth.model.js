import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      minlength: [2, 'Name must be at least 2 characters'],
      maxlength: [50, 'Name cannot exceed 50 characters'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email'],
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [6, 'Password must be at least 6 characters'],
      select: false, // Never return password by default
    },
    phone: {
      type: String,
      trim: true,
      match: [/^[6-9]\d{9}$/, 'Please enter a valid 10-digit Indian phone number'],
    },
    role: {
      type: String,
      enum: ['customer', 'admin', 'manager', 'staff', 'chef', 'delivery'],
      default: 'customer',
    },
    avatar: {
      type: String,
      default: '',
    },
    address: {
      street: { type: String, default: '' },
      city: { type: String, default: '' },
      state: { type: String, default: '' },
      pincode: { type: String, default: '' },
      landmark: { type: String, default: '' },
    },
    employeeId: {
      type: String,
      unique: true,
      sparse: true,
    },
    staffDetails: {
      salary: { type: Number, default: 0 },
      rating: { type: Number, default: 0 },
      attendance: [{
        date: { type: Date, required: true },
        status: { type: String, enum: ['Present', 'Absent', 'Half-Day', 'Leave'], required: true }
      }],
      customersServed: { type: Number, default: 0 },
      joinDate: { type: Date, default: Date.now },
      salaryPaid: { type: Boolean, default: false },
      paymentMethod: { type: String, enum: ['Cash', 'UPI', 'Bank Transfer', 'Cheque', ''], default: '' },
      salaryPayments: [{
        month: { type: Number, required: true },   // 0-11
        year:  { type: Number, required: true },
        amount: { type: Number, required: true },
        paymentMethod: { type: String, default: '' },
        paidAt: { type: Date, default: Date.now },
      }],
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    isBlocked: {
      type: Boolean,
      default: false,
    },
    refreshToken: {
      type: String,
      select: false,
    },
    loyaltyPoints: {
      type: Number,
      default: 0,
    },
    favorites: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'MenuItem',
      },
    ],
    resetPasswordToken: String,
    resetPasswordExpire: Date,
    resetPasswordOtp: String,
    resetPasswordOtpExpire: Date,
    emailVerificationToken: String,
    emailVerificationExpire: Date,
    registrationOtp: String,
    registrationOtpExpire: Date,
    lastLogin: Date,
    lastIpAddress: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Index for faster queries
userSchema.index({ role: 1 });

// Hash password before saving and generate employeeId
userSchema.pre('save', async function (next) {
  // Generate employeeId for staff if not present
  if (this.role && this.role !== 'customer' && !this.employeeId) {
    let isUnique = false;
    while (!isUnique) {
      const randomNum = Math.floor(100000 + Math.random() * 900000);
      const generatedId = `RJ${randomNum}`;
      const existing = await mongoose.models.User.findOne({ employeeId: generatedId });
      if (!existing) {
        this.employeeId = generatedId;
        isUnique = true;
      }
    }
  }

  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Compare password method
userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Virtual for full address
userSchema.virtual('fullAddress').get(function () {
  const { street, city, state, pincode } = this.address || {};
  return [street, city, state, pincode].filter(Boolean).join(', ');
});

const User = mongoose.model('User', userSchema);

export default User;
