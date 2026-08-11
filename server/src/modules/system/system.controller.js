import asyncHandler from '../../middleware/asyncHandler.js';

// @desc    Get system maintenance status
// @route   GET /api/system/maintenance/status
// @access  Public
export const getMaintenanceStatus = asyncHandler(async (req, res) => {
  res.status(200).json({
    success: true,
    isMaintenanceMode: !!global.isMaintenanceMode,
  });
});

// @desc    Toggle system maintenance mode
// @route   POST /api/system/maintenance/toggle
// @access  Admin/Manager
export const toggleMaintenanceMode = asyncHandler(async (req, res) => {
  const { enabled } = req.body;
  
  global.isMaintenanceMode = enabled === true;
  
  res.status(200).json({
    success: true,
    message: global.isMaintenanceMode 
      ? 'System is now in Maintenance Mode. Normal traffic is blocked.' 
      : 'Maintenance Mode disabled. System is operating normally.',
    isMaintenanceMode: global.isMaintenanceMode,
  });
});
