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

<!-- AUIGrid 라이센스 파일입니다. 그리드 출력을 위해 꼭 삽입하십시오. -->
<link href="${auiGridPath}/3.0.9/AUIGrid_style.css" rel="stylesheet">
<script type="text/javascript" src="${auiGridPath}/3.0.9/AUIGrid.js"></script>
<script type="text/javascript" src="${auiGridPath}/3.0.9/AUIGridLicense.${domain}.js"></script>
<%-- <script type="text/javascript" src="${auiGridPath}/AUIGrid.pdfkit.js"></script>
<script type="text/javascript" src="${auiGridPath}/FileSaver.min.js"></script>
<script type="text/javascript" src="${auiGridPath}/jspdf.min.js"></script> --%>
<%-- <script type="text/javascript" src="${scriptPath}/ifrs/gridCommon.js?2"></script> --%>


<script src="${scriptPath}/ifrs/echarts/echarts-all.js"></script>



<style type="text/css">
div#container { width:1900px; }
div#content { width:1500px; }
/* .money {text-align:right;} */
.left-cell {text-align:left;}
.center-cell {text-align:center;}
/* .center {text-align:center;} */
#sdate {text-align:center;font-size:15px;}
#sdate1 {text-align:center;font-size:15px;}
#sdate2 {text-align:center;font-size:15px;}


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
	border-width: 0px;
	border-color: gray;
	width:100%;	  	
}

.stable td {
 	border-style: solid;
	border-width: 0px;
	border-color: gray;
	height:20px;
	margin:3px;
	padding:3px;
	font-size:13px;
	color:black;
}	 

.stable tr {
 	border-style: solid;
	border-width: 2px;
	border-color: gray;
}

