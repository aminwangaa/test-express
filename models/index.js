const mongoose = require('mongoose');

mongoose.connect(
    'mongodb://localhost:27017/users',
    {
        useNewUrlParser: true, //使用新的url解析器
        useUnifiedTopology: true
    }
);

module.exports = mongoose
