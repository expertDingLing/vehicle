var mysql = require('mysql');
// var con = mysql.createConnection({
//     host: "192.168.1.153",
//     user: "root",
//     password: ""
// });

// con.connect(function(err) {
//     if (err) throw err;
//     console.log("Connected!");
//     con.query("CREATE DATABASE 591chat1", function (err, result) {
//         if (err) {
//             console.log("Already exist");
//         } else {
//             console.log("Database created");
//         }
//     });
// });

var connection = mysql.createPool({
    host: 'localhost',//'localhost',//'192.168.1.153',
    user: 'root',
    password: '',
    // password: 'RobAndHana@2020',
    database: 'vehicles'
});
console.log("db connections---------------");
module.exports = connection;