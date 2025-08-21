// Define allowed actions for each role based on your doc
const permissions = {
  "Project Initiator": ["create_project", "edit_project", "delete_project"],
  "Recruiter Lead": ["assign_recruiters", "manage_candidates"],
  "Recruiter": ["manage_candidates"],
  "Admin": [
    "create_project", "edit_project", "delete_project",
    "assign_recruiters", "manage_candidates"
  ]
};

module.exports = function (requiredPermission) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    const role = req.user.role;
    if (!permissions[role] || !permissions[role].includes(requiredPermission)) {
      return res.status(403).json({ message: "Access Denied" });
    }

    next();
  };
};
module.exports.checkRole = (allowedRoles) => {
  return (req, res, next) => {
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Access denied: insufficient permissions' });
    }
    next();
  };
};
