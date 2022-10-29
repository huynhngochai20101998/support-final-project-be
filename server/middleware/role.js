const ROLES = {
    Admin: 'ROLE_ADMIN',
    Customer: 'ROLE_MEMBER',
    Merchant: 'ROLE_MERCHANT'
  };
  
  const checkRole = (...roles) => (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success : false,
        message : 'Unauthorized',
        data : null
      });
    }
  
    const hasRole = roles.find(role => req.user.role === role);
    if (!hasRole) {
      return res.status(403).json({
        success : false,
        message : 'You are not allowed to make this request',
        data : null
      });
    }
  
    return next();
  };
  
  const role = { ROLES, checkRole };
  
  module.exports = role;