const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const commentSchema = new Schema(
  {
    comment: { type: String , required: true, },
    post_id:{type:String},
    user_id: { type: String },
    created_at: { type: Date, default: new Date() },
    updated_at: { type: Date, default: new Date() },
  },
  {
    versionKey: false,
  }
);

module.exports = mongoose.model("Comment", commentSchema);
