import mongoose from 'mongoose';

const menuItemSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Dish name is required'],
      unique: true,
      trim: true,
      minlength: [2, 'Dish name must be at least 2 characters'],
      maxlength: [100, 'Dish name cannot exceed 100 characters'],
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      trim: true,
    },
    price: {
      type: Number,
      required: [true, 'Price is required'],
      min: [0, 'Price cannot be negative'],
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      enum: ['North Indian', 'South Indian', 'Chinese', 'Italian', 'Desserts', 'Beverages'],
    },
    image: {
      type: String,
      required: [true, 'Image URL is required'],
    },
    isVeg: {
      type: Boolean,
      default: true,
    },
    isAvailable: {
      type: Boolean,
      default: true,
    },
    isTodaySpecial: {
      type: Boolean,
      default: false,
    },
    isComboMeal: {
      type: Boolean,
      default: false,
    },
    isFeatured: {
      type: Boolean,
      default: false,
    },
    prepTime: {
      type: Number,
      default: 15, // prep time in minutes
      min: [1, 'Preparation time must be at least 1 minute'],
    },
    ratings: {
      average: {
        type: Number,
        default: 5,
        min: [1, 'Rating must be at least 1'],
        max: [5, 'Rating cannot exceed 5'],
      },
      count: {
        type: Number,
        default: 0,
      },
    },
  },
  {
    timestamps: true,
  }
);

menuItemSchema.index({ category: 1 });
menuItemSchema.index({ isAvailable: 1 });
menuItemSchema.index({ isTodaySpecial: 1 });
menuItemSchema.index({ isFeatured: 1 });

const MenuItem = mongoose.model('MenuItem', menuItemSchema);

export default MenuItem;
