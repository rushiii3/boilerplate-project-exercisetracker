const express = require('express')
const app = express()
const cors = require('cors')
const bodyparser = require("body-parser")
const mongoose = require("mongoose");
const Schema = mongoose.Schema
mongoose.connect("mongodb+srv://hrushiop:skvNaNiO6m1171TA@cluster0.k1r58yg.mongodb.net/certificate", { useNewUrlParser: true, useUnifiedTopology: true }).then(() => {
  console.log("Connected!");
})
  .catch((error) => {
    console.log(error);
  });
require('dotenv').config()
app.use(bodyparser.urlencoded({ extended: false }));
app.use(cors())
app.use(express.static('public'))

const UserSchema = new Schema({
  username: {
    type: String,
    required: true,
  }
})
const ExerciseSchema = new Schema({
  username: String,
  description: String,
  duration: Number,
  date: { type: Date, default: Date.now },
})
let User = mongoose.model("User", UserSchema);
let Exercise = mongoose.model("Exercise", ExerciseSchema);
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
});
app.post("/api/users", function (req, res) {
  const { username } = req.body;
  const saveUser = new User({
    username: username
  })
  saveUser.save().then((data) => {
    res.json(data);
  }).catch((err) => {
    res.json(err)
  })
})

app.get("/api/users", function (req, res) {
  User.find({}).then((data) => {
    res.json(data)
  }).catch((err) => {
    res.json(err)
  });

})

app.post("/api/users/:_id/exercises", function (req, res) {
  const { _id } = req.params;
  User.findById(_id).then((data) => {
    const saveExercise = new Exercise({
      username: data.username,
      description: req.body.description,
      duration: req.body.duration || new Date.now,
      date: req.body.date
    });
    saveExercise.save().then((response) => {
      res.json({
        username: data.username,
        description: response.description,
        duration: response.duration,
        date: response.date,
        _id: data._id
      });
    }).catch((err) => {
      res.json(err)
    })
  });
})
app.get("/api/users/:_id/logs", async function (req, res) {
  const { _id } = req.params;
  const user = await User.findById(_id);
  const userExercise = await Exercise.find({ username: user?.username });
  let log
  if (req.query.from || req.query.to || req.query.limit) {
    let filter = { 'username': user?.username };
    const fromDate = new Date(req.query.from);
    const toDate = new Date(req.query.to);
    const limit = Number(req.query.limit);
    if (fromDate.toString() === "Invalid Date") {
      return res.json({ "error": "Invalid Date" });
    } else {
      filter.date = { $gte: fromDate };
    }
    if (toDate.toString() === "Invalid Date") {
      return res.json({ "error": "Invalid Date" });
    } else {
      filter.date = { ...filter.date, $lte: toDate };
    }
    console.log(limit);
    if (limit) {
      console.log("limited");
      log = await Exercise.find(filter).limit(limit);
      
      return res.json(log)
    } else {
      console.log("unnlimited");
      log = await Exercise.find(filter);
      return res.json(log)
    }
  }
  log = userExercise.map((value) => {
    return ({
      description: value.description,
      duration: value.duration,
      date: value.date.toDateString(),
    })
  })
  // res.json({
  //   username: user?.username,
  //   count: userExercise?.length,
  //   _id: user._id,
  //   log: log
  // })
})
const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})
