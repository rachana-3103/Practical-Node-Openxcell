module.exports = app => {
    const users = require("../controller/controller");
    const {authorization} = require("../helpers/helper");

    var router = require("express").Router();
  
    router.post("/signup", users.signup);
    router.post("/login", users.login);
    router.post("/topic", authorization, users.createTopic);
    router.post('/topic/:topicId/post', authorization,users.createPost);
    router.post('/post/:postId/comment', authorization,users.createComment);
    router.get('/topics', authorization,users.listTopics);
    router.get('/posts', authorization,users.listPosts);

    app.use('/api/users', router);

  };