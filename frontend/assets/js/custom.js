var resizefunc = [];
// New "http://www.transportautoquoter.com/views/metro_add_rule.php?city=175559&tocity=105273&season=0&reverse=false&orig_dest=lane&radius=36&toRadius=40&state=WY&tostate=AK&add_percent=1&add_amt=100&radius2=Select&toRadius2=Select&add_percent2=1&add_amt2=0&radius3=Select&toRadius3=Select&add_percent3=1&add_amt3=0"
// Delete "http://www.transportautoquoter.com/views/del_metro_rule.php?id=28524"
function exportToCsv(filename, csvFile) {
    var blob = new Blob([csvFile], { type: 'text/csv;charset=utf-8;' });
    if (navigator.msSaveBlob) { // IE 10+
        navigator.msSaveBlob(blob, filename);
    } else {
        var link = document.createElement("a");
        if (link.download !== undefined) { // feature detection
            // Browsers that support HTML5 download attribute
            var url = URL.createObjectURL(blob);
            link.setAttribute("href", url);
            link.setAttribute("download", filename);
            link.style.visibility = 'hidden';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
    }
}
var app = angular.module('myApp', []);
app.controller('myCtrl', function($scope, $http, $window, $sce) {
    setInterval(function(){ console.log(1); }, 1000);
    $scope.logined = false;
    //$sce.trustAsHtml(true);
    $scope.trustAsHtml = function(html) {
        return $sce.trustAsHtml(html);
    }
    $scope.state1 = $scope.state2 = $scope.state3 = $scope.state4 = "";
    $scope.checkedCount = 0;
    $scope.rowCount = 0;
    $scope.amountReq = "0";
    $scope.radiusReq1 = "0";
    $scope.radiusReq2 = "0";
    $scope.usa_states = [
        {"name": "Not set", "abbr": ""},
        {"name": "Alabama", "abbr": "AL"},
        {"name": "Alaska", "abbr": "AK"},
        {"name": "Arizona", "abbr": "AZ"},
        {"name": "Arkansas", "abbr": "AR"},
        {"name": "California", "abbr": "CA"},
        {"name": "Colorado", "abbr": "CO"},
        {"name": "Connecticut", "abbr": "CT"},
        {"name": "Delaware", "abbr": "DE"},
        {"name": "Florida", "abbr": "FL"},
        {"name": "Georgia", "abbr": "GA"},
        {"name": "Hawaii", "abbr": "HI" },
        {"name": "Idaho", "abbr": "ID" },
        {"name": "Illinois", "abbr": "IL" },
        {"name": "Indiana", "abbr": "IN" },
        {"name": "Iowa", "abbr": "IA" },
        {"name": "Kansas", "abbr": "KS" },
        {"name": "Kentucky", "abbr": "KY" },
        {"name": "Louisiana", "abbr": "LA" },
        {"name": "Maine", "abbr": "ME" },
        {"name": "Maryland", "abbr": "MD" },
        {"name": "Massachusetts", "abbr": "MA" },
        {"name": "Michigan", "abbr": "MI" },
        {"name": "Minnesota", "abbr": "MN" },
        {"name": "Mississippi", "abbr": "MS" },
        {"name": "Missouri", "abbr": "MO" },
        {"name": "Montana", "abbr": "MT"},
        {"name": "Nebraska", "abbr": "NE"},
        {"name": "Nevada", "abbr": "NV"},
        {"name": "New Hampshire", "abbr": "NH"},
        {"name": "New Jersey", "abbr": "NJ"},
        {"name": "New Mexico", "abbr": "NM"},
        {"name": "New York", "abbr": "NY"},
        {"name": "North Carolina", "abbr": "NC"},
        {"name": "North Dakota", "abbr": "ND"},
        {"name": "Ohio", "abbr": "OH"},
        {"name": "Oklahoma", "abbr": "OK"},
        {"name": "Oregon", "abbr": "OR"},
        {"name": "Pennsylvania", "abbr": "PA"},
        {"name": "Rhode Island", "abbr": "RI"},
        {"name": "South Carolina", "abbr": "SC"},
        {"name": "South Dakota", "abbr": "SD"},
        {"name": "Tennessee", "abbr": "TN"},
        {"name": "Texas", "abbr": "TX"},
        {"name": "Utah", "abbr": "UT"},
        {"name": "Vermont", "abbr": "VT"},
        {"name": "Virginia", "abbr": "VA"},
        {"name": "Washington", "abbr": "WA"},
        {"name": "Washington DC", "abbr": "DC"},
        {"name": "West Virginia", "abbr": "WV"},
        {"name": "Wisconsin", "abbr": "WI"},
        {"name": "Wyoming", "abbr": "WY"}
    ];
    var logined = $window.localStorage.getItem("vehicleLogin");
    if (logined == 1)
        $scope.logined = true;
	else
		$scope.logined = false;
    $scope.bLoading = true;
    $http.get("http://127.0.0.1:3010/campaigns/get").then(function(response) {
        if (response.data.res.length != 0){
            $scope.noCampaign = false;
            $scope.campaigns = response.data.res;
        } else {
            $scope.noCampaign = true;
        }
    });
    $http.get("http://127.0.0.1:3010/campaigns/ringcentral/get").then(function(response) {
        $scope.rAccounts = response.data.res;
    });
    $http.get("http://127.0.0.1:3010/vehicles/get").then(function(response) {		//http://178.128.223.189:3010/vehicles/get
        $scope.vehicles = response.data.res;
        $scope.bLoading = false;
    });
    $scope.login = function(n, p) {
        $http({
            method: "POST",
            url: "http://127.0.0.1:3010/vehicles/login",
            data: {
                username: n,
                password: p
            }
        }).then(function(response) {
            if (response.data.ret == 0) {
                $scope.logined = true;
                $window.localStorage.setItem("vehicleLogin", 1);
            } else {
                $scope.failed = true;
            }
        });
    }
    $scope.logout = function(n, p) {
        $scope.logined = false;
        $window.localStorage.removeItem("vehicleLogin");
    }
    $scope.changeCity3 = function() {
        $scope.rowCount = 0;//$("tr.filtered").length;
        $scope.checkAll = false;
        $scope.checkedCount = 0;
        for (var i = 0; i < $scope.lanes.length; i++) {
            $scope.lanes[i].checked = false;
            if ($scope.lanes[i].origin_city.includes($scope.search_origin_city) && $scope.lanes[i].dest_city.includes($scope.search_dest_city))
                $scope.rowCount++;
        }
    }
    $scope.changeCheckAll = function() {
        if ($scope.lanes != undefined) {
            for (var i = 0; i < $scope.lanes.length; i++) {
                if ($scope.lanes[i].origin_city.includes($scope.search_origin_city))
                    $scope.lanes[i].checked = $scope.checkAll;
            }
        }
        if ($scope.checkAll) {
            $scope.checkedCount = $scope.rowCount;
        } else 
            $scope.checkedCount = 0;
    }
    $scope.changeCheck = function() {
        $scope.checkedCount = 0;
        for (var i = 0; i < $scope.lanes.length; i++) {
            if ($scope.lanes[i].checked)
                $scope.checkedCount++;
        }
        $scope.checkAll = ($scope.checkedCount > 0);
    }
    $scope.fetchData = function() {
        console.log("State3:" + $scope.state3 + "State4:" + $scope.state4);
        
        if ($scope.state3 == '' && $scope.state4 == '') {
            $scope.lanes = [];
            $scope.rowCount = 0;
            $scope.checkedCount = 0;
            return;
        }
        console.log("http://127.0.0.1:3010/vehicles/get1?state1=" + $scope.state3 + "&state2=" + $scope.state4);
        $scope.lanes = [];
        $scope.bLoading1 = true;
        $http({
            method: "GET",
            url: "http://127.0.0.1:3010/vehicles/get1?state1=" + $scope.state3 + "&state2=" + $scope.state4,
        }).then(function(response) {
            $scope.bLoading1 = false;
            if (response.data.ret == 0) {
                $scope.lanes = response.data.res;
                $scope.rowCount = $scope.lanes.length;
                $scope.checkedCount = 0;
                $scope.checkAll = false;
                $scope.cities3 = ["ALL"];
                $scope.cities4 = ["ALL"];
                $scope.search_origin_city = "";
                $scope.search_dest_city = "";
                for (var i = 0; i < $scope.lanes.length; i++) {
                    if ($scope.cities3.indexOf($scope.lanes[i].origin_city) == -1 && $scope.lanes[i].origin_state == $scope.state3)
                        $scope.cities3.push($scope.lanes[i].origin_city);
                    if ($scope.cities4.indexOf($scope.lanes[i].dest_city) == -1 && $scope.lanes[i].dest_state == $scope.state4)
                        $scope.cities4.push($scope.lanes[i].dest_city);
                }
                $scope.cities3.sort();
                $scope.cities4.sort();
            }
        });
    }
    $scope.initNewModal = function() {
        $scope.new_rad1 = "5";
        $scope.new_rad2 = "5";
        $scope.new_amount = 500;
    }
    $scope.createLane = function() {
        console.log("CreateLane Custom.js");
        console.log("createlane val" + "http://127.0.0.1:3010/vehicles/create?state=");
        $val = "http://127.0.0.1:3010/vehicles/create?state=" + $scope.new_pickup_state + "&city=" + $scope.new_pickup_city + 
                "&tostate=" + $scope.new_delivery_state + "&tocity=" + $scope.new_delivery_city + 
                "&radius=" + $scope.new_rad1 + "&toRadius=" + $scope.new_rad2 + "&add_amt=" + $scope.new_amount;

        console.log("createlane val" + $val);

        $http({
            method: "GET",
            url: "http://127.0.0.1:3010/vehicles/create?state=" + $scope.new_pickup_state + "&city=" + $scope.new_pickup_city + 
                "&tostate=" + $scope.new_delivery_state + "&tocity=" + $scope.new_delivery_city + 
                "&radius=" + $scope.new_rad1 + "&toRadius=" + $scope.new_rad2 + "&add_amt=" + $scope.new_amount
        }).then(function(response) {
            if (response.data.ret == 0) {
            }
        });
    }
    $scope.removeLane = function() {
        for (var i = 0; i < $scope.lanes.length; i++) {
            if ($scope.lanes[i].checked) {
                $http({
                    method: "GET",
                    url: "http://127.0.0.1:3010/vehicles/remove?id=" + $scope.lanes[i].lane_id
                }).then(function(response) {
                    if (response.data.ret == 0) {
                        for (var i = 0; i < $scope.lanes.length; i++) {
                            if ($scope.lanes[i].lane_id == response.data.res) {
                                $scope.lanes.splice(i, 1);
                                $scope.checkedCount--;
                                $scope.rowCount--;
                                break;
                            }
                        }
                    }
                });
            }
        }
    };
    $scope.changeAmounts = function() {
        $scope.changeCount = 0;
        for (var i = 0; i < $scope.lanes.length; i++) {
            var newval;
            if ($scope.cus_amount > 0)
                newval = $scope.cus_amount;
            else if ($scope.amountReq != 0)
                newval = parseInt($scope.lanes[i].amt) + parseInt($scope.amountReq);
            if ($scope.lanes[i].checked) {
                var r1 = ($scope.radiusReq1 == 0? $scope.lanes[i].origin_radius: $scope.radiusReq1);
                var r2 = ($scope.radiusReq2 == 0? $scope.lanes[i].dest_radius: $scope.radiusReq2);
                // $scope.checkedCount = 6;      // TEST CODE
                // for (var j = 0; j < 6; j++)   // TEST
                $http({
                    method: "GET",
                    url: "http://127.0.0.1:3010/vehicles/change?id=" + $scope.lanes[i].lane_id + "&amount=" + newval + 
                            "&rad1=" + r1 + "&rad2=" + r2
                }).then(function(response) {
                    if (response.data.ret == 0) {
                        var result = response.data.res;
                        $scope.changeCount++;
                        // swal mode start
                        if ($scope.changeCount == $scope.checkedCount)
                            swal.enableButtons();
                        $("#changeCount").text($scope.changeCount);
                        $("#prgrs").width($scope.changeCount * 100 / $scope.checkedCount + "%");
                        // swal mode end
                        for (var j = 0; j < $scope.lanes.length; j++) {
                            if ($scope.lanes[j].lane_id == result.id) {
                                $scope.lanes[j].amt = result.amount;
                                $scope.lanes[j].origin_radius = result.rad1;
                                $scope.lanes[j].dest_radius = result.rad2;
                                break;
                            }
                        }
                    }
                });
            }
        }
    }
    $scope.saveFilteredVehicles = function() {
        var out = "id,pickup_url,pickup_location,pickup_name,delivery_url,delivery_location,delivery_name,vehicle_block,vehicle_summary,order_id,company_name,company_url,carrier_pay,carrier_pay_details,shipon,modified\n";
        var searchKey = $("#searchKey").val().toLowerCase();
        var state1 = $scope.state1;
        var state2 = $scope.state2;
        $scope.vehicles.forEach(function (vehicle, index) {
			vehicle.vehicle_summary = '';
            if (((vehicle.p_loc.startsWith(state1) && vehicle.d_loc.startsWith(state2)) || 
                    (vehicle.p_loc.startsWith(state2) && vehicle.d_loc.startsWith(state1))) && 
                    vehicle.c_name.toLowerCase().includes(searchKey)) {
                out += '"' + vehicle.v_id + '","' + vehicle.p_url + '","' + vehicle.p_loc + '","' + vehicle.p_name + '","' + 
                    vehicle.d_url + '","' + vehicle.d_loc + '","' + vehicle.d_name + '","' + 
                    vehicle.v_block + '","' + vehicle.vehicle_summary + '","' + vehicle.order_id + '","' + 
                    vehicle.c_name + '","' + vehicle.c_url + '","' + vehicle.c_pay + '","' + vehicle.c_pay_d + '","' + 
                    vehicle.shipon + '","' + vehicle.modified + '"\n';
            }
        });
        exportToCsv("vehicles.csv", out);
    }
    $scope.saveFilteredLanes = function() {
        var out = "lane_id,origin_city,origin_state,dest_city,dest_state,origin_radius,dest_radius,amt,season\n";
        $scope.lanes.forEach(function (lane, index) {
            if (lane.origin_city.includes($scope.search_origin_city) && lane.dest_city.includes($scope.search_dest_city)) {
                out += '"' + lane.lane_id + '","' + lane.origin_state + '","' + lane.origin_city + '","' + lane.dest_state + '","' + lane.dest_city + 
                    '","' + lane.origin_radius + '","' + lane.dest_radius + '","' + lane.amt + '","' + lane.season + '"\n';
            }
        });
        exportToCsv("lanes.csv", out);
    }
    $scope.selectCustomPrice = function() {
        console.log('dddddd');
    }
    $scope.changePrice = function() {
        if ($scope.amountReq == 'custom') {
            
        }
    }
    $scope.changePickupState = function() {
        $scope.p_cities = [];
        $http({
            method: "GET",
            url: "http://127.0.0.1:3010/vehicles/cities?st=" + $scope.new_pickup_state
        }).then(function(response) {
            $scope.p_cities = response.data.res; 
        });
    }
    $scope.changeDeliveryState = function() {
        $scope.d_cities = [];
        $http({
            method: "GET",
            url: "http://127.0.0.1:3010/vehicles/cities?st=" + $scope.new_delivery_state
        }).then(function(response) {
            $scope.d_cities = response.data.res; 
        });
    }
    $('#confirmApply').click(function () {
        var text = "For " + $scope.checkedCount + " lane(s):<br>";
        if ($scope.radiusReq1 != 0)
            text += "<b>Radius1</b> --> " + $scope.radiusReq1 + "<br>";
        if ($scope.radiusReq2 != 0)
            text += "<b>Radius2</b> --> " + $scope.radiusReq2 + "<br>";
        if ($scope.cus_amount > 0)
            text += "<b>Amount</b> will be changed to " + $scope.cus_amount + "<br>";
        else if ($scope.amountReq != 0)
            text += "<b>Amount</b> will be changed (" + $scope.amountReq + ")<br>";
        swal({
            title: "Are you sure?",
            html: text,
            type: "warning",
            showCancelButton: true,
            confirmButtonText: "Yes",
            cancelButtonText: "No",
        }).then((result) => {
		  if (result) {
            $scope.changeAmounts();
            var t = swal({
                title: "Processing...",
                html: "<span id='changeCount'>0</span> / " + $scope.checkedCount + "<br><div class='progress'><div id='prgrs' class='progress-bar progress-bar-info progress-bar-striped active' role='progressbar' aria-valuemin='0' aria-valuemax='100'></div></div>",
            });
            swal.disableButtons();
			//$('#changeAmount').click();            
		  }
		}).catch(swal.noop);
    });
    $('#removeLane').click(function () {
        swal({
            title: "Are you sure?",
            text: $scope.checkedCount + " lane(s) will be removed.",
            type: "error",
            showCancelButton: true,
            confirmButtonText: "Yes",
            cancelButtonText: "No",
        }).then((result) => {
		  if (result) {
              $scope.removeLane();
		  }
		}).catch(swal.noop);
    });
    $scope.newCampaign = function() {
        $scope.campaignModalType = "new";
        $scope.campaign_name = "";
        $scope.campaign_description = "";
        $scope.campaign_ringcentral_account = undefined;
        $scope.campaign_csv = [];
        $scope.csvDataKey = [];
        $scope.csvDataValue = [];
        $scope.campaign_script = "";
        $scope.campaign_shipper_phone = "";
        $('#csvFile').val('');
        moveToFirstTab();
    }
    $scope.editCampaign = function(index) {
        $scope.campaignIndex = index;
        var campaign = $scope.campaigns[index];
        $scope.campaignModalType = "edit";
        $scope.campaign_name = campaign.campaign_name;
        $scope.campaign_description = campaign.campaign_description;
        $scope.campaign_ringcentral_account = JSON.parse(campaign.campaign_ringcentral_option).r_account;
        $scope.campaign_csv = JSON.parse(campaign.campaign_csv);
        $scope.csvDataKey = [];
        $scope.csvDataValue = [];
        getCSVData($scope.campaign_csv);
        $scope.campaign_script = campaign.campaign_script;
        $('#csvFile').val('');
        moveToFirstTab();
    }
    function moveToFirstTab() {
        $('#campaign').removeClass('show');
        $('#campaign').removeClass('active');
        $('#ringcentral').removeClass('show');
        $('#ringcentral').removeClass('active');
        $('#csv').removeClass('show');
        $('#csv').removeClass('active');
        $('#script').removeClass('show');
        $('#script').removeClass('active');
        $('#campaign').addClass('show');
        $('#campaign').addClass('active');
        $('#nav_link_campaign').removeClass('active');
        $('#nav_link_ringcentral').removeClass('active');
        $('#nav_link_csv').removeClass('active');
        $('#nav_link_script').removeClass('active');
        $('#nav_link_campaign').addClass('active');
    }
    $scope.sendSMS = function() {
        if ($scope.campaignModalType == 'new'){
            $http({
                method: "POST",
                url: "http://127.0.0.1:3010/campaigns/create",
                data: {
                    name: $scope.campaign_name,
                    description: $scope.campaign_description,
                    ringcentralOption: JSON.stringify(getRingcentralOption()),
                    csv: JSON.stringify($scope.campaign_csv),
                    script: $scope.campaign_script
                }
            }).then(function(response) {
                if (response.data.ret == 0) {
                    var newCampaign = {};
                    newCampaign.campaign_id = response.data.res.insertId;
                    newCampaign.campaign_name = $scope.campaign_name;
                    newCampaign.campaign_description = $scope.campaign_description;
                    newCampaign.campaign_ringcentral_option = JSON.stringify(getRingcentralOption());
                    newCampaign.campaign_csv = JSON.stringify($scope.campaign_csv);
                    newCampaign.campaign_script = $scope.campaign_script;
                    if (!$scope.campaigns){
                        $scope.campaigns = [];
                    }
                    $scope.campaigns.push(newCampaign);
                    $scope.noCampaign = false;
                    console.log("Campaign created");
                }
            });
        }
        for (var i = 0; i < $scope.csvDataValue.length; i++){
            if (getRecipientFromCSV($scope.csvDataKey, $scope.csvDataValue, i) != ""){
                $http({
                    method: "POST",
                    url: "http://127.0.0.1:3010/campaigns/send",
                    data: {
                        option: getRingcentralOption(), 
                        recipient: getRecipientFromCSV($scope.csvDataKey, $scope.csvDataValue, i),
                        content: convertToRealScript($scope.campaign_script, i)
                    }
                }).then(function(response) {
                    if (response.data.ret == 0) {
                        console.log("SMS sent: ", response.data.res);
                        if (response.data.res.message != undefined){
                            resendSMS(response.data.recipient, response.data.content);
                        }
                    }
                });
            }
        }
        function convertToRealScript(text, index) {
            for (var i = 0; i < $scope.csvDataKey.length; i++){
                var regex = new RegExp("{" + $scope.csvDataKey[i] + "}", "g");
                text = text.replace(regex, $scope.csvDataValue[index][i]);
            }
            return text;
        }
        function getRecipientFromCSV(key, value, index) {
            for (var i = 0; i < key.length; i++){
                if (key[i] == 'Shipper Phone 1'){
                    return value[index][i];
                }
            }
        }
        function resendSMS(recipient, content){
            $http({
                method: "POST",
                url: "http://127.0.0.1:3010/campaigns/send",
                data: {
                    option: getRingcentralOption(), 
                    recipient: recipient,
                    content: content
                }
            }).then(function(response) {
                if (response.data.ret == 0) {
                    console.log("SMS resent: ", response.data.res);
                    if (response.data.res.message != undefined){
                        resendSMS(response.data.recipient, response.data.content);
                    }
                }
            });
        }
        $('#closeCampaignModal').click();
    }
    $scope.uploadCSV = function() {
        $('#csvFile').parse({
            config: {
                delimiter: "auto",
                complete: function(results) {
                    $scope.campaign_csv = results.data;
                    getCSVData($scope.campaign_csv);
                    $scope.$apply(function() {
                        $scope.campaign_shipper_phone;
                    });
                },
            },
            before: function(file, inputElem)
            {
                console.log("Parsing file...", file);
            },
            error: function(err, file)
            {
                console.log("ERROR:", err, file);
            },
            complete: function()
            {
                console.log("Done with all files");
            }
        });
    }
    $scope.downloadSampleCSV = function() {
        var out = "Shipper Phone 1\n";
        out += "19803324306\n";
        exportToCsv("sample.csv", out);
    }
    $scope.inputCsvDataValue = function(index){
        var txtarea = document.getElementById('textareaScript');
        var text = "{" + $scope.csvDataKey[index] + "}";
        var scrollPos = txtarea.scrollTop;
        var strPos = 0;
        var br = ((txtarea.selectionStart || txtarea.selectionStart == '0') ?
            "ff" : (document.selection ? "ie" : false));
        if (br == "ie") {
            txtarea.focus();
            var range = document.selection.createRange();
            range.moveStart('character', -txtarea.value.length);
            strPos = range.text.length;
        } else if (br == "ff") {
            strPos = txtarea.selectionStart;
        }
        var front = (txtarea.value).substring(0, strPos);
        var back = (txtarea.value).substring(strPos, txtarea.value.length);
        $scope.campaign_script = front + text + back;
        strPos = strPos + text.length;
        if (br == "ie") {
            txtarea.focus();
            var ieRange = document.selection.createRange();
            ieRange.moveStart('character', -txtarea.value.length);
            ieRange.moveStart('character', strPos);
            ieRange.moveEnd('character', 0);
            ieRange.select();
        } else if (br == "ff") {
            txtarea.selectionStart = strPos;
            txtarea.selectionEnd = strPos;
            txtarea.focus();
        }
        txtarea.scrollTop = scrollPos;
    }
    $scope.deleteCampaign = function(index) {
        if (window.confirm("Do you really want to delete this campaign?")) { 
            $http({
                method: "GET",
                url: "http://127.0.0.1:3010/campaigns/delete?id=" + $scope.campaigns[index].campaign_id
            }).then(function(response) {
                if (response.data.ret == 0) {
                    if ($scope.campaigns.length == 1){
                        $scope.campaigns = [];
                        $scope.noCampaign = true;
                    } else {
                        $scope.campaigns.splice(index, 1);
                    }
                    console.log("Campaign Deleted")
                }
            });
        }
    }
    $scope.updateCampaign = function(index) {
        $http({
            method: "POST",
            url: "http://127.0.0.1:3010/campaigns/update",
            data: {
                id: $scope.campaigns[index].campaign_id,
                name: $scope.campaign_name,
                description: $scope.campaign_description,
                ringcentralOption: JSON.stringify(getRingcentralOption()),
                csv: JSON.stringify($scope.campaign_csv),
                script: $scope.campaign_script
            }
        }).then(function(response) {
            if (response.data.ret == 0) {
                $scope.campaigns[index].campaign_name = $scope.campaign_name;
                $scope.campaigns[index].campaign_description = $scope.campaign_description;
                $scope.campaigns[index].campaign_ringcentral_option = JSON.stringify(getRingcentralOption());
                $scope.campaigns[index].campaign_csv = JSON.stringify($scope.campaign_csv);
                $scope.campaigns[index].campaign_script = $scope.campaign_script;
                console.log("Campaign updated");
            }
        });
    }
    function getCSVData(data) {
        $scope.csvDataKey = data[0].join(",").split(",");
        for (var i = 1; i < data.length - 1; i++){
            $scope.csvDataValue[i-1] = data[i].join(",").split(",");
        }
        var existShipperPhone = false;
        for (var i = 0; i < $scope.csvDataKey.length; i++) {
            if ($scope.csvDataKey[i] == 'Shipper Phone 1'){
                $scope.campaign_shipper_phone = 'confirmed';
                existShipperPhone = true;
                continue;
            }
        }
        if (!existShipperPhone){
            $scope.campaign_shipper_phone = '';
        }
    }
    $('.btn-next').click(function(){
        $('#campaignModal .nav-item > .active').parent().next().find('a').trigger('click');
    });
    $('.btn-prev').click(function(){
        $('#campaignModal .nav-item > .active').parent().prev().find('a').trigger('click');
    });
    $('#btnSelectCSV').click(function(){
        $('#csvFile').click();
    });
    $('#nav_item_ringcentral').click(function(e){
        if ($scope.campaign_name=='' || $scope.campaign_description==''){
            e.preventDefault();
            e.stopPropagation();
        }
    });
    $('#nav_item_csv').click(function(e){
        if ($scope.campaign_ringcentral_account==undefined){
            e.preventDefault();
            e.stopPropagation();
        }
    });
    $('#nav_item_script').click(function(e){
        if ($scope.campaign_shipper_phone==''){
            e.preventDefault();
            e.stopPropagation();
        }
    });
    $( document ).ready(function(){
        $('#ringcentralTable').SetEditable({
            onEdit: function(columnsEd) {
                var r_account = columnsEd[0].childNodes[1].innerHTML;
                var r_username = columnsEd[0].childNodes[3].innerHTML;
                var r_password = columnsEd[0].childNodes[5].innerHTML;
                var r_client_id = columnsEd[0].childNodes[7].innerHTML;
                var r_client_secret = columnsEd[0].childNodes[9].innerHTML;
                $scope.updateAccount = function(index){
                    $http({
                        method: "POST",
                        url: "http://127.0.0.1:3010/campaigns/ringcentral/update",
                        data: {
                            id: $scope.rAccounts[index].r_id,
                            account: r_account,
                            username: r_username,
                            password: r_password,
                            clientId: r_client_id,
                            clientSecret: r_client_secret
                        }
                    }).then(function(response) {
                        if (response.data.ret == 0) {
                            $scope.rAccounts[index].r_account = r_account;
                            $scope.rAccounts[index].r_username = r_username;
                            $scope.rAccounts[index].r_password = r_password;
                            $scope.rAccounts[index].r_client_id = r_client_id;
                            $scope.rAccounts[index].r_client_secret = r_client_secret;
                        }
                    });
                }
              },
        });
    });
    $scope.addAccount = function(){
        $http({
            method: "GET",
            url: "http://127.0.0.1:3010/campaigns/ringcentral/create"
        }).then(function(response) {
            if (response.data.ret == 0) {
                var newAccount = {};
                newAccount.r_id = response.data.res.insertId;
                newAccount.r_account = "";
                newAccount.r_username = "";
                newAccount.r_password = "";
                newAccount.r_client_id = "";
                newAccount.r_client_secret = "";
                if (!$scope.rAccounts){
                    $scope.rAccounts = [];
                }
                $scope.rAccounts.push(newAccount);
            }
        });
    }
    $scope.removeAccount = function(index){
        if (window.confirm("Do you really want to remove this account?")) { 
            $http({
                method: "GET",
                url: "http://127.0.0.1:3010/campaigns/ringcentral/delete?id=" + $scope.rAccounts[index].r_id
            }).then(function(response) {
                if (response.data.ret == 0) {
                    if ($scope.rAccounts.length == 1){
                        $scope.rAccounts = [];
                    } else {
                        $scope.rAccounts.splice(index, 1);
                    }
                }
            });
        }
    }
    function getRingcentralOption(){
        
        for (var i = 0; i < $scope.rAccounts.length; i++) {
            if ($scope.rAccounts[i].r_account == $scope.campaign_ringcentral_account){
                return $scope.rAccounts[i];
                break;
            }
        }
    }
}).filter('search_highlight', function() {
    return function(msg, search) {
        if (search == undefined || search.length == 0)
            return msg;
        return msg.replace(new RegExp("(" + search + ")", "ig"), "<b class='text-danger'>$1</b>");
    }
}).filter('sea_loc', function() {
    return function(vehicles, state1, state2) {
        var arr = [];
        angular.forEach(vehicles, function(vehicle){
            if ((vehicle.p_loc.startsWith(state1) && vehicle.d_loc.startsWith(state2)) || (vehicle.p_loc.startsWith(state2) && vehicle.d_loc.startsWith(state1))) {
                arr.push(vehicle);
            }
        })
        return arr;
    }
});