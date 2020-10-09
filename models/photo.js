const mongoose = require('mongoose');

var photoSchema = new mongoose.Schema({
    img: {
        data: Buffer,
        Type: String
    }
});

var Photo = mongoose.model("Photo", photoSchema);

module.exports = Photo;