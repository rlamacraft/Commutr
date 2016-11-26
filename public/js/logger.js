var timestamp = require('timestamp');

// logging function with timestamp and a parameter for additional text
this.log = function (string) {
    console.log(Date(timestamp()) + ' - ' + string);
};