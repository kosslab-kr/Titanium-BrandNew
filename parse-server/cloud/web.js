var request_ = require('request');
var cheerio = require('cheerio'); //import

var scrapHtml = function(request, response){

  var url = "http://www.mutnam.com/product/list.html?cate_no=264";
  var Item = Parse.Object.extend("Item");
  var ItemList = Parse.Object.extend("ItemList");

  request_(url, function(error, resp, body) {
    if (error) throw error;

    var $ = cheerio.load(body);

    var itemList = new ItemList();

    itemList.save(null, {
      success: function(itemList) {
        console.log('success to save itemList');
        _itemSave();
      },
      error: function(itemList, error) {
        console.log('Failed to create new object, with error code: ' + error.message);
      }
    });

    function _itemSave() {
      var promises = [];

      var postElements = $("ul.prdList.grid4 li.xans-record-");
      postElements.each(function() {
        var item = new Item();
        var itemPrice;
        var promotion = $(this).find("div.description div.icon div.promotion>img").prop('src');
        var itemName = $(this).find("div.description strong a span:nth-child(2)").text();
        var imgSrc = $(this).find("div.thumbnail img").attr('src');

        if(itemName !== undefined && itemName !== ''){
          item.set("name", itemName); //item.setName(itemName);
          if(promotion === "/web/upload/custom_7.gif"){
            itemPrice = $(this).find("div.description ul li:nth-child(3)>span").text();
          }else{
            itemPrice = $(this).find("div.description ul li:nth-child(2)>span").text();
          }
          item.set("price", itemPrice);
          item.set("imgsrc", imgSrc);
          item.set("url", "http://www.mutnam.com/");
          item.set("ItemListId", itemList.id);
          item.set("ItemList", itemList);

          promises.push(item.save());
        }
      });

      Parse.Promise.when(promises).then(function() {
        console.log("success!!");
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
  itemListQuery.skip(1);
  itemListQuery.first({
    success: function(object) {
      // Successfully retrieved the object.
      item = Parse.Object.extend("Item");
      itemQuery = new Parse.Query(item);

      itemQuery.equalTo("ItemListId", object.id);
      itemQuery.find({
        success: function(results) {

          itemList = Parse.Object.extend("ItemList");
          itemListQuery = new Parse.Query(itemList);
          itemListQuery.descending("createdAt");
          itemListQuery.first({

            success: function(currentItemList){

              item = Parse.Object.extend("Item");
              itemQuery = new Parse.Query(item);

              itemQuery.equalTo("ItemListId", currentItemList.id);
              itemQuery.find({
                success: function(items){

                  var result;
                  for(var i = 0; i < results.length; i++){
                    var compareResult = false;
                    for(var j = 0; j < items.length; j++){
                      if(results[i].get("name") === items[j].get("name")){
                        compareResult = true;
                      }
                    }
                    if(compareResult === false){
                      result = "update!";
                      break;
                    }else{
                      result = "Nothing happened";
                    }
                  }
                  response.success(result);
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
        error: function(error) {
          alert("Error: " + error.code + " " + error.message);
        }
      });
    },
    error: function(error) {
      alert("Error: " + error.code + " " + error.message);
    }
  });

}
