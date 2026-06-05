<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8" %>
<%@ include file="/WEB-INF/jsp/config/include.jsp" %>
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">
<head>
<meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
<meta http-equiv="X-UA-Compatible" content="IE=9;FF=3;OtherUA=4" />
<title>IFRS</title>


<script type="text/javascript" src="${scriptPath}/ifrs/new/jquery.js"></script>
<script type="text/javascript" src="${scriptPath}/ifrs/new/jquery-ui.js"></script>
<script type="text/javascript" src="${scriptPath}/ifrs/calendar_month5.js"></script>
<script type="text/javascript" src="${scriptPath}/ifrs/jqCommonNew.js"></script>
<script type="text/javascript" src="${scriptPath}/ifrs/common.js"></script>
<script type="text/javascript" src="${scriptPath}/ifrs/Address.js"></script>


<script type="text/javascript" src="${scriptPath}/ifrs/new/bootstrap.min.js"></script>
<script type="text/javascript" src="${scriptPath}/ifrs/new/select2.min.js"></script>
<script type="text/javascript" src="${scriptPath}/ifrs/new/json2xml.js"></script>
<script type="text/javascript" src="${scriptPath}/ifrs/new/xml2json.js"></script>

<script type="text/javascript" src="${scriptPath}/ifrs/new/jquery.ui.datepicker-ko.js"></script>
<script type="text/javascript" src="${scriptPath}/ifrs/new/jquery.isloading.min.js"></script>

<script type="text/javascript" src="${scriptPath}/ifrs/new/jQuery.print.js"></script>
<script type="text/javascript" src="${scriptPath}/ifrs/new/html2canvas.js"></script>
<script type="text/javascript" src="${scriptPath}/ifrs/new/canvas2image.js"></script>
<script type="text/javascript" src="${scriptPath}/ifrs/new/jquery.table2excel.js"></script>
<script type="text/javascript" src="${scriptPath}/ifrs/new/printThis.js"></script>


<script type="text/javascript" src="${scriptPath}/ifrs/new/tinymce/tinymce.min.js"></script>


<link rel="stylesheet" type="text/css" href="${cssPath}/ifrs/new/jquery-ui.css" />
<link rel="stylesheet" type="text/css" href="${cssPath}/ifrs/new/bootstrap.min.css" />
<link rel="stylesheet" type="text/css" href="${cssPath}/ifrs/new/bootstrap-theme.css" />
<link rel="stylesheet" type="text/css" href="${cssPath}/ifrs/new/select2.css" />

<link rel="stylesheet" type="text/css" href="${cssPath}/ifrs/new/font-awesome/css/font-awesome.min.css" />

<link rel="stylesheet" type="text/css" href="${cssPath}/ifrs/ifrs.css" />




<style type="text/css">
div#container { width:1900px; }
div#content { width:1500px; }
/* .money {text-align:right;} */
.left-cell {text-align:left;}
/* .center {text-align:center;} */
#sdate {text-align:center;font-size:15px;background-color:#e6f0ff;}


.ahref { 
    font-size:14px;
    margin-right:10px;
}

.ahref:hover { 
    color: red;
}

.ahref:hover {color: red;}

.ahref:active {color: blue;background-color:lightgray;}

.modal-dialog {
	min-width:100px;
}

.modal-header {
	text-align:right;
	background-color:lightgray;
	margin:0px;
	padding:10px;
}	

.modal-dialog {
	max-height: calc(100vh - 225px);
}

.modal {
  text-align: center;
  padding: 0!important;
}

.modal:before {
  content: '';
  display: inline-block;
  height: 100%;
  vertical-align: middle;
  margin-right: -4px;
}

.modal-dialog {
  display: inline-block;
  text-align: left;
  vertical-align: middle;
}

.confirmModalContentText {
	text-align : center;
	font-weight:bold;
	font-size:18px;
}

.confirmModalContent {
	text-align : center;
	font-weight:bold;
	font-size:18px;
}

.modal-title{
	font-size:12px;
}

.my-row-style {
	background:#ffffcc;
	font-weight:bold;
}

