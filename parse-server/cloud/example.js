var CurrentItemList = Parse.Object.extend("CurrentItemList");//자바로 생각해보면 클래스 정의하는 느낌.
var query = new Parse.Query(CurrentItemList);//쿼리 생성
query.descending("createdAt");//CurrentItemList를 날짜 내림차순으로 정리
query.first({//첫번째 것을 받아오기 때문에 가장 최근 것을 가져오게됨
  success: function(itemList){//여기서 itemList가 위에서 query.first로 받아온 결과
    var Item = Parse.Object.extend("Item");
    var itemQuery = new Parse.Query(Item);
    itemQuery.equalTo("ItemListID", itemList.id);
    itemQuery.find({
      sucess: function(items){
        /*여기서 items가 신상품 목록입니다!
        for(var i=0; items.length; i++)처럼 접근이 가능하고
        items[0].get("name")으로 품명
        items[0].get("price")으로 가격
        items[0].get("imgsrc")으로 이미지파일 경로를 받아 올 수 있습니다.
        */
      },
      error: function(error){
        //error handling
      }
    });
  },
  error: function(error){
    //error handling
  }
});
