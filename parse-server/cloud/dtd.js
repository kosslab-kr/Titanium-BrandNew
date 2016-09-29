var request = require('request');
var cheerio = require('cheerio');
var Parse = require('parse');

var scrapHtml = function(){

  var url = "http://pur-ple.co.kr/product/list.html?cate_no=72";
  var Item = Parse.Object.extend("Item");
  var ItemList = Parse.Object.extend("ItemList");

  request(url, function(error, response, body) {
    if (error) throw error;

    var $ = cheerio.load(body);
//
var itemList = new ItemList();
itemList.save(null, {
  success: function(itemList) {
    console.log('success to save itemList');
    //아래 정의된 함수 _itemSave 호출
    _itemSave();
  },
  error: function(itemList, error) {
    console.log('Failed to create new object, with error code: ' + error.message);
  }
});

//Html을 파싱하여 각각의 item으로 가공을 하여 저장하는 부분
function _itemSave() {
  var promises = [];

//
  var postElements = $("li.item.xans-record-");
    postElements.each(function() {
      var item = new Item();

      var itemName = $(this).find("p.name a span").text(); // utf-8
      var itemPrice = $(this).find("p.price").text();
      var imgSrc = $(this).find("a img").attr('src');

      if(itemName !== undefined && itemName !== ''){
        item.set("name", itemName);
        item.set("price", itemPrice);
        item.set("imgsrc", imgSrc);
        item.set("url", "http://pur-ple.co.kr");

        item.set("ItemListId", itemList.id);
        item.set("ItemList", itemList);

        promises.push(item.save());

        var tempText = item.get('name')+'\n'+item.get('price')+'\n'+item.get('url')+'\n'+item.get('imgsrc')+'\n';
        console.log(tempText);
      }
    });

    Parse.Promise.when(promises).then(function() {
      console.log("success to save all items");
      campareItemList(response);
      //response.success();
    }, function (error) {
      console.log("error! in promise");
      response.error();
    });
  }
  });

};

module.exports.scrapHtml = scrapHtml;

var campareItemList = function(response){
  var itemList = Parse.Object.extend("ItemList");
  var itemListQuery = new Parse.Query(itemList);
  itemListQuery.descending("createdAt");
  itemListQuery.limit(2);
  itemListQuery.find({
    success: function(object){

      if(object.length === 1){
        result = "There is no ItemList to compare.";
        saveCurrentItemList(itemList, result, response);
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
                saveCurrentItemList(latestItems, result, response);
              }else{
                response.success(result);
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

function saveCurrentItemList(itemList, result, response){
  var CurrentItemList = Parse.Object.extend("CurrentItemList");
  currentItemList = new CurrentItemList();
  currentItemList.set("url", "http://www.mutnam.com/");
  currentItemList.set("ItemListID", itemList.id);
  currentItemList.set("ItemList", itemList);
  currentItemList.save(null, {
    success: function(){
      console.log("save CurrentItemList");
      response.success(result);
    },
    error: function(){

    }
  });
}
