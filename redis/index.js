const index = require('redis/index')
const client = index.createClient(6379, '127.0.0.1');
client.on('error', function (err) {
    console.log('Error ' + err);
});

module.exports = client
