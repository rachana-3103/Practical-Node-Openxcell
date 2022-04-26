const express = require('express');
const app = express();
const bodyParser = require("body-parser");
const cors = require('cors');
app.use(bodyParser.json());
app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));

const db = require("./models");
require("./routes/route")(app);
require('dotenv').config();

db.mongoose
  .connect(db.url, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  })
  .then(() => {
    console.log("Connected to the database!");
  })
  .catch(err => {
    console.log("Cannot connect to the database!", err);
    process.exit();
  });

app.get('/', (req, res) => res.send('Notes App'));

app.listen(8080, () => console.log(`listening on port ${8080}`));