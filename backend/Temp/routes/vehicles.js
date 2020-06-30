var express = require('express');
var router = express.Router();
var fs = require('fs');
var readline = require('readline');
var db = require('../dbconnection');
var parser = require('node-html-parser');
var request = require('request');
var schedule = require('node-schedule');
const json2csv = require('json2csv');

router.get('/test', function () {
	db.query("SELECT * FROM lanes", [], function (err, sql_res) {
		var d = new Date().toISOString().substring(0, 10);
		fs.writeFile("backup_db/lanes" + d + ".csv", json2csv.parse(sql_res));
	});
	db.query("SELECT * FROM vehicles", [], function (err, sql_res) {
		var d = new Date().toISOString().substring(0, 10);
		fs.writeFile("backup_db/vehicles" + d + ".csv", json2csv.parse(sql_res));
	});
})
router.get('/t', function (req, res, next) {
	res.send('resp:\n' + req);
	console.log(req);
});
router.post('/t1', function (req, res, next) {
	res.send('resp:\n' + req);
	console.log(req);
});
router.get('/update', function (req, res, next) {
	res.send('respond with a resource');
	db.query("DELETE FROM vehicles", [], function(err, sql_res) {
		//console.log(err, sql_res);
		checkVehicles(0);
	});
});
router.get('/update1', function (req, res, next) {
	res.send('respond with a resource1');
	db.query("DELETE FROM lanes", [], function(err, sql_res) {
		checkLanes(0);
	});
});
router.get('/get1', function (req, res, next) {
	if (req.query.state1 == undefined && req.query.state2 == undefined) {
		res.json({ ret: -1 });
		return;
	}
	var f1 = (req.query.state1 == '');
	var f2 = (req.query.state2 == '');
	//db.query("SELECT * FROM lanes WHERE origin_state=? OR dest_state=?", [req.query.state, req.query.state], function(err, sql_res) {
	db.query("SELECT * FROM lanes WHERE (origin_state=? OR ?) AND (dest_state=? OR ?) ORDER BY dest_city", 
			[req.query.state1, f1, req.query.state2, f2], function (err, sql_res) {
		res.json({ ret: 0, res: sql_res });
	});
});
router.get('/remove', function (req, res) {
	removeLane(req.query.id, function () {
		res.json({ret: 0, res: req.query.id });
	});
});
router.get('/create', function (req, res) {
	createLane(req.query, function () {
		res.json({ret: 0, res: req.query });
	});
});
function createLane(query, callback) {
	//http://www.transportautoquoter.com/views/metro_rule_fetch.php?st=WY&city=175559
	getCookie4Lane(function(cookie) {
		current_cookie = cookie;
		var options = {
			method: "GET", 
			headers: {'Cookie': current_cookie},
			url: "http://www.transportautoquoter.com/views/metro_add_rule.php?city=" + query.city + "&tocity=" + 
				query.tocity + "&season=0&reverse=false&orig_dest=lane&radius=" + query.radius + "&toRadius=" + 
				query.toRadius + "&state=" + query.state + "&tostate=" + query.tostate + "&add_percent=1&add_amt=" + query.add_amt + 
				"&radius2=Select&toRadius2=Select&add_percent2=1&add_amt2=0&radius3=Select&toRadius3=Select&add_percent3=1&add_amt3=0"};
		request(options, function() {
			var options1 = {
				method: "GET",
				headers: {'Cookie': current_cookie},
				url: "http://www.transportautoquoter.com/views/metro_rule_fetch.php?st=" + query.state + "&city=" + query.city};
			request(options1, function(error, response, body) {
				var objs = getObjFromBody(body);
				var i = objs.length - 1;
				db.query("INSERT INTO lanes(lane_id,origin_city,origin_state,dest_city,dest_state,origin_radius,dest_radius,amt,season) VALUES(?,?,?,?,?,?,?,?,?)", 
						[objs[i].lane_id, objs[i].origin_city, objs[i].origin_state, objs[i].dest_city, objs[i].dest_state, objs[i].origin_radius, objs[i].dest_radius, objs[i].amt, objs[i].season], function(err, sql_res) {
					console.log(err, sql_res);
					if (callback)
						callback();
				});
			})
		});
	});
};
function removeLane(id, callback) {
	var options = {method: "GET", headers: {'Cookie': current_cookie}};
	options.url = "http://www.transportautoquoter.com/views/del_metro_rule.php?id=" + id;
	request(options, function (error, response, body) {
		if (body.indexOf("login = ''") >= 0) {	// if token is invalid
			getCookie4Lane(function(cookie) {
				current_cookie = cookie;
				removeLane(id, callback);
			});
		} else {
			db.query("DELETE FROM lanes WHERE lane_id=?", [id], function(err, sql_res) {
				if (callback)
					callback();
			});
		}
	});
}
router.post('/login', function (req, res) {
	if (req.body.username == "admin", req.body.password == "pwd2018")
		res.json({ ret: 0 });
    else
        res.json({ ret: -1 });
});
router.get('/get', function (req, res) {
	
	db.query("SELECT vehicle_id AS v_id,pickup_url AS p_url,pickup_location AS p_loc,pickup_name AS p_name,delivery_url AS d_url,delivery_location AS d_loc,delivery_name AS d_name,vehicle_block AS v_block,order_id,company_name AS c_name,company_url AS c_url,carrier_pay AS c_pay,carrier_pay_details AS c_pay_d,shipon,modified FROM vehicles", function (err, sql_res) {
		
		if (sql_res != undefined) {
			res.json({ ret: 0, res: sql_res });                  // success
		} else {
			res.json({ ret: -1, err: "Get UserInfo Error" });    // fail
		}
	});
});
router.get('/cookie', function (req, res) {
	getCookie4Lane(function(cookie) {
		res.send(cookie);
	});
});
router.get('/download1', function (req, res) {
	db.query("SELECT * FROM vehicles", [], function(err, sql_res) {
		var d = new Date().toISOString().substring(0, 10);
		fs.writeFile("tmp", json2csv.parse(sql_res), function(err) {
			res.download("tmp", "vehicles" + d + ".csv");
		});
	});
});
router.get('/download2', function (req, res) {
	db.query("SELECT * FROM lanes", [], function(err, sql_res) {
		var d = new Date().toISOString().substring(0, 10);
		fs.writeFile("tmp", json2csv.parse(sql_res), function(err) {
			res.download("tmp", "lanes" + d + ".csv");
		});
	});
});
var all_states = [];
var current_cookie;
router.get('/change', function (req, res, next) {
	if (req.query != undefined) {
		changeValue(req.query, function(res1) {
			res.json({ret: 0, res: res1});
		});
	}
});
router.get('/cities', function (req, res) {
	var options = {method: "GET", headers: {'Cookie': current_cookie}};
	options.url = "http://www.transportautoquoter.com/views/metro_city_fetch.php?st=" + req.query.st;
	var p = [];
	request(options, function(error, response, body) {
		var options = parser.parse(body).querySelectorAll("option");
		for (var i = 0; i < options.length; i++) {
			if (options[i].rawAttributes.value > 0)
				p.push({id: options[i].rawAttributes.value, name: options[i].text});
		}
		res.json({ret: 0, res: p});
	});
});
function changeValue(q, callback) {
	var options = {	method: "POST", 
					url: "http://www.transportautoquoter.com/views/pricing_metro_update_radius.php",
					headers: {'Cookie': current_cookie},
					formData: { radius: q.rad1, toRadius: q.rad2, amount: q.amount, id: q.id, col: 1 }};
	request(options, function(error, response, body) {
		if (body == '') {
			getCookie4Lane(function(cookie) {
				current_cookie = cookie;
				changeValue(q, callback);
			});
		} else {
			db.query("UPDATE lanes SET amt=?,origin_radius=?,dest_radius=? WHERE lane_id=?", [q.amount, q.rad1, q.rad2, q.id], function(err, sql_res) {
				if (callback)
					callback(q);
			});
		}
	});
}
function checkLanes() {
	db.query("SELECT * FROM states", [], function (err, sql_res) {
		all_states = sql_res;
		getCookie4Lane(function(cookie) {
			current_cookie = cookie;
			checkOneLane(0);
		});
	});
}
function getCookie4Lane(callback) {
	var options = {	method: "POST", 
					url: "http://www.transportautoquoter.com/user_site_login_process.php",
					formData: { login_username: 'TJRR', login_userpass: 'silver28' }};
	request(options, function (error, response, body) {
		console.log("err", error);
		var cookie = response.headers['set-cookie'][0];
		cookie = cookie.substring(0, cookie.indexOf(';'));
		console.log(cookie);
		if (callback)
			callback(cookie);
	});
}
function getObjFromBody(body) {
	var res = [];
	var trs = parser.parse(body).querySelectorAll("tr");
	for (var j = 0; j < trs.length; j++) {
		var tds = parser.parse(trs[j].innerHTML).querySelectorAll("td");
		if (tds.length >= 1) {
			var lane = tds[0].text.trim();
			var sp = lane.split(" to ");
			var lane_id = trs[j].id.substring(4);
			var origin_city = sp[0].split(',')[0];
			var origin_state = sp[0].split(',')[1];
			var dest_city = sp[1].split(',')[0];
			var dest_state = sp[1].split(',')[1].substring(0, 2);
			var radius = tds[1].text.trim().split(" | ");
			var origin_radius = radius[0].split(" / ")[0];
			var dest_radius = radius[0].split(" / ")[1];
			var amt = radius[1].substring(1);
			if (radius[1].startsWith("-"))
				amt = -radius[1].substring(2);
			var season = tds[4].text.trim();
			res.push({lane_id: lane_id, origin_city: origin_city, origin_state: origin_state, dest_city: dest_city, dest_state: dest_state, 
				origin_radius: origin_radius, dest_radius: dest_radius, amt: amt, season: season});
		}
	}
	return res;
}
function checkOneLane(st) {
	var options = {method: "GET", headers: {'Cookie': current_cookie}};
	options.url = "http://www.transportautoquoter.com/views/metro_rule_fetch.php?st=" + all_states[st].state_code + "&city=Select";
	request(options, function (error, response, body) {
		var objs = getObjFromBody(body);
		console.log("objlength", objs.length);
		for (var i = 0; i < objs.length; i++) {
			db.query("INSERT INTO lanes(lane_id,origin_city,origin_state,dest_city,dest_state,origin_radius,dest_radius,amt,season) VALUES(?,?,?,?,?,?,?,?,?)", 
				[objs[i].lane_id, objs[i].origin_city, objs[i].origin_state, objs[i].dest_city, objs[i].dest_state, objs[i].origin_radius, objs[i].dest_radius, objs[i].amt, objs[i].season]);
		}
		if (st + 1 < all_states.length)
			checkOneLane(st + 1);
	});
}
function checkVehicles(pg) {
	console.log("page", pg);
	var options = {
		method: "GET",
		headers: {'Cookie': 'test-session=1; CSRF_TOKEN=81161cd4222e024bab0268fa0129c5a5bcb636a58ca1fa8a14349922e767e3c9; test-persistent=1; test-session=1; _ga=GA1.1.352852732.1550251407; _gid=GA1.1.320431126.1550251407; ak_bmsc=99B251CF85AC59F26AC2D9412792E6F5684F0AA4120E00008DF5665CFADA8340~plGEzDTxNE4Q1YZuTIU3Ff95eELEZJOd+f0tz1Flo0YzQ3Emrtro2QjlYwan9s2Av60L/jHZy0D6YqWop4PfGMOfYfbPrZKcUO5gSEJ9aG5PBDx5umhjr1febbmDbSLaaETbPSNkKwaTWMeuRLBZa2pdvPYAaAJy0HarRsEU02ImUzHMTf3SkZLFZfFzvLUAf1bzSBjjfBrOjWI4f5CCrgaFBazUYOKjFshjVf815qPjhxk1JA5nZpKShPvTkpl7/b; PHPSESSID=6cb30c04de57d136ce2b76730f6a2475; visitedDashboard=1; bm_sv=AD3727932C04362B658E592F9D09E098~+zmY9VXFldk/HT9f5axHUyCRlwQ9qxTyxw9jfRhBRx8M5kb9mz4x1kFI7XO3kWAYt0jw0tdNrXqy6oM28gx5J373883cSTXXhkm3RinBxQwET7SvLwK2kC0e5hfwlJyERik2p/wIihH3rHH5Aw2KRXw3HU5WRH3HALqoFrFnFG4='},
		url: 'https://www.centraldispatch.com/protected/cargo/my-vehicles?group=My%20Vehicles&folder=Delivered&sort=&dir=asc&page=' + pg + "&timeframe=all"
		//	  https://www.centraldispatch.com/protected/cargo/my-vehicles?group=My%20Vehicles&folder=Delivered&sort=&dir=asc&page=1&timeframe=all
	};//https://www.centraldispatch.com/protected/cargo/my-vehicles?timeframe=all
	request(options, function (error, response, body) {
		var trs = parser.parse(body).querySelectorAll("tr");
		for (var i = 0; i < trs.length; i++) {
			if (trs[i].id == '') continue;
			var tds = parser.parse(trs[i].innerHTML).querySelectorAll("td");
			if (tds[2] == undefined)
				continue;
			var id = trs[i].id;
			var pickup_url = tds[2].childNodes[1].rawAttributes.href;
			pickup_url = pickup_url.substring(43);
			var pickup_location = tds[2].childNodes[1].text.trim();
			var pickup_name = tds[2].text.trim().substring(pickup_location.length).trim();
			var delivery_url = tds[3].childNodes[1].rawAttributes.href;
			delivery_url = delivery_url.substring(43);
			var delivery_location = tds[3].childNodes[1].text.trim();
			var delivery_name = tds[3].text.trim().substring(delivery_location.length).trim();
			var vehicle_block = tds[4].querySelector(".vehicleBlock").text.trim();
			var vehicle_summary = tds[4].querySelector(".vehicleSummary").text.trim();
			var order_id = tds[4].querySelector(".order-id").text.trim();
			var company_name = tds[5].childNodes[1].text.trim();
			var company_url = tds[5].childNodes[1].rawAttributes.href;
			company_url = company_url.substring(37);
			var carrier_pay = tds[5].querySelector(".carrierPay").text.trim();
			var carrier_pay_details = tds[5].querySelector(".carrierPayDetails").text.trim();
			carrier_pay_details = carrier_pay_details.replace(/\s\s/g, '');
			var shipon = tds[6].childNodes[1].text.trim();
			var modified = tds[6].childNodes[3].text.trim();
			modified = modified.replace(/\s\s/g, '');
			if (modified.startsWith("Modified: "))
				modified = modified.substring(10);
			db.query("INSERT INTO vehicles(vehicle_id,pickup_url,pickup_location,pickup_name,delivery_url,delivery_location,delivery_name,vehicle_block,vehicle_summary,order_id,company_name,company_url,carrier_pay,carrier_pay_details,shipon,modified) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)",
					[id,pickup_url,pickup_location,pickup_name,delivery_url,delivery_location,delivery_name,vehicle_block,vehicle_summary,order_id,company_name,company_url,carrier_pay,carrier_pay_details,shipon,modified], function (err1, sql_res1) {
						//console.log(err1, sql_res1);
			});
		}
		console.log(trs.length);
		var pgtext = parser.parse(body).querySelector(".col-xs-6").text.trim();
		var sp = pgtext.split(" ");		// Results: 1-500 of 1768
		if (!sp[1].endsWith("-" + sp[3]))
			checkVehicles(pg + 1);
	});
}
schedule.scheduleJob({ second: 0, minute: 0, hour: 20 }, function () {
	console.log("update vehicles schedule");
	db.query("DELETE FROM vehicles", [], function(err, sql_res) {
		checkVehicles(0);
	});
});
schedule.scheduleJob({ second: 0, minute: 2, hour: 8}, function () {
	console.log("update lanes schedule");
	db.query("DELETE FROM lanes", [], function(err, sql_res) {
		checkLanes(0);
	});
});
schedule.scheduleJob({ second: 0, minute: 28, hour: 8}, function () {
	console.log("backup schedule");
	db.query("SELECT * FROM lanes", [], function(err, sql_res) {
		var d = new Date().toISOString().substring(0, 10);
		fs.writeFile("backup_db/lanes" + d + ".csv", json2csv.parse(sql_res));
		//zip.file("backup_db/vehicles" + d + ".csv", json2csv.parse);
	});
	db.query("SELECT * FROM vehicles", [], function(err, sql_res) {
		var d = new Date().toISOString().substring(0, 10);
		fs.writeFile("backup_db/vehicles" + d + ".csv", json2csv.parse(sql_res));
		//zip.file("backup_db/vehicles" + d + ".csv", json2csv.parse);
	});
});
module.exports = router;