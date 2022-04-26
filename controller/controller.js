const User = require("../models/user.model");
const Topic = require("../models/topic.model");
const Post = require("../models/post.model");
const Comment = require("../models/comment.model");
const EmailTemplates = require("email-templates");
const path = require("path");
const { sendMail } = require("../helpers/smtp");
const {
  USER_NOT_EMPTY,
  USER_NOT_FOUND,
  INVALID_UNAME_PWORD,
  TOPIC_NOT_FOUND,
  POST_NOT_FOUND,
  PASSWORD_NOT_EMPTY,
  EMAIL_IS_EMPTY,
  TOPIC_IS_EMPTY,
  TITLE_IS_EMPTY,
  COMMENT_IS_EMPTY
} = require("../helpers/messages");

const moment = require("moment");
const {
  comparePassword,
  jwtSignUser,
  passwordEncrypt,
} = require("../helpers/helper");

exports.signup = async (req, res) => {
  try {
    if (!req.body.username) {
      return res.status(400).send({ message: USER_NOT_EMPTY });
    }
    if (!req.body.password) {
      return res.status(400).send({ message: PASSWORD_NOT_EMPTY });
    }
    if (!req.body.email) {
      return res.status(400).send({ message: EMAIL_IS_EMPTY });
    }
    const password = await passwordEncrypt(req.body.password);
    const user = new User({
      username: req.body.username,
      password: password,
      email: req.body.email,
      token_expired: null,
    });
    await user.save(user);
    res.send({
      message: "User Register Successfully",
    });

    const templatesDir = path.resolve(__dirname, "..");
    const emailContent = new EmailTemplates({ views: { root: templatesDir } });
    const mailObj = {
      message: "User Register Successfully!",
      Name: req.body.username,
    };
    const subject = "Register Successfully";
    const body = await emailContent.render("templates/user/user.ejs", mailObj);

    sendMail(req.body.email, subject, body);
  } catch (error) {
    res.send(error);
  }
};

exports.login = async (req, res) => {
  try {
    const param = req.body;
    if (!param.username) {
     return res.status(400).send({ message: USER_NOT_EMPTY });
    }
    if (!param.password) {
      return res.status(400).send({ message: PASSWORD_NOT_EMPTY });
    }
    const user = await User.findOne({ username: param.username });
    if (!user) {
      res.status(400).send({ message: USER_NOT_FOUND });
    }
    const password = comparePassword(param.password, user.password);

    if (!password) {
      res.status(400).send({ message: INVALID_UNAME_PWORD });
    }
    const tokenExpireIn = moment()
      .add(process.env.AUTH_TOKEN_EXPIRED, "minutes")
      .unix();
    const generatedToken = jwtSignUser({ _id: user._id, email: user.Email });
    await User.updateOne(
      {
        _id: user._id,
      },
      {
        $set: {
          auth_token: generatedToken,
          token_expired: tokenExpireIn,
        },
      }
    );
    let response = {
      username: user.username,
      email: user.email,
      auth_token: generatedToken,
    };

    res.send({
      message: "User Login Successfully",
      user: response,
    });
  } catch (error) {
    res.send(error);
  }
};

exports.createTopic = async (req, res) => {
  try {
    const param = req.body;
    const user = await User.findOne({ auth_token: req.headers.token });
    if (!param.topicName) {
      return res.status(400).send({ message: TOPIC_IS_EMPTY });
    }
    const topic = new Topic({
      topic_name: param.topicName,
      topic_description: param.topicDescription,
      user_id: user._id,
    });
    await topic.save(topic);
    res.send({
      message: "Topic Created Successfully",
      Topic: topic,
    });
  } catch (error) {
    console.log(error);
    res.send(error);
  }
};

exports.createPost = async (req, res) => {
  try {
    const param = req.body;
    const topicId = req.params.topicId;
    const user = await User.findOne({ auth_token: req.headers.token });
    const topic = await Topic.findOne({ _id: topicId });
    if (!topic) {
      res.status(400).send({ message: TOPIC_NOT_FOUND });
    }
    if (!param.title) {
      return res.status(400).send({ message: TITLE_IS_EMPTY });
    }
    const post = new Post({
      title: param.title,
      description: param.description,
      user_id: user._id,
      topic_id: topic._id,
    });
    await post.save(post);
    res.send({
      message: "Post Created Successfully",
      Post: post,
    });
  } catch (error) {
    console.log(error);
    res.send(error);
  }
};

exports.createComment = async (req, res) => {
  try {
    const param = req.body;
    const postId = req.params.postId;
    const user = await User.findOne({ auth_token: req.headers.token });
    const post = await Post.findOne({ _id: postId });
    if (!post) {
      res.status(400).send({ message: POST_NOT_FOUND });
    }
    if (!param.comment) {
      return res.status(400).send({ message: COMMENT_IS_EMPTY });
    }
    const comment = new Comment({
      comment: param.comment,
      user_id: user._id,
      post_id: post._id,
    });
    await comment.save(comment);
    res.send({
      message: "Comment Created Successfully",
    });
  } catch (error) {
    console.log(error);
    res.send(error);
  }
};

exports.listTopics = async (req, res) => {
  try {
    let page = parseInt(req.query.PageNo) || 1;
    let maxRecords = parseInt(req.query.Rows) || 10;
    const pageNumber = (parseInt(page) - 1) * parseInt(maxRecords);
    let result = await Topic.aggregate([
      {
        $project: {
          _id: {
            $toString: "$_id",
          },
          topic_name: 1,
          user_id: 1,
          topic_description: 1,
          created_at: 1,
          updated_at: 1,
        },
      },
      {
        $facet: {
          Summary: [
            { $count: "TotalRecords" },
            { $addFields: { Page: parseInt(page) } },
          ],
          Records: [
            { $skip: pageNumber },
            { $limit: parseInt(maxRecords, 10) },
          ],
        },
      },
    ]);
    res.send({
      message: "Topic List:",
      data: result,
    });
  } catch (error) {
    console.log(error);
    res.send(error);
  }
};

exports.listPosts = async (req, res) => {
  try {
    let page = parseInt(req.query.PageNo) || 1;
    let maxRecords = parseInt(req.query.Rows) || 10;
    const pageNumber = (parseInt(page) - 1) * parseInt(maxRecords);
    let result = await Post.aggregate([
      {
        $project: {
          _id: {
            $toString: "$_id",
          },
          title: 1,
          description: 1,
          topic_id: 1,
          user_id: 1,
          created_at: 1,
          updated_at: 1,
        },
      },
      {
        $lookup: {
          from: "comments",
          localField: "_id",
          foreignField: "post_id",
          as: "comments",
        },
      },
      {
        $facet: {
          Summary: [
            { $count: "TotalRecords" },
            { $addFields: { Page: parseInt(page) } },
          ],
          Records: [
            { $skip: pageNumber },
            { $limit: parseInt(maxRecords, 10) },
          ],
        },
      },
    ]);
    res.send({
      message: "Post List:",
      data: result,
    });
  } catch (error) {
    console.log(error);
    res.send(error);
  }
};