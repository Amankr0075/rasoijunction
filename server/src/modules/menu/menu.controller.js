import MenuItem from './menu.model.js';
import { AppError } from '../../middleware/errorHandler.js';
import asyncHandler from '../../middleware/asyncHandler.js';

/**
 * @desc    Get all menu items with search, filter, and sorting
 * @route   GET /api/menu
 * @access  Public
 */
export const getMenuItems = asyncHandler(async (req, res) => {
  const { category, isVeg, isAvailable, search, sort, isTodaySpecial, isFeatured, limit = 50, page = 1 } = req.query;
  const query = {};

  if (category) query.category = category;
  if (isVeg !== undefined) query.isVeg = isVeg === 'true';
  if (isAvailable !== undefined) {
    query.isAvailable = isAvailable === 'true';
  } else {
    // By default, only show available items for public browsing
    // Unless requested by admin/staff
    if (req.user?.role !== 'admin' && req.user?.role !== 'manager' && req.user?.role !== 'staff') {
      query.isAvailable = true;
    }
  }
  if (isTodaySpecial !== undefined) query.isTodaySpecial = isTodaySpecial === 'true';
  if (isFeatured !== undefined) query.isFeatured = isFeatured === 'true';

  if (search) {
    query.$or = [
      { name: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } },
    ];
  }

  // Build sorting object
  let sortBy = { createdAt: -1 };
  if (sort) {
    if (sort === 'priceAsc') sortBy = { price: 1 };
    else if (sort === 'priceDesc') sortBy = { price: -1 };
    else if (sort === 'rating') sortBy = { 'ratings.average': -1 };
    else if (sort === 'prepTime') sortBy = { prepTime: 1 };
  }

  const skip = (parseInt(page) - 1) * parseInt(limit);

  const menuItems = await MenuItem.find(query)
    .sort(sortBy)
    .skip(skip)
    .limit(parseInt(limit));

  const total = await MenuItem.countDocuments(query);

  res.status(200).json({
    success: true,
    count: menuItems.length,
    pagination: {
      total,
      page: parseInt(page),
      limit: parseInt(limit),
      pages: Math.ceil(total / limit),
    },
    data: menuItems,
  });
});

/**
 * @desc    Get a single menu item
 * @route   GET /api/menu/:id
 * @access  Public
 */
export const getMenuItemById = asyncHandler(async (req, res) => {
  const menuItem = await MenuItem.findById(req.params.id);
  if (!menuItem) {
    throw new AppError('Menu item not found', 404);
  }

  res.status(200).json({
    success: true,
    data: menuItem,
  });
});

/**
 * @desc    Create a menu item
 * @route   POST /api/menu
 * @access  Admin/Manager
 */
export const createMenuItem = asyncHandler(async (req, res) => {
  const { name, description, price, category, image, isVeg, isAvailable, isTodaySpecial, isComboMeal, isFeatured, prepTime } = req.body;

  const existingItem = await MenuItem.findOne({ name });
  if (existingItem) {
    throw new AppError('A dish with this name already exists', 400);
  }

  const menuItem = await MenuItem.create({
    name,
    description,
    price,
    category,
    image,
    isVeg,
    isAvailable,
    isTodaySpecial,
    isComboMeal,
    isFeatured,
    prepTime,
  });

  res.status(201).json({
    success: true,
    message: 'Menu item created successfully',
    data: menuItem,
  });
});

/**
 * @desc    Update a menu item
 * @route   PUT /api/menu/:id
 * @access  Admin/Manager/Staff
 */
export const updateMenuItem = asyncHandler(async (req, res) => {
  const menuItem = await MenuItem.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  if (!menuItem) {
    throw new AppError('Menu item not found', 404);
  }

  res.status(200).json({
    success: true,
    message: 'Menu item updated successfully',
    data: menuItem,
  });
});

/**
 * @desc    Delete a menu item
 * @route   DELETE /api/menu/:id
 * @access  Admin/Manager
 */
export const deleteMenuItem = asyncHandler(async (req, res) => {
  const menuItem = await MenuItem.findByIdAndDelete(req.params.id);

  if (!menuItem) {
    throw new AppError('Menu item not found', 404);
  }

  res.status(200).json({
    success: true,
    message: 'Menu item deleted successfully',
  });
});
