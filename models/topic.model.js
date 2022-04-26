const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const topicSchema = new Schema(
  {
    topic_name: { type: String, required: true, },
    topic_description: {type: String},
    user_id: { type: String },
    created_at: { type: Date, default: new Date() },
    updated_at: { type: Date, default: new Date() },
  },
  {
    versionKey: false,
  }
);

module.exports = mongoose.model("Topic", topicSchema);
