const mongoose = require("./index");  //  顶会议用户组件
const mongooseLeanVirtuals = require('mongoose-lean-virtuals');
const autoIncrement = require('mongoose-auto-increment');
autoIncrement.initialize(mongoose);

const Schema = mongoose.Schema;    //  创建模型
const userScheMa = new Schema({
    userName: String,
    password: String,
    userId: Number
}, { collection: "user", _id: false }); //  定义了一个新的模型，但是此模式还未和users集合有关联
userScheMa.plugin(mongooseLeanVirtuals);
userScheMa.plugin(autoIncrement.plugin, { model: 'user', field: 'userId' });
userScheMa.plugin(autoIncrement.plugin, 'user');

exports.user = mongoose.model('user', userScheMa , "user"); //  与users集合关联
exports.userScheMa = userScheMa
