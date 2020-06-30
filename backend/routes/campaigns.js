var express = require('express');
var router = express.Router();
var db = require('../dbconnection');

const SDK = require('@ringcentral/sdk').SDK;

router.get('/get', function(req, res) {
  db.query("SELECT * FROM campaigns", function (err, sql_res) {
    res.json({ res: sql_res });
  });
});

router.post('/create', function(req, res) {
  db.query("INSERT INTO campaigns(campaign_name,campaign_description,campaign_ringcentral_option,campaign_csv,campaign_script) VALUES(?,?,?,?,?)", 
						[req.body.name, req.body.description, req.body.ringcentralOption, req.body.csv, req.body.script], function(err, sql_res) {
              res.json({ ret: 0, res: sql_res });
				});
});

router.post('/update', function(req, res) {
  db.query("UPDATE campaigns SET campaign_name=?,campaign_description=?,campaign_ringcentral_option=?,campaign_csv=?,campaign_script=? WHERE campaign_id=?", 
            [req.body.name, req.body.description, req.body.ringcentralOption, req.body.csv, req.body.script, req.body.id], function(err, sql_res) {
              res.json({ ret: 0 });
  });
});

router.get('/delete', function(req, res) {
  db.query("DELETE FROM campaigns WHERE campaign_id=?", [req.query.id], function(err, sql_res) {
    res.json({ ret: 0 });
  });
});

router.get('/ringcentral/get', function(req, res) {
  db.query("SELECT * FROM ringcentral", function (err, sql_res) {
    res.json({ res: sql_res });
  });
});

router.get('/ringcentral/create', function(req, res) {
  db.query("INSERT INTO ringcentral(r_account,r_username,r_password,r_client_id,r_client_secret) VALUES(?,?,?,?,?)", 
						["", "", "", "", ""], function(err, sql_res) {
              res.json({ ret: 0, res: sql_res });
				});
});

router.post('/ringcentral/update', function(req, res) {
  db.query("UPDATE ringcentral SET r_account=?,r_username=?,r_password=?,r_client_id=?,r_client_secret=? WHERE r_id=?", 
            [req.body.account, req.body.username, req.body.password, req.body.clientId, req.body.clientSecret, req.body.id], function(err, sql_res) {
              res.json({ ret: 0 });
  });
});

router.get('/ringcentral/delete', function(req, res) {
  db.query("DELETE FROM ringcentral WHERE r_id=?", [req.query.id], function(err, sql_res) {
    res.json({ ret: 0 });
  });
});

router.post('/send', function (req, res) {
  sendSMS(req.body.option, req.body.recipient, req.body.content, function(res1) {
    res.json({ret: 0, res: res1, recipient: req.body.recipient, content: req.body.content});
  });
});

function sendSMS(option, recipient, content, callback) {
  var rcsdk = new SDK({
    server: 'https://platform.devtest.ringcentral.com',
    clientId: option.r_client_id,
    clientSecret: option.r_client_secret
  });
  var platform = rcsdk.platform();

  platform.login({
    username: option.r_username,
    password: option.r_password,
    extension: '101'
    })
    .then(function(resp) {
        send_sms();
    })
    .catch(function(error){
        console.log(error);
        callback(error);
    });

  function send_sms(){
    platform.post('/restapi/v1.0/account/~/extension/~/sms', {
        from: {'phoneNumber': option.r_username},
        to: [{'phoneNumber': recipient}],
        text: content
      })
      .then(function (resp) {
          console.log("SMS sent. Message status: " + resp.json().messageStatus);
          callback(resp);
      })
      .catch(function(error){
          console.log(error);
          callback(error);
      });
  }
}

module.exports = router;
