const mongoose = require('mongoose');

mongoose.Promise = Promise;

module.exports.User = require("./user");
module.exports.Task = require("./task");