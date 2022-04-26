const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const _ = require("lodash");
const {
  NO_TOKEN_PROVIDED,
  USER_NOT_AUTHORIZED,
} = require("../helpers/messages");

const User = require("../models/user.model");
const moment = require("moment");

exports.comparePassword = (paramPass, dbPass) => {
  const password = crypto.createHash("md5").update(paramPass).digest("hex");

  if (password === dbPass) {
    return true;
  }
  return false;
};

exports.passwordEncrypt = (password) => {
  const pwd = crypto.createHash("md5").update(password).digest("hex");
  return pwd;
};

exports.jwtSignUser = (user) => {
  const ONE_WEEK = process.env.AUTH_TOKEN_EXPIRED;
  return jwt.sign(user, process.env.JWT_SECRET, {
    expiresIn: ONE_WEEK,
  });
};

exports.authorization = async (req, res, next) => {
  const authToken = req.headers.token;
  const currentTime = moment().utc();

  if (!(req.headers && req.headers.token)) {
    res.status(401).send({ message: NO_TOKEN_PROVIDED });

  }
  const user = await User.findOne({ auth_token: authToken });
    if(!user){
      res.status(401).send({ message: USER_NOT_AUTHORIZED });
    } 

  // if (user && user.token_expired > currentTime) {
    return next();
  // }
};
