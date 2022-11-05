const bcryptjs = require("bcryptjs");
var salt = bcryptjs.hashSync("hej", 8);

console.log(salt);
