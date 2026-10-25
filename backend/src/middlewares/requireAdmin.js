const adminRepository = require('../repositories/adminRepository');

const allowedRoles = new Set(['super_admin', 'admin', 'editor']);

module.exports = async (req, res, next) => {
  const { id } = req.user || {};
  if (!id) {
    return res.status(401).json({
      success: false,
      data: null,
      error: 'Access token không hợp lệ',
      timestamp: new Date().toISOString(),
    });
  }

  try {
    const admin = await adminRepository.findById(id);
    if (!admin || admin.is_active !== true) {
      return res.status(403).json({
        success: false,
        data: null,
        error: 'Không có quyền truy cập',
        timestamp: new Date().toISOString(),
      });
    }

    if (!allowedRoles.has(admin.role)) {
      return res.status(403).json({
        success: false,
        data: null,
        error: 'Không có quyền truy cập',
        timestamp: new Date().toISOString(),
      });
    }

    return next();
  } catch (error) {
    return next(error);
  }
};
