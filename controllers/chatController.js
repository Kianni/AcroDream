const Message = require("../models/message");

module.exports = io => {
  io.on("connection", client => {
    //console.log("new connection");

    Message.find({})
      .sort({ createdAt: -1 })
      .limit(10)
      .then(messages => {
        client.emit("load all messages", messages.reverse());
      });

  client.on("viesti", (data) => {
      let messageAttributes = {
        content: data.content,
        userName: data.userName,
        user: data.userId
      },
      m = new Message(messageAttributes);
      m.save()
        .then(() => {
            io.emit("viesti", messageAttributes);
        })
        .catch(error => console.log(`error: ${error.message}`));



    });

  });
};
