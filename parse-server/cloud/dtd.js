var request = require('request');
var cheerio = require('cheerio');
var Parse = require('parse');

var scrapHtml = function(){

  var url = "http://www.coupang.com/np/categories/130800?eventCategory=categoryLeftMenu&eventLabel=";
  var Item = Parse.Object.extend("Item");

  request(url, function(error, response, body) {
    if (error) throw error;

    var $ = cheerio.load(body);

  var postElements = $("ul.prdList.grid4 li.xans-record-");
    postElements.each(function() {
      var item = new Item();
      var itemPrice;
      var promotion = $(this).find("div.description div.icon div.promotion>img").prop('src');
      var itemName = $(this).find("div.description strong a span:nth-child(2)").text();
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

scrapHtml();