.stable th {
 	border-style: solid;
	border-width: 0px;
	border-color: gray;
	height:25px;
	/* background-color: yellow; */
	text-align:center;
	margin:3px;
	padding:3px;
	font-size:12px;
	color:black;
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

th {
	font-size:9px;
	text-align:center;
}

.inmoney {
	color:red;
}

.outmoney {
	color:blue;
}

.moneytd {
	text-align:right;
	font-weight:bold;
	background-color:#e0ebeb;
}

.moneybold {
	text-align:right;
	font-weight:bold;
	background-color:#ffffe6;	
}

.moneybold1 {
	font-weight:bold;
	background-color:lightgray;	
}



</style>

<script type="text/javascript">

var SESSION = "${SESSION}"; // 소속 법인 번호

// 휴무일 여부 판단해서 전일 선택
function holyday(year,month,day,plus){
	
	var url = "<c:url value='/ifrs/capital/comBasicInfoListAjax' />";
	data = {};
	fn_ajax(url, data, function( result_com ){
		//console.log(result_com.result);
		var krw = "KRW";
		for(  var i=0 in result_com.result ) {
			if ( result_com.result[i].comNo == $("#comNo").val() ) {
				krw = result_com.result[i].currCd;
			}
		}	
	
	var holyparam = "Y";
	var url = "<c:url value='/ifrs/capital/holyday' />";
	var serdate = "serdate=" + year+month+day;
	fn_ajax(url, serdate, function( results ){
		holyparam = results.list[0].holyparam;			
		$("#holyday").val(holyparam);
	
	setTimeout( function(){
		//console.log($("#holyday").val());
		if ( $("#holyday").val() == "Y" && krw =="KRW" ) {
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
	
	});
}	

$(document).on('change', '#sdate1', function() {
	
	if(!isDate($("#sdate1").val())){
		alert("<spring:message code='capital.date.validation' />");
		$("#sdate1").focus();
		return;
	}
	var dYear = $("#sdate1").val().substr(0,4);
	var dMonth = $("#sdate1").val().substr(4,2);
	var dDay = $("#sdate1").val().substr(6,2);
	
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
	
	var myGridID1;
	
	// AUIGrid 를 생성합니다.
	var auiGridProps1 = {
			editable : false,
			processValidData : false,
			softRemovePolicy : "exceptNew",
			enableFocus : true, 
			editBeginMode : "doubleClick",
			editingOnKeyDown : true,
			selectionMode : "multipleCells",
			enableFilter : true,
			showFooter :true,
			showRowNumColumn : true,
			showStateColumn : false, 
			useGroupingPanel : false,
			displayTreeOpen : true,
			enableCellMerge : true,
			showBranchOnGrouping : false,
			showRowCheckColumn : false, 	//체크박스
			showRowAllCheckBox : false,			
			groupingFields : ["accname"],
			groupingSummary  : {
				dataFields : [ "remamt"  ]
			},			
	};		
	
	var columnLayout1 = [
							{
								dataField: "bankname",
								headerText: "금융기관",
							},{
								dataField: "bankaccno",
								headerText: "계좌번호",
							},{
								dataField: "accname",
								headerText: "계정과목",
							},{
								dataField: "currname",
								headerText: "통화",
							},{
								dataField: "remforamt",
								headerText: "외화잔액",
		            			style : "money",
		            			dataType : "numeric",
		            			formatString : "#,##0.00",								
							},{
								dataField: "remamt",
								headerText: "원화잔액",
		            			style : "money",
		            			dataType : "numeric",
		            			formatString : "#,##0",								
							}
		            	];			
	
	
	// 푸터 설정
	var footerObject1 = [ {
		labelText : "",
		positionField : "#base",
	},{
		dataField : "remamt",
		positionField : "remamt",
		operation : "SUM",
		style : "money",
		formatString : "#,##0"
	}
	];	
	
	
	$(document).ready(function(){
		
		$("#comNo").select2();
		
		// 일자 선택
		$("#sdate1").datepicker({
			dateFormat:'yymmdd',
			changeMonth: true,
			changeYear: true
		});		
		
		// 일자 선택
		$("#sdate2").datepicker({
			dateFormat:'yymmdd',
			changeMonth: true,
			changeYear: true
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
		$("#sdate1").val(year + "" + month + "" + day).change(); // 오늘 날짜 선택
		$("#sdate2").val(year + "" + month + "" + day).change(); // 오늘 날짜 선택
		
		//$("#sdate1").val('20170301').change();
		//$("#sdate2").val('20170613').change();
		//$("#comNo").val(2).change();
		
		// 모달 리사이즈
		$('.modal-dialog').resizable({
			handles: 'e, w'
		});

		// 모달 드레그
		$('.modal-dialog').draggable({
			handle: ".modal-header",
			containment : "document"
		});			
		
		
/* 		myGridID1 = AUIGrid.create("#grid_wrap1", columnLayout1, auiGridProps1); // AuiGrid 표시
		AUIGrid.setFooter(myGridID1, footerObject1); */
		
		// 조회
		$("#btnSelect").unbind("click");
		
		$("#btnSelect").click(function() {
			

			if(!isDate($("#sdate1").val())){
				alert("<spring:message code='capital.date.validation' />");
				$("#sdate1").focus();
				return;
			}
			if(!isDate($("#sdate2").val())){
				alert("<spring:message code='capital.date.validation' />");
				$("#sdate2").focus();
				return;
			}
			$.isLoading({ tpl : "<span class='isloading-wrapper %wrapper%'>Loading&nbsp;&nbsp;<i class='fa fa-refresh fa-spin'></i></span>" });

			var sdate1 = $("#sdate1").val();
			var sdate2 = $("#sdate2").val();
			var comNo = $("#comNo").val();

			var data = "sdate1=" + sdate1;
			data += "&sdate2=" + sdate2;
			data += "&comNo=" + comNo;
			var url = "<c:url value='/ifrs/capital/IfrsWeekReport14' />";
			
			fn_ajax(url, data, function(result) {
				$("#printDiv").empty();

				var lastAccName = "";
				var inamt = 0;
				var outamt = 0;
				var remamt = 0;
				var inamtTotal = 0;
				var outamtTotal = 0;
				var remamtTotal = 0;

				var inamtLast = 0;
				var outamtLast = 0;
				var remamtLast = 0;

				var sdate1t = $("#sdate1").val().substr(0, 4) + "년 " + $("#sdate1").val().substr(4,2) + "월 " + $("#sdate1").val().substr(6,2) + "일";
				
				var sdate2t = $("#sdate2").val().substr(0, 4) + "년 " + $("#sdate2").val().substr(4,2) + "월 " + $("#sdate2").val().substr(6,2) + "일";

				var appendHtml = "";
				appendHtml += "<table><tr><td style='padding-left:30px;'><p style='text-align:left; font-weight:bold; text-decoration:underline; font-size:28px; height:35px;color:black;'>현&nbsp;&nbsp;금&nbsp;&nbsp;출&nbsp;&nbsp;납&nbsp;&nbsp;장</p>";
				appendHtml += "<p style='text-align:left; font-size:17px; height:35px;color:black;'>" + sdate1t + "<br>" + sdate2t + "</p></td>";
				appendHtml += "<td style='text-align:right;'><img src='../../images/ifrs/orgline.png'></td></tr></table>";
				appendHtml += "<br><p style='text-align:left; font-size:15px;color:black;'>" + $("#comNo option[value='"+ $("#comNo").val() + "']").text() + "</p>";
				appendHtml += "<p style='text-align:left; font-size:10px;'>&nbsp;</p>";
				appendHtml += "<table class='stable'><thead><tr><th>일자</th><th>적요</th><th>계정과목</th><th>차변금액</th><th>대변금액</th><th>잔액</th></tr></thead>";
				appendHtml += "<tbody>";

				// 어제
				var data1 = "comNo=" + $("#comNo").val();
				data1 += "&sdate2=" + $("#newday").val();
				data1 += "&sdate=" + $("#newday").val();
				data1 += "&sType=111";
				data1 += "&SaveType=R";

				var url = "<c:url value='/ifrs/capital/IfrsLoadSaveData' />";
				
				fn_ajax(url, data1, function(result) {
					for ( var i = 0 in result.list) {
						if (result.list[i].sdata1 == "현금") {

							appendHtml += "<tr>";
							appendHtml += "<td>" + $("#newday").val() + "</td>";
							appendHtml += "<td>전일잔액</td>";
							appendHtml += "<td>&nbsp;</td>";
							appendHtml += "<td class='money'>0</td>";
							appendHtml += "<td class='money'>0</td>";
							appendHtml += "<td class='money'>" + result.list[i].sum4 + "</td>";
							appendHtml += "</tr>";
						}
					}

					var data = "sdate1=" + sdate1;
					data += "&sdate2=" + sdate2;
					data += "&comNo=" + comNo;
					var url = "<c:url value='/ifrs/capital/IfrsWeekReport13' />";
					
					fn_ajax(url, data, function(result) {
						for ( var i = 0 in result.list) {
							
							if (lastAccName == result.list[i].accdate) {
								lastAccName = result.list[i].accdate;
								inamt = inamt + result.list[i].inamt;
								outamt = outamt + result.list[i].outamt;
								remamt = result.list[i].remamt;
							} else {
								if (i > 0) {
									appendHtml += "<tr>";
									appendHtml += "<td colspan=3 style='text-align:left;'>일  계</td>";
									appendHtml += "<td class='money'>" + inamt + "</td>";
									appendHtml += "<td class='money'>" + outamt + "</td>";
									appendHtml += "<td class='money'>&nbsp;</td>";
									appendHtml += "</tr>";

									appendHtml += "<tr>";
									appendHtml += "<td colspan=3 style='text-align:left;'>누  계</td>";
									appendHtml += "<td class='money'>" + inamtTotal + "</td>";
									appendHtml += "<td class='money'>" + outamtTotal + "</td>";
									appendHtml += "<td class='money'>" + remamtTotal + "</td>";
									appendHtml += "</tr>";
								}
								
								lastAccName = result.list[i].accdate;
								inamt = result.list[i].inamt;
								outamt = result.list[i].outamt;
								remamt = result.list[i].remamt;
							}

							appendHtml += "<tr>";
							appendHtml += "<td>" + result.list[i].accdate + "</td>";
							appendHtml += "<td>" + result.list[i].summary + "</td>";
							appendHtml += "<td>" + result.list[i].accname + "</td>";
							appendHtml += "<td class='money'>" + result.list[i].inamt + "</td>";
							appendHtml += "<td class='money'>" + result.list[i].outamt + "</td>";
							appendHtml += "<td class='money'>" + result.list[i].remamt + "</td>";
							appendHtml += "</tr>";

							inamtTotal = inamtTotal + result.list[i].inamt;
							outamtTotal = outamtTotal + result.list[i].outamt;
							remamtTotal = result.list[i].remamt;

							if (result.list[i].accdate == result.list[result.list.length - 1].accdate) {
								inamtLast = inamtLast + result.list[i].inamt;
								outamtLast = outamtLast + result.list[i].outamt;
								remamtLast = result.list[i].remamt;
							}

							if (i == result.list.length - 1) {
								appendHtml += "<tr>";
								appendHtml += "<td colspan=3 style='text-align:left;'>일  계</td>";
								appendHtml += "<td class='money'>" + inamtLast + "</td>";
								appendHtml += "<td class='money'>" + outamtLast + "</td>";
								appendHtml += "<td class='money'>&nbsp;</td>";
								appendHtml += "</tr>";

								appendHtml += "<tr>";
								appendHtml += "<td colspan=3 style='text-align:left;'>누  계</td>";
								appendHtml += "<td class='money'>" + inamtTotal + "</td>";
								appendHtml += "<td class='money'>" + outamtTotal + "</td>";
								appendHtml += "<td class='money'>" + remamtTotal + "</td>";
								appendHtml += "</tr>";
							}
						}

						appendHtml += "</tbody><tr>";
						appendHtml += "</table>";

						$("#printDiv").append(appendHtml);

						setTimeout(function() {
							// 숫자 콤마 찍기
							$(".money").each(function() {
								var data = $(this).text().replace(/\B(?=(\d{3})+(?!\d))/g,",");
								$(this).text(data);
							});
						},50);

						setTimeout(function() {
							$.isLoading("hide");
						},10);
					});
				});
			});
		});

						/* 		// PDF 저장 버튼
						 $("#savepdf").unbind("click");
						 $("#savepdf").click(function(){
						 if(!AUIGrid.isAvailabePdf(myGridID1)) {
						 alert("PDF 저장은 HTML5를 지원하는 최신 브라우저에서 가능합니다.(IE는 10부터 가능)");
						 return;
						 }
						
						 var exportProps = {
						 // 폰트 지정
						 fontPath : "../../images/jejugothic-regular.ttf",
						 // 저장하기 파일명
						 fileName : "예적금현황",
						 // 헤더 내용
						 headers : [ {
						 text : "", height:20 // 첫행 빈줄
						 }, {
						 text : "예적금 현황[ 잔액 ]", height:35, style : { fontSize:25, textAlign:"center", underline:true, background:"white"}
						 }, {
						 text : "(2017-01-01 ~ 2017-12-31)", height:35, style : { fontSize:15, textAlign:"center", background:"white"}
						 }, {
						 text : "회계단위 : SGH", style : { textAlign:"left"}
						 }, {
						 text : "", height:5, style : { background:"#555555"} // 빈줄 색깔 경계 만듬
						 }],
						 // 푸터 내용
						 footers : [ {
						 text : "", height:5, style : { background:"#555555"} // 빈줄 색깔 경계 만듬
						 }]
						 };			
						 AUIGrid.exportToPdf(myGridID1, exportProps);						
						 }); */

						/* 		// XLS 저장 버튼
						 $('#savexls').unbind("click");
						 $('#savexls').click(function () {
						 var exportProps = {fileName : "예적금현황"};
						 AUIGrid.setProp(myGridID1, "exportURL", "/ifrs/capital/export.do");
						 AUIGrid.exportToXlsx(myGridID1, true, exportProps);
						 });		
						 */
						// PNG 저장 버튼
						$("#savepng").unbind("click");
						$("#savepng").click(function() {

							var agent = navigator.userAgent.toLowerCase();

							if (agent.indexOf("chrome") != -1) { // 크롬 브라우저 일 경우 border-width 변경
								$("table").css("border-width", "1px");
								$("td").css("border-width", "1px");
								$("th").css("border-width", "1px");
								$("tr").css("border-width", "1px");
							}

							var element = $("#printDiv");

							html2canvas(element, {
								onrendered : function(canvas) {
									var url = canvas.toDataURL();
									$("<a>", {
										href : url,
										download : "예적금현황"
									}).on("click", function() {
										$(this).remove()
									}).appendTo("body")[0].click();

									if (agent.indexOf("chrome") != -1) { // 크롬 브라우저 일 경우 border-width 변경
										$("table").css("border-width", "2px");
										$("td").css("border-width", "2px");
										$("th").css("border-width", "2px");
										$("tr").css("border-width", "2px");
									}

								}
							});

						});

						$("#print").unbind("click");
						$("#print")
								.click(
										function() {

											var element = $("#printDiv");
											html2canvas(
													element,
													{
														onrendered : function(
																canvas) {
															getCanvas = canvas;
															imgageData = "<img src='"
																	+ getCanvas
																			.toDataURL("image/png")
																	+ "'>";

															$("#printimg")
																	.append(
																			imgageData);

															setTimeout(
																	function() {

																		$(
																				"#printimg")
																				.print();
																		$(
																				"#printimg")
																				.empty();

																	}, 1000);

														}
													});

										});

						// 저장
						$("#btnSave").unbind("click");
						$("#btnSave")
								.click(
										function() {

											var agent = navigator.userAgent
													.toLowerCase();

											if (agent.indexOf("chrome") != -1) { // 크롬 브라우저 일 경우 border-width 변경
												$("table").css("border-width",
														"1px");
												$("td").css("border-width",
														"1px");
												$("th").css("border-width",
														"1px");
												$("tr").css("border-width",
														"1px");
											}

											var element = $("#printDiv");
											var height = element.css("height").replace("px", "");
											
											html2canvas(
													element,
													{
														onrendered : function(
																canvas) {
															var getCanvas = canvas;
															var canvImgStr = getCanvas
																	.toDataURL("image/png");
															$
																	.ajax({
																		url : '/ifrs/capital/ajax_Upload_proc',
																		data : {
																			strImg : canvImgStr,
																			height : height
																		},
																		type : 'POST',
																		success : function(
																				json) {

																			var data = "sdate="
																					+ $(
																							"#sdate2")
																							.val();
																			data += "&companyseq="
																					+ $(
																							"#comNo")
																							.val();
																			data += "&imgsrc="
																					+ "https://ifrs.${domain}/upload/capital/"
																					+ json;
																			data += "&stype=2";
																			var url = "<c:url value='/ifrs/capital/IfrsWeekReport11' />";
																			fn_ajax(
																					url,
																					data,
																					function(
																							result) {

																						msg("저장 되었습니다.");

																						if (agent
																								.indexOf("chrome") != -1) { // 크롬 브라우저 일 경우 border-width 변경
																							$(
																									"table")
																									.css(
																											"border-width",
																											"2px");
																							$(
																									"td")
																									.css(
																											"border-width",
																											"2px");
																							$(
																									"th")
																									.css(
																											"border-width",
																											"2px");
																							$(
																									"tr")
																									.css(
																											"border-width",
																											"2px");
																						}

																					});

																		},
																		error : function(
																				a,
																				b,
																				c) {
																		}
																	});
														}
													});

										});

						// 메세지 Modal
						function msg(st) {
							$("#confirmModalContentText").text(st);
							$("#msgModal").dialog(
									{
										show : 'fade',
										hide : 'fade',
										duration : 1000,
										open : function(eve, ui) {
											$(".ui-dialog-titlebar-close",
													ui.dialog | ui).hide();
											var item = $(this);
											window.setTimeout(function() {
												item.dialog('close');
											}, 800);
										}
									});
						}

					});
	
	// 날짜포맷 체크 Function
	function isDate(txtDate) {
	    var currVal = txtDate;
	    if (currVal == '')
	        return false;
	 
	    var rxDatePattern = /^(\d{4})(\d{1,2})(\d{1,2})$/;              
	    var dtArray = currVal.match(rxDatePattern);
	 
	    if (dtArray == null)
	        return false;

	    dtYear = dtArray[1];
	    dtMonth = dtArray[2];
	    dtDay = dtArray[3];
	 
	    if (dtMonth < 1 || dtMonth > 12 || dtYear.length!=4)
	        return false;
	    else if (dtDay < 1 || dtDay > 31 || dtDay.length!=2)
	        return false;
	    else if ((dtMonth == 4 || dtMonth == 6 || dtMonth == 9 || dtMonth == 11) && dtDay == 31 || dtMonth.length!=2)
	        return false;
	    else if (dtMonth == 2) {
	        var isleap = (dtYear % 4 == 0 && (dtYear % 100 != 0 || dtYear % 400 == 0));
	        if (dtDay > 29 || (dtDay == 29 && !isleap))
	            return false;
	    }
	    return true;
	};
</script>
</head>


<body>

	
	<!-- 메세지 Modal -->
	<div id="msgModal" title="SmileGate Capital" style="display: none;"><br><br>
	<div class="confirmModalContentText" id="confirmModalContentText">저장 되었습니다.</div>
	</div><!-- 메세지 Modal -->
	
	<!-- 저장 Modal -->
	<div class="modal fade" id="confirmmodal" role="dialog">
	<div class="modal-dialog modal-sm"><div class="modal-content">
	<div class="modal-header"><button type="button" class="close" data-dismiss="modal">&times;</button>
	<div class="modal-title">&nbsp;</div></div><div class="modal-body">
	<p align="center"><div id="confirmModalContent" class="confirmModalContent">자금일보 전송 하시겠습니까?</div>
	</p></div><div class="modal-footer">
	<button type="button" class="btn btn-primary btn-sm" id="save_row1">저장</button>
	<button type="button" class="btn btn-default btn-sm" data-dismiss="modal">취소</button>
	</div></div></div></div><!-- 저장 Modal -->	
	
	
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
 			 			
			<div class="panel panel-default" style="width:1650px;margin-bottom:10px;">
			  <div class="panel-body">

						<div style="float:left;width:10px;">
						&nbsp;&nbsp;
						</div>
						
                   		<div style="float:left;">
                   		<select name="comNo" id="comNo" style="width:200px;">
                   		<c:forEach var="list" items="${companyList}">
                   			<c:choose>
                   				<c:when test="${locale eq 'ko'}"><option value="${list.COM_NO }">${list.COM_NM}</option></c:when>
                   				<c:otherwise><option value="${list.COM_NO }">${list.COM_NM_EN}</option></c:otherwise>
                   			</c:choose>
                   		</c:forEach>
                   		</select>
                   		</div>						

                   		<div style="float:left;">
                   			<input type="text" class="form-control input-sm" id="sdate1" name="sdate1" style="width:120px;">
                   		</div>
                   		
                   		<div style="float:left;">
                   		<input type="text" class="form-control input-sm" readonly style="width:35px;font-size:16px;font-weight:bolder;" value="~">
                   		</div>                   		
                   		
                   		<div style="float:left;">
                   			<input type="text" class="form-control input-sm" id="sdate2" name="sdate2"  style="width:120px;">
                   		</div>                   		
                   		
						<div style="float:left;width:10px;">
						&nbsp;&nbsp;&nbsp;&nbsp;
						</div>                   		
                   		
                   		<div style="float:left;">
                   			<button class="btn btn-default btn-sm" type="button" id="btnSelect"><spring:message code='capital.search'/></button>	   
                   			<c:if test="${registAuth eq 'Y' }" >                		
	                   		<button class="btn btn-default btn-sm" type="button" id="btnSave"><spring:message code='capital.save'/></button>
	                   		</c:if>
	                   		<%-- <button class="btn btn-default btn-sm" type="button" id=btnReset><spring:message code='capital.init'/></button> --%>
	                   		<%-- <button class="btn btn-default btn-sm" type="button" id="savexls">XLS</button> --%>
	                   		<%-- <button class="btn btn-default btn-sm" type="button" id="savepdf">PDF</button> --%>
	                   		<button class="btn btn-default btn-sm" type="button" id="savepng">PNG</button>
	                   		<button class="btn btn-default btn-sm" type="button" id="print"><spring:message code='capital.print'/></button>                   		
                   		</div>                     		               		                   		 
		  
			  
			  </div>
			</div> 
			
					

            <div class="panel panel-default" style="width:1650px;margin-bottom:10px;">
            <div class="panel-body">
			<div style="width:1000px;background-color:white;" id="printDiv">

			  
			</div>		
			</div> 	
			</div>	
					
            
            </div>            


        </div>

	<jsp:include page="/WEB-INF/jsp/config/footer.jsp"/>
	
</div>

<div id="printimg" style="background-color:white;">
</div>
     <input type="text" id="holyday">
	<input type="text" id="newday">
</body>
</html>
<jsp:include page="/WEB-INF/jsp/config/footer_naviTime_capital.jsp"/>