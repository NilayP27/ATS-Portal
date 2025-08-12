const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const userSchema = new mongoose.Schema(
  {
    username: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },

    // RBAC Role (From permissions matrix in doc)
    role: {
      type: String,
      enum: ["Project Initiator", "Recruiter Lead", "Recruiter", "Admin"],
      default: "Recruiter"
    },

    // Optional: for profile display
    department: { type: String },
    title: { type: String },

    // Password reset fields
    resetCode: String,
    resetCodeExpires: Date
  },
  { timestamps: true }
);

// Hash password before saving
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Compare password method
userSchema.methods.comparePassword = function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// To JSON without password
userSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.password;
  return obj;
};

module.exports = mongoose.model("User", userSchema);
