<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8" %>
<%@ include file="/WEB-INF/jsp/config/include.jsp" %>
<!DOCTYPE html >
<html>
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

<!-- webponent chart / 21.03.09 ICM-7569 echart → webponent chart로 변경 -->
<script src="${chartPath}/webponent.licenseKey.js"></script>
<script src="${chartPath}/lib/comm/raphael.js"></script>
<script src="${chartPath}/lib/comm/webponent.comm.common.js"></script>
<script src="${chartPath}/lib/chart/webponent.chart.js?ver=1"></script>

<!-- AUIGrid 라이센스 파일입니다. 그리드 출력을 위해 꼭 삽입하십시오. -->
<link href="${auiGridPath}/3.0.9/AUIGrid_style.css" rel="stylesheet">
<script type="text/javascript" src="${auiGridPath}/3.0.9/AUIGrid.js"></script>
<script type="text/javascript" src="${auiGridPath}/3.0.9/AUIGridLicense.${domain}.js"></script>
<%-- <script type="text/javascript" src="${scriptPath}/ifrs/gridCommon.js?2"></script> --%>


<style type="text/css">
div#container { width:1900px; }
div#content { width:1500px; }
/* .money {text-align:right;} */
.left-cell {text-align:left;}
/* .center {text-align:center;} */
#sdate {text-align:center;font-size:15px;}
#edate {text-align:center;font-size:15px;}
#sdate1 {text-align:center;font-size:15px;background-color:#e6f0ff;}
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
	border-width: 2px;
	border-color: gray;
	width:100%;	  	
}

