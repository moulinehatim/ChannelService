"use strict";

var express = require("express");

var router = express.Router(); // Item model

var myModule = require("../../models/Channel");

var Channel = myModule.Channel; // const UserSchema = myModule.UserSchema;
// const fetch = require('node-fetch');

var axios = require("axios"); //!@route GET api/channels = Get all channels (even by name)


router.get("/", function (req, res) {
  var name = req.body.name; //get all

  if (name == undefined || name == "") Channel.find().sort({
    date: -1
  }).then(function (channels) {
    return res.json(channels);
  }); //get all that start with the name in the body
  else Channel.find({
      name: {
        $regex: "^" + name
      }
    }).sort({
      date: -1
    }).then(function (channels) {
      return res.json(channels);
    });
}); //!@route GET api/channels = Get all MY channels by OWNER_ID

router.get("/mychannels/:id", function (req, res) {
  var id = req.params.id;
  Channel.find({
    "owner.id": id
  }).then(function (channel) {
    return res.json(channel);
  });
}); //!@route GET api/channels = Get The ONE channel by id

router.get("/:id", function (req, res) {
  var id = req.params.id;
  Channel.findOne({
    _id: id
  }).then(function (channel) {
    return res.json(channel);
  });
}); //!@route POST api/channels = Create a Post

router.post("/", function (req, res) {
  //sned request to straming service
  // const options = {
  //   method: 'POST',
  // };
  // await fetch('https://containerName/createchannel/'+req.body.owner.username, options)
  //   .then(response => streaminAnswer=response.json())
  //   .then(response => console.log(response))
  //   .catch(err => console.error(err));
  axios.post("http://127.0.0.1:5000/createchannel/" + req.body.owner.username).then(function (response) {
    console.log("statusCode: ".concat(response.status));
    console.log(response);
    console.log(response);
    console.log("yyyyyyyyyyyyy");

    if (response.statusText == "OK") {
      var newChannel = new Channel({
        //_id is set by default
        name: req.body.name,
        description: req.body.description,
        profilePictureURL: "test",
        //todo req.body.profilePictureURL,
        owner: req.body.owner,
        ingestEndpoint: response.data["ingestEndpoint"],
        playbackUrl: response.data["playbackUrl"],
        streamKey: response.data["streamKey"],
        subscribersList: [],
        //Empty when created, req.body.subscribersList,
        videoList: [] //Empty when created, req.body.videoList,
        //dateOfCreation is set by default in the model

      });
      newChannel.save().then(function (channel) {
        return res.json(channel);
      });
    }
  })["catch"](function (error) {
    console.error(error);
  }); //todo else
}); //!@route PUT api/channels/:id = Subscribe & Unsubscribe to a channel

router.put("/:id", function _callee(req, res) {
  var id, isSubscribing, user, doc;
  return regeneratorRuntime.async(function _callee$(_context) {
    while (1) {
      switch (_context.prev = _context.next) {
        case 0:
          //id of the channel
          id = req.params.id;
          isSubscribing = req.body.subscrib;
          console.log(isSubscribing);
          user = {
            id: req.body.userId,
            name: req.body.userName,
            email: req.body.userEmail
          };
          _context.next = 6;
          return regeneratorRuntime.awrap(Channel.findOne({
            _id: id
          }));

        case 6:
          doc = _context.sent;

          if (isSubscribing) {
            doc.subscribersList.push(user);
          } else {
            doc.subscribersList = doc.subscribersList.filter(function (element) {
              return element.get("id") != user.id;
            });
          }

          doc.save().then(function (channel) {
            return res.json(channel);
          }); //ou
          // const channel = await Channel.findOneAndUpdate(
          //   { _id: id },
          //   {
          //     subscribersList: doc.subscribersList
          //   },
          //   { new: true }
          // );
          // res.json(channel);

        case 9:
        case "end":
          return _context.stop();
      }
    }
  });
}); //!@route DELETE api/channels/:id = Delete a channel

router["delete"]("/:id", function (req, res) {
  //delete in streaming channel first
  axios["delete"]("http://127.0.0.1:5000/deletechannel/" + req.body.owner.username).then(function (response) {
    console.log("statusCode: ".concat(response.status));
    console.log(response);
    console.log(response);
    console.log("yyyyyyyyyyyyy");

    if (response.statusText == "OK") {
      if (streamingAnswer.data["isDeleted"]) {
        Channel.findById(req.params.id).then(function (channel) {
          return channel.remove().then(function () {
            return res.json({
              success: true
            });
          });
        })["catch"](function (err) {
          return res.status(404).json({
            success: false
          });
        });
      }
    }
  })["catch"](function (error) {
    console.error(error);
  }); //todo else
});
module.exports = router;