var request = require('request');
var cheerio = require('cheerio');
var Parse = require('parse');

var scrapHtml = function(){

  var url = "http://www.chicfox.co.kr/shop/shopbrand.html?xcode=020&type=P";
  var Item = Parse.Object.extend("Item");

  request(url, function(error, response, body) {
    if (error) throw error;
    //console.log(body);
    var $ = cheerio.load(body);

  var postElements = $("div.item_list.list");
    postElements.each(function() {
      var item = new Item();

      var itemName = $(this).find("li.pname font font").text();
      var promotion = $(this).find("li.icons>img").prop('src');
      var itemPrice;
      var imgSrc = $(this).find("li.thumb img").attr('src');
      //item.set("url", "http://www.chicfox.co.kr/index.html");
      //var link = $(this).find(li.thumb a).text();
      //link = link+url;
      //("div.thumbnail img").attr('src');

      if(itemName !== undefined && itemName !== ''){
        item.set("name", itemName);
        if(promotion !== undefined){
          itemPrice = $(this).find("div.item_list.list span.price-strike").text();
        }else{
          itemPrice = $(this).find("div.item_list.list span.price").text();
        }
        item.set("price", itemPrice);
        item.set("imgsrc", imgSrc);
        item.set("url", "http://www.chicfox.co.kr/index.html");

        var tempText = item.get('name')+'\n'+item.get('price')+'\n'+item.get('url')+'\n'+item.get('imgsrc')+'\n';
        console.log(tempText);
      }
    });
  });

};

scrapHtml();