.stable td {
 	border-style: solid;
	border-width: 2px;
	border-color: gray;
	height:20px;
	margin:3px;
	padding:3px;
	font-size:11px;
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

.aui-grid-nodata-msg-layer{
	background: none;
}
</style>

<script type="text/javascript">

var searchFlag = false;

var graphSettingList = ${graphSettingList}; // 법인별 그래프 상한값 세팅목록



function fnShowChart1(weekList, chartData, companyseq, appno) {
	
	var data = "companylist=" + companyseq;	
	var url = "<c:url value='/ifrs/capital/IfrsWeekReport6' />";
	
	if(chartData == '') {
		chartData = [''];
	}
	if(weekList == ''){
		weekList = [''];
	};
	
	fn_ajaxAsync(url, data, function( result ){
		
		var weekText = $("#sMonth").val() + "<spring:message code='capital.month'/>" + $("#sWeek").val() + "<spring:message code='capital.week'/>";
		var titleText = result.list[0].comNmEn + " " + weekText + " 일별 가용자금";
		$("#chart1"+appno+"title").text(titleText);

		var nweekList = [];

		for (var i=0 in weekList) {
			var value = weekList[i].toString().substr(4,2) + "/" + weekList[i].toString().substr(6,2);
			nweekList.push(value);
		}

		var yAxis = [];

		// 21.03.09 ICM-7569 echart → webponent chart로 변경
		var item = null;
		var maxAmtF;
        var intervalNum;

		for (var i=0, len=graphSettingList.length; i<len; i++){
			item = graphSettingList[i];
			if (companyseq == item.comNo) {
				maxAmtF = item.maxAmt;
				intervalNum = item.splitInterval;
			}
		}

		var objList = new Array();
		var obj;
		for(var i=0; i<chartData.length; i++){
			obj = new Object();
			obj.xAxis = nweekList[i];
			obj.val = chartData[i];
			objList.push(obj);
		}

		var options = {
			data: {
				data: objList
			},
			format: {
				xAxis: function(_str){
					return _str;
				},
				yAxis: 'priceDataFormat', // webponent.comm.common.js에 미리 정의해 놓은 함수, value의 천단위 ',' (comma) 형식 적용 리턴 : 1,000
			},
			use: {
				animate: false,
				aCrossLine: false,
				reSize: true,
				tip : false,
			}
		};
		var styles = {
			main: {
				layout: {
					//paddingTop: 10, paddingRight: 30,
					color: '#FFFFFF',
					line: {color: '#eaeaea', width: 0}
				},
				xAxis: {
					line: {color: '#e3e3e3', width: 0},
					text: {family: 'Nanum Gothic', size: 12, color: '#666'},
					paddingTop: 13, height: 30,
				},
				yAxis: {
					line: {color: '#cccccc', width: 1, opacity: 1},
					text: {family: 'Nanum Gothic', size: 12, color: '#666', align: 'center'},
					maxNumber : maxAmtF,
                    interval : intervalNum,
					baseAtZero : true,
					useValue: { min: true, max: true }
				},
				series: {
					s1: {
						area: {
							normal: {
								color: '#c9c9c9', opacity: 1,
								over: { color: {src: '/images/ifrs/chart_over.png', color: '#4e6679'} }
							}
						},
						line: {
							normal: {
								width: 0,
								over: { width: 0 }
							}
						},
						text: {
							use: true, color: '#666666', family: 'Nanum Gothic', size: 12,
							format: 'priceDataFormat'
						}
					}
				}
			}
		};
		var series = {
			"main": {
				"s1": {series: 'column', xaxis: 'xAxis', yaxis: 'val'}
			}
		};
		var chart = webponent.chart.init($("#chart1"+appno), options, styles, series);

	});
};

	var SESSION = "${SESSION}"; // 소속 법인 번호
	var sDate = [];
	
	var myGridID1;
	var myGridID2;
	var myGridID4;
	
	// AUIGrid 를 생성합니다.
	var auiGridProps = {
			editable : false,
			processValidData : false,
			softRemovePolicy : "exceptNew",
			enableFocus : true,
			editBeginMode : "doubleClick",
			editingOnKeyDown : true,
			selectionMode : "multipleCells",
			enableFilter : true,
			showFooter :false,
			showRowNumColumn : false,
			showStateColumn : false, 			
			noDataMessage : '주요 거래내역이 존재하지 않습니다.'
	};	
	
	// AUIGrid 를 생성합니다.
	var auiGridProps2 = {
			// 행 고유 id 에 속하는 필드명 (필드의 값은 중복되지 않은 고유값이여야 함)
			rowIdField : "rowNum",
			editable : true,
			processValidData : false,
			softRemovePolicy : "exceptNew",
			enableFocus : true, 
			editBeginMode : "doubleClick",
			editingOnKeyDown : true,
			selectionMode : "multipleCells",
			enableFilter : true,
			showFooter :false,
			showRowNumColumn : false,
			showStateColumn : false, 
			useGroupingPanel : false,
			displayTreeOpen : true,
			groupingFields : ["sDate"],
			enableCellMerge : true,
			showBranchOnGrouping : false,			
			showRowCheckColumn : true, 	//체크박스
			showRowAllCheckBox : true,			
			noDataMessage : '주요 거래내역이 존재하지 않습니다.'
	};		
	
	// AUIGrid 를 생성합니다.
	var auiGridProps3 = {
			editable : true,
			processValidData : false,
			softRemovePolicy : "exceptNew",
			enableFocus : true, 
			editBeginMode : "doubleClick",
			editingOnKeyDown : true,
			selectionMode : "multipleCells",
			enableFilter : true,
			showFooter :false,
			showRowNumColumn : false,
			showStateColumn : false, 
			useGroupingPanel : false,
			displayTreeOpen : true,
			enableCellMerge : true,
			showBranchOnGrouping : false,
			showRowCheckColumn : false, 	//체크박스
			showRowAllCheckBox : false,			
			groupingFields : ["sDate","sType"],
			groupingSummary  : {
				dataFields : [ "cramt" ]
			},			
			noDataMessage : '주요 거래내역이 존재하지 않습니다.'
	};	
	
	// 주요 거래내역 그리드
	var columnLayout2 = [
		{
			dataField: "companyseq",
			headerText: "법인번호",
			visible : false
		},{
			dataField: "currCd",
			headerText: "통화",
			visible : false
		},{
			dataField: "sDate",
			headerText: "날짜",
			width:100,
			formatString : "yyyymmdd",
			editRenderer : {
				type : "CalendarRenderer",
				showExtraDays : false, // 지난 달, 다음 달 여분의 날짜(days) 출력 안함
				onlyCalendar : false // 사용자 입력 불가, 즉 달력으로만 날짜입력 (기본값 : true)
			}
// 			dataField: "sDate",
// 			headerText: "날짜",
// 			width:100,
		},{
			dataField: "sType",
			headerText: "구분",
			width:80,
			labelFunction : function(  rowIndex, columnIndex, value, headerText, item ) { 
				var keyValueList = [{'sType': 1, 'sTypeNm' : '출금'}, {'sType': 2, 'sTypeNm' : '입금'}];
   				var retStr = value;
   				for(var i=0,len=keyValueList.length; i<len; i++) {
					if(keyValueList[i]["sType"] == value) {
						retStr = keyValueList[i]["sTypeNm"];
						break;
					}
				}
   				return retStr;
   			},
			styleFunction : function(rowIndex, columnIndex, value, headerText, item, dataField) {
				if(item.sType == '2') {
					return "outmoney";
				} else if (item.sType == '1') {
					return "inmoney";
				} else {
					return "moneybold1";
				}
				return null;
			},
			editRenderer : {
				type : "DropDownListRenderer",
				showEditorBtnOver : true,
				list : [{'sType': 1, 'sTypeNm' : '출금'}, {'sType': 2, 'sTypeNm' : '입금'}], //key-value Object 로 구성된 리스트
				keyField : "sType", // key 에 해당되는 필드명
				valueField : "sTypeNm" // value 에 해당되는 필드명
			}
		},{
			dataField: "cramt",
			headerText: "금액(억원)",
       		style : "money",
       		dataType : "numeric",
       		editRenderer : {
    		    type : "InputEditRenderer",
    		    onlyNumeric : true
    		},
       		formatString : "#,##0.0",
       		width:100,			
       		styleFunction : function(rowIndex, columnIndex, value, headerText, item, dataField) {
         		if(item.sType == "2") {
         			return "outmoney";
         		} else if (item.sType == "1") {
         			return "inmoney";
         		} else {
					return "moneybold1";
				}
     			return null;
     		}	
		},{
			dataField: "summary",
			headerText: "적요",
			style : "left-cell",
			//width:300,			
			styleFunction : function(rowIndex, columnIndex, value, headerText, item, dataField) {
				if(item.sType == "2") {
         			return "outmoney";
         		} else if (item.sType == "1") {
         			return "inmoney";
         		} else {
					return "moneybold1";
				}
				return null;
			}	
		}
	];		
	
	var columnLayout3 = [
		{
			dataField: "sDate",
			headerText: "날짜",
			width:100,
		},{
			dataField: "sType",
			headerText: "구분",
			width:80,			
			styleFunction : function(rowIndex, columnIndex, value, headerText, item, dataField) {
				if(item.sType == "입금") {
					return "outmoney";
				} else if (item.sType == "출금") {
					return "inmoney";
				} else {
					return "moneybold1";
				}
				return null;
			}	
		},{
			dataField: "cramt",
			headerText: "금액(원)",
       		style : "money",
       		dataType : "numeric",
       		formatString : "#,##0.0",
       		width:100,			
       		styleFunction : function(rowIndex, columnIndex, value, headerText, item, dataField) {
       			if(item.sType == "입금") {
       				return "outmoney";
       			} else if (item.sType == "출금") {
       				return "inmoney";
       			} else {
					return "moneybold1";
				}
        		return null;
			}	
		},{
			dataField: "summary",
			headerText: "적요",
			style : "left-cell",
			//width:300,			
			styleFunction : function(rowIndex, columnIndex, value, headerText, item, dataField) {
				if(item.sType == "입금") {
					return "outmoney";
				} else if (item.sType == "출금") {
					return "inmoney";
				} else {
					return "moneybold1";
				}
				return null;
			}
		}
	];

	// 선택 법인 삭제
	function removeCompany(comNoDiv) { // 법인선택 시 리스트 추가
		comNoDiv = 'div' + comNoDiv;
		var currText = $("#" + comNoDiv).attr("name");		
		$("#" + comNoDiv).remove();
		
		if($("#comlist").find("[name="+currText+"]").length == 0){
			$("#currList").find("#div"+currText).remove();
		};
	};
	
	// 휴무일 여부 판단해서 전일 선택
	function holyday(year, month, day, plus){
		
		var url = "<c:url value='/ifrs/capital/comBasicInfoListAjax' />";
		data = {};
		fn_ajaxAsync(url, data, function( result_com ){
			var holyparam = "Y";
			var url = "<c:url value='/ifrs/capital/holyday' />";
			var serdate1 = "serdate=" + year+month+day;
			
			fn_ajaxAsync(url, serdate1, function( results ){
				holyparam = results.list[0].holyparam;			
				$("#holyday").val(holyparam);
			});
		
			setTimeout( function(){
				if ( $("#holyday").val() == "Y") {	
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
			}, 100 );					
		});	
	};
	
	function append() {
		if(!isDate($("#sdate").val())){
			alert("<spring:message code='capital.date.validation' />");
			$("#sdate").focus();
			return;
		}
		if(!isDate($("#edate").val())){
			alert("<spring:message code='capital.date.validation' />");
			$("#edate").focus();
			return;
		}
		
		$("#printdiv").empty();
		
		$.isLoading({ tpl: "<span class='isloading-wrapper %wrapper%'>Loading&nbsp;&nbsp;<i class='fa fa-refresh fa-spin'></i></span>" });
		
 		var weekly = $("#sdate2").val();
 		$("#sYear").val($("#sdate").val().substr(0,4));
 		
 		var sYear = $("#sYear").val();
 		var sMonth = $("#sMonth").val();
 		var sWeek = $("#sWeek").val();
		var userid = "${userid}"; // 사용자ID
		var companylist = "";
		
		$("#comlist").find("div").each(function(){
			companylist += $(this).attr("id").replace("div","") + ",";
		});
		
		var data = "userid=" + userid;
		data += "&weekly=" + weekly;
		data += "&companylist=" + companylist;
		data += "&sYear=" + sYear;
		data += "&sMonth=" + sMonth;
		data += "&week=" + sWeek;
		
		// week, 법인 등록		
		var url = "<c:url value='/ifrs/capital/IfrsWeekReport8' />";
		fn_ajaxAsync(url, data, function( result ){});
		
		for ( var appno = 0 ; appno < $("#comlist").find("div").length ; appno++  ) {
			appendrun(appno, weekly);
		}	
	};
	
	function appendrun(appno, weekly) {
		
		var sdate = $("#sdate2").val();
		var companyseq = $("#comlist").find("div").eq(appno).attr("id").replace("div","");	
		var currText = $("#comlist").find("div").eq(appno).attr("name");		
		
		var rateText = "";
		
		if (currText != "KRW") {
			rateText = "[환율:" + currText + "]</br>[단위:백만원]";
		} else {
			rateText = "[단위:백만원]";
		};
		
		var appendHtml = "";
	
		appendHtml += "<div id='append"+ appno +"'>";
		appendHtml += "<div class='panel panel-default divclass' style='width:100%;height:100%;color:black;'>";
		appendHtml += "<div class='panel-body' style='width:100%;height:100%;color:black;'>";
		appendHtml += "<div class='panel panel-default' id='grid_wrap' style='width:100%;color:black;'>";
		appendHtml += "<div id='chart1"+appno+"title' style='text-align:center; font-weight:bold;mfont-size:13px; font-size:20px; font-color:gray; font-weight:bolder; margin:10px;'></div>";
		appendHtml += "<div style='text-align:right;padding-right:10px;padding-bottom:3px;padding-top:3px;'>" + rateText + "</div>";
		appendHtml += "<div id='chart1"+appno+"' style='width:100%;height:300px;'></div>";
		appendHtml += "<div id='grid_wrap1"+appno+"' style='width:100%;height:120px;'></div>";
		appendHtml += "<div id='memo' style='width:100%;height:50px;'>";
		appendHtml += "<textarea style='width:100%;height:100%;border-color:lightgray;border-width:1px;border-style: solid;' id='textmemo"+appno+"'></textarea></div>";
		appendHtml += "<div class='panel-heading clearfix'>";
		appendHtml += "<div class='panel-title pull-left' style='font-size:12px;'>[주요 거래내역 요약]</div><div class='btn-group pull-right'>";
		appendHtml += "<i class='glyphicon glyphicon-plus ahref add_row' aria-hidden='true' data-toggle='tooltip' title=' 행추가' id='add_row"+appno+"' name='grid_wrap2"+appno+"'></i>";
		appendHtml += "<i class='glyphicon glyphicon-minus ahref del_row' aria-hidden='true' data-toggle='tooltip' title='행삭제' id='del_row"+appno+"' name='grid_wrap2"+appno+"'></i>";
		appendHtml += "</div></div><div id='grid_wrap2"+appno+"' style='width:100%;height:250px;padding:0px;'></div></div></div></div><div>";
			
		$("#printdiv").append(appendHtml);	
		
		var data = "weekly=" + weekly;
		data += "&companyseq=" + companyseq;
		
		// 비고 조회
		var url = "<c:url value='/ifrs/capital/getText' />";
		
		fn_ajaxAsync(url, data, function( result ){	
			if (null != result.list && 0 < result.list.length) {
				for (var i in result.list) {
					$('#textmemo'+appno).val(result.list[i].comment);
				}
			}else{
				$('#textmemo'+appno).val("");
			}
		});
		
		searchData(appno);
	};
	
	// 차트 및 그리드 데이터 세팅
	function searchData(appno) {
		
		var week = $("#sdate2").val();
		var companyseq = $("#comlist").find("div").eq(appno).attr("id").replace("div","");
		var curr = $("#comlist").find("div").eq(appno).attr("name").replace("div","");
		var cmsYn = $("#comlist").find("div").eq(appno).attr("cms").replace("div","");
		
		var sdate = week.split("~")[0];
		var edate = week.split("~")[1];
		
		// 시작일자, 종료일자, 법인번호, 통화코드, cms구분, 날짜값
		var data = "sdate=" + sdate;
		data += "&edate=" + edate;
		data += "&companyseq=" + companyseq;
		data += "&curr=" + curr;
		data += "&cmsYn=" + cmsYn;
		data += "&datevalue=" + sdate +"~"+ edate;
		
		var url = "<c:url value='/ifrs/capital/IfrsWeekReport1' />";
		
		fn_ajaxAsync(url, data, function( result ){
	
			// 입출금, 잔액 그리드 Layout
			var columnLayout = [];

			var columnObj = {};
			columnObj.dataField = "Doc";
			columnObj.headerText = "월";
			columnLayout.push(columnObj);
			
			var columnObj = {};
			columnObj.dataField = "Before";
			columnObj.headerText = "이월";
			columnObj.style = "moneybold";
			columnLayout.push(columnObj);			
	
			weekList = [];
	
			var year_s = sdate.substr(0,4);
			var year_e = edate.substr(0,4);			
			
			var month_s = sdate.substr(4,2);
			var month_e = edate.substr(4,2);
			
			var month_count = 30;

			if ( 	month_s == '01' || month_s == '03' || month_s == '05' || month_s == '07' || month_s == '08' || month_s == '10' || month_s == '12' ) {
				month_count = 31;
			};
			
			if ( 	month_s == '02') {
				if((year_s % 400 == 0) || (year_s % 4 == 0 && year_s % 100 != 0)){
					month_count = 29;
				}else{
					month_count = 28;
				}
			};
	
			var cdate1 = Number(year_s + month_s + month_count);
	
			// 월요일 날짜 부터 금요일까지
			var firstDate  = toDate(sdate);
            var secondDate = toDate(edate);
            var diffDays = Math.round(Math.abs((firstDate.getTime() - secondDate.getTime())/(24*60*60*1000)));				
			var vDate = new Date(firstDate);	
			
			for (var n=0; n <= diffDays; n++ ) {
				vDate.setTime(firstDate.getTime() + n * 86400000);
				var i = Number(formatDate(vDate));
				
				// 현재 달 날짜 체크
				if ( month_s == String(i).substr(4,2) && i <= cdate1 && i.toString().substr(6,2) != '00' ) {
		
					var newDate = i.toString().substr(4,2) + "/" + i.toString().substr(6,2);
					var columnObj = {};
					columnObj.dataField = "a" + i;
					columnObj.headerText = newDate;
					columnObj.style = "money";
			
					columnObj.styleFunction = function(rowIndex, columnIndex, value, headerText, item, dataField) {
				
						if(item.Doc == "입금") {
							return "outmoney";
						} else if (item.Doc == "출금") {
							return "inmoney";
						} else if (item.Doc == "잔액") {
							return "moneytd";
						}
						return null;
					};
			
					columnLayout.push(columnObj);
					weekList.push(i);
				};
		
				// 다음 달 날짜 체크
				if ( month_s != String(i).substr(4,2)  && i.toString().substr(6,2) != '00'  ) {
					
					var newDate = i.toString().substr(4,2) + "/" + i.toString().substr(6,2);
					var columnObj = {};
					columnObj.dataField = "a" + i;
					columnObj.headerText = newDate;
					columnObj.style = "money";
					
					columnObj.styleFunction = function(rowIndex, columnIndex, value, headerText, item, dataField) {
						if(item.Doc == "입금") {
							return "outmoney";
						} else if (item.Doc == "출금") {
							return "inmoney";
						} else if (item.Doc == "잔액") {
							return "moneytd";
						}
						return null;
					};
					
					columnLayout.push(columnObj);
					weekList.push(i);
				}
			}; // for
	
			// 그리드 데이터
			var dataArr = [];
			
			// 차트 데이터
			var chartData = [];
			var chartWeekListData = [];
			
			var depositDataObj = {};
			depositDataObj.Doc = "입금";
			depositDataObj.Before = "";
			
			var withdrawDataObj = {};
			withdrawDataObj.Doc = "출금";
			withdrawDataObj.Before = "";

			var balanceDataObj = {};
			balanceDataObj.Doc = "잔액";
			balanceDataObj.Before = "";
			
			var depositCnt = 0;
			var withdrawCnt = 0;
			var balanceCnt = 0;
			
			// 입,출,잔액 목록
			var weekReportList = result.list.weekReport;

			// 환율 목록
			var rateList = result.list.rateList;
			var rateDt = "";
			
			var date = "";
			var cramt = 0;
			var betWeenDt = "";
			var year, month, day;
			
			var incomAmt = 0;
			var outAmt = 0;
			var balMoney = 0;
			
			var chartDataChk = false;
			
			for ( var i=0; i < weekReportList.length; i++ ) {
				date = result.list.weekReport[i].sDate;
				cramt = result.list.weekReport[i].cramt;
				
				if(curr != "KRW" && cmsYn == "N"){
					if(date != result.list.serdate){
						year = date.toString().substring(0,4);
						month = date.toString().substring(4,6);
						day = date.toString().substring(6,8);
						
						var holyparam = "Y";
						var url = "<c:url value='/ifrs/capital/holyday' />";
						var serdate1 = "serdate=" + year+month+day;
						
						fn_ajaxAsync(url, serdate1, function( results ){
							holyparam = results.list[0].holyparam;			
							$("#holyday").val(holyparam);
						});
						
						var nowday = new Date(year+"-"+month+"-"+day);
						tomorrow = new Date(nowday.valueOf() + (24*60*60*1000));
						
						year = tomorrow.getFullYear();
						month = tomorrow.getMonth() + 1;
						day = tomorrow.getDate();		
						
						if(month < 10){month = "0" + month;}
						if(day < 10){day = "0" + day;}			
						
						date = year+month+day;
					};
				};
				
				if(cmsYn == "N"){
					// 입금
					if ( result.list.weekReport[i].sType == 2) {
						if(date == result.list.serdate){
							var obj = "a" + weekList[0];
						}else{
							if(date < weekList[0]){
								date = weekList[0];	
							};
							var obj = "a" + date;
						}
						var value = (Math.round(cramt)).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
						value = "▲ " + value;
						depositDataObj[obj] = value;
					};

					// 출금
					if ( result.list.weekReport[i].sType == 1) {
						if(date == result.list.serdate){
							var obj = "a" + weekList[0];
						}else{
							if(date < weekList[0]){
								date = weekList[0];	
							};
							var obj = "a" + date;
						}
						var value = (Math.round(cramt)).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
						value = "▼ " + value;
						withdrawDataObj[obj] = value;
					};

					// 잔액
					if ( result.list.weekReport[i].sType == 3) {
						if(date == result.list.serdate){
							var obj = "a" + weekList[0];
							var value = (Math.round(cramt)).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
							balanceDataObj.Before = value;
							balanceDataObj[obj] = value;
							chartData.push((Math.round(cramt)));
						}else{
							
							if(date >= weekList[0]){
								if(curr != "KRW" && cmsYn == "N"){
									if($("#holyday").val() != "Y"){
										chartData.push((Math.round(cramt)));
									}
								}else{
									chartData.push((Math.round(cramt)));
								};
							};
							
							if(date < weekList[0]){
								date = weekList[0];
								
								if(betWeenDt != date){
									if(curr != "KRW" && cmsYn == "N"){
										if($("#holyday").val() != "Y"){
											chartData.push((Math.round(cramt)));
										};
									};
								};
							};
							
							var obj = "a" + date;
							var value = (Math.round(cramt)).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
							balanceDataObj[obj] = value;
						}
						if(betWeenDt != date && date >= weekList[0]){
							chartWeekListData.push(date);
						}
						betWeenDt = date;
					};
				}else{
					
					incomAmt = result.list.weekReport[i].incomAmt;
					outAmt = result.list.weekReport[i].outAmt;
					balMoney = result.list.weekReport[i].balMoney;
					
					// 입금
					var obj = "a" + date;
					
					var value = (Math.round(result.list.weekReport[i].incomAmt)).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
					value = "▲ " + value;
					depositDataObj[obj] = value;

					var value = (Math.round(result.list.weekReport[i].outAmt)).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
					value = "▼ " + value;
					withdrawDataObj[obj] = value;

					// 잔액
					if(date == result.list.serdate){
						chartDataChk = true; 
						var obj = "a" + weekList[0];
						var value = (Math.round(result.list.weekReport[i].balMoney)).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
						balanceDataObj.Before = value;
						chartData.push((Math.round(result.list.weekReport[i].balMoney)));
					}else{
						if(date >= weekList[0]){
							if(!chartDataChk){
								chartData.push("");
								chartDataChk = true; 
							};
							chartData.push((Math.round(result.list.weekReport[i].balMoney)));
						};
						
						if(date < weekList[0]){
							date = weekList[0];
						};
						
						var obj = "a" + date;
						var value = (Math.round(result.list.weekReport[i].balMoney)).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
						balanceDataObj[obj] = value;

					};
					if(betWeenDt != date && date >= weekList[0]){
						chartWeekListData.push(date);
					}

					betWeenDt = date;
				};
			};
			
			
			
			dataArr.push(depositDataObj);
			dataArr.push(withdrawDataObj);			
			// 기초이월액 
			balanceDataObj.Before = (Math.round(result.basicBalance)).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
			dataArr.push(balanceDataObj);
			
			fnShowChart1(chartWeekListData, chartData, companyseq, appno);
				
			AUIGrid.destroy("#grid_wrap1"+appno);
			myGridID1 = null;
	
			myGridID1 = AUIGrid.create("#grid_wrap1"+appno, columnLayout, auiGridProps);
			AUIGrid.setGridData(myGridID1, dataArr);
			AUIGrid.resize(myGridID1);
			var colSizeList = AUIGrid.getFitColumnSizeList(myGridID1, true);
			AUIGrid.setColumnSizeList(myGridID1, colSizeList);
			
			$.isLoading( "hide" );
			
			setSummary(data, appno, companyseq);
		}); // 조회 끝
	};
	
	function setSummary(data, appno, companyseq){
		
		var savedata;
		var savedataLength;
		
		var newData = [];
		var newDataItem = {};
		
		// 주요 거래 내역 요약 조회
		var url = "<c:url value='/ifrs/capital/IfrsWeekReport4' />";
		fn_ajaxAsync(url, data, function( result ){
			savedata = result.list;
			savedataLength = result.list.length;
			
			// 주요 거래내역을 저장한적 이 없으면
			if ( savedataLength > 0 ) {
				for (var e=0 in savedata ) {
					if(savedata[e] != ''){
						savedata[e].rowNum = e;
						savedata[e].accname = savedata[e].accname.replace(/percent_text/gi,"%").replace(/and_text/gi,"&").replace(/dblqt/gi,"\"").replace(/gtgt/gi,"\<").replace(/ltlt/gi,"\>");
						savedata[e].remseqname1 = savedata[e].remseqname1.replace(/percent_text/gi,"%").replace(/and_text/gi,"&").replace(/dblqt/gi,"\"").replace(/gtgt/gi,"\<").replace(/ltlt/gi,"\>");
						savedata[e].summary = savedata[e].summary.replace(/percent_text/gi,"%").replace(/and_text/gi,"&").replace(/dblqt/gi,"\"").replace(/gtgt/gi,"\<").replace(/ltlt/gi,"\>");
					};
				};
				newData = savedata;
				summaryGridSet(newData, appno, companyseq);
			}else{
				newDataSummary(data, appno, companyseq)
			};
		});
	};
	
	function newDataSummary(data, appno, companyseq){
		
		var newData = [];
		var newDataItem = {};
		
		var url = "<c:url value='/ifrs/capital/IfrsWeekReport3' />";						
		
		fn_ajaxAsync(url, data, function( result ){
			for ( var i=0 in result.list.summaryList ) {
				if ( result.list.summaryList[i].cramt >= 1 ) {
					newDataItem = {
						"docNo" : 0,
						"rowNum" : i,
						"companyseq" : result.list.summaryList[i].companyseq,
						"currCd" : result.list.summaryList[i].currCd,
						"sDate" : result.list.summaryList[i].sDate,
						"sType" : result.list.summaryList[i].sType,
						"cramt" : result.list.summaryList[i].cramt,
						"remseqname1" : result.list.summaryList[i].remseqname1.replace(/percent_text/gi,"%").replace(/and_text/gi,"&").replace(/dblqt/gi,"\"").replace(/gtgt/gi,"\<").replace(/ltlt/gi,"\>"),
						"accname" : result.list.summaryList[i].accname.replace(/percent_text/gi,"%").replace(/and_text/gi,"&").replace(/dblqt/gi,"\"").replace(/gtgt/gi,"\<").replace(/ltlt/gi,"\>"),
						"summary" : result.list.summaryList[i].summary.replace(/percent_text/gi,"%").replace(/and_text/gi,"&").replace(/dblqt/gi,"\"").replace(/gtgt/gi,"\<").replace(/ltlt/gi,"\>")
					};
				};
				newData.push(newDataItem);
			};
			
			summaryGridSet(newData, appno, companyseq);
		});
	};
		
	function summaryGridSet(newData, appno, companyseq){
		
		AUIGrid.destroy("#grid_wrap2"+appno);
		myGridID2 = null;
		$("#grid_wrap2"+appno).height(newData.length == 0 ? 120 : newData.length * 27 + 30);
		
		myGridID2 = AUIGrid.create("#grid_wrap2"+appno, columnLayout2, auiGridProps2);														
		
		AUIGrid.setGridData(myGridID2, newData);

		var sortingInfo = [];
		sortingInfo[0] = {'dataField' : 'sType', 'sortType' : -1 }; // 오름차순 1
		sortingInfo[1] = {'dataField' : 'cramt', 'sortType' : -1 };
		AUIGrid.setSorting(myGridID2, sortingInfo);
		
		// 버튼 툴팁 적용
		$('[data-toggle="tooltip"]').tooltip(); 

		var curr = $("#comlist").find("div").eq(appno).attr("name").replace("div","");
		
		AUIGrid.bind(myGridID2, "cellDoubleClick", function(event) {
			if(event.dataField == "sDate"){
				// 추가된 행 아이템인지 조사하여 추가된 행인 경우만 에디팅 진입 허용
				if(AUIGrid.isAddedById(event.pid, event.item.rowNum)) {
		 			AUIGrid.setGroupBy("#grid_wrap2"+appno, [] );
		 			return false; // 원래 입력값 리턴		
				};
			};
			
			if(event.dataField == "sDate" || event.dataField == "sType") {
				
				// 추가된 행 아이템인지 조사하여 추가된 행인 경우만 에디팅 진입 허용
				if(AUIGrid.isAddedById(event.pid, event.item.rowNum)) {
		 			return false; // 원래 입력값 리턴		
				};
				
				var data = "sdate=" + event.item.sDate;
				data += "&companyseq=" + event.item.companyseq;
				data += "&curr=" + event.item.currCd;
				var url = "<c:url value='/ifrs/capital/IfrsWeekReport5' />";
				fn_ajaxAsync(url, data, function( result ){
					
					var newlist = [];
					
					for ( var i=0 in result.list ) {
						if ( result.list[i].sType == "출금" ) {
							result.list[i].cramt = result.list[i].cramt * -1;
							newlist.push(result.list[i]);
						} else {
							result.list[i].cramt = result.list[i].cramt;
							newlist.push(result.list[i]);
						}
					};
					
					var w = Number($("#modal_div1").css("width").replace("px","")) - 30;
					
					AUIGrid.destroy("#grid_wrap4");
					myGridID4 = null;
					myGridID4 = AUIGrid.create("#grid_wrap4", columnLayout3, auiGridProps3);
					AUIGrid.setGridData(myGridID4, newlist);			
					AUIGrid.resize(myGridID4, w, '700');
					var colSizeList = AUIGrid.getFitColumnSizeList(myGridID4, true);
					AUIGrid.setColumnSizeList(myGridID4, colSizeList);										
					
					$("#setting1").modal({ show: true });
					
				});									
				
			};
					
			$('.modal-dialog').unbind("resize");
			$('.modal-dialog').resize(function(){									
				AUIGrid.resize(myGridID4);
				var colSizeList = AUIGrid.getFitColumnSizeList(myGridID4, true);
				AUIGrid.setColumnSizeList(myGridID4, colSizeList);																
			});										
		});
		
		AUIGrid.bind(myGridID2, "cellEditCancel", function(event) {
			if(event.dataField == "sDate") {
				AUIGrid.setGroupBy("#grid_wrap2"+appno, ["sDate"] );
			};
		});
		
		AUIGrid.bind(myGridID2, "cellEditEnd", function(event) {
			if(event.dataField == "sDate") {
				var dataField = event.dataField;
				var value = event.value;
				var item = {};
				item[dataField] = value.replace(/[/]/gi, "");
				AUIGrid.updateRow("#grid_wrap2"+appno, item, event.rowIndex);
				AUIGrid.setGroupBy("#grid_wrap2"+appno, ["sDate"] );
			};
		});
		
		// 행추가
		$("#add_row"+appno).unbind("click");
		$("#add_row"+appno).click(function () {
		
			AUIGrid.setGroupBy("#grid_wrap2"+appno, [] );
		
			var item = new Object();
			var rowPos = "last";
			item.rowNum = "";
			item.docNo = 0;
			item.companyseq = $("#comlist").find("div").eq(appno).attr("id").replace("div","");
			item.comNmEn = $("#comlist").find("div").eq(appno).attr("ename");
			item.comOrder = $("#comlist").find("div").eq(appno).attr("order");
			item.sDate = "";
			item.sType = "";
			item.cramt = "";
			item.accname = "";
			item.remseqname1 = "";
			item.summary = "";
			
			AUIGrid.addRow("#grid_wrap2"+appno, item, rowPos);
			AUIGrid.setGroupBy("#grid_wrap2"+appno, ["sDate"] );
		});						
	
		// 행삭제
		$("#del_row"+appno).unbind("click");
		$("#del_row"+appno).click(function () {
			AUIGrid.setGroupBy("#grid_wrap2"+appno, [] );
			AUIGrid.removeCheckedRows("#grid_wrap2"+appno);
			AUIGrid.removeSoftRows("#grid_wrap2"+appno);
			AUIGrid.setGroupBy("#grid_wrap2"+appno, ["sDate"] );
		});
	};
	
	 $(document).ready(function(){
		// 일자 선택
		$("#sdate").datepicker({
			dateFormat:'yymmdd',
			changeMonth: true,
			changeYear: true
		});		

		// 일자 선택
		$("#edate").datepicker({
			dateFormat:'yymmdd',
			changeMonth: true,
			changeYear: true
		});		
			
		$("#comNo").change(function(){
			
			var comNo = $("#comNo").val();
			var comNoText = $("#comNo option:selected").text();
			var currText = $("#comNo option:selected").attr("curr");
			var cmsYnText = $("#comNo option:selected").attr("cms");
			var enameText = $("#comNo option:selected").attr("ename");
			var orderText = $("#comNo option:selected").attr("order");
			
			var dupCk = true;
			
			if($("#comlist").find("#div"+comNo).length == 0){
				$("#comlist").append("<div style='float:left;' id='div" + comNo + "' name='"+currText+"' cms='" + cmsYnText + "' order='" + orderText + "' ename='" + enameText + "'>&nbsp;&nbsp;&nbsp;<a href='#' onclick='removeCompany(" + comNo + ");'>" + 
				comNoText + "<span class='glyphicon glyphicon-remove' aria-hidden='true'></a></div>");
			}else{
				$("#comlist").find("div").each(function(){
					if(currText == $(this).attr("name") && "div"+comNo == $(this).attr("id")){
						dupCk = false;
					};
				});
				
				if(dupCk){
					$("#comlist").append("<div style='float:left;' id='div" + comNo + "' name='"+currText+"' cms='" + cmsYnText + "' order='" + orderText + "' ename='" + enameText + "'>&nbsp;&nbsp;&nbsp;<a href='#' onclick='removeCompany(" + comNo + ");'>" + 
					comNoText + "<span class='glyphicon glyphicon-remove' aria-hidden='true'></a></div>");
				};
			};
		});
		
		$("#sdate").change(function(){ 
			searchWeekData('D');
		});
		
		$("#edate").change(function(){ 
			searchWeekData('D');
		});

		$("#sMonth").change(function(){ 
			searchWeekData('W');
		});

		$("#sWeek").change(function(){ 
			searchWeekData('W');
		});
		
		var startDate = "${sDate}";
		var endDate = "${eDate}";
		var sYear = "${sYear}";
		var sMonth = "${sMonth}";
		var sWeek = "${sWeek}";
		
		$("#comNo").val($("#comNo").val()).change();
		
		if(startDate == '' || startDate == null){
			// 오늘 날짜
			var date = new Date();
			var year = date.getFullYear(); 
			var month = new String(date.getMonth()+1); 
			var day = new String(date.getDate()); 
			
			var toDate = new Date();
			toDate.setDate(toDate.getDate() + 5);
			
			var toYear = toDate.getFullYear();
			var toMonth = new String(toDate.getMonth() + 1);
			var toDay = new String(toDate.getDate());

			// 한자리수일 경우 0을 채워준다. 
			if(month.length == 1){ 
			  month = "0" + month; 
			};
			
			if(day.length == 1){ 
			  day = "0" + day; 
			};
			
			if(toMonth.length == 1){ 
				toMonth = "0" + toMonth; 
			};
			
			if(toDay.length == 1){
				toDay = "0" + toDay;
			};
			
			$("#sYear").val(year);
			$("#sMonth").val(month);
			$("#sdate").val(year + "" + month + "" + day); // 오늘 날짜 선택
			$("#edate").val(toYear + "" + toMonth + "" + toDay);
		}else{
			$("#sYear").val(sYear);
			$("#sMonth").val(sMonth);
			$("#sWeek").val(sWeek);
			$("#sdate").val(startDate); // 오늘 날짜 선택
			$("#edate").val(endDate); // 오늘 날짜 선택
		}
		
		$("#sdate").change();
		
		$("#comNo").select2();
		$("#currCd").select2();
		$("#sMonth").select2();
		$("#sWeek").select2();
		
		// 모달 리사이즈
		$('.modal-dialog').resizable({
			handles: 'e, w'
		});

		// 모달 드레그
		$('.modal-dialog').draggable({
			handle: ".modal-header",
			containment : "document"
		});			
		
		// 조회
		$("#btnSelect").unbind("click");
		$("#btnSelect").click(function(){
			if ( $("#comlist").find("div").length > 0 ) {
				searchFlag = true;
				append();
			} else {
				msg("법인을 선택하세요.");
			}
		});
		
		// 초기화
		$("#btnReset").unbind("click");
		$("#btnReset").click(function(){
			if(!searchFlag){
				alert("조회 후 초기화 하세요.");
				return;
			};
			
			for ( var appno = 0 ; appno < $("#comlist").find("div").length ; appno++  ) {
				delete_row(appno);
				searchFlag = false;
			}			
			
			$("#printdiv").empty();
			msg("초기화 되었습니다.");						
		});			
		
		// 저장
		$("#btnSave").unbind("click");
		$("#btnSave").click(function(){
			if(!searchFlag){
				alert("조회 후 저장 하세요.");
				return;
			};
			$("#confirmmodal").modal({ show: true });
		});		
		
		$("#save_row1").unbind("click");
		$("#save_row1").click(function(){
			for ( var appno = 0 ; appno < $("#comlist").find("div").length; appno++  ) {
				var insertFlag = save_row(appno);
				
				if(!insertFlag){
					return false;
				};
			};
			
 			if(insertFlag){
	 			$("#confirmmodal").modal('toggle');
				msg("자금일보 적용 완료되었습니다.");
			}
		});
	});
	
	function searchWeekData(flag){
		
		searchFlag = false;
		
		// 날짜 변경 시 주차 선택
		$("#sdate2").val($("#sdate").val() + "~" + $("#edate").val());
		
		$("#sYear").val($("#sdate").val().substr(0,4));
		
		var sYear = $("#sYear").val();
		var weekly = $("#sdate2").val();

		var data = "weekly=" + weekly;
		data += "&sYear=" + sYear;
		data += "&sMonth=" + $("#sMonth").val();
		data += "&week=" + $("#sWeek").val();
		data += "&flag=" + flag;
		
		var url = "<c:url value='/ifrs/capital/IfrsWeekReport9' />";
		
		fn_ajaxAsync(url, data, function( result ){	
			if ( result.list.length > 0 ) {
				$("#comlist").empty();

				var comlist = result.list[0].companylist.split(",");
				for (var i = 0; i < comlist.length - 1; i++) {
					$("#comNo").val(comlist[i]).change();
				};

				/* if(flag == "D"){
					$("#sYear").val(result.list[0].sYear);
					$("#sMonth").val(result.list[0].sMonth);
					$("#sWeek").val(result.list[0].week);

					$("#sMonth").select2();
					$("#sWeek").select2();					
				}else{
					$("#sdate").val(result.list[0].weekly.split("~")[0]);
					$("#edate").val(result.list[0].weekly.split("~")[1]);
					
					$("#sdate2").val($("#sdate").val() + "~" + $("#edate").val());
				}; */
			};
		});
	};
	
	function delete_row(appno){
		AUIGrid.setGroupBy("#grid_wrap2"+appno, [] );
		
		AUIGrid.setAllCheckedRows("#grid_wrap2"+appno, true);
		AUIGrid.removeCheckedRows("#grid_wrap2"+appno);

		var removeItems = AUIGrid.getRemovedItems("#grid_wrap2"+appno);
		
		var data = {};	
		data.removeData = removeItems;
		
		data.sYear = $("#sYear").val();
		data.sMonth = $("#sMonth").val();
		data.week = $("#sWeek").val();
		
		var url = "<c:url value='/ifrs/capital/deleteCapitalHistory' />";
		
		$.ajax({
			async : false,
		    url : url,
		    dataType : "json",
		    type : "POST",
		    contentType: "application/json; charset=utf-8",
		    data : JSON.stringify(data),
		    success: function(r) {
		    	if(r.success == "N"){
		    		alert("처리 중 오류가 발생하였습니다.\n\n스마일큐로 문의해 주세요");
		    	}
		    },
		    error:function(request, status, error){
		    	alert("처리 중 오류가 발생하였습니다.\n\n스마일큐로 문의해 주세요");
		    }
		});
		
		AUIGrid.setGroupBy("#grid_wrap2"+appno, ["sDate"] );
	}
	
	function save_row(appno) {
	
		var insertFlag = true;
		
		AUIGrid.setAllCheckedRows("#grid_wrap2"+appno, true);
		//var checkedItems = AUIGrid.getCheckedRowItems("#grid_wrap2"+appno);
		var checkedItems = AUIGrid.getGridData("#grid_wrap2"+appno);
		var removeItems = AUIGrid.getRemovedItems("#grid_wrap2"+appno);
		
		
		
		var arry = [];
		
		//20210201 김승희 긴급반영의 건
		for(var i=0 in checkedItems) {
			if(checkedItems[i].sType == undefined || checkedItems[i].sType == ''){
	        	alert("구분을 선택하세요."); 
	        	insertFlag = false;
	        	return false;
	        };
	        
	        if(checkedItems[i].cramt == undefined){
	        	alert("금액을 입력하세요."); 
	        	insertFlag = false;
	        	return false;
	        };
	        
	        arry.push(checkedItems[i]);
		}
		
		/*  $.each(checkedItems, function(n,v) {
	        if(v.item.sType == undefined || v.item.sType == ''){
	        	alert("구분을 선택하세요."); 
	        	insertFlag = false;
	        	return false;
	        };
	        
	        if(v.item.cramt == undefined){
	        	alert("금액을 입력하세요."); 
	        	insertFlag = false;
	        	return false;
	        };
	        arry.push(v.item);
		}); */
		
		if(!insertFlag){
			$("#confirmmodal").modal('toggle');
			return insertFlag;
		};
		
		var data = {};	
		data.insertData = arry;
		data.removeData = removeItems;
		
		data.companyseq = $("#comlist").find("div").eq(appno).attr("id").replace("div","");
		data.comment = $('#textmemo'+appno).val();
		data.datevalue = $("#sdate2").val();
		
		var url = "<c:url value='/ifrs/capital/insertCapitalHistory' />";
		
		$.ajax({
			async : false,
		    url : url,
		    dataType : "json",
		    type : "POST",
		    contentType: "application/json; charset=utf-8",
		    data : JSON.stringify(data),
		    success: function(r) {
		    	if(r.success == "N"){
		    		alert("처리 중 오류가 발생하였습니다.\n\n스마일큐로 문의해 주세요");
		    	}
		    },
		    error:function(request, status, error){
		    	alert("처리 중 오류가 발생하였습니다.\n\n스마일큐로 문의해 주세요");
		    }
		});
		
		return insertFlag;
	};
	
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
				},800);
			}
		});
	};
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
	}
