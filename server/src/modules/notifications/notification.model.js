import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: false,
    },
    message: {
      type: String,
      required: [true, 'Message is required'],
      trim: true,
    },
    type: {
      type: String,
      required: [true, 'Notification type is required'],
      enum: ['Order', 'Reservation', 'Feedback', 'Review', 'System'],
      default: 'System',
    },
    read: {
      type: Boolean,
      default: false,
    },
    attachmentUrl: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

const Notification = mongoose.model('Notification', notificationSchema);

export default Notification;
