const mongoose = require('mongoose');
const Schema = mongoose.Schema;

let feelingSchema = new Schema({
  date: {
    type: Date
  },
  level: {
    type: Number
  },
  comment: {
    type: String
  },
  userId: {
    type: String
  }
}, {
    collection: 'Feelings'
  })

module.exports = mongoose.model('feeling', feelingSchema)