.isloading-wrapper.isloading-right{margin-left:10px;}
.isloading-overlay{position:relative;text-align:center;}.isloading-overlay .isloading-wrapper{background:#FFFFFF;-webkit-border-radius:7px;-webkit-background-clip:padding-box;-moz-border-radius:7px;-moz-background-clip:padding;border-radius:7px;background-clip:padding-box;display:inline-block;margin:0 auto;padding:10px 20px;top:10%;z-index:9000;}

/*Glyphicon Spinner*/
.glyphicon-spin {
    -animation: spin .9s infinite linear;
    -webkit-animation: spin2 .9s infinite linear;
}

@-webkit-keyframes spin2 {
    from { -webkit-transform: rotate(0deg);}
    to { -webkit-transform: rotate(360deg);}
}

@keyframes spin {
    from { transform: scale(1) rotate(0deg);}
    to { transform: scale(1) rotate(360deg);}
}

.stable {
 	border-style: solid;
	border-width: 2px;
	border-color: gray;
	width:100%;
	background-color:white;	  	
}

.stable td {
 	border-style: solid;
	border-width: 2px;
	border-color: gray;
	height:20px;
	margin:3px;
	padding:3px;
	font-size:11px;
	background-color:white;
}	 

.stable th {
 	border-style: solid;
	border-width: 2px;
	border-color: gray;
	height:25px;
	background-color: lightgray;
	text-align:center;
	margin:3px;
	padding:3px;
	font-size:11px;
}
.subtitle {
/*   	border-style: solid;
	border-width: 0px 0px 0px 0px;
	border-color: gray; */
	height:25px;
	/* background-color: #e6e6e6; */
	text-align:center;
	margin:3px;
	padding:3px;
	font-weight:bold;
}

.bold {
	font-weight:bold;
}

.titletext {
	font-weight:bold;
	font-size:15px;
	font-color:gray;
/*  	border-width: 0px 0px 0px 0px;
	border-style: dashed;
	border-color: lightgray; */
}

.money {
	text-align:right;
}



</style>

<script type="text/javascript">

	var SESSION = "${SESSION}"; // 소속 법인 번호
	
	// 휴무일 여부 판단해서 전일 선택
	function holyday(year,month,day,plus){
		var holyparam = "Y";
		var url = "<c:url value='/ifrs/capital/holyday' />";
		var serdate = "serdate=" + year+month+day;
		fn_ajax(url, serdate, function( results ){
			holyparam = results.list[0].holyparam;			
			$("#holyday").val(holyparam);
		
		setTimeout( function(){
			//console.log($("#holyday").val());
			if ( $("#holyday").val() == "Y" ) {
				nowday = new Date(year+"-"+month+"-"+day);
				yesterday = new Date(nowday.valueOf() - (24*60*60*1000*plus));
				year = yesterday.getFullYear();
				month = yesterday.getMonth() + 1;
				day = yesterday.getDate();					
				if(month < 10){month = "0" + month;}
				if(day < 10){day = "0" + day;}														
				holyday(year,month,day,plus);							
			} else {
				var newday = year +"" + month + "" + day;
				$("#newday").val(newday);				
			}
		}, 50 );			
		
		});
	}	
	
	$(document).on('change', '#sdate', function() {
		
		var dYear = $("#sdate").val().substr(0,4);
		var dMonth = $("#sdate").val().substr(4,2);
		var dDay = $("#sdate").val().substr(6,2);
		
		var nowday = new Date(dYear+"-"+dMonth+"-"+dDay);			
		var yesterday = new Date(nowday.valueOf() - (24*60*60*1000));
		
		
		var year = yesterday.getFullYear();
		var month = yesterday.getMonth() + 1;
		var day = yesterday.getDate();
		
		if(month < 10){month = "0" + month;}
		if(day < 10){day = "0" + day;}
		
		var sdate1 = year+''+month+''+day;
		
		holyday(year, month, day, 1);			
		
	});	
	

	$(document).ready(function(){
		
		$("#comNo").val(SESSION);
		
		$("#topDiv").hide();
		
		// 법인선택 Select2
		$("#comNo").select2();
		
		// 일자 선택
		$("#sdate").datepicker({
			dateFormat:'yymmdd',
			changeMonth: true,
			changeYear: true
		});
		
		// 버튼 툴팁 적용
		$('[data-toggle="tooltip"]').tooltip(); 		
		
		// 모달 리사이즈
		$('.modal-dialog').resizable({
			handles: 'e, w'
		});

		// 모달 드레그
		$('.modal-dialog').draggable({
			handle: ".modal-header",
			containment : "document"
		});			
		
		// 오늘 날짜
		var date = new Date(); 
		var year = date.getFullYear(); 
		var month = new String(date.getMonth()+1); 
		var day = new String(date.getDate()); 

		// 한자리수일 경우 0을 채워준다. 
		if(month.length == 1){ 
		  month = "0" + month; 
		} 
		if(day.length == 1){ 
		  day = "0" + day; 
		} 
		
		$("#comNo").val($("#comNo").val()).change();
		$("#sdate").val(year + "" + month + "" + day).change(); // 오늘 날짜 선택
		
		//$("#sdate").val('20170424').change();
		//$("#comNo").val(20).change();		
		
		

		
		// 전일조회
		
		$("#btnPrev").unbind("click");
		$("#btnPrev").click(function(){
			
			var dYear = $("#sdate").val().substr(0,4);
			var dMonth = $("#sdate").val().substr(4,2);
			var dDay = $("#sdate").val().substr(6,2);
			var nowday = new Date(dYear+"-"+dMonth+"-"+dDay);
			var yesterday = new Date(nowday.valueOf() - (24*60*60*1000));
			var year = yesterday.getFullYear();
			var month = yesterday.getMonth() + 1;
			var day = yesterday.getDate();
			
			if(month < 10){month = "0" + month;}
			if(day < 10){day = "0" + day;}
			
			
			$("#sdate").val(year + "" + month + "" + day).change();			
			$("#btnSelect").trigger("click");			
			
		});
		
		// 다음날조회
		$("#btnNext").unbind("click");
		$("#btnNext").click(function(){
			
			var dYear = $("#sdate").val().substr(0,4);
			var dMonth = $("#sdate").val().substr(4,2);
			var dDay = $("#sdate").val().substr(6,2);
			var nowday = new Date(dYear+"-"+dMonth+"-"+dDay);
			var yesterday = new Date(nowday.valueOf() + (24*60*60*1000));
			var year = yesterday.getFullYear();
			var month = yesterday.getMonth() + 1;
			var day = yesterday.getDate();
			
			if(month < 10){month = "0" + month;}
			if(day < 10){day = "0" + day;}
			
			$("#sdate").val(year + "" + month + "" + day).change();
			
			$("#btnSelect").trigger("click");
		});		
		
		
		// 조회
		$("#btnSelect").unbind("click");
		$("#btnSelect").click(function(){
			
			$.isLoading({ tpl: "<span class='isloading-wrapper %wrapper%'>Loading&nbsp;&nbsp;<i class='fa fa-refresh fa-spin'></i></span>" });
			
			setTimeout( function(){
				
				
			var comNo = $("#comNo").val();
			
			$("#logodiv").empty();
			var logoimg = "";
			
			if ( comNo == "1" ) {logoimg="Smilegate-v0207_Entertainment_EN_HB.png";}			
			if ( comNo == "2" ) {logoimg="Smilegate-v0207_Holdings_EN_HB.png";}
			if ( comNo == "3" ) {logoimg="Smilegate-v0207_Mobile_EN_HB.png";}
			if ( comNo == "5" ) {logoimg="Smilegate-v0207_RPG_EN_HB.png";}
			//if ( comNo == "8" ) {logoimg="Smilegate-v0207_Megaport_EN_HB.png";}
			if ( comNo == "14" ) {logoimg="Smilegate-v0207_MegaLab_EN_HB.png";}
			//if ( comNo == "20" ) {logoimg="Smilegate-v0208_Stove_EN_HB.png";}
			
			var titleText = "<b>자 금 일 보</b>";
			
			if ( logoimg != "" ) {
				titleText = "<img src='${imgPath}/ifrs/logo/" + logoimg + "'>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<b>자 금 일 보</b>";
			}			
			
			$("#logodiv").append(titleText);
			
			$("#topDiv").show();
			
			$("#table_list").empty();

			$("#serDate").text($("#sdate").val());
			
			var dYear = $("#sdate").val().substr(0,4);
			var dMonth = $("#sdate").val().substr(4,2);
			var dDay = $("#sdate").val().substr(6,2);
			
			var nowday = new Date(dYear+"-"+dMonth+"-"+dDay);			
			var yesterday = new Date(nowday.valueOf() - (24*60*60*1000));
			
			
			var year = yesterday.getFullYear();
			var month = yesterday.getMonth() + 1;
			var day = yesterday.getDate();
			
			if(month < 10){month = "0" + month;}
			if(day < 10){day = "0" + day;}
			
			var sdate1 = year+''+month+''+day;
			
			//holyday(year, month, day, 1);
							
			
			//console.log($("#newday").val());
			
			// 오늘
			var data = "comNo=" + $("#comNo").val();
			data += "&sdate2=" + $("#sdate").val();
			data += "&sdate=" + $("#sdate").val();
			data += "&sType=111";	
			data += "&SaveType=R";
			
			// 어제
			var data1 = "comNo=" + $("#comNo").val();
			data1 += "&sdate2=" + $("#newday").val();
			data1 += "&sdate=" + $("#newday").val();
			data1 += "&sType=111";	
			data1 += "&SaveType=R";
			
			// 오늘 입출금 날짜
			var data2 = "comNo=" + $("#comNo").val();
			data2 += "&sdate=" + $("#sdate").val();
			data2 += "&sType=111";	
			data2 += "&SaveType=R";
			
			// 내일 입출금 날짜
			var data3 = "comNo=" + $("#comNo").val();
			data3 += "&sdate=" + $("#sdate").val();
			data3 += "&sType=222";			
			data3 += "&SaveType=R";			
			
			var appendHtml = "";
			

			// 즉시 현금화 가능액
			var badata1 = 0;
			var badata2 = 0;
			var badata3 = 0;
			
			// 3개월 이내 현금화 가능액
			var cadata1 = 0;
			var cadata2 = 0;
			var cadata3 = 0;	
			
			// 1년 이내 현금화 가능액
			var dadata1 = 0;
			var dadata2 = 0;
			var dadata3 = 0;				
			
			var abdata1 = 0;
			var bbdata1 = 0;
			var cbdata1 = 0;
			var dbdata1 = 0;
			
			var assetTotal1 = 0; // 담보제공금액
			var assetTotal2 = 0; // 차입금

			
 			// 금일 금융자산 합계
			var url = "<c:url value='/ifrs/capital/IfrsLoadSaveData' />";
			fn_ajax(url, data, function( result ){

				//console.log(result.list);
				
				var assetSum2 = 0;
				
				// 총금융자산
				var assetSum2_1 = 0;
				var assetSum2_2 = 0;
				var assetSum2_3 = 0;
				var assetSum2_4 = 0;
				
				// 즉시 현금화 가능액
				var assetSum2_11 = 0;
				var assetSum2_22 = 0;
				var assetSum2_33 = 0;
				var assetSum2_44 = 0;		
				
				// 3개월 이내 현금화 가능액
				var assetSum2_111 = 0;
				var assetSum2_222 = 0;
				var assetSum2_333 = 0;
				var assetSum2_444 = 0;
				
				// 1년 이내 현금화 가능액
				var assetSum2_1111 = 0;
				var assetSum2_2222 = 0;
				var assetSum2_3333 = 0;
				var assetSum2_4444 = 0;				
				

				
				var dancnt = 0;
				var chacnt = 0;
				
				
								
				for ( var i=0 in result.list ) {
					
					//console.log(i);					
					if ( result.list[i].stype != 8 ) {		
						
						assetSum2 = assetSum2 + Number(result.list[i].sum4);
						assetSum2_1 = assetSum2_1 + Number(result.list[i].sum1);
						assetSum2_2 = assetSum2_2 + Number(result.list[i].sum2);
						assetSum2_3 = assetSum2_3 + Number(result.list[i].sum3);
						assetSum2_4 = assetSum2_4 + Number(result.list[i].sum4);		
						
						if ( result.list[i].stype < 3 ) {					
							assetSum2_11 = assetSum2_11 + Number(result.list[i].sum1);
							assetSum2_22 = assetSum2_22 + Number(result.list[i].sum2);
							assetSum2_33 = assetSum2_33 + Number(result.list[i].sum3);
							assetSum2_44 = assetSum2_44 + Number(result.list[i].sum4);									
						}
						
						
						if ( result.list[i].stype < 8 ) {					
							assetSum2_1111 = assetSum2_1111 + Number(result.list[i].sum1);
							assetSum2_2222 = assetSum2_2222 + Number(result.list[i].sum2);
							assetSum2_3333 = assetSum2_3333 + Number(result.list[i].sum3);
							assetSum2_4444 = assetSum2_4444 + Number(result.list[i].sum4);									
						}						
						
						if ( result.list[i].stype < 4 ) {
							
							if ( result.list[i].stype < 3 ) {		
								assetSum2_111 = assetSum2_111 + Number(result.list[i].sum1);
								assetSum2_222 = assetSum2_222 + Number(result.list[i].sum2);
								assetSum2_333 = assetSum2_333 + Number(result.list[i].sum3);
								assetSum2_444 = assetSum2_444 + Number(result.list[i].sum4);								
							} else {
								
								if ( dancnt == 0 ) {	
									assetSum2_111 = assetSum2_111 + Number(result.list[i].sum1);
									assetSum2_222 = assetSum2_222 + Number(result.list[i].sum2);
									assetSum2_333 = assetSum2_333 + Number(result.list[i].sum3);
									assetSum2_444 = assetSum2_444 + Number(result.list[i].sum4);
									dancnt++;
								}
								
							}
						}
						
					}
					
					
					if ( result.list[i].stype == 8 ) {
						if ( chacnt == 0 ) {	
							assetTotal1 = assetTotal1 + Number(result.list[i].sum4); // 담보제공금액								
							chacnt++;
						} else {
							assetTotal2 = assetTotal2 + Number(result.list[i].sum4); // 차입금
							chacnt++;
						}
					}					
					
				}				

				
 			// 전일 잔액 금융자산 합계
			var url = "<c:url value='/ifrs/capital/IfrsLoadSaveData' />";
			fn_ajax(url, data1, function( result_a ){

				
				//console.log(result_a.list);
				
				var assetSum1 = 0;
				var assetSum11 = 0;
				for ( var i=0 in result_a.list ) {
					if ( result_a.list[i].stype != 8 ) {
						assetSum1 = assetSum1 + Number(result_a.list[i].sum4);
						assetSum11 = assetSum11 + Number(result_a.list[i].sum4);
					}
				}
				
				var assetSum = 0;
/* 				for ( var i=0 in result.list ) {
					assetSum = assetSum + Number(result.list[i].sum4);
				} */
				
				//console.log(assetSum);
				
				var todayData;
				var tomorrowData;
				
				//console.log(assetSum1);
				
			// 어제 실적
			var url = "<c:url value='/ifrs/capital/IfrsERPINReportAjax' />";
			fn_ajax(url, data1, function( result1 ){
				
				//console.log(result1.list);
				
				yesterData = result1.list;
				
				var incost = 0;
				var outcost = 0;			
				
				for ( var i=0 in yesterData ) {
					if ( yesterData[i].sType == 2 ) {
						incost = incost + yesterData[i].cramt;
					} else if ( yesterData[i].sType == 1 ) {
						outcost = outcost + yesterData[i].cramt;
					}
				}
				
				
				//assetSum1 = assetSum1 +  incost - outcost;
				/* 				전일이월=((전일금융자산+전일입금)-전일출금)
								전일금융자산=(전일이월+입금) - 출금 */
				
				
				// 당일 실적
				var url = "<c:url value='/ifrs/capital/IfrsERPINReportAjax' />";
				fn_ajax(url, data2, function( result1 ){
					
					//console.log(result1.list);
					todayData = result1.list;
					
					var incost = 0;
					var outcost = 0;				
					for ( var i=0 in todayData ) {
						if ( todayData[i].sType == 2 ) {
							incost = incost + todayData[i].cramt;
						} else if ( todayData[i].sType == 1 ) {
							outcost = outcost + todayData[i].cramt;
						}
					}
					
					assetSum = assetSum1 +  incost - outcost;
					
					//console.log(assetSum + " = " + assetSum1 + " + " + incost + " - " +  outcost);

					// 계획
					var url = "<c:url value='/ifrs/capital/IfrsERPINReportAjax' />";
					fn_ajax(url, data3, function( result2 ){
						
						//console.log(result2.list);	
						tomorrowData = result2.list;
						
						
						// 당일 실적
						
						var col1 = 2;
						var col2 = 4;							
						
						for ( var i=0 in todayData ) {
							if ( todayData[i].sType == 1 ) {
								col1 = col1+ 1;
							} 
							if ( todayData[i].sType == 2 ) {
								col2 = col2+ 1;
							}					
						}
						
						
						appendHtml += "<table style='width:100%;'><tr><td colspan='3' class='titletext'> 1. 입출금 내역</td></tr><tr><td colspan='3'>&nbsp;</td></tr><tr><td style='width:49%;vertical-align:top;'>";
						
						appendHtml += "<div id='report_wrap1' style='width:100%;height:100%;color:black;'>";
						appendHtml += "<table class='stable' ><thead><tr><th colspan='6' >당일 실적</th></tr></thead><tbody>";
						appendHtml += "<tr class='subtitle' ><td rowspan='rowspanin' >입금</td><td colspan='4' >내역</td><td rowspan='2'  >금액</td></tr>";
						appendHtml += "<tr class='subtitle' ><td >계정</td><td >거래처</td><td >적요</td></tr>";
						appendHtml += "<tr><td colspan='2' ><b>전일이월</b></td><td colspan='2' ></td><td class='money bold' >" + assetSum1 + "</td></tr>";
			
						appendHtml = appendHtml.replace("rowspanin",col2);						
						
						var appendHtmlIn = "";
						var appendHtmlOut = "";
						 
						var sum1 = 0;
						var sum2 = 0;						
						var outcnt = 0;
						
						//console.log(todayData.length);
						
						if ( todayData.length > 0 ) {

						for ( var i=0 in todayData ) {
							
							if ( todayData[i].sType == 2 ) {
								appendHtmlIn += "<tr><td >" + todayData[i].accname + "</td><td >" + todayData[i].remseqname1 + "</td><td colspan='2' >" + todayData[i].summary + "</td><td class='money' >" + todayData[i].cramt + "</td></tr>";	
								sum1 = sum1 + Number(todayData[i].cramt);
							}
							
							if ( todayData[i].sType == 1 ) {
								if ( outcnt == 0 ) {
									appendHtmlOut += "<td rowspan='" + col1 + "'  class='subtitle' >출금</td><tr><td >" + todayData[i].accname + "</td><td >" + todayData[i].remseqname1 + "</td><td colspan='2' >" + todayData[i].summary + "</td><td class='money' >" + todayData[i].cramt + "</td></tr>";									
								} else {
									appendHtmlOut += "<tr><td >" + todayData[i].accname + "</td><td >" + todayData[i].remseqname1 + "</td><td colspan='2' >" + todayData[i].summary + "</td><td class='money' >" + todayData[i].cramt + "</td></tr>";										
								}
								sum2 = sum2 + Number(todayData[i].cramt);
								outcnt++;
							}
							
						}			
						
						appendHtmlIn += "<tr class='subtitle' ><td colspan='4' >입금 실적 계</td><td class='money' >" + sum1 + "</td></tr>";
						
						if (outcnt > 0 ) {
							appendHtmlOut += "<tr class='subtitle' ><td colspan='4' >출금 실적 계</td><td class='money' >" + sum2 + "</td></tr>";
						} else {
							appendHtmlOut += "<tr class='subtitle' ><td>출금</td><td colspan='4' >출금 실적 계</td><td class='money' >" + sum2 + "</td></tr>";	
						}
						
						} else {
							appendHtmlIn += "<tr class='subtitle' ><td colspan='4' >입금 실적 계</td><td class='money' >0</td></tr>";
							appendHtmlOut += "<tr  class='subtitle' ><td >출금</td><td colspan='4' >출금 실적 계</td><td class='money' >0</td></tr>";							
						}
						
						appendHtml += appendHtmlIn;
						appendHtml += appendHtmlOut;
						
						var inout = sum1 - sum2;
						
						appendHtml += "</tbody><tfoot><tr><th colspan='5' >순입출금 계</th><td class='money bold' >" + inout + "</td></tr>";
						appendHtml += "<tr><th colspan='5' >전일금융자산</th><td class='money bold' >" + assetSum + "</td></tr></tfoot></table><br></div>";
						appendHtml += "<div style='width:20px;height:100%;color:black;float:left'>&nbsp;</div>";
						
						appendHtml += "</td><td></td><td  style='width:49%;vertical-align:top;'>";
						
		
						// 당일 실적
						
						
						// 계획
						
						var col1 = 2;
						var col2 = 3;							
						
						for ( var i=0 in tomorrowData ) {
							if ( tomorrowData[i].sType == 11 ) {
								col1 = col1+ 1;
							}
							if ( tomorrowData[i].sType == 22 ) {
								col2 = col2+ 1;
							}					
						}
						
						
						appendHtml += "<div id='report_wrap1' style='width:100%;height:100%;color:black;'>";
						appendHtml += "<table class='stable' ><thead><tr><th colspan='6' >계획</th></tr></thead><tbody>";
						appendHtml += "<tr class='subtitle' ><td rowspan='rowspanin' >입금</td><td colspan='4' >내역</td><td rowspan='2'  >금액</td></tr>";
						appendHtml += "<tr class='subtitle' ><td >계정</td><td >거래처</td><td >적요</td></tr>";
					
			
						appendHtml = appendHtml.replace("rowspanin",col2);						
						
						var appendHtmlIn = "";
						var appendHtmlOut = "";
						
						var sum1 = 0;
						var sum2 = 0;						
						var outcnt = 0;
						
						if ( tomorrowData.length > 0 ) {
						
						for ( var i=0 in tomorrowData ) {
							
							if ( tomorrowData[i].sType == 22 ) {
								appendHtmlIn += "<tr><td >" + tomorrowData[i].accname + "</td><td >" + tomorrowData[i].remseqname1 + "</td><td colspan='2' >" + tomorrowData[i].summary + "</td><td class='money' >" + tomorrowData[i].cramt + "</td></tr>";	
								sum1 = sum1 + Number(tomorrowData[i].cramt);
							}
							
							if ( tomorrowData[i].sType == 11 ) {
								
								if ( outcnt == 0 ) {
									appendHtmlOut += "<td rowspan='" + col1 + "' class='subtitle' >출금</td><tr><td >" + tomorrowData[i].accname + "</td><td >" + tomorrowData[i].remseqname1 + "</td><td colspan='2' >" + tomorrowData[i].summary + "</td><td class='money' >" + tomorrowData[i].cramt + "</td></tr>";									
								} else {
									appendHtmlOut += "<tr><td >" + tomorrowData[i].accname + "</td><td >" + tomorrowData[i].remseqname1 + "</td><td colspan='2' >" + tomorrowData[i].summary + "</td><td class='money' >" + tomorrowData[i].cramt + "</td></tr>";										
								}
								sum2 = sum2 + Number(tomorrowData[i].cramt);
								outcnt++;
							}
							
						}				

						appendHtmlIn += "<tr class='subtitle' ><td colspan='4' >입금 계획 계</td><td class='money' >" + sum1 + "</td></tr>";
						
						if (outcnt > 0 ) {
							appendHtmlOut += "<tr class='subtitle' ><td colspan='4' >출금 계획 계</td><td class='money' >" + sum2 + "</td></tr>";
						} else {
							appendHtmlOut += "<tr class='subtitle' ><td>출금</td><td colspan='4' >출금 계획 계</td><td class='money' >" + sum2 + "</td></tr>";	
						}						
						
						
						} else {							
							appendHtmlIn += "<tr class='subtitle' ><td colspan='4' >입금 계획 계</td><td class='money' >0</td></tr>";
							appendHtmlOut += "<tr  class='subtitle' ><td >출금</td><td colspan='4' >출금 계획 계</td><td class='money' >0</td></tr>";																
						}
						

						
						appendHtml += appendHtmlIn;
						appendHtml += appendHtmlOut;
						
						var inout = sum1 - sum2;
						
						var assetSum2 = assetSum + inout;
						
						appendHtml += "</tbody><tfoot><tr><th colspan='5' >순입출금 계</th><td class='money bold' >" + inout + "</td></tr>";
						appendHtml += "<tr><th colspan='5' >금일금융자산</th><td class='money bold' >" + assetSum2 + "</td></tr></tfoot></table><br></div>";

						appendHtml += "</td></tr><table>";
						
						// 계획			
						
						
						
						
						
 			setTimeout( function(){ // 1초 딜레이 시킴
			
			// 자금일보 자산내역 조회
			
			var LoadSaveData;

			// 금융자산명세
			var url = "<c:url value='/ifrs/capital/IfrsLoadSaveData' />";
			fn_ajax(url, data, function( result ){

				LoadSaveData = result.list;
				
				var arr1=[];
				
				for ( var i=0; i < 10; i++) {
					var arr2 = [];
					for ( var z=0 in  LoadSaveData) {
						if ( LoadSaveData[z].stype ==  i ) {
							arr2.push(LoadSaveData[z]);
						} 					
					}					
					arr1.push(arr2);					
				}
				
				//console.log(arr1);
					
					var titleList = ['1) 현금','2) 보통예금','3) 외화예금','4) 단기금융상품','5) 장기금융상품','6) 단기매매상품','7) 매도가능증권','8) 만기보유증권','9) 담보 및 차입금 현황','10) 기타'];
				
					appendHtml += "<table style='width:1510px;'><tr><td colspan='3' class='titletext' > 2. 금융자산명세</td></tr><tr><td colspan='3'>&nbsp;</td></tr><tr><td style='width:750px;vertical-align:top;'><div id='secondDiv'>";
					
				for ( var i=0; i<10 ;i++) {
					
					if ( arr1[i].length > 0 ) {
						
					appendHtml += "<div style='width:750px;height:100%;color:black;'>";
					appendHtml += "<table class='stable' ><thead><tr>";
					appendHtml += "<th  style='width:130px;'>계정</th><th  style='width:150px;'>구분</th><th style='width:130px;'>기초</th><th style='width:130px;'>입금(증가)</th><th style='width:130px;'>출금(감소)</th><th style='width:130px;'>마감</th>";
					appendHtml += "</tr></thead><tbody>";	
					for ( var z=0 in  arr1[i]) {
						if ( z == 0 ) {
							var col = Number(arr1[i].length) + 1;
							appendHtml += "<tr><td rowspan='" + col + "' class='center bold' >" + titleList[i] + "</td><td class='center' >" + arr1[i][z].sdata1 + "</td><td class='money' >" + arr1[i][z].sum1 + "</td><td class='money' >" + arr1[i][z].sum2 + "</td><td class='money' >" + arr1[i][z].sum3 + "</td><td class='money' >" + arr1[i][z].sum4 + "</td></tr>";
						} else {
							appendHtml += "<tr><td class='center' >" + arr1[i][z].sdata1 + "</td><td class='money' >" + arr1[i][z].sum1 + "</td><td class='money' >" + arr1[i][z].sum2 + "</td><td class='money' >" + arr1[i][z].sum3 + "</td><td class='money' >" + arr1[i][z].sum4 + "</td></tr>";	
						}				
					}
					appendHtml += "<tr class='subtitle' id='sumtr' ><td >소계</td><td class='money bold' >0</td><td class='money bold' >0</td><td class='money bold' >0</td><td class='money bold' >0</td></tr>";
					appendHtml += "</tbody></table><br></div>";					
					
									
					
/*  					if ( i == 3 && arr1[i][0] != null && arr1[i][0] != "" ) { // 단기 금융 상품						
 						
 						if ( arr1[i].length > 0 ) { 						
	 						cadata1 = Number(arr1[i][0].sum1);
							cadata2 = Number(arr1[i][0].sum2) - Number(arr1[i][0].sum3);
							cadata3 = Number(arr1[i][0].sum4);
 						}
					
 						if ( arr1[i].length > 1 ) {
 					
						dadata1 = dadata1 + Number(arr1[i][1].sum1);
						dadata2 = dadata2 + Number(arr1[i][1].sum2) - Number(arr1[i][0].sum3);
						dadata3 = dadata3 + Number(arr1[i][1].sum4);
						
 						}						
						
					} 
					
					
					if ( i == 8  && arr1[i][0] != null && arr1[i][0] != "" ) { // 담보 및 차입금 현황
						bbdata1 = Number(arr1[i][0].sum4);
						if ( arr1[i][1] ) {
							dbdata1 = Number(arr1[i][1].sum4);
						}
					} */
					
					}
					
				}
				
				appendHtml += "<div style='width:750px;height:100%;color:black;'>";
				appendHtml += "<table class='stable' >";
				appendHtml += "<tfoot>";	
				appendHtml += "<tr class='subtitle' id='sumtotal' ><th ' colspan='2'>금융자산합계</th><td class='money bold' style='width:130px;' >" + assetSum2_1 + "</td><td class='money bold' style='width:130px;'>" + assetSum2_2 + "</td><td class='money bold' style='width:130px;'>" + assetSum2_3 + "</td><td class='money bold' style='width:130px;'>" + assetSum2_4 + "</td></tr>";
				appendHtml += "</tfoot></table><br></div></div>";		
				
				
				appendHtml += "</div></td><td></td><td style='width:750px;vertical-align:top;'>";
				
				
				appendHtml += "</td></tr><table>";
				
				// 자산 현황 및 자동 수식 구현
				
				// aadata1 = 총금융자산
				// badata1 = 즉시 현금화 가능액
				// cadata1 = 3개월 이내 현금화 가능액
				// dadata1 = 1년 이내 현금화 가능액
				
				// abdata1 = 금융자산총액
				// bbdata1 = 담보제공금액
				// cbdata1 = 가용현금자산
				// dbdata1 = 차입금
				// ebdata1 = 차입금반영후 가용현금
				
				appendHtml += "<table style='width:1510px;'><tr><td colspan='3' class='titletext' > 3. 자산현황 및 요약 </td></tr><tr><td colspan='3'>&nbsp;</td></tr><tr><td style='width:750px;vertical-align:top;'>";
				
				appendHtml += "<div style='width:750px;height:100%;color:black;'>";
				appendHtml += "<table class='stable' ><thead><tr>";
				appendHtml += "<th  style='width:130px;' colspan='3'>종류</th><th style='width:130px;'>기초</th><th style='width:130px;'>증감</th><th style='width:130px;'>마감</th>";
				appendHtml += "</tr></thead><tbody>";					
				appendHtml += "<tr><td colspan='3' >총금융자산</td><td class='money bold' id='aadata1' >" + assetSum2_1 + "</td><td class='money bold' id='aadata2' >" + (assetSum2_2 - assetSum2_3) + "</td><td class='money bold' id='aadata3' >" + assetSum2_4 + "</td></tr>";
				appendHtml += "<tr><td colspan='3' >즉시 현금화 가능액</td><td class='money bold' id='badata1' >" + assetSum2_11 + "</td><td class='money bold' id='badata2' >" + (assetSum2_22 - assetSum2_33) + "</td><td class='money bold' id='badata3' >" + assetSum2_44+ "</td></tr>";
				appendHtml += "<tr><td colspan='3' >3개월 이내 현금화 가능액</td><td class='money bold' id='cadata1' >" + assetSum2_111 + "</td><td class='money bold' id='cadata2' >" + (assetSum2_222 - assetSum2_333) + "</td><td class='money bold' id='cadata3' >" + assetSum2_444 + "</td></tr>";
				appendHtml += "<tr><td colspan='3' >1년 이내 현금화 가능액</td><td class='money bold' id='dadata1' >" + assetSum2_1111 + "</td><td class='money bold' id='dadata2' >" + (assetSum2_2222 - assetSum2_3333) + "</td><td class='money bold' id='dadata3' >" + assetSum2_4444 + "</td></tr>";
				appendHtml += "</tbody></table><br></div>";
				
				appendHtml += "<div style='width:750px;height:100%;color:black;'>";
				appendHtml += "<table class='stable' ><thead><tr>";
				appendHtml += "<th  style='width:130px;' colspan='5'>구분</th><th style='width:130px;'>금액</th>";
				appendHtml += "</tr></thead><tbody>";
				
				appendHtml += "<tr><td colspan='5' >금융자산총액</td><td class='money bold' id='abdata1' >" + assetSum2_4 + "</td></tr>";
				appendHtml += "<tr><td colspan='5' >담보제공금액</td><td class='money bold' id='bbdata1' >" + assetTotal1 + "</td></tr>";
				appendHtml += "<tr><td colspan='5' >가용현금자산</td><td class='money bold' id='cbdata1' >" + (assetSum2_4 - assetTotal1) + "</td></tr>";
				appendHtml += "<tr><td colspan='5' >차입금</td><td class='money bold' id='dbdata1' >" + assetTotal2 + "</td></tr>";
				appendHtml += "<tr><td colspan='5' >차입금반영후 가용현금</td><td class='money bold' id='ebdata1' >" + (assetSum2_4 - assetTotal1 - assetTotal2) + "</td></tr>";
				appendHtml += "</tbody></table><br></div>";				
				
				appendHtml += "</td><td></td><td style='width:750px;vertical-align:top;'>";
				appendHtml += "</td></tr><table>";			
	
				
				// 자산 현황 및 자동 수식 구현
				
				$("#table_list").append(appendHtml);
				
   				var tsum1 = 0;
				var tsum2 = 0;
				var tsum3 = 0;
				var tsum4 = 0;	
				var index = 0;
				
				$("#secondDiv").find("table").each(function(){
					
					var tr = $(this).find("tbody tr").length;
					
					var sum1 = 0;
					var sum2 = 0;
					var sum3 = 0;
					var sum4 = 0;
					
					for ( var i=0 ; i < tr ; i++ ) {
						if ( i == 0 ) {
						sum1 = sum1 + Number($(this).find("tbody tr").eq(i).find("td").eq(2).text());
						sum2 = sum2 + Number($(this).find("tbody tr").eq(i).find("td").eq(3).text());
						sum3 = sum3 + Number($(this).find("tbody tr").eq(i).find("td").eq(4).text());
						sum4 = sum4 + Number($(this).find("tbody tr").eq(i).find("td").eq(5).text());
						} else {
							sum1 = sum1 + Number($(this).find("tbody tr").eq(i).find("td").eq(1).text());
							sum2 = sum2 + Number($(this).find("tbody tr").eq(i).find("td").eq(2).text());
							sum3 = sum3 + Number($(this).find("tbody tr").eq(i).find("td").eq(3).text());
							sum4 = sum4 + Number($(this).find("tbody tr").eq(i).find("td").eq(4).text());
						}						
					}					
					$(this).find("tbody tr").eq(tr-1).find("td").eq(1).text(sum1);
					tsum1 = tsum1 + sum1;
					$(this).find("tbody tr").eq(tr-1).find("td").eq(2).text(sum2);
					tsum2 = tsum2 + sum2;
					$(this).find("tbody tr").eq(tr-1).find("td").eq(3).text(sum3);
					tsum3 = tsum3 + sum3;
					$(this).find("tbody tr").eq(tr-1).find("td").eq(4).text(sum4);
					tsum4 = tsum4 + sum4;			
					
/* 					if ( index >= 0 && index < 3  ) {
						badata1 = badata1 + sum1;
						badata2 = badata2 + sum2 - sum3;
						badata3 = badata3 + sum4;
					}
					
					if ( index >= 4 && index < 7  ) {
						dadata1 = dadata1 + sum1;
						dadata2 = dadata2 + sum2 - sum3;
						dadata3 = dadata3 + sum4;
					}	 */				
					
					index++;
					
				});	 
				
/*  				$("#secondDiv").find("#sumtotal").find("td").eq(0).text(tsum1);
				$("#secondDiv").find("#sumtotal").find("td").eq(1).text(tsum2);
				$("#secondDiv").find("#sumtotal").find("td").eq(2).text(tsum3);
				$("#secondDiv").find("#sumtotal").find("td").eq(3).text(tsum4); 
				
				$("#aadata1").text(tsum1);
				$("#aadata2").text(tsum2-tsum3);
				$("#aadata3").text(tsum4);
				
				$("#badata1").text(badata1);
				$("#badata2").text(badata2);
				$("#badata3").text(badata3);
				
				$("#cadata1").text(cadata1);
				$("#cadata2").text(cadata2);
				$("#cadata3").text(cadata3);				
				
				$("#dadata1").text(dadata1);
				$("#dadata2").text(dadata2);
				$("#dadata3").text(dadata3);
				
				$("#abdata1").text(tsum4);
				$("#bbdata1").text(bbdata1);
				$("#cbdata1").text(tsum4-bbdata1);
				$("#dbdata1").text(dbdata1);
				$("#ebdata1").text(tsum4-bbdata1-dbdata1); */
				
				// 금융자산명세						
				
				//setTimeout( function(){$.isLoading( "hide" );}, 10 );
				
				setTimeout( function(){
					// 숫자 콤마 찍기
					$(".money").each(function() {
						var data = $(this).text().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
						$(this).text(data);
					});
					
					setTimeout( function(){$.isLoading( "hide" );}, 10 );
					
					}, 50 ); 				
				
				}, 200 );	
						
			});					
					
			});
				
			});
			
			});

				
			}); // 전월 금융자산 합계
			
			}); // 금일 금융자산 합계
			
			}, 3000 );
			
		});
		
		
 		$("#save_excel").unbind("click");
		$("#save_excel").click(function(){
			
			var $obj1 = $("#topDiv").clone();
			var $obj2 = $("#table_list").clone();
			
			var eHtml = "<html>"
				+ "<head>"
				+ 	"<style type='text/css'>"
				
				+ 	".stable {border-style: solid;border-width: 1px;border-color: gray;width:100%;} \n"
				+ 	".stable td {border-style: solid;border-width: 1px;border-color: gray;height:20px;margin:3px;padding:3px;font-size:11px;} \n"
				+ 	".stable th {border-style: solid;border-width: 1px;border-color: gray;height:25px;background-color: lightgray;text-align:center;margin:3px;padding:3px;font-size:11px;} \n"
				+ 	".subtitle {height:25px;text-align:center;margin:3px;padding:3px;font-weight:bold;} \n"
				+ 	".bold {font-weight:bold;} \n"
				+ 	".titletext {font-weight:bold;font-size:15px;font-color:gray;} \n"
				+ 	".money {text-align:right;} \n"
				
/* 				+ 	"table.listType td{background-color:#FFFFFF;text-align:right; border:solid 1px #e3e3e3;} \n"
				+ 	"table.listType td.code{background-color:#FFFFFF;text-align:center} \n"
				+	"table.listType td.codeNm{background-color:#FFFFFF;text-align:left} \n"
				+	"tr.sum td{background-color:#D4F4FA; font-weight:bold; } \n"
				+	"tr.greenTr td{background-color:#E4F7BA; font-weight:bold; }\n"
				+	"tr.greenTr td{background-color:#E4F7BA; font-weight:bold; }\n"
				+	"tr.greenTr td.code{background-color:#E4F7BA;}\n"
				+	"tr.greenTr td.codeNm{background-color:#E4F7BA;}\n"
				+	".listType tbody td.amt { text-align:right }\n"
				+	"tr.orangeTr td{background-color:#FFBB00;font-weight:bold;}\n"
				+	"tr.orangeTr td.codeNm{background-color:#FFBB00;}\n"
				+	"thead th{background-color:#e8e8e8;border:solid 1px #a0a0a0;}\n"
 */				+	"</style>"
				+	"</head>";
				
			var bodyHtml = $obj1.html() + $obj2.html();
			
			var filename = $("#sdate").val() + "_" + "자금일보";
			
			$("#excelTbl").val( eHtml + bodyHtml );
			$("#excelTitle").val( filename );
			$("#excelForm").attr("action", "/ifrs/connect/excelDown");
			$("#excelForm").submit();
 		  	
		});
		
 		$("#print").unbind("click");
		$("#print").click(function(){
			
			$("#printDiv").print({
	            globalStyles : true,
	            mediaPrint : true,
	            stylesheet : "${cssPath}/ifrs/new/NewTable.css",
	            iframe : true,
	            noPrintSelector : ".avoid-this",
	            prepend : "<div style='text-align:right;font-size:9px;'>자금일보</div>"
	        });				
			
		});
		
		
		$("#reflashBtn").unbind("click");
		$("#reflashBtn").click(function(){
			$("#btnSelect").trigger("click");
		});
		
		
		$("#setMail").click(function(){
			var comNo = $("#comNo").val();
			var url = "./mailList?companyseq=" + comNo;		
			var sAddrJson = window.open(url,'IFRS', 'width=700, height=350, left=0, top=0, toolbar=no, location=no, directories=no, status=no, menubar=no, resizable=no, scrollbars=no, copyhistory=no');
		});
		
		
		$("#sendMailModal").click(function(){
			
			var agent = navigator.userAgent.toLowerCase();

			if (agent.indexOf("chrome") != -1) { // 크롬 브라우저 일 경우 border-width 변경
				$("table").css("border-width","1px");
				$("td").css("border-width","1px");
				$("th").css("border-width","1px");
			 	$("tr").css("border-width","1px");	
			}
			
			$('body').on('hidden.bs.modal', '.modal', function () {$(this).removeData('bs.modal');});
			
			
    		var data = "companyseq=" + $("#comNo").val();
    		fn_ajax( "/ifrs/capital/selectMail", data, function(result){

    		var mailaddr = "";
    		
    		if ( result.list.length > 0 ) {
    			//console.log(result);    			
    			mailaddr = result.list[0].touser.replace(/@@@/gi,",");
    			mailaddr1 = result.list[0].attuser.replace(/@@@/gi,",");    			
    		} 
    		    		
    		$("#mailaddr").val(mailaddr);
    		$("#mailaddr1").val(mailaddr1);
    		
			var element = $("#printDiv");
			html2canvas(element, {
		         onrendered: function (canvas) {
		        	 	var getCanvas = canvas;		  
		        	 	var canvImgStr = getCanvas.toDataURL("image/png");
		        	 	
		        	 	var imgageData ="";
		        	 	
		        	 	$("#setting1").modal({ show: true });
		        	 	
		        	 	//$("#printDiv1").append(imgageData);
		        	 	
  				       		 $.ajax({ 
				       		  url : '/ifrs/capital/ajax_canvasUpload_proc',
				       		  data : { strImg: canvImgStr },
				       		  type : 'POST',
				       		  success : function(json) {
				       			  
					      			if (agent.indexOf("chrome") != -1) { // 크롬 브라우저 일 경우 border-width 변경
					    				$("table").css("border-width","2px");
					    				$("td").css("border-width","2px");
					    				$("th").css("border-width","2px");
					    			 	$("tr").css("border-width","2px");			 
					    			}				       			  
			       			  		
				       			  	//console.log(json);
				       			  	
				       			  	$("#filelist1").val(json);
				       			  	
				       			 	var link = document.location.href.split("/ifrs/")[0] + "/upload/capital/";
					        	 	
					        	 	imgageData +="<br><br><div><img src='" + link + json + "' name='img'></div>";
					        	 	
					        	 	//console.log(imgageData);
					        	 	
					        	 	tinymce.get('bbs').setContent(imgageData);
					        	 	var alertSubject = $("#sdate").val() + " 자금일보(" + $("#comNo option[value='" + $("#comNo").val() + "']").text() + ")";
					        	 	
					        	 	$("#mailtitle").val(alertSubject);
					        	 	

					        	 	
					        	 	// 첨부파일 표시
					      			var data = "sdate=" + $("#sdate").val();				
					    			data += "&companyseq=" + $("#comNo").val();
					    			var url = "<c:url value='/ifrs/capital/IfrsWeekReport12' />";						
					    			fn_ajax(url, data, function( result ){
					    		
			       			  		var link = document.location.href.split("/ifrs/")[0] + "/upload/capital/";
							       			  
					        	 	var addimg ="";
					        	 	
					        	 	if ( result.list.length > 0 ) {
					        	 		
					        	 		for (var i=0 in result.list) {
					        	 			
					        	 			if ( result.list[i].stype == 1 ) {
					        	 				addimg += "<br><a href='" + result.list[i].imgsrc + "' target='_blank'>첨부1 : 예적금현황 보기</a>";
					        	 				$("#filelist2").val(result.list[i].imgsrc.replace("http://ifrs.smilegate.net/upload/capital/",""));
					        	 			}
					        	 			
					        	 			if ( result.list[i].stype == 2 ) {
					        	 				addimg += "<br><a href='" + result.list[i].imgsrc + "' target='_blank'>첨부2 : 현금출납장 보기</a>";
					        	 				$("#filelist3").val(result.list[i].imgsrc.replace("http://ifrs.smilegate.net/upload/capital/",""));
					        	 			}
					        	 			
					        	 		}
					        	 		
					        	 		$("#addimg").empty();
					        	 		$("#addimg").append(addimg);					        	 		
					        	 		
					        	 	}
									
									});					        	 	
					        	 	
					        	 	
					        	 	
					        	 	$("#setting1").modal({ show: true });
					        	 	
					    			
					        	 	
 			       		  },
				       		  error : function(a, b, c){
				       			  //console.log('ng:'+ a+'//'+b+'//'+c);
				       		  }		  
				       	});
				       	
				       	
		             }
		    });    		
    				
    		});
			
		});
		
		
		$("#sendMail").click(function() {
		
			$.isLoading({ tpl: "<span class='isloading-wrapper %wrapper%'>Loading&nbsp;&nbsp;<i class='fa fa-refresh fa-spin'></i></span>" });
			
			var mailList = [];
			var imgageData = tinymce.get('bbs').getContent();
       	 	var pwidth = $("#printDiv").width() + 15;
       	 	var pheight = $("#printDiv").height() + 15;
       	 	imgageData = imgageData.replace("<img src","<img width='" + pwidth + "' height='" + pheight + "' src");
       	 	
       	 	
       	 	var imgageData1 = imgageData.split("<img width=")[0];
       	 	var imgageData2 = imgageData.split("name=\"img\" />")[1];
       	 	
       		var data = "companyseq=" + $("#comNo").val();
       		fn_ajax( "/ifrs/capital/selectMail", data, function(result){
       			
      				 var fromuser_id = result.list[0].fromuserId;
      				 var touser_id = result.list[0].touserId; 
      				 var attuser_id = result.list[0].attuserId;
      				 
      				 var fromuser_id_arr = [];
      				 var touser_id_arr = [];
      				 var attuser_id_arr = [];
      				 
      				 if ( fromuser_id ) {fromuser_id_arr = fromuser_id.split("@@@");}
      				 if ( touser_id ) {touser_id_arr = touser_id.split("@@@");}
      				 if ( attuser_id ) {attuser_id_arr = attuser_id.split("@@@");}
      				 
      				 if ( fromuser_id ) {fromuser_id_arr = fromuser_id.split("@@@");}
      				 
      				 var result_arr = [];
      				 
      				 if ( fromuser_id_arr.length > 0 ) {
      					 
      					 result_arr = jQuery.merge(touser_id_arr, attuser_id_arr);
       				 
      					//console.log(result_arr);
      					 
        				 for ( var z=0 in result_arr ) {
        					 
        					 selectDept (result_arr[z]);
        				 
        				 }
        				 
 		        			setTimeout( function(){
 		        				var mailsendlist = $("#mailsendlist").val();
 		        				var result = [];
 		        				
 		        				if ( mailsendlist != '' && mailsendlist != null) {
 		        					mailList = mailsendlist.split(",");
 		        				}
 		        				
		        				var resultText = '';
		        				$.each(mailList, function (index, element){
		        				    if ($.inArray(element, result) == -1){
		        				        result.push(element);
		        				        resultText += element + '\r\n';
		        				    }
		        				});		        				
		        				//console.log(result);		   
		        				for ( var mm=0 in result ) {
		        					if ( result[mm] != "" ) {  
		        						sendMailFunc(fromuser_id_arr[0],result[mm],imgageData,imgageData1,imgageData2);
		        					}
		        					if ( mm == result.length - 1 ) {
				        				 msg("발송 되었습니다.");				        				 
				        				 $("#setting1").modal('toggle');		   
				        				 setTimeout( function(){$.isLoading( "hide" );}, 10 );
		        					}
		        				}
	        				}, 2000 );        				 
       				}
					
      			
      			});							       			  
				       			  

			
		});

		
	});
	
	function selectDept (result_arr_z) {
		var data = "deptmail=" + result_arr_z;
		fn_ajax( "/ifrs/capital/selectDeptCd", data, function(result2){
			if ( result2.list.length > 0 ) { // 부서 메일 발송				
    		var data = "deptmail=" + result2.list[0].deptCd;
    		fn_ajax( "/ifrs/capital/selectDeptMail", data, function(result1){    			
        			if ( result1.list.length > 0 ) {
        				for ( var q=0 in result1.list ) {
	        				 var toMail = result1.list[q].logonId;
	        				 $("#mailsendlist").val($("#mailsendlist").val()+","+toMail);
		        		}							        	
	        		}        			
    			});									   
			} else {
				$("#mailsendlist").val($("#mailsendlist").val()+","+result_arr_z);
			}		
		 });	
	}
	
	
	
	
	function sendMailFunc(fromMail1, toMail1, imgageData,imgageData1,imgageData2) {
		
/* 		//console.log(fromMail1);
		//console.log(toMail1);
		//console.log(memo); */
		
		 var fromMail = fromMail1 + "@" + "${domain}";
		 var toMail = toMail1 + "@" + "${domain}";
		 
		 var alertStatus = 0;
		 var alertType = 1;
		 var fromId = fromMail1;
		 var fromName = "EFIS";
		 var alertSubject = $("#mailtitle").val();
		 var alertMessage = imgageData;
		 var appType = "EFIS";
		 var appId = "EFIS";
		 var priority = 0;		
		 
		 fromMail = fromMail.replace("smilegate.net", "smilegate.com");
		 toMail = toMail.replace("smilegate.net", "smilegate.com");
		 
		 //console.log(toMail);
		 
		 var filelist1 = $("#filelist1").val();
		 var filelist2 = $("#filelist2").val();
		 var filelist3 = $("#filelist3").val();
		 
		 if ( filelist1 == null || filelist1 == "" ) {filelist1 = "noimg.png";}
		 if ( filelist2 == null || filelist2 == "" ) {filelist2 = "noimg.png";}
		 if ( filelist3 == null || filelist3 == "" ) {filelist3 = "noimg.png";}

		 
		 //console.log(filelist1);
		 //console.log(filelist2);
		 //console.log(filelist3);
		 
		 var data = {};
		 data.alertStatus = alertStatus;
		 data.alertType = alertType;
		 data.fromId = fromId;
		 data.fromName = fromName;
		 data.fromMail = fromMail;
		 data.toId = toMail1;
		 data.toMail = toMail;
		 data.alertSubject = alertSubject;
		 data.alertMessage = alertMessage;
		 data.appType = appType;
		 data.appId = appId;
		 data.priority = priority;		 
		 data.filelist1 = filelist1;
		 data.filelist2 = filelist2;
		 data.filelist3 = filelist3;
		 data.imgageData1 = imgageData1;
		 data.imgageData2 = imgageData2;
		 
		 fn_ajax( "/ifrs/capital/insertSendMail_test", data, function(result){});
		
	}
	
	
	
	// 메세지 Modal
	function msg(st) {
		$("#confirmModalContentText").text(st);			
		$("#msgModal").dialog({
			show: 'fade',
			hide: 'fade',
			duration: 1000,
			  open : function(eve, ui) {
				  $(".ui-dialog-titlebar-close", ui.dialog | ui).hide();			  
			   var item = $(this);
			     window.setTimeout(function() {
			       item.dialog('close');
			     }, 
			     800);
			  }
		});
	}		
	
	tinymce.remove('#bbs');
	tinymce.init({
		mode : "specific_textareas",
		  selector: '#bbs',
		  language: 'ko',
		    setup: function(editor) {
	        editor.on('change', function () {
	            editor.save();
	        });
	        
	        editor.on('init', function() 
			    {
			     this.getDoc().body.style.fontSize = '14px';
			 });	
        	},						    
		    //force_br_newlines: true,
		    //force_p_newlines: false,							    
		    relative_urls : false,
		    remove_linebreaks : true,
		    remove_trailing_nbsp : true,
		    remove_script_host : false,
		    forced_root_block : false, // IE 한글문제
		    entity_encoding : "raw",
		    fix_nesting: true,
		    font_formats: "맑은고딕=맑은고딕;나눔고딕=나눔고딕;굴림=굴림;굴림체=굴림체;궁서=궁서;궁서체=궁서체;돋움=돋움;돋움체=돋움체;바탕=바탕;바탕체=바탕체;필기체=필기체;Arial=Arial; Comic Sans MS='Comic Sans MS';Courier New='Courier New';Tahoma=Tahoma;Times New Roman='Times New Roman';Verdana=Verdana",
		    //formats: { custom_format: { block: 'img', styles: { 'max-width': '100%' } } },
		    //valid_elements : '*[class|style|href|src|name|align|alt|title|width|height|target]',
		    //extended_valid_elements : "*[class|style|href|src|name|align|alt|title|width|height|target]",
		    invalid_elements : 'script',
		    inline_styles : true,
		    theme: "modern",
		    plugins: [
		        "advlist autolink lists link image charmap print preview hr anchor pagebreak",
		        "searchreplace wordcount visualblocks visualchars code",
		        "insertdatetime media nonbreaking save table contextmenu directionality",
		        "emoticons template paste textcolor autoresize textcolor colorpicker image"
		    ],
	        autoresize_bottom_margin: 50,
	        autoresize_min_height: 350,	
	        autoresize_max_height: 900,						    
	        toolbar1: " newdocument undo redo | bold italic underline strikethrough | alignleft aligncenter alignright alignjustify | fontselect fontsizeselect forecolor backcolor media | custom_image_ie table code |",
		    menubar: true,
		    toolbar_items_size: 'small',   
		    table_class_list: [
		                       {title: 'None', value: ''},
		                       {title: 'Table Header', value: 'tableheader'},
		                       {title: 'Table Repeat', value: 'tablerepeat'},
		                     ],
             table_row_class_list: [
                                    {title: 'None', value: ''},
                                    {title: 'Rows Header', value: 'rowsheader'},
                                    {title: 'Rows Repeat', value: 'rowsrepeat'}
                              ],						                     
		    style_formats: [
		        {title: 'Bold text', inline: 'b'},
		        {title: 'Red text', inline: 'span', styles: {color: '#ff0000'}},
		        {title: 'Red header', block: 'h1', styles: {color: '#ff0000'}},
		        {title: 'Example 1', inline: 'span', classes: 'example1'},
		        {title: 'Example 2', inline: 'span', classes: 'example2'},
		        {title: 'Table styles'},
		        {title: 'Table row 1', selector: 'tr', classes: 'tablerow1'}
		    ]							    
	});			
	

</script>
</head>


<body>
	<input type="hidden" id="mailsendlist" style="width:100%;">
	
	<input type="hidden" id="filelist1">
	<input type="hidden" id="filelist2">
	<input type="hidden" id="filelist3">



	<!-- 메세지 Modal -->
	<div id="msgModal" title="SmileGate Capital" style="display: none;"><br><br>
	<div class="confirmModalContentText" id="confirmModalContentText">저장 되었습니다.</div>
	</div><!-- 메세지 Modal -->

	<!-- 메일발송 Modal -->
	<div id="setting1" class="modal fade">
	
	<div class="modal-dialog modal-lg" id="modal_div1">
	<div class="modal-content">
	<div class="modal-header">
	<div class="btn-group">
	
	<button type="button" class="btn btn-default btn-sm" id="sendMail">메일발송</button>
	<button type="button" class="btn btn-default btn-sm" data-dismiss="modal">닫기</button>
	</div>
    </div>
   	
   	<div class="modal-body">
   	<div>   	
   	</div>

		<div>
			<input type="text" id="mailaddr" class="form-control" readonly value="">
		</div>
		<div>
			<input type="text" id="mailaddr1" class="form-control" readonly value="">
		</div>		
   	   	
		<div>
			<input type="text" id="mailtitle" class="form-control" placeholder="메일 제목을 입력하세요.">
		</div>
		
		<div id="mailcontent">
			<textarea style="width:100%;" id="bbs"></textarea>
		</div>
		
		<div id="addimg">
			
		</div>		

  	</div>

	
	</div>
	</div>
	
	</div>
	<!-- 메일발송 Modal -->


<form name="downloadForm" id="downloadForm" method="post">
	<input type="hidden" name="comNo" value="" />
	<input type="hidden" name="comNm" value="" />
	<input type="hidden" name="year"  value="" />
	<input type="hidden" name="month" value="" />
	<input type="hidden" name="gubun" value="${gubun }" />
</form>

<form name="excelForm" id="excelForm" method="post">
	<input type="hidden" name="excelTitle" id="excelTitle" value="" />
	<input type="hidden" name="excelTbl" id="excelTbl" value="" />
</form>

<!--wrap div-->
<div id="wrap">
	
	<!--로고 & 메뉴-->
	<!--left 메뉴부분 및 Rbac 권한 세팅 영역-->
	<c:choose>
		<c:when test="${authMap.typeGb eq 'P' }">
	 		<c:set var="menuId" value="${authMap.parentsRbacId }" />
	 	</c:when>
	 	<c:otherwise>
	 		<c:set var="menuId" value="${authMap.rbacId }" />
	 	</c:otherwise>
	</c:choose>
	<jsp:include page="/WEB-INF/jsp/config/menu.jsp">
		<jsp:param name="menuId" value="${menuId }"/>
	</jsp:include>
	<c:choose>
		<%--1.화면에 접근이 가능하다는 것은 기본 R 권한이 있음  
		    2.전사권한이거나 , W, A 권한이 있으면  registAuth 으로 체크값 비교 가능 (기본적으로 등록, 수정 버튼)
		    3.더 확장하고 싶은면 각화면에 각각 특정 권한에 대한 코딩하기 바람 --%>
		<c:when test="${authMap.authUseYn eq 'N' || authMap.writeAuth eq 'W' || authMap.adminAuth eq 'A' }">
			<c:set var="registAuth" value="Y"/>
		</c:when>
		<c:otherwise><c:set var="registAuth" value="N"/></c:otherwise>
	</c:choose>
	
        <div class="content">
 			 			
			<div class="panel panel-default" style="width:1600px;margin-bottom:10px;">
			  <div class="panel-body">
			  
                   		<div style="float:left;">
                   		<select name="comNo" id="comNo" style="width:200px;">
                   		<c:forEach var="list" items="${companyList}">	
                   			<option value="${list.COM_NO }">${list.COM_NM}</option>
                   		</c:forEach>
                   		</select>
                   		</div>
                   		
                   		<div style="float:left;">                   	
                   		&nbsp;&nbsp;<button class="btn btn-default btn-sm" type="button" id="btnPrev">◀</button>
                   		</div>

                   		<div style="float:left;">
                   		<input type="text" class="form-control input-sm" id="sdate" name="sdate" placeholder="일자를 선택하세요.">
                   		</div> 
                   		
                   		<div style="float:left;">                   	
                   		<button class="btn btn-default btn-sm" type="button" id="btnNext">▶</button>
                   		</div>                   		
                   		
                   		<div>
	                   		&nbsp;&nbsp;
	                   		<button class="btn btn-default btn-sm" type="button" id="btnSelect">조&nbsp;회</button>
	                   		<button class="btn btn-default btn-sm" type="button" id="sendMailModal">메일 발송</button>
	                   		<button class="btn btn-default btn-sm" type="button" id="setMail">메일 설정</button>
                   		</div>			  
			  
			  </div>
			</div> 			

            
			<div style="width:1650px;">
			
			<div class="panel panel-default" style="width:1600px;height:100%;color:black;">
			  
			  <div class="panel-heading clearfix">
			  <div class="panel-title pull-left" style="font-size:12px;"><b>법인별 자금일보 조회</b></div>
			      <div class="btn-group pull-right">
			       		<i class="glyphicon glyphicon-print ahref print" aria-hidden="true" data-toggle="tooltip" title="인쇄" id="print"></i>
			       		<i class="glyphicon glyphicon-export ahref exceldown" aria-hidden="true" data-toggle="tooltip" title="엑셀저장" id="save_excel"></i>
			       		<i class="glyphicon glyphicon-repeat ahref" aria-hidden="true" id="reflashBtn"></i>
			      </div>	
			  </div>
			  
			  <div class="panel-body" style="width:100%;height:100%;color:black;background-color:white;">
			            
			            
			            <div style="width:100%;background-color:white;" id="printDiv">
			            
			            <div style="width:100%;background-color:white;" id="topDiv">
						
						<table class="stable" id="alltable" style='border-style: solid;border-width: 2px;border-color: gray;width:100%;height:85px;width:100%;background-color:white;'>
						<tr>
							<td style="border-style: solid;border-width: 2px;border-color: gray;width:100%;height:85px;width:70%;vertical-align:middle;" rowspan="2" colspan="9">
							
							<div style="float:left;margin-left:20px;margin-top:20px;font-size:15px"><div id="serDate"></div></div>
							
<%-- 							<div style="text-align:center;width:20%;font-size:30px;float:left;"><img src="${imgPath}/ifrs/logo/Smilegate-v0207_Entertainment_EN_HB.png"></div> --%>
							<div style="text-align:center;width:70%;font-size:30px;margin-top:10px" id="logodiv"><img src="${imgPath}/ifrs/logo/Smilegate-v0207_Entertainment_EN_HB.png">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<b>자 금 일 보</b></div>
							
							</td>							
							<th style="border-style: solid;border-width: 2px;border-color: gray;height:25px;background-color: lightgray;text-align:center;margin:3px;padding:3px;font-size:11px;width:120px">담당</th><th style="border-style: solid;border-width: 2px;border-color: gray;height:25px;background-color: lightgray;text-align:center;margin:3px;padding:3px;font-size:11px;width:120px">1차 확인자</th><th style="border-style: solid;border-width: 2px;border-color: gray;height:25px;background-color: lightgray;text-align:center;margin:3px;padding:3px;font-size:11px;width:120px">2차확인자</th><th style="border-style: solid;border-width: 2px;border-color: gray;height:25px;background-color: lightgray;text-align:center;margin:3px;padding:3px;font-size:11px;width:120px">최종 확인자</th>
						</tr>
						
						<tr>
							<td style="border-style: solid;border-width: 2px;border-color: gray;height:20px;margin:3px;padding:3px;font-size:11px;height:80px;">&nbsp;</td><td style="border-style: solid;border-width: 2px;border-color: gray;height:20px;margin:3px;padding:3px;font-size:11px;height:80px;">&nbsp;</td><td style="border-style: solid;border-width: 2px;border-color: gray;height:20px;margin:3px;padding:3px;font-size:11px;height:80px;">&nbsp;</td><td style="border-style: solid;border-width: 2px;border-color: gray;height:20px;margin:3px;padding:3px;font-size:11px;height:80px;">&nbsp;</td>
						</tr>						
						
						</table><br><br>
			
			            </div>
			                        
			            
						<div id="table_list" style="background-color:white;">
			            
			            	
			            
			            </div>
			            
			            </div>  				
			            
			            <div style="width:100%;background-color:white;" id="printDiv1">
			            </div>	                        			            
			            
			  </div>
			  
			  
			  
			  
			  
			</div>			
            
            </div>            


        </div>
        

	<jsp:include page="/WEB-INF/jsp/config/footer.jsp"/>
	
</div>

     <input type="text" id="holyday">
	<input type="text" id="newday">

</body>
</html>
<jsp:include page="/WEB-INF/jsp/config/footer_naviTime_capital.jsp"/>