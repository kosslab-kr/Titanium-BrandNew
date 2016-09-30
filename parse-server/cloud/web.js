var request_ = require('request');
var cheerio = require('cheerio'); //import

var MUTNAM = {
  homeUrl : {src : "http://www.mutnam.com/"},
  itemUrl : {css : "div.thumbnail a"},
  postElements : {css : "ul.prdList.grid4 li.xans-record-"},
  promotion : {css : "div.description div.icon div.promotion>img"},
  itemName : {css : "div.description strong a span:nth-child(2)"},
  imgSrc : {css : "div.thumbnail img"},
  promotionImg: {
    first : {src : "/web/upload/custom_7.gif"}
  },
  promotionPrice : {css : "div.description ul li:nth-child(3)>span"},
  unPromotionPrice : {css : "div.description ul li:nth-child(2)>span"}
};

var PURPLE = {
  homeUrl : {src : "http://pur-ple.co.kr"},
  itemUrl : {css : "a"},
  postElements : {css : "li.item.xans-record-"},
  promotion : {css : "div.icon>img"},
  itemName : {css : "p.name a>span"},
  imgSrc : {css : "a img"},
  promotionImg: {
    first : {src : "/web/upload/benefit/benefit_shop1_821667577203545cf3b0.77032659.gif"},
    second : {src : "/web/upload/benefit/benefit_shop1_73575457c77ee16ccb72.79719215.gif"}
  },
  promotionPrice : {css : "p.price_sale"},
  unPromotionPrice : {css : "p.price.strike"}
};

var WITHYOON = {
  homeUrl : {src : "http://withyoon.com/"},
  itemUrl : {css : "div.box p.name a:nth-child(2)"},
  postElements : {css : "div.xans-element-.xans-product.xans-product-listmain-2.xans-product-listmain.xans-product-2 ul.prdList.column3 li.item.xans-record-"},
  itemName : {css : "div.box p.name span"},
  imgSrc : {css : "div.box p.name a img"},
  price : {css : "div.box li:nth-child(1)>span"}
};

