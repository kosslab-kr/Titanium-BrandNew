var request_ = require('request');
var cheerio = require('cheerio'); //import

//Html을 scraping, parsing하여 데이터로 가공 저장하는 함수
var scrapHtml = function(request, response){
  //타겟 쇼핑몰 url을 설정하고 필요한 object를 정의
  var url = "http://www.mutnam.com/product/list.html?cate_no=264";
  var Item = Parse.Object.extend("Item");
  var ItemList = Parse.Object.extend("ItemList");

  //위에서 정의한 url을 request를 통해 Html을 가져온다. 가지고온 Html은 body에 있다.
  request_(url, function(error, resp, body) {
    if (error) throw error;

    //body를 cheerio를 통해 파싱하기 위한 부분
    var $ = cheerio.load(body);

    //itemList를 생성 후 저장한다.
    //내용은 비어있지만 이후 생성되는 item이 itemList의 id를 가지며 논리적으로는 itemList가 item들을 가지게 된다
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
      //상품 목록을 포함하는 부분을 찾아 postElements로 설정한다. 아래 결과 postElement는 여러개의 li가 된다고 할 수 있다.
      var postElements = $("ul.prdList.grid4 li.xans-record-");
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
          item.set("url", "http://www.mutnam.com/");
          item.set("ItemListId", itemList.id);
          item.set("ItemList", itemList);

          //object의 내용을 저장한다. 저장한 결과를 pomises배열에 넣어 추후 모두 잘 들어갔는지 확인한다.
          promises.push(item.save());
        }
      });
      //promises를 확인하려 모든 item들의 save가 성공적으로 이루어졌는지 확인한다.
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
        response.success("There is no ItemList to compare.");
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

              for(var i = 0; i < latestItems.length; i++){
                var compareResult = false;
                for(var j = 0; j < previousItems.length; j++){
                  if(latestItems[i].get("name") === previousItems[j].get("name")){
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
    error: function(error){
      alert("Error: " + error.code + " " + error.message);
    }
  });
}
