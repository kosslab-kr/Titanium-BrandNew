var request_ = require('request');
var cheerio = require('cheerio'); //import
//var Parse = require('Parse');
//var Parse = require('parse').Parse;

//Parse.initialize("Your App Id", "Your JavaScript Key");

//Html을 scraping, parsing하여 데이터로 가공 저장하는 함수
var scrapHtml_dtd = function(request, response){
  //타겟 쇼핑몰 url을 설정하고 필요한 object를 정의
  var url = "http://pur-ple.co.kr/product/list.html?cate_no=72";
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
      var postElements = $("li.item.xans-record-");
      //각각의 element들에 대하여 function을 실행한다.
      postElements.each(function() {
        var item = new Item();
        var itemName = $(this).find("p.name a span").text(); // utf-8
        var itemPrice = $(this).find("p.price").text();
        var imgSrc = $(this).find("a img").attr('src');

        //찾아낸 데이터중 필요가 없는 데이터를 제외하고 item object로 가공한다.
        if(itemName !== undefined && itemName !== ''){
          item.set("name", itemName); //item.setName(itemName);
          item.set("price", itemPrice);
          item.set("imgsrc", imgSrc);
          item.set("url", "http://pur-ple.co.kr");
          item.set("ItemListId", itemList.id);
          item.set("ItemList", itemList);

          //object의 내용을 저장한다. 저장한 결과를 pomises배열에 넣어 추후 모두 잘 들어갔는지 확인한다.
          promises.push(item.save());
        }
      });
      //promises를 확인하려 모든 item들의 save가 성공적으로 이루어졌는지 확인한다.
      Parse.Promise.when(promises).then(function() {
        console.log("success to save all items");
        campareItemList(response);          //campare -> compare 오타 나신듯
        //response.success();
      }, function (error) {
        console.log("error! in promise");
        response.error();
      });
    }
  });

};

module.exports.scrapHtml_dtd = scrapHtml_dtd;

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
  currentItemList.set("url", "http://pur-ple.co.kr");
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

//scrapHtml_dtd();
