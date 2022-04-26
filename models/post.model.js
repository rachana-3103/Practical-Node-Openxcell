const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const postSchema = new Schema(
  {
    title: { type: String, required: true, },
    description: {type: String},
    topic_id:{type:String},
    user_id: { type: String },
    created_at: { type: Date, default: new Date() },
    updated_at: { type: Date, default: new Date() },
  },
  {
    versionKey: false,
  }
);

module.exports = mongoose.model("Post", postSchema);
