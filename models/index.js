
const mongoose = require("mongoose");
const req = require("express/lib/request");
mongoose.Promise = global.Promise;

const db = {};
db.mongoose = mongoose;
db.url = "mongodb://localhost:27017/userdb"
db.users = require("../models/user.model")(mongoose);
db.topics = require("../models/topic.model")(mongoose);
db.posts = require("../models/post.model")(mongoose);
db.comments = require("../models/comment.model")(mongoose);

module.exports = db;
