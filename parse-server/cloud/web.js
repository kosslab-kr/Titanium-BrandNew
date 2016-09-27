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
        response.success();
      }, function (error) {
        console.log("error! in promise");
        response.error();
      });
    }
  });

};
module.exports.scrapHtml = scrapHtml;
