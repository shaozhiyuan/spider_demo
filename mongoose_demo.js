const mongoose = require('mongoose');

mongoose.Promise = Promise;
const Schema = mongoose.Schema;
const ObjectId = Schema.Types.ObjectId;

const uri = `mongodb://localhost:27017/what-i-love`;
const connection = mongoose.connect(uri);
const db = mongoose.connection;

const UserSchema = new Schema({
    name: {type: String, required: true, unique: true },
    age: {type: Number, Max: 188, min: 0}
});

const UserModel = mongoose.model('user', UserSchema);
(async () => {
    const users = await UserModel.find({}).select();
    return users
})().then(r => {
    console.log(1,r)
}).catch(e => {
    console.log(2,e)
});

db.on('open', () => {
    console.log('connect');
});

db.on('error', (e) => {
    console.log(e);
});