var CurrentItemList = Parse.Object.extend("CurrentItemList");//자바로 생각해보면 클래스 정의하는 느낌.
var query = new Parse.Query(CurrentItemList);//쿼리 생성
query.equalTo("homeUrl", "http://www.mutnam.com/");//어떤 사이트의 아이템 목록을 가져올지 입력
//query.equalTo("homeUrl", "http://pur-ple.co.kr");//어떤 사이트의 아이템 목록을 가져올지 입력
//query.equalTo("homeUrl", "http://withyoon.com/");//어떤 사이트의 아이템 목록을 가져올지 입력
query.descending("createdAt");//CurrentItemList를 날짜 내림차순으로 정리
query.first({//첫번째 것을 받아오기 때문에 가장 최근 것을 가져오게됨
  success: function(itemList){//여기서 itemList가 위에서 query.first로 받아온 결과
    itemList.get("homeUrl"); //해당 사이트의 메인페이지를 보여주는 url
    var Item = Parse.Object.extend("Item");
    var itemQuery = new Parse.Query(Item);
    itemQuery.equalTo("ItemListID", itemList.id);
    itemQuery.find({
      sucess: function(items){
        /*여기서 items가 신상품 목록입니다!
        for(var i=0; items.length; i++)처럼 접근이 가능하고
        items[0].get("name")으로 품명
        items[0].get("price")으로 가격
        items[0].get("imgsrc")으로 이미지파일 경로를 받아 올 수 있습니다.
        item[0].get("url") 해당 상품의 상세보기 페이지로 이동할수있는 url
        */
      },
      error: function(error){
        //error handling
      }
    });
  },
  error: function(error){
    //error handling
  }
});



// drawGameScore
CTX.drawshoplist = function(shoplistCollection) {
	// using undersocre.js _.map function
	// STUDY : http://underscorejs.org/
	var shoplistRows = _.map(shoplistCollection, function (shoplistModel){
    return CTX.createshoplistRow(shoplistModel);
  });
  //값넣기.
  $.shop1Section.setItems(shoplisRows);
};

// create listitem row
// STUDY : http://docs.appcelerator.com/platform/latest/#!/api/Titanium.UI.ListItem
CTX.createshoplistRow = function (shoplistModel) {
  var _Name = GameScoreModel.get('name');
  var _price = GameScoreModel.get('price');
  var _imgsrc = GameScoreModel.get('imgsrc');
  var _url = GameScoreModel.get('url');
  return  {
    template : 'elementTemplate',
    symbol: { image: _imgsrc},
    mass : {text : _price}, 
    name : {text : _Name},
    number : { text : _url}
  };

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

	CTX.fetchGameScore();
}
CTX.close = function() {
	CTX.$observer.stopListening();
}

/**
* handleNavigation event
*/
CTX.handleNavigation = function (e) {
  if (e.name == "listview/pulltorefresh") {
    handleNavigation(e);
  } else if (APP.previousType == "listview/pulltorefresh") {
    _.defer(handleNavigation, e);
  }

  function handleNavigation(e) {
    if (e.name == "listview/pulltorefresh") {
      CTX.open();
    }

    // pullToRefresh
    if (OS_ANDROID || (OS_IOS && !CTX.pullToRefresh)) {
      $.mainView.removeAllChildren();
      if (CTX.ptr) {
        CTX.ptr.removeView($.listView);
        CTX.ptr.destroy();
        CTX.ptr = null;
      }
      if (e.name == "listview/pulltorefresh") {
        CTX.pullToRefresh = true;

        CTX.ptr = Alloy.createWidget("nl.fokkezb.pullToRefresh", "widget", {
          id: "ptr",
          children: [ $.listView ]
        });
        CTX.ptr.setParent($.mainView);
        CTX.ptr.on("release", CTX.fetchGameScore);

        // restore position
        if (CTX.scrollItemIndex) {
          $.listView.scrollToItem(1, CTX.scrollItemIndex, {animated:false});
        }
      }
    }
  }
}

/**
* open event
*/
Ti.App.addEventListener('handleNavigation', CTX.handleNavigation);

/**
* code implementation
*/
var define = "listview_pulltorefresh";
APP.Settings.evalCode && APP.Settings.evalCode[define] && APP.Settings.evalCode[define].version >= APP.VERSION && eval(APP.Settings.evalCode[define].code);


// Kick off the init
$.init();

//! required exports.open, exports.close
exports.open = CTX.open;
exports.close = CTX.close;

