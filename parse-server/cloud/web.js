var request_ = require('request');
var cheerio = require('cheerio'); //import

//Html을 scraping, parsing하여 데이터로 가공 저장하는 함수
var scrapHtml_mutnam = function(){
  //타겟 쇼핑몰 url을 설정하고 필요한 object를 정의
  var url = "http://www.mutnam.com/product/list.html?cate_no=264";
  var ItemList = Parse.Object.extend("ItemList");

  //위에서 정의한 url을 request를 통해 Html을 가져온다. 가지고온 Html은 body에 있다.
  request_(url, function(error, resp, body) {
    if (error) throw error;
    //itemList를 생성 후 저장한다.
    //내용은 비어있지만 이후 생성되는 item이 itemList의 id를 가지며 논리적으로는 itemList가 item들을 가지게 된다
    var itemList = new ItemList();
    itemList.set("homeUrl", "http://www.mutnam.com/");
    itemList.save(null, {
      success: function(itemList) {
        console.log('success to save itemList');
        //아래 정의된 함수 _itemSave 호출
        _itemSave(body, itemList, url);
      },
      error: function(itemList, error) {
        console.log('Failed to create new object, with error code: ' + error.message);
      }
    });
  });
};

var scrapHtml_purple = function(){
  var url = "http://pur-ple.co.kr/product/list.html?cate_no=72";
  var ItemList = Parse.Object.extend("ItemList");

  request_(url, function(error, resp, body) {
    if (error) throw error;

    var itemList = new ItemList();
    itemList.set("homeUrl", "http://pur-ple.co.kr");
    itemList.save(null, {
      success: function(itemList) {
        console.log('success to save itemList');
        _itemSave(body, itemList, url);
      },
      error: function(itemList, error) {
        console.log('Failed to create new object, with error code: ' + error.message);
      }
    });
  });
};

//Html을 파싱하여 각각의 item으로 가공을 하여 저장하는 부분
function _itemSave(body, itemList, url) {
  //body를 cheerio를 통해 파싱하기 위한 부분
  var $ = cheerio.load(body);

  var Item = Parse.Object.extend("Item");
  var promises = [];
  var postElements;
  //상품 목록을 포함하는 부분을 찾아 postElements로 설정한다. 아래 결과 postElement는 여러개의 li가 된다고 할 수 있다.
  if(url === "http://www.mutnam.com/product/list.html?cate_no=264"){
    postElements = $("ul.prdList.grid4 li.xans-record-");
    //각각의 element들에 대하여 function을 실행한다.
    postElements.each(function() {
      var item = new Item();
      //itemPrice의 경우 이 사이트에서는 상품의 할인 여부에 따라 위치가 달라져 아래(if문)에서 정의한다.
      var itemPrice;
      //price를 찾아내기 위한 부분인 promotion을 정의한다.
      var promotion = $(this).find("div.description div.icon div.promotion>img").prop('src');
      //상품명과 상품 이미지
      var itemName = $(this).find("div.description strong a span:nth-child(2)").text();
      var imgSrc = $(this).find("div.thumbnail img").attr('src');
      var p_link = $(this).find("div.thumbnail a").attr('href');  // 해당 상품 주소 55
      p_link = "http://www.mutnam.com"+p_link;
      //찾아낸 데이터중 필요가 없는 데이터를 제외하고 item object로 가공한다.
      if(itemName !== undefined && itemName !== ''){
        item.set("name", itemName); //item.setName(itemName);
        //promotion에 있는 이미지가 아래 경로와 같을때를 제외하고는 2번째 li 아래에 있는 span에 상품명이 존재한다.
        if(promotion === "/web/upload/custom_7.gif"){
          itemPrice = $(this).find("div.description ul li:nth-child(3)>span").text();
        }else{
          itemPrice = $(this).find("div.description ul li:nth-child(2)>span").text();
        }
        //item object의 필드값을 채워주고
        item.set("price", itemPrice);
        item.set("imgsrc", imgSrc);
        //item.set("url", "http://www.mutnam.com/");
        item.set("url", p_link);      //url변경 (쇼핑몰 대표 페이지->해당 상품 페이지주소)
        item.set("ItemListId", itemList.id);
        item.set("ItemList", itemList);

        //object의 내용을 저장한다. 저장한 결과를 pomises배열에 넣어 추후 모두 잘 들어갔는지 확인한다.
        promises.push(item.save());
      }
    });
  }else if(url === "http://pur-ple.co.kr/product/list.html?cate_no=72"){
    postElements = $("li.item.xans-record-");
    postElements.each(function() {
      var item = new Item();
      var itemName = $(this).find("p.name a span").text();
      var itemPrice = $(this).find("p.price").text();
      var imgSrc = $(this).find("a img").attr('src');

      var p_link = $(this).find("a").attr('href');   // 해당 상품 주소 55
      p_link = "http://pur-ple.co.kr"+p_link;

      if(itemName !== undefined && itemName !== ''){
        item.set("name", itemName);
        item.set("price", itemPrice);
        item.set("imgsrc", imgSrc);
        //item.set("url", "http://pur-ple.co.kr");
        item.set("url", p_link);  //url변경 (쇼핑몰 대표 페이지->해당 상품 페이지주소)
        item.set("ItemListId", itemList.id);
        item.set("ItemList", itemList);

        promises.push(item.save());
      }
    });
  }

  //promises를 확인하려 모든 item들의 save가 성공적으로 이루어졌는지 확인한다.
  Parse.Promise.when(promises).then(function() {
    console.log("success to save all items");
    compareItemList(itemList.get("homeUrl"));          //campare -> compare 오타 나신듯-> 수정
  }, function (error) {
    console.log("error! in promise");
  });
}

