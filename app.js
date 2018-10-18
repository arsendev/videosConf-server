/* =======================
    LOAD THE DEPENDENCIES
==========================*/
const express = require('express');
const router = express.Router();
const bodyParser = require('body-parser');
const morgan = require('morgan');
const mongoose = require('mongoose');
const cors = require('cors');
const Room = require('./model/RoomList');
/* =======================
    LOAD THE CONFIG
==========================*/
const config = require('./config')
const port = process.env.PORT || 8000

/* =======================
    EXPRESS CONFIGURATION
==========================*/
const app = express()

// parse JSON and url-encoded query
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())
app.use(cors());

// print the request log on console
app.use(morgan('dev'))
app.use('/', router);
app.set('json spaces', 2);
// set the secret key variable for jwt
app.set('jwt-secret', config.secret)

// index page, just for testing
router.get('/', (req, res) => {
  Room.find((err, data) => {
    if (err) {
      res.status(500).json({
        message: 'Error'
      })
    } else {
      res.json(data)
    }
  });
});

router.route('/rooms').post((req, res) => {
  let {
    title,
    userName,
    userMail
  } = req.body;

  const newRoom = new Room({
    title,
    userName,
    userMail
  });

  newRoom.save((err, roomsData) => {
    if (err) {
      res.status(500).json({
        message: 'error'
      })
    } else {
      res.json({ message: "success" });
    }
  });
});

router.route('/update').post((req, res) => {
  let {
    title,
    userName,
    userMail
  } = req.body;
  Room.findOne({ 'userMail': userMail }, function (err, user) {
    if (err) {
      console.log(err);
      res.status(500).send('update error');
      return;
    }
    user.title = title;
    user.userName = userName;
    user.save(function (err, silence) {
      if (err) {
        console.log(err);
        res.status(500).send('update error');
        return;
      }
      res.status(200).send("Updated");
    });
  });
});


app.delete('/rooms/:id', function (req, res) {
  const { id } = req.body;
  Room.findOneAndDelete({ _id: id }, function (err) {
    if (err) {
      res.send(err);
    } else {
      res.json({ message: 'Offer Deleted!' })
    }
  })
});

// configure api router
app.use('/api', require('./routes/api'))

// open the server
app.listen(port, () => {
  console.log(`Express is running on port ${port}`)
})

/* =======================
    CONNECT TO MONGODB SERVER
==========================*/
mongoose.connect(config.mongodbUri)
const db = mongoose.connection
db.on('error', console.error)
db.once('open', () => {
  console.log('connected to mongodb server')
})