const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const UserSchema = new Schema({
    name: String,
    email: String,
    password: String,
    token: { type: String, required: false },
    picture: {type: Object, required: false},
    following: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    notifications: [{ type: String }],
}); 

module.exports = mongoose.model('User', UserSchema);