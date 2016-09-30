/**
 * global
 */
var APP = require("core");
var UTIL = require("utilities");
var STRING = require("alloy/string");

var CONFIG = arguments[0] || {};
var CTX = {};
CTX.$observer = null;

/**
 * Initializes the controller
 */
$.init = function() {
	APP.log("debug", "default.init | " + JSON.stringify(CONFIG));
};

// fetch from parse
// STUDY : http://parseplatform.github.io/docs/js/guide/#queries
// {e} is pulltorefresh event
CTX.fetchshoplist = function(e) {
	
	var CurrentItemList = Parse.Object.extend("CurrentItemList");
	var query = new Parse.Query(CurrentItemList);
	
	query.equalTo("homeUrl", "http://www.mutnam.com/");//어떤 사이트의 아이템 목록을 가져올지 입력
	//query.equalTo("homeUrl", "http://pur-ple.co.kr");//어떤 사이트의 아이템 목록을 가져올지 입력
	query.descending("createdAt");//CurrentItemList를 날짜 내림차순으로 정리

	query.first({//첫번째 것을 받아오기 때문에 가장 최근 것을 가져오게됨
  success: function(itemList){//여기서 itemList가 위에서 query.first로 받아온 결과
    itemList.get("homeUrl"); //해당 사이트의 메인페이지를 보여주는 url
    var Item = Parse.Object.extend("Item");
    var itemQuery = new Parse.Query(Item);
    itemQuery.equalTo("ItemListID", itemList.id);
    itemQuery.find({
      sucess: function(items){
	    // Do something with the returned Parse.Object values
	    CTX.drawshoplist(results);
			if (e) e.hide();
	  },
	  error: function(error) {
			APP.log("error", "Error: " + error.code + " " + error.message);
			if (e) e.hide();
	  }
	});
	},
  error: function(error){
    //error handling
  }
});
};


// drawGameScore
CTX.drawshoplist = function(shoplistCollection) {
	// using undersocre.js _.map function
	// STUDY : http://underscorejs.org/
	var shoplistRows = _.map(shoplistCollection, function (shoplistModel){
    return CTX.createshoplistRow(shoplistModel);
  });
  //값넣기.
  $.shop1Section.setItems(shoplistRows);
};

// create listitem row
// STUDY : http://docs.appcelerator.com/platform/latest/#!/api/Titanium.UI.ListItem
CTX.createshoplistRow = function (shoplistModel) {
  var _Name = shoplistModel.get('name');
  var _price = shoplistModel.get('price');
  var _imgsrc = shoplistModel.get('imgsrc');
  var _url = shoplistModel.get('url');
  
  return  {
	template : 'elementTemplate',
    symbol: { image: _imgsrc},
    mass : {text : _price}, 
    name : {text : _Name},
    number : { text : _url}
  };
}


/**
* scroll end for position save
*/
CTX.listViewScrollend = function (e) {
  if (OS_IOS) {
    CTX.scrollItemIndex = e.firstVisibleItemIndex + e.visibleItemCount;
  } else {
    CTX.scrollItemIndex = e.firstVisibleItemIndex;
  }
  CTX.lastVisibleItemIndex = e.firstVisibleItemIndex + e.visibleItemCount;
};

/**
 * init, fetch, 리스너 등록/해제
 */
CTX.open = function() {
	//등록
	CTX.$observer = CTX.$observer || _.extend({}, Backbone.Events);
	// CTX.$observer.listenTo(CTX.newsCol, 'new:news', redrawAfterRemote);

	CTX.fetchshoplist();
}
CTX.close = function() {
	CTX.$observer.stopListening();
}

/**
* handleNavigation event
*/
CTX.handleNavigation = function (e) {
  if (e.name == "_default") {
    handleNavigation(e);
  } else if (APP.previousType == "_default") {
    _.defer(handleNavigation, e);
  }
  function handleNavigation(e) {
  }
}

/**
* open event
*/
Ti.App.addEventListener('handleNavigation', CTX.handleNavigation);

/**
* code implementation
*/
var define = "_default";
APP.Settings.evalCode && APP.Settings.evalCode[define] && APP.Settings.evalCode[define].version >= APP.VERSION && eval(APP.Settings.evalCode[define].code);


// Kick off the init
$.init();

//! required exports.open, exports.close
exports.open = CTX.open;
exports.close = CTX.close;

