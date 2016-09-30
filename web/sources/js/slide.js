// JavaScript Document


$(document).ready(function() {
	
	var current=0;
	var slide_length = $('.slide_ul>li').length;//이미지의 갯수를 변수로
	var btn_ul = '<ul class="slide_btn"></ul>';//버튼 LIST 작성할 UL
	


	$('.slide_ul>li').hide();//이미지 안보이게
	$('.slide_ul>li').first().show();//이미지 하나만 보이게
	
	
	$(btn_ul).prependTo($('.slide'))//slide 클래스위에 생성
	for (var i = 0 ; i < slide_length; i++){//동그라미 버튼 생성 이미지 li 개수 만큼
		var child = '<li><a href="#none">'+i+'</a></li>';
		$(child).appendTo($('.slide_btn'));
	}
	
	$('.slide_btn > li > a').first().addClass('active');	
	$('.slide_btn > li > a').on('click' , slide_stop);
	
//자동 슬라이드 함수
function autoplay(){
	
	if(current == slide_length-1){
	current = 0;
}else{
	current++;
}
	$('.slide_ul>li').stop().fadeOut(900);
	$('.slide_ul>li').eq(current).stop().fadeIn(700);
	$('.slide_btn > li > a').removeClass('active');	
	$('.slide_btn > li > a').eq(current).addClass('active');	
}
setInterval(autoplay,2000);//반복

//버튼 클릭시 호출되는 함수
function slide_stop(){
		var fade_idx = $(this).parent().index(); 
		current = $(this).parent().index();//클릭한 버튼의 Index 를 받아서 그 다음 이미지부터 슬라이드 재생.
		if($('.slide_ul > li:animated').length >= 1) return false; //버튼 반복 클릭시 딜레이 방지
		$('.slide_ul > li').fadeOut(400);
		$('.slide_ul > li').eq(fade_idx).fadeIn(400);
		$('.slide_btn > li > a').removeClass('active');	
		$(this).addClass('active');
		
	}	
});