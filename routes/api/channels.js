const express = require("express");
const router = express.Router();
// Item model
const myModule = require("../../models/Channel");
const Channel = myModule.Channel;
// const UserSchema = myModule.UserSchema;
// const fetch = require('node-fetch');
const axios = require("axios");

//!@route GET api/channels = Get all channels (even by name)
router.get("/", (req, res) => {
  const name = req.body.name;
  //get all
  if (name == undefined || name == "")
    Channel.find()
      .sort({ date: -1 })
      .then((channels) => res.json(channels));
  //get all that start with the name in the body
  else
    Channel.find({
      name: { $regex: "^" + name },
    })
      .sort({ date: -1 })
      .then((channels) => res.json(channels));
});

//!@route GET api/channels = Get all MY channels by OWNER_ID
router.get("/mychannels/:id", (req, res) => {
  const id = req.params.id;
  Channel.find({
    "owner.id": id,
  }).then((channel) => res.json(channel));
});

//!@route GET api/channels = Get The ONE channel by id
router.get("/:id", (req, res) => {
  const id = req.params.id;
  Channel.findOne({
    _id: id,
  }).then((channel) => res.json(channel));
});

//!@route POST api/channels = Create a Post
router.post("/", (req, res) => {
  //sned request to straming service

  // const options = {
  //   method: 'POST',
  // };

  // await fetch('https://containerName/createchannel/'+req.body.owner.username, options)
  //   .then(response => streaminAnswer=response.json())
  //   .then(response => console.log(response))
  //   .catch(err => console.error(err));

  axios
    .post("http://127.0.0.1:5000/createchannel/" + req.body.owner.username)
    .then((response) => {
      console.log(`statusCode: ${response.status}`);
      console.log(response);

      console.log(response);
      console.log("yyyyyyyyyyyyy");
      if (response.statusText == "OK") {
        const newChannel = new Channel({
          //_id is set by default
          name: req.body.name,
          description: req.body.description,
          profilePictureURL: "test", //todo req.body.profilePictureURL,
          owner: req.body.owner,
          ingestEndpoint: response.data["ingestEndpoint"],
          playbackUrl: response.data["playbackUrl"],
          streamKey: response.data["streamKey"],
          subscribersList: [], //Empty when created, req.body.subscribersList,
          videoList: [], //Empty when created, req.body.videoList,
          //dateOfCreation is set by default in the model
        });
        newChannel.save().then((channel) => res.json(channel));
      }
    })
    .catch((error) => {
      console.error(error);
    });

  //todo else
});

//!@route PUT api/channels/:id = Subscribe & Unsubscribe to a channel
router.put("/:id", async (req, res) => {
  //id of the channel
  const id = req.params.id;
  const isSubscribing = req.body.subscrib;
  console.log(isSubscribing);
  const user = {
    id: req.body.userId,
    name: req.body.userName,
    email: req.body.userEmail,
  };
  const doc = await Channel.findOne({ _id: id });
  if (isSubscribing) {
    doc.subscribersList.push(user);
  } else {
    doc.subscribersList = doc.subscribersList.filter(
      (element) => element.get("id") != user.id
    );
  }
  doc.save().then((channel) => res.json(channel));
  //ou
  // const channel = await Channel.findOneAndUpdate(
  //   { _id: id },
  //   {
  //     subscribersList: doc.subscribersList
  //   },
  //   { new: true }
  // );
  // res.json(channel);
});

//!@route DELETE api/channels/:id = Delete a channel
router.delete("/:id", (req, res) => {
  //delete in streaming channel first

  const headers = { 
    'role': 'user',
    'username': "hatimmoydydtf"
};

  axios
    .delete("http://127.0.0.1:5000/deletechannel/" + req.body.owner.username, { headers })
    .then((response) => {
      console.log(`statusCode: ${response.status}`);
      console.log(response);

      console.log(response);
      console.log("yyyyyyyyyyyyy");
      if (response.statusText == "OK") {
        if (streamingAnswer.data["isDeleted"]) {
          Channel.findById(req.params.id)
            .then((channel) =>
              channel.remove().then(() => res.json({ success: true }))
            )
            .catch((err) => res.status(404).json({ success: false }));
        }
      }
    })
    .catch((error) => {
      console.error(error);
    });

  //todo else
});

module.exports = router;
