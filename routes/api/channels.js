const express = require("express");
const router = express.Router();
// Item model
const myModule = require("../../models/Channel");
const Channel = myModule.Channel;
// const UserSchema = myModule.UserSchema;

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
router.post("/", async (req, res) => {
  //sned request to straming service
  const streaminAnswer = undefined;

  const options = {
    method: 'POST',
  };
  
  await fetch('https://containerName/createchannel/'+req.body.owner.username, options)
    .then(response => streaminAnswer=response.json())
    .then(response => console.log(response))
    .catch(err => console.error(err));

  if(streaminAnswer.ok){
    const newChannel = new Channel({
      //_id is set by default
      name: req.body.name,
      description: req.body.description,
      profilePictureURL: "test", //todo req.body.profilePictureURL,
      owner: req.body.owner,
      ingestEndpoint:streaminAnswer['ingestEndpoint'],
      playbackUrl:streaminAnswer.playbackUrl,
      streamKey:streaminAnswer.streamKey,
      subscribersList: [], //Empty when created, req.body.subscribersList,
      videoList: [], //Empty when created, req.body.videoList,
      //dateOfCreation is set by default in the model
    });
  } //todo else
  
  // res.setHeader({
  //   'Access-Control-Allow-Origin': '*'
  // })
  newChannel.save().then((channel) => res.json(channel));
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
router.delete("/:id", async (req, res) =>  {

  //delete in streaming channel first
  const streamingAnswer = undefined;

  const options = {
    method: 'DELETE',
  };
  
  await fetch('https://containerName/deletechannel/'+req.body.owner.username, options)
    .then(response => streamingAnswer=response.json())
    .then(response => console.log(response))
    .catch(err => console.error(err));

  if(streamingAnswer["isDeleted"]){
    Channel.findById(req.params.id)
    .then((channel) => channel.remove().then(() => res.json({ success: true })))
    .catch((err) => res.status(404).json({ success: false }));
  }
  //todo else
  
});

module.exports = router;
