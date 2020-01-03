const mongoose = require("./index");  //  顶会议用户组件

const mongooseLeanVirtuals = require('mongoose-lean-virtuals');
const autoIncrement = require('mongoose-auto-increment');
autoIncrement.initialize(mongoose);

var Schema = mongoose.Schema;    //  创建模型
var testScheMa = new Schema({
    userId: {type: Number, ref: 'user'},
    likeStatus: Boolean
}, { collection: "test", _id: false }); //  定义了一个新的模型，test
testScheMa.plugin(mongooseLeanVirtuals);
testScheMa.plugin(autoIncrement.plugin, 'test');

exports.test = mongoose.model('test', testScheMa, 'test'); //  test