</script>
</head>
<body>
	<input type="hidden" id="holyday">
	<input type="hidden" id="newday">
	<input type="hidden" id="sYear">
	
	<!-- 메세지 Modal -->
	<div id="msgModal" title="SmileGate Capital" style="display: none;"><br><br>
		<div class="confirmModalContentText" id="confirmModalContentText">저장 되었습니다.</div>
	</div><!-- 메세지 Modal -->
	
	<!-- 저장 Modal -->
	<div class="modal fade" id="confirmmodal" role="dialog">
		<div class="modal-dialog modal-sm">
			<div class="modal-content">
				<div class="modal-header">
					<button type="button" class="close" data-dismiss="modal">&times;</button>
					<div class="modal-title">&nbsp;</div>
				</div>
				<div class="modal-body">
					<p align="center">
						<div id="confirmModalContent" class="confirmModalContent">자금일보 전송 하시겠습니까?</div>
					</p>
				</div>
				<div class="modal-footer">
					<button type="button" class="btn btn-primary btn-sm" id="save_row1">저장</button>
					<button type="button" class="btn btn-default btn-sm" data-dismiss="modal">취소</button>
				</div>
			</div>
		</div>
	</div><!-- 저장 Modal -->	
	
	<!-- 상세리스트 Modal -->
	<div id="setting1" class="modal fade">
		<div class="modal-dialog modal-lg" id="modal_div1">
			<div class="modal-content">
				<div class="modal-header">
					<div class="btn-group">
						<button type="button" class="btn btn-default btn-sm" data-dismiss="modal">닫기</button>
					</div>
    			</div>
   				<div class="modal-body">
            		<div id="grid_wrap4" style="width:100%;height:700px;color:black;"></div>   
		  		</div>
			</div>
		</div>
	</div>

	<!-- 상세리스트 Modal -->
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
	                   		<input type="text" class="form-control input-sm" id="sdate" name="sdate" style="width:120px;" placeholder="시작일자를 선택하세요."> 
                   		</div>
						
						<div style="float:left;">
                   			<input type="text" class="form-control input-sm" readonly="" style="width:35px;font-size:16px;font-weight:bolder;" value="~">
                   		</div>
                   		
						<div style="float:left;">
	                   		<input type="text" class="form-control input-sm" id="edate" name="edate" style="width:120px;" placeholder="종료일자를 선택하세요.">
                   		</div>
                   		
                   		<div>
	                   		&nbsp;&nbsp;
	                   		<button class="btn btn-default btn-sm" type="button" id="btnSelect"><spring:message code='capital.search'/></button>
	                   		<c:if test="${registAuth eq 'Y' }" >
	                   			<button class="btn btn-success btn-sm" type="button" id="btnSave"><spring:message code='capital.save'/></button>
	                   		</c:if>
	                   		<button class="btn btn-danger btn-sm" type="button" id="btnReset"><spring:message code='capital.init'/></button>
                   		</div>
					</div>
					
					<div class="panel-body">
						<div style="float:left;width:10px;">
						&nbsp;&nbsp;
						</div>
						
                   		<div style="float:left;">
	                   		<input type="hidden" class="form-control input-sm" readonly style="width:35px;font-size:16px;font-weight:bolder;" value="=">
                   		</div>
	                   		
                   		<div style="float:left;">
	                   		<input type="hidden" class="form-control input-sm" id="sdate2" name="sdate2" readonly>
                   		</div>
	                   		
                   		<select name="sMonth" id="sMonth" style="width:120px;">
	                   		<c:forEach var="month" begin="1" end="12">
	                   			<option value="${month }">${month }</option>
	                   		</c:forEach>
                   		</select>
                   		&nbsp;<span style="text-align:center;font-size:15px;"><spring:message code='capital.month'/></span>

                   		<select name="sWeek" id="sWeek" style="width:120px;">
	                   		<c:forEach var="week" begin="1" end="6">
	                   			<option value="${week }">${week }</option>
	                   		</c:forEach>
                   		</select>
                   		&nbsp;<span style="text-align:center;font-size:15px;"><spring:message code='capital.week'/></span>
					</div>
					
					<div class="panel-body">
						<div style="float:left;width:10px;">
						&nbsp;&nbsp;
						</div>
						
						<div style="float:left;">
	                   		<select name="comNo" id="comNo" style="width:200px;">
		                   		<c:forEach var="list" items="${companyList}">
		                   			<c:choose>
		                   				<c:when test="${locale eq 'ko'}">
		                   					<option value="${list.comNo }" curr="${list.currCd}" cms="${list.cmsYn }" order="${list.comOrder }" ename="${list.comNmEn }">${list.comNm}</option>
	                   					</c:when>
		                   				<c:otherwise>
		                   					<option value="${list.comNo }" curr="${list.currCd}" cms="${list.cmsYn }" order="${list.comOrder }" ename="${list.comNmEn }">${list.comNmEn}</option>
	                   					</c:otherwise>
		                   			</c:choose>
		                   		</c:forEach>
	                   		</select>
                   		</div>						
					</div>
				</div> 
				
				<div class="panel panel-default" style="width:1650px;margin-bottom:10px;">
					<div class="panel-body" id="comlist" style="background-color:#f2f2f2;">
					<!-- 법인 선택 시 리스트 추가 -->
					</div>
				</div>

				<div style="width:700px;background-color:white;" id="printdiv"></div>
			</div>            
        </div>
		<jsp:include page="/WEB-INF/jsp/config/footer.jsp"/>
	</div>
</body>
</html>
<jsp:include page="/WEB-INF/jsp/config/footer_naviTime_capital.jsp"/>