var compareItemList = function(homeUrl){ //campare -> compare 오타 나신듯-> 수정
  console.log("compareItemList - " + homeUrl);
  var itemList = Parse.Object.extend("ItemList");
  var itemListQuery = new Parse.Query(itemList);
  itemListQuery.equalTo("homeUrl", homeUrl);
  itemListQuery.descending("createdAt");
  itemListQuery.limit(2);
  itemListQuery.find({
    success: function(object){
      console.log("sucess compareItemList");
      if(object.length === 1){
        result = "There is no ItemList to compare.";
        saveCurrentItemList(itemList, result);
      }

      item = Parse.Object.extend("Item");
      itemQuery = new Parse.Query(item);
      itemQuery.equalTo("ItemListId", object[0].id);
      itemQuery.find({
        success: function(latestItems){

          itemQuery = new Parse.Query(item);
          itemQuery.equalTo("ItemListId", object[1].id);
          itemQuery.find({
            success: function(previousItems){

              result = "Nothing happened";
              for(var i = 0; i < latestItems.length; i++){
                var compareResult = false;
                for(var j = 0; j < previousItems.length; j++){
                  if(latestItems[i].get("name") === previousItems[j].get("name")){
                    compareResult = true;
                  }
                }
                if(compareResult === false){
                  result = "update!";
                }
              }
              if(result === "update!"){
                saveCurrentItemList(latestItems, result);
              }else{
                console.log(result);
              }
            },
            error: function(error){
              alert("Error: " + error.code + " " + error.message);
            }
          });
        },
        error: function(error){
          alert("Error: " + error.code + " " + error.message);
        }
      });
    },
    error: function(error){
      alert("Error: " + error.code + " " + error.message);
    }
  });
};

function saveCurrentItemList(itemList, result){
  var CurrentItemList = Parse.Object.extend("CurrentItemList");
  currentItemList = new CurrentItemList();
  currentItemList.set("url", "http://www.mutnam.com/");
  currentItemList.set("ItemListID", itemList.id);
  currentItemList.set("ItemList", itemList);
  currentItemList.save(null, {
    success: function(){
      console.log("save CurrentItemList");
      console.log(result);
    },
    error: function(){

    }
  });
}

module.exports.scrapHtml_mutnam = scrapHtml_mutnam;
module.exports.scrapHtml_purple = scrapHtml_purple;