//Html을 scraping, parsing하여 데이터로 가공 저장하는 함수
var scrapHtml_mutnam = function(){
  //타겟 쇼핑몰 url을 설정하고 필요한 object를 정의
  var url = "http://www.mutnam.com/product/list.html?cate_no=264";
  var ItemList = Parse.Object.extend("ItemList");

  //위에서 정의한 url을 request를 통해 Html을 가져온다.
  request_(url, function(error, resp, body) {
    if (error) throw error;
    //itemList를 생성 후 저장한다.
    //내용은 비어있지만 이후 생성되는 item이 itemList의 id를 가지며 논리적으로는 itemList가 item들을 가지게 된다
    var itemList = new ItemList();
    itemList.set("homeUrl", MUTNAM.homeUrl.src);
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
    itemList.set("homeUrl", PURPLE.homeUrl.src);
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

var scrapHtml_withyoon = function(){
  var url = "http://withyoon.com/index.html";
  var ItemList = Parse.Object.extend("ItemList");

  request_(url, function(error, resp, body) {
    if (error) throw error;

    var itemList = new ItemList();
    itemList.set("homeUrl", WITHYOON.homeUrl.src);
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
  var ENUM;
  console.log(itemList.get("homeUrl"));
  if(itemList.get("homeUrl")=== MUTNAM.homeUrl.src){
    ENUM = MUTNAM;
  }else if(itemList.get("homeUrl")=== PURPLE.homeUrl.src){
    ENUM = PURPLE;
  }else if(itemList.get("homeUrl") === WITHYOON.homeUrl.src){
    ENUM = WITHYOON;
  }
  postElements = $(ENUM.postElements.css);
  //각각의 element들에 대하여 function을 실행한다.
  postElements.each(function() {
    var item = new Item();
    //itemPrice의 경우 이 사이트에서는 상품의 할인 여부에 따라 위치가 달라져 아래(if문)에서 정의한다.
    var itemPrice;
    //상품명과 상품 이미지
    var itemName = $(this).find(ENUM.itemName.css).text();

    var imgSrc = $(this).find(ENUM.imgSrc.css).attr('src');
    var p_link = ENUM.homeUrl.src + $(this).find(ENUM.itemUrl.css).attr('href');  // 해당 상품 주소 55
    //price를 찾아내기 위한 부분인 promotion을 정의한다.
    //var promotion = $(this).find(ENUM.promotion.css).prop('src');
    //찾아낸 데이터중 필요가 없는 데이터를 제외하고 item object로 가공한다.
    if(itemName !== undefined && itemName !== ''){
      item.set("name", itemName); //item.setName(itemName);
      //promotion에 있는 이미지가 아래 경로와 같을때를 제외하고는 2번째 li 아래에 있는 span에 상품명이 존재한다.
      if(ENUM.promotion !== undefined){
        var promotion = $(this).find(ENUM.promotion.css).prop('src');

        var isOnSale = false;
        for(var i in ENUM.promotionImg){
          if(promotion === ENUM.promotionImg[i].src){
            isOnSale = true;
          }
        }

        if(isOnSale){
          itemPrice = $(this).find(ENUM.promotionPrice.css).text();
        }else{
          itemPrice = $(this).find(ENUM.unPromotionPrice.css).text();
        }
      }else{
        itemPrice=$(this).find(ENUM.price.css).text();
      }

      //item object의 필드값을 채워주고
      item.set("price", itemPrice);
      item.set("imgsrc", imgSrc);
      item.set("url", p_link);      //url변경 (쇼핑몰 대표 페이지->해당 상품 페이지주소)
      item.set("ItemListId", itemList.id);
      item.set("ItemList", itemList);
      //object의 내용을 저장한다. 저장한 결과를 pomises배열에 넣어 추후 모두 잘 들어갔는지 확인한다.
      promises.push(item.save());
    }
  });
  //promises를 확인하여 모든 item들의 save가 성공적으로 이루어졌는지 확인한다.
  Parse.Promise.when(promises).then(function() {
    console.log("success to save all items");
    compareItemList(itemList.get("homeUrl"));
  }, function (error) {
    console.log("error! in promise");
  });
}

//이전에 저장된 ItemList와 가장 최근 저장된 ItemList를 비교, 업데이트 여부 확인
var compareItemList = function(homeUrl){
  console.log("compareItemList - " + homeUrl);
  var promises = [];
  var itemList = Parse.Object.extend("ItemList");
  var itemListQuery = new Parse.Query(itemList);

  itemListQuery.equalTo("homeUrl", homeUrl);//인자로 받아온 Url에 해당하는 아이템리스트를 받아옴
  itemListQuery.descending("createdAt");
  itemListQuery.limit(2); //가장 최근 저장된 두개를 비교하면 되기때문에 2개로 제한
  itemListQuery.find({
    success: function(object){
      console.log("sucess compareItemList");
      if(object.length === 1){ //2개로 제한을 했는데 1개만 왔을경우 첫번째로 삽입이 되는 경우.(최초 실행)
        result = "There is no ItemList to compare.";
        saveCurrentItemList(object[0], result); //이 itemList로 최근아이탬리스트 저장
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
                var isUpdate = false; //업데이트 여부를 확인할 변수. 초기값 false 변화가 있을지 true로
                for(var j = 0; j < previousItems.length; j++){
                  if(latestItems[i].get("name") === previousItems[j].get("name")){
                    isUpdate = true; //가장 최근 아이템 리스트에 있는 아이템과 이전 아이템을 비교 변화가 있을경우 true
                  }
                }
                if(isUpdate === false){
                  result = "update!";
                }
              }
              if(result === "update!"){
                //업데이트가 있을경우 더이상 탐색을 하지 않아도 되기 때문에 여기서 saveCurrentItemList를 호출
                saveCurrentItemList(latestItems, result);
              }else{
                //업데이트가 안됐을 경우 오브젝트 삭제
                console.log(result);
                for(var k=0; k<latestItems.length; k++){
                  promises.push(latestItems[k].destroy());
                }
                Parse.Promise.when(promises).then(function() {
                  console.log("all items were deleted");
                  object[0].destroy({
                    success: function(myObject) {
                      console.log("delete itemList unupdated");
                    },
                    error: function(myObject, error) {
                      console.log("destroy fail - compareItemList");
                    }
                  });
                }, function (error) {
                  console.log("error! in promise - compareItemList");
                });
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

//업데이트 여부가 확인된 아이템리스트를 저장
function saveCurrentItemList(itemList, result){
  var CurrentItemList = Parse.Object.extend("CurrentItemList");
  currentItemList = new CurrentItemList();
  currentItemList.set("homeUrl", itemList.get("homeUrl"));
  currentItemList.set("ItemListID", itemList.id);
  currentItemList.set("ItemList", itemList);
  currentItemList.save(null, {
    success: function(){
      console.log("save CurrentItemList");
      console.log(result);
      Parse.Push.send({
        where: query,
        data: {
          alert: "신상품이 업데이트 되었습니다!"
        }
      }, {
        success: function() {
          console.log("push sended");
        },
        error: function(error) {
          // Handle error
        }
      });

    },
    error: function(error){
      alert("Error: " + error.code + " " + error.message);
    }
  });
}

module.exports.scrapHtml_mutnam = scrapHtml_mutnam;
module.exports.scrapHtml_purple = scrapHtml_purple;
module.exports.scrapHtml_withyoon = scrapHtml_withyoon;
