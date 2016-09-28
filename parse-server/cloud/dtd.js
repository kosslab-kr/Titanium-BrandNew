var request = require('request');
var cheerio = require('cheerio');
var Parse = require('parse');

var Iconv = require('iconv').Iconv;
var iconv = new Iconv('EUC-KR', 'UTF-8//TRANSLIT//IGNORE');

var scrapHtml = function(){

  var url = "http://pur-ple.co.kr/product/list.html?cate_no=72";
  var Item = Parse.Object.extend("Item");

  request(url, function(error, response, body) {
    if (error) throw error;
    //console.log(body);
    var $ = cheerio.load(body);

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
        item.set("url", "http://www.chicfox.co.kr/index.html");

        var tempText = item.get('name')+'\n'+item.get('price')+'\n'+item.get('url')+'\n'+item.get('imgsrc')+'\n';
        console.log(tempText);
      }
    });
  });

};

scrapHtml();
