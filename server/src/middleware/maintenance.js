export const maintenanceMiddleware = (req, res, next) => {
  if (global.isMaintenanceMode && global.maintenanceEndTime) {
    if (Date.now() > global.maintenanceEndTime) {
      // Auto-disable maintenance mode
      global.isMaintenanceMode = false;
      global.maintenanceEndTime = null;
      return next();
    }
  }

  // If maintenance mode is off, proceed normally
  if (!global.isMaintenanceMode) {
    return next();
  }

  // Bypass maintenance mode if the requester is an admin OR has special access
  if (req.user && (req.user.role === 'admin' || req.user.hasMaintenanceAccess)) {
    return next();
  }

  // Whitelist certain paths so admins can still login and toggle maintenance off
  const whitelistedPaths = [
    '/api/system/maintenance/toggle',
    '/api/system/maintenance/status',
    '/api/auth/login',
    '/api/auth/me',
    '/api/auth/refresh-token'
  ];

  // Check if the current request path is strictly in the whitelist
  if (whitelistedPaths.some(path => req.path === path)) {
    return next();
  }

  // Otherwise, block the request
  return res.status(503).json({
    success: false,
    message: 'System is currently under maintenance. We will be back shortly.',
  });
};
