const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const userSchema = new Schema(
  {
    username: { type: String , required: true,},
    password: { type: String, required: true, },
    email: { type: String , required: true, trim: true,},
    auth_token: { type: String, default:null },
    token_expired: { type: String },
    created_at: { type: Date, default: new Date() },
    updated_at: { type: Date, default: new Date() },
  },
  {
    versionKey: false,
  }
);

module.exports = mongoose.model("User", userSchema);
