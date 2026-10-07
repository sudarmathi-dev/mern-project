const Notification = require("../models/Notification");
const { emitToUser } = require("./socket");

// Creates a notification and pushes it live to the recipient if online.
// Skips creating a notification if the user is notifying themselves.
const createNotification = async ({ recipient, sender, type, post }) => {
  if (recipient.toString() === sender.toString()) return null;

  const notification = await Notification.create({ recipient, sender, type, post });
  const populated = await notification.populate("sender", "username profilePic");

  emitToUser(recipient, "newNotification", populated);

  return populated;
};

module.exports = { createNotification };
