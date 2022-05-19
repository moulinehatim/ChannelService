"use strict";

function _readOnlyError(name) { throw new Error("\"" + name + "\" is read-only"); }

var express = require("express");

var router = express.Router(); // Item model

var myModule = require("../../models/Channel");

var Channel = myModule.Channel; // const UserSchema = myModule.UserSchema;
//!@route GET api/channels = Get all channels (even by name)

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

router.post("/", function _callee(req, res) {
  var streaminAnswer, options, _newChannel;

  return regeneratorRuntime.async(function _callee$(_context) {
    while (1) {
      switch (_context.prev = _context.next) {
        case 0:
          //sned request to straming service
          streaminAnswer = undefined;
          options = {
            method: 'POST'
          };
          _context.next = 4;
          return regeneratorRuntime.awrap(fetch('https://containerName/createchannel/' + req.body.owner.username, options).then(function (response) {
            return streaminAnswer = (_readOnlyError("streaminAnswer"), response.json());
          }).then(function (response) {
            return console.log(response);
          })["catch"](function (err) {
            return console.error(err);
          }));

        case 4:
          if (streaminAnswer.ok) {
            _newChannel = new Channel({
              //_id is set by default
              name: req.body.name,
              description: req.body.description,
              profilePictureURL: "test",
              //todo req.body.profilePictureURL,
              owner: req.body.owner,
              ingestEndpoint: streaminAnswer['ingestEndpoint'],
              playbackUrl: streaminAnswer.playbackUrl,
              streamKey: streaminAnswer.streamKey,
              subscribersList: [],
              //Empty when created, req.body.subscribersList,
              videoList: [] //Empty when created, req.body.videoList,
              //dateOfCreation is set by default in the model

            });
          } //todo else
          // res.setHeader({
          //   'Access-Control-Allow-Origin': '*'
          // })


          newChannel.save().then(function (channel) {
            return res.json(channel);
          });

        case 6:
        case "end":
          return _context.stop();
      }
    }
  });
}); //!@route PUT api/channels/:id = Subscribe & Unsubscribe to a channel

router.put("/:id", function _callee2(req, res) {
  var id, isSubscribing, user, doc;
  return regeneratorRuntime.async(function _callee2$(_context2) {
    while (1) {
      switch (_context2.prev = _context2.next) {
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
          _context2.next = 6;
          return regeneratorRuntime.awrap(Channel.findOne({
            _id: id
          }));

        case 6:
          doc = _context2.sent;

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
          return _context2.stop();
      }
    }
  });
}); //!@route DELETE api/channels/:id = Delete a channel

router["delete"]("/:id", function _callee3(req, res) {
  var streamingAnswer, options;
  return regeneratorRuntime.async(function _callee3$(_context3) {
    while (1) {
      switch (_context3.prev = _context3.next) {
        case 0:
          //delete in streaming channel first
          streamingAnswer = undefined;
          options = {
            method: 'DELETE'
          };
          _context3.next = 4;
          return regeneratorRuntime.awrap(fetch('https://containerName/deletechannel/' + req.body.owner.username, options).then(function (response) {
            return streamingAnswer = (_readOnlyError("streamingAnswer"), response.json());
          }).then(function (response) {
            return console.log(response);
          })["catch"](function (err) {
            return console.error(err);
          }));

        case 4:
          if (streamingAnswer["isDeleted"]) {
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
          } //todo else


        case 5:
        case "end":
          return _context3.stop();
      }
    }
  });
});
module.exports = router;