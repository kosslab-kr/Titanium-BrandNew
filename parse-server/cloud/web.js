var request = require('request');
var cheerio = require('cheerio');
var Parse = require('parse');

var scrapHtml = function(){

  var url = "http://www.mutnam.com/product/list.html?cate_no=264";
  var Item = Parse.Object.extend("Item");

  request(url, function(error, response, body) {
    if (error) throw error;
    console.log(body);
    var $ = cheerio.load(body);

  var postElements = $("ul.prdList.grid4 li.xans-record-");
    postElements.each(function() {
      var item = new Item();
      var itemPrice;
      var promotion = $(this).find("div.description div.icon div.promotion>img").prop('src');
      var itemName = $(this).find("div.description strong a span:nth-child(2)").text();
      // decription -> class이름임. strong, span 은 태그. nth-여러개 있는 경우. 2는 2번째로 나오는 <span></>사이에 있는 정보 가져오기

      var imgSrc = $(this).find("div.thumbnail img").attr('src');

      if(itemName !== undefined && itemName !== ''){
        item.set("name", itemName);
        if(promotion !== undefined){
          itemPrice = $(this).find("div.description ul li:nth-child(3)>span").text();
        }else{
          itemPrice = $(this).find("div.description ul li:nth-child(2)>span").text();
        }
        item.set("price", itemPrice);
        item.set("imgsrc", imgSrc);
        item.set("url", "http://www.mutnam.com/");

        var tempText = item.get('name')+'\n'+item.get('price')+'\n'+item.get('url')+'\n'+item.get('imgsrc')+'\n';
        console.log(tempText);
      }
    });
  });

};

<<<<<<< HEAD
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
=======
scrapHtml();
>>>>>>> 03d0c7b6fe66e9165ce5a6fb907ba5a5448b50be
