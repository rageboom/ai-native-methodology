<%@ page contentType="text/html" pageEncoding="UTF-8" %>
<%@ page import="java.net.InetAddress" %>
<%@ taglib prefix="spring" uri="http://www.springframework.org/tags" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>

<%@	include	file="/WEB-INF/jsp/config/include.jsp" %>

<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">
<head>

<meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
<meta http-equiv="X-UA-Compatible" content="IE=edge">
<title>IFRS</title>


<script type="text/javascript" src="${scriptPath}/ifrs/new/jquery.js"></script>
<script type="text/javascript" src="${scriptPath}/ifrs/new/jquery-ui.js"></script>
<script type="text/javascript" src="${scriptPath}/ifrs/calendar_month5.js"></script>
<script type="text/javascript" src="${scriptPath}/ifrs/jqCommonNew.js"></script>
<script type="text/javascript" src="${scriptPath}/ifrs/common.js"></script>


<script type="text/javascript" src="${scriptPath}/ifrs/new/bootstrap.min.js"></script>
<script type="text/javascript" src="${scriptPath}/ifrs/new/select2.min.js"></script>
<script type="text/javascript" src="${scriptPath}/ifrs/new/json2xml.js"></script>
<script type="text/javascript" src="${scriptPath}/ifrs/new/xml2json.js"></script>

<script type="text/javascript" src="${scriptPath}/ifrs/new/jquery.ui.datepicker-ko.js"></script>
<script type="text/javascript" src="${scriptPath}/ifrs/new/jquery.isloading.min.js"></script>

<script type="text/javascript" src="${scriptPath}/ifrs/new/moment.js"></script>
<script type="text/javascript" src="${scriptPath}/ifrs/new/daterangepicker.js"></script>

<!-- 브라우저 다운로딩 할 수 있는 JS 추가 -->
<script type="text/javascript" src="${scriptPath}/ifrs/pdfkit/FileSaver.min.js"></script>

<!-- SheetJS js-xlsx, https://github.com/SheetJS/js-xlsx-->
<script type="text/javascript" src="${scriptPath}/ifrs/js-xlsx-master/shim.js"></script>
<script type="text/javascript" src="${scriptPath}/ifrs/js-xlsx-master/jszip.js"></script>
<script type="text/javascript" src="${scriptPath}/ifrs/js-xlsx-master/xlsx.js"></script>


<link rel="stylesheet" type="text/css" href="${cssPath}/ifrs/new/jquery-ui.css" />
<link rel="stylesheet" type="text/css" href="${cssPath}/ifrs/new/bootstrap.min.css" />
<link rel="stylesheet" type="text/css" href="${cssPath}/ifrs/new/bootstrap-theme.css" />
<link rel="stylesheet" type="text/css" href="${cssPath}/ifrs/new/select2.css" />
<link rel="stylesheet" type="text/css" href="${cssPath}/ifrs/new/daterangepicker.css" />

<link rel="stylesheet" type="text/css" href="${cssPath}/ifrs/new/font-awesome/css/font-awesome.min.css" />

<link rel="stylesheet" type="text/css" href="${cssPath}/ifrs/ifrs.css" />

<!-- AUIGrid 라이센스 파일입니다. 그리드 출력을 위해 꼭 삽입하십시오. -->
<link href="${auiGridPath}/3.0.9/AUIGrid_style.css" rel="stylesheet">
<script type="text/javascript" src="${auiGridPath}/3.0.9/AUIGrid.js"></script>
<script type="text/javascript" src="${auiGridPath}/3.0.9/AUIGridLicense.${domain}.js"></script>
<%-- <script type="text/javascript" src="${scriptPath}/ifrs/gridCommon.js?2"></script> --%>

<style type="text/css">
div#container { width:1900px; }
div#content { width:1500px; }
.money {text-align:right;}
.left-cell {text-align:left;}
#sdate {text-align:center;font-size:15px;background-color:#e6f0ff;}

#erp_cms {text-align:right;font-size:15px;background-color:#ffe6e6;}


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

label {
	font-weight:bold;
	font-size: 14px;
}

span.holding { 
	padding:0 8px 0 8px; 
	background-color:#fff4e3; 
/* 	border:1px solid #cccccc;  */
}

#content{
/*  	width: 1050px;  */
 	width: 1200px; 
}

.input-transparent {
	width: 150px;
	background-color:transparent; 
	border: none;
}

.input-calendar{
	float: left; 
	width: 90px; 
	height: 22px; 
	font-weight: bold; 
	text-align: center;
	margin: 0px 2px 0px 0px;
}

.ui-widget{font-size : 1em;}
.ui-widget-content{background: #fff;}
.ui-widget-header{background: #8C8C8C;border:none;}
.ui-state-default, .ui-widget-content .ui-state-default, .ui-widget-header .ui-state-default{ border: none; background: #fff;}
.ui-datepicker{ width: 15em;}
.ui-datepicker-week-end > a {color:#FF5E00 !important;}

.pupupTable { font-size:12px; text-decoration:none; border-collapse:collapse; background-color:#fff;}

.my-column-underline {
	text-align:right;
	text-decoration:underline;
}
.my-column-right {
	text-align:right;
}
.my-column-left {
	text-align:left;
}
.my-footer-style {
	color:red;
}
.my-column {
	text-align:right;
}

 .my-right {
	text-align:right!important;
 }
 .my-left {
	text-align:left!important;
 } 
	 

</style>

<script type="text/javascript">




function documentReady() {
	return false;
};

var myGridID12;

// 그리드 속성 설정
var auiGridProps = {
		editable : true, // 수정 모드
		selectionMode : "multipleCells", // 다중셀 선택
		showStateColumn : true,
		noDataMessage : "엑셀에서 데이터를 첨부 하십시오.",
		//softRemoveRowMode 적용을 원래 데이터에만 적용 즉, 새 행인 경우 적용 안시킴
		softRemovePolicy :"exceptNew",
		wrapSelectionMove : true // 칼럼 끝에서 오른쪽 이동 시 다음 행, 처음 칼럼으로 이동할지 여부
};


	var columnLayout1 = [{
	dataField : "문서구분",
	headerText : "문서구분"
	},{
		dataField : "문서이름",
		headerText : "문서이름",
		style : "my-left"
	},{
		dataField : "적용일자",
		headerText : "적용일자"
	},{
		dataField : "계정명",
		headerText : "계정명",
		style : "my-left"
	},{
		dataField : "관리항목값",
		headerText : "관리항목값"
	},{
		dataField : "거래처",
		headerText : "거래처",
		style : "my-left"
	},{
		dataField : "적요",
		headerText : "적요",
		style : "my-left"
	},{
		dataField : "금액",
		headerText : "금액",
		dataType : "numeric",
		editRenderer : {
		    type : "InputEditRenderer",
		    onlyNumeric : true
		},
		formatString : "#,##0.00",			
		style : "my-right"
	}
	];	
	
	var columnLayout2 = [{
		dataField : "항목구분",
		headerText : "<spring:message code='capital.categoryType'/>"
		},{
			dataField : "항목이름",
			headerText : "<spring:message code='capital.categoryName'/>",
			style : "my-left"
		},{
			dataField : "적용일자",
			headerText : "<spring:message code='capital.appliedDate'/>"
		},{
			dataField : "내용",
			headerText : "<spring:message code='capital.desc'/>",
			style : "my-left"
		},{
			dataField : "기초",
			headerText : "<spring:message code='capital.beginning'/>",
			dataType : "numeric",
			editRenderer : {
			    type : "InputEditRenderer",
			    onlyNumeric : true
			},
			formatString : "#,##0",			
			style : "my-right"
		},{
			dataField : "입금_증가",
			headerText : "<spring:message code='capital.receiptsInc'/>",
			dataType : "numeric",
			editRenderer : {
			    type : "InputEditRenderer",
			    onlyNumeric : true
			},
			formatString : "#,##0",			
			style : "my-right"
		},{
			dataField : "출금_감소",
			headerText : "<spring:message code='capital.paymentsDec'/>",
			dataType : "numeric",
			editRenderer : {
			    type : "InputEditRenderer",
			    onlyNumeric : true
			},
			formatString : "#,##0",			
			style : "my-right"
		},{
			dataField : "마감",
			headerText : "<spring:message code='capital.closing'/>",
			dataType : "numeric",
			editRenderer : {
			    type : "InputEditRenderer",
			    onlyNumeric : true
			},
			formatString : "#,##0",			
			style : "my-right"
		}
		];		

	function xlsInput() {
	
	$("#filediv").empty();
	$("#filediv").append("<input type='file' class='form-control input-sm' style='height: 30px; vertical-align: middle;' id='fileSelector' name='files' accept='.xlsx'>");
	
	// IE10, 11은 readAsBinaryString 지원을 안함. 따라서 체크함.
	var rABS = typeof FileReader !== "undefined" && typeof FileReader.prototype !== "undefined" && typeof FileReader.prototype.readAsBinaryString !== "undefined";

	// HTML5 브라우저인지 체크 즉, FileReader 를 사용할 수 있는지 여부
	function checkHTML5Brower() {
		var isCompatible = false;
		if (window.File && window.FileReader && window.FileList && window.Blob) {
			isCompatible = true;
		}
		return isCompatible;
	};
	
	// 파일 선택하기
	$('#fileSelector').on('change', function(evt) {
		if (!checkHTML5Brower()) {
		    alert("브라우저가 HTML5 를 지원하지 않습니다.");
			return;
		} else {
		    var data = null;
		    var file = evt.target.files[0];
		    if (typeof file == "undefined") {
				alert("파일 선택 시 오류 발생!!");
		        return;
		    }
		    var reader = new FileReader();

			reader.onload = function(e) {
				var data = e.target.result;

				/* 엑셀 바이너리 읽기 */
				
				var workbook;

				if(rABS) { // 일반적인 바이너리 지원하는 경우
					workbook = XLSX.read(data, {type: 'binary'});
				} else { // IE 10, 11인 경우
					var arr = fixdata(data);
					workbook = XLSX.read(btoa(arr), {type: 'base64'});
				}

				var jsonObj = process_wb(workbook);

				//console.log(JSON.stringify(jsonObj.Sheet1, 2, 2));
				
				createAUIGrid( jsonObj[Object.keys(jsonObj)[0]] );
			};

			if(rABS) reader.readAsBinaryString(file);
			else reader.readAsArrayBuffer(file);
			
		}
	});
	
	}	
	


// document ready 
$(document).ready(function() {
	
	var SESSION = "${SESSION}"; // 소속 법인 번호
	$("#comNo").val(SESSION);	
	
	// 법인선택 Select2
	$("#comNo").select2();


	
	// 최초 그리드 생성함.
	createInitGrid();
	
	xlsInput(); // 엑셀 입력 함수
	
	
	$("#capitaldeleteBtn").click(function() { // 삭제
	
		$.isLoading({ tpl: "<span class='isloading-wrapper %wrapper%'>Loading&nbsp;&nbsp;<i class='fa fa-refresh fa-spin'></i></span>" }); 
		
		var deletedate = $("#deletedate").val();
						
		if ( deletedate == null || deletedate == "" ) {
			alert("기간을 입력하세요.");	
			return false;
		}
		
		var deletedate_arr = deletedate.split("~");
		
		var data = "sdate=" + deletedate_arr[0].replace(/-/gi,"");
		data += "&edate=" + deletedate_arr[1].replace(/-/gi,"");
		data += "&CompanySeq=" +$("#comNo").val();
		data += "&docType=" +$("#docType").val();
		
		//console.log(data);
		
		var url = "<c:url value='/ifrs/capital/IfrsCapitalDelete' />";
 		fn_ajax(url, data, function( result ){
			$("#capitaldelete").modal('toggle');
			setTimeout( function(){$.isLoading( "hide" );}, 10 );
			msg("삭제 되었습니다.");			
		});	
	});
	
	$("#save_row1").click(function() { // 저장

		var comNo = $("#comNo").val();		
		var data = "CompanySeq=" + comNo;
		var checkedItems = AUIGrid.getGridData(myGridID12);
		
		$("#fileSelector").attr("disabled",true);
		$("#C12_btnSave").attr("disabled",true);
		
		$.isLoading({ tpl: "<span class='isloading-wrapper %wrapper%'>Loading&nbsp;&nbsp;<i class='fa fa-refresh fa-spin'></i></span>" }); 
				
		// 입출금내역
		if ( $("#docType").val() == "A" ) {
			
 			var xml = "<ROOT>";

			for(var i=0 in checkedItems) {
				xml += "<DATAROW ";
				xml += " sType=\"" + checkedItems[i].문서구분 + "\"";
				xml += " companyseq=\"" + comNo + "\"";
				xml += " sDate=\"" + checkedItems[i].적용일자 + "\"";
				xml += " accno=\"" + $("#Cur").val() + "\"";
				
				
				if ( checkedItems[i].계정명 ) {				
					xml += " accname=\"" + checkedItems[i].계정명.replace(/%/gi,"percent_text").replace(/&/gi,"and_text").replace(/\"/gi,"dblqt").replace(/\</gi,"gtgt").replace(/\>/gi,"ltlt") + "\"";
				} else {
					xml += " accname=\"\"";	
				}					
				
				if ( checkedItems[i].관리항목값 ) {
					xml += " remname1=\"" +  checkedItems[i].관리항목값.replace(/%/gi,"percent_text").replace(/&/gi,"and_text").replace(/\"/gi,"dblqt").replace(/\</gi,"gtgt").replace(/\>/gi,"ltlt") + "\"";
				} else {
					xml += " remname1=\"\"";	
				}
				
				if ( checkedItems[i].거래처 ) {
					xml += " remseqname1=\"" + checkedItems[i].거래처.replace(/%/gi,"percent_text").replace(/&/gi,"and_text").replace(/\"/gi,"dblqt").replace(/\</gi,"gtgt").replace(/\>/gi,"ltlt") + "\"";
				} else {
					xml += " remseqname1=\"\"";	
				}
				if ( checkedItems[i].적요 ) {
					xml += " summary=\"" + checkedItems[i].적요.replace(/%/gi,"percent_text").replace(/&/gi,"and_text").replace(/\"/gi,"dblqt").replace(/\</gi,"gtgt").replace(/\>/gi,"ltlt") + "\"";
				} else {
					xml += " summary=\"\"";	
				}
				
				var domamt = 0;								
				if ( typeof(checkedItems[i].금액) == "string" ) {															
					domamt = Number(checkedItems[i].금액.replace(/,/gi,""));										
				} else {
					domamt = checkedItems[i].금액;
				}					
				
				xml += " cramt=\"" + domamt + "\"";
				xml += "></DATAROW>";
			}
			
			xml += "</ROOT>";
			
			data += "&sType=1";
			data += "&sDate=19000101";
			data += "&xml=" + xml;		
			data += "&SaveType=R";
			
	 		var url = "<c:url value='/ifrs/capital/IfrsERPINListSave' />";
			fn_ajax(url, data, function( result ){			
				$("#confirmmodal").modal('toggle');
				setTimeout( function(){$.isLoading( "hide" );}, 10 );
				msg("적용 되었습니다.");			
			});	 			
			
		} else {
			
			// 금융자산내역
 			var xml = "<ROOT>";

			for(var i=0 in checkedItems) {
				xml += "<DATAROW ";
				xml += " stype=\"" + checkedItems[i].항목구분 + "\"";
				xml += " companyseq=\"" + comNo + "\"";
				xml += " sdate=\"" + checkedItems[i].적용일자 + "\"";

				var forwarddramt = 0;
				var dramt = 0;
				var cramt = 0;
				var remainamt = 0;
				
				if ( typeof(checkedItems[i].기초) == "string" ) {
					forwarddramt = Number(checkedItems[i].기초.replace(/,/gi,""));										
				} else {
					forwarddramt = checkedItems[i].기초;
				}	
				
				if ( typeof(checkedItems[i].입금_증가) == "string" ) {															
					dramt = Number(checkedItems[i].입금_증가.replace(/,/gi,""));										
				} else {
					dramt = checkedItems[i].입금_증가;
				}
				
				if ( typeof(checkedItems[i].출금_감소) == "string" ) {															
					cramt = Number(checkedItems[i].출금_감소.replace(/,/gi,""));										
				} else {
					cramt = checkedItems[i].출금_감소;
				}
				
				if ( typeof(checkedItems[i].마감) == "string" ) {															
					remainamt = Number(checkedItems[i].마감.replace(/,/gi,""));										
				} else {
					remainamt = checkedItems[i].마감;
				}				
				
					xml += " sdata1=\"" + checkedItems[i].내용.replace(/%/gi,"percent_text").replace(/&/gi,"and_text").replace(/\"/gi,"dblqt").replace(/\</gi,"gtgt").replace(/\>/gi,"ltlt") + "\"";
					xml += " sdata2=\"" + $("#Cur").val() + "\"";
					xml += " sdata3=\"\"";
					xml += " sdata4=\"\"";
					xml += " sdata5=\"\"";
					xml += " sum1=\"" + forwarddramt + "\"";
					xml += " sum2=\"" + dramt + "\"";
					xml += " sum3=\"" + cramt + "\"";
					xml += " sum4=\"" + remainamt + "\"";
					xml += " sum5=\"0\"";
					xml += " sum6=\"0\"";
					xml += " sum7=\"0\"";
					xml += " sum8=\"0\"";
					xml += " sum9=\"0\"";
						

				xml += "></DATAROW>";
			}
			
			xml += "</ROOT>";
			
			xml = xml.replace(/undefined/gi,"0");
			
			
			data += "&sType=1";
			data += "&sDate=19000101";
			data += "&xml=" + xml;
			data += "&SaveType=R";
			
			var url = "<c:url value='/ifrs/capital/IfrsAssetINSetSave' />";
			fn_ajax(url, data, function( result ){
				$("#confirmmodal").modal('toggle');
				setTimeout( function(){$.isLoading( "hide" );}, 10 );
				msg("적용 되었습니다.");			
			});	 			
			
		}
		
		
		
	});
	
	// 출금내역 자금일보 전달
	$("#C12_btnSave").unbind("click");
	$("#C12_btnSave").click(function(){
		$("#confirmmodal").modal({ show: true });
	});		

	
	$("#C12_btnReset").click(function(){

		AUIGrid.setGridData(myGridID12, []);
		C12_changeCheck();
		msg("초기화 되었습니다.");
		
	});
	

	
	$("#docType").attr("disabled",true);
	$("#fileSelector").attr("disabled",true);
	$("#C12_btnReset").attr("disabled",true);
	$("#C12_btnSave").attr("disabled",true);

	$("#Cur").change(function(){
		
		AUIGrid.setGridData(myGridID12, []);
		C12_changeCheck();		
		
		if ( $(this).val() != "" ) {
			$("#docType").attr("disabled",false);
			$("#fileSelector").attr("disabled",false);
		} else {			
			$("#docType").attr("disabled",true);
			$("#fileSelector").attr("disabled",true);
		}		
	});
	
	
	$("#docType").change(function(){
		
		AUIGrid.setGridData(myGridID12, []);
		C12_changeCheck();
		
		if ( $(this).val() != "" ) {
			$("#fileSelector").attr("disabled",false);
			$("#C12_btnReset").attr("disabled",false);
			$("#C12_btnSave").attr("disabled",false);
			
			
			if ( $(this).val() == "A" ) {
				AUIGrid.destroy("#C12_grid_wrap");
				myGridID12 = null;
				myGridID12 = AUIGrid.create("#C12_grid_wrap", columnLayout1, auiGridProps);
				AUIGrid.setGridData(myGridID12, []);				
			} else {
				AUIGrid.destroy("#C12_grid_wrap");
				myGridID12 = null;
				myGridID12 = AUIGrid.create("#C12_grid_wrap", columnLayout2, auiGridProps);
				AUIGrid.setGridData(myGridID12, []);				
			}
			
			
		} else {			
			$("#fileSelector").attr("disabled",true);
			$("#C12_btnReset").attr("disabled",true);
			$("#C12_btnSave").attr("disabled",true);			
		}
		
	});
	
	
	// 엑셀 양식 다운로드 Click Event
	$("#C12_btnDownload").click(function(){
		fnSampleDownload("capitalupload.zip", "capitalupload.zip");
	});	
	
	
	
	// 자금일보 삭제 버튼
	$('#C12_btnDelete').unbind("click");
	$('#C12_btnDelete').click(function () {
		
		$('body').on('hidden.bs.modal', '.modal', function () {$(this).removeData('bs.modal');});			
		 
		$("#capitaldelete").modal({ show: true });
		
	});			
	
	
	$("#deletedate").daterangepicker({
  	    "showDropdowns": true,
		"singleDatePicker": false,
  	    "autoApply": false,
  	    "autoUpdateInput": false,
  	    "locale": {
  	    	"cancelLabel": 'Clear',
      		"format": "YYYY-MM-DD",
      		"separator": "~",
      		"applyLabel": "Confirm",
      		"cancelLabel": "Cancle",
      		"fromLabel": "Start",
      		"toLabel": "End",
      		"customRangeLabel": "Custom",
      		"daysOfWeek": ["일","월","화","수","목","금","토"],
      		"monthNames": ["01","02","03","04","05","06","07","08","09","10","11","12"],
      		"firstDay": 1            
  			}
  		});
	$('#deletedate').on('apply.daterangepicker', function(ev, picker) {
		$(this).val(picker.startDate.format('YYYY-MM-DD') + '~' + picker.endDate.format('YYYY-MM-DD'));
	});
	$('#deletedate').on('cancel.daterangepicker', function(ev, picker) {
		$(this).val('');
	});		
	
	
	// 모달 리사이즈
	$('.modal-dialog').resizable({
		handles: 'e, w'
	});

	// 모달 드레그
	$('.modal-dialog').draggable({
		handle: ".modal-header",
		containment : "document"
	});	
	/* $("#comNo").val('2').change(); */
});




// IE10, 11는 바이너리스트링 못읽기 때문에 ArrayBuffer 처리 하기 위함.
function fixdata(data) {
	var o = "", l = 0, w = 10240;
	for(; l<data.byteLength/w; ++l) o+=String.fromCharCode.apply(null,new Uint8Array(data.slice(l*w,l*w+w)));
	o+=String.fromCharCode.apply(null, new Uint8Array(data.slice(l*w)));
	return o;
};

// 파싱된 시트의 CDATA 제거 후 반환.
function process_wb(wb) {
	var output = "";
	output = JSON.stringify(to_json(wb));
	output = output.replace( /<!\[CDATA\[(.*?)\]\]>/g, '$1' );
	return JSON.parse(output);
};

// 엑셀 시트를 파싱하여 반환
function to_json(workbook) {
	var result = {};
	workbook.SheetNames.forEach(function(sheetName) {
		var roa = XLSX.utils.sheet_to_row_object_array(workbook.Sheets[sheetName]);
		if(roa.length > 0){
			result[sheetName] = roa;
		}
	});
	return result;
}

// 엑셀 파일 시트에서 파싱한 JSON 데이터 기반으로 그리드 동적 생성
function createAUIGrid(jsonData) {
	if(AUIGrid.isCreated(myGridID12)) {
		AUIGrid.destroy(myGridID12);
		myGridID12 = null;
	}
	
	// 현재 엑셀 파일의 0번째 행을 기준으로 컬럼을 작성함.
	// 만약 상단에 문서 제목과 같이 있는 경우
	// 조정 필요.
	var firstRow = jsonData[0];

	if(typeof firstRow == "undefined") {
		alert("AUIGrid 로 변환할 수 없는 엑셀 파일입니다.");
		return;
	}
	
/* 		var columnLayout = [];
	
	$.each(firstRow, function(n,v) {
		columnLayout.push({
			dataField : n,
			headerText : n,
			width : 100
		});
	}); */
			
	
	// 그리드 생성
	if ( $("#docType").val() == "A" ) {
		myGridID12 = AUIGrid.create("#C12_grid_wrap", columnLayout1, auiGridProps);
	} else {
		myGridID12 = AUIGrid.create("#C12_grid_wrap", columnLayout2, auiGridProps);	
	}
	

	//console.log(jsonData);
	
	// 그리드에 데이터 삽입
	AUIGrid.setGridData(myGridID12, jsonData);

};


//최초 그리드 생성..
function createInitGrid() {
	myGridID12 = AUIGrid.create("#C12_grid_wrap", columnLayout2, auiGridProps);
	AUIGrid.setGridData(myGridID12, []);
}	


function C12_changeCheck() {
	AUIGrid.setGridData(myGridID12, []);
	
	$("#filediv").empty();
	$("#filediv").append("<input type='file' class='form-control input-sm' id='fileSelector' name='files' accept='.xlsx'>");		
	xlsInput();
	
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


</script>
</head>


<body>

	<!-- 메세지 Modal -->
	<div id="msgModal" title="SmileGate" style="display: none;"><br><br>
	<div class="confirmModalContentText" id="confirmModalContentText">저장 되었습니다.</div>
	</div><!-- 메세지 Modal -->
	
	<!-- 저장 Modal -->
	<div class="modal fade" id="confirmmodal" role="dialog">
	<div class="modal-dialog modal-sm"><div class="modal-content">
	<div class="modal-header"><button type="button" class="close" data-dismiss="modal">&times;</button>
	<div class="modal-title">&nbsp;</div></div><div class="modal-body">
	<p align="center"><div id="confirmModalContent" class="confirmModalContent">저장 하시겠습니까?</div>
	</p></div><div class="modal-footer">
	<button type="button" class="btn btn-primary btn-sm" id="save_row1">저장</button>
	<button type="button" class="btn btn-default btn-sm" data-dismiss="modal">취소</button>
	</div></div></div></div><!-- 저장 Modal -->
	
	<!-- 환경설정 Modal2 -->
	<div id="capitaldelete" class="modal fade">
	<div class="modal-dialog">
	<div class="modal-content">
	<div class="modal-header">
	<div class="btn-group">
	<button type="button" class="btn btn-danger btn-sm" id="capitaldeleteBtn">삭제</button>
	<button type="button" class="btn btn-default btn-sm" data-dismiss="modal">닫기</button>
	</div>
    </div>
   	<div class="modal-body">
  		<input type=text class="form-control" id="deletedate" style="text-align:center;" readonly>
  	</div>
	</div>
	</div>
	</div>
	<!-- 환경설정 Modal2 -->

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
				<spring:message code='capital.sentence1'/><br> 
				<spring:message code='capital.sentence2'/>	  
			  </div>
			 </div> 			
			<div class="panel panel-default" style="width:1600px;margin-bottom:10px;">
			  <div class="panel-body">
                   		<div style="float:left; height: 30px">
                   		<select name="comNo" id="comNo"  class="form-control input-sm" style="width:200px;">
                   		<c:forEach var="list" items="${companyList}">
                   			<c:choose>
                   				<c:when test="${locale eq 'ko'}"><option value="${list.COM_NO }">${list.COM_NM}</option></c:when>
                   				<c:otherwise><option value="${list.COM_NO }">${list.COM_NM_EN}</option></c:otherwise>
                   			</c:choose>
                   		</c:forEach>
                   		</select>
                   		</div>
                   		<div style="float:left;">
                   		&nbsp;&nbsp;
                   		</div>
                   		<div style="float:left;">
                   		<select id="Cur" class="form-control input-sm">
                   			<option value=""><spring:message code='capital.currency'/></option>
                   			<option value="KRW">KRW</option>
                   			<option value="USD">USD</option>
                   			<option value="CAD">CAD</option>
                   			<option value="CNY">CNY</option>
                   			<option value="MYR">MYR</option>
                   			<option value="PHP">PHP</option>
                   			<option value="EUR">EUR</option>
                   		</select>
                   		</div>  
                   		<div style="float:left;">
                   		&nbsp;&nbsp;
                   		</div>                   		
                   		<div style="float:left;">
                   		<select id="docType" class="form-control input-sm" style="height: 30px">
                   			<option value=""><spring:message code='capital.docType'/></option>
                   			<option value="A"><spring:message code='capital.recpay'/></option>
                   			<option value="B"><spring:message code='capital.financialAssets'/></option>
                   		</select>
                   		</div>                    		                 		
                   		<div style="float:left;">
                   		&nbsp;&nbsp;
                   		</div>                   		
                   		<div class="desc" id="filediv" style="float:left;width:600px; height: 30px">   		
                   		<input type="file" class="form-control input-sm" style="height: 30px; vertical-align: middle;" id="fileSelector" name="files" accept=".xlsx" >
                   		</div>                   		
                   		<div style="float:left;">
	                   		&nbsp;&nbsp;
	                   		<button class="btn btn-primary btn-sm" type="button" id="C12_btnSave"><spring:message code='capital.save'/></button>
	                   		<button class="btn btn-danger btn-sm" type="button" id="C12_btnReset"><spring:message code='capital.init'/></button>
	                   		<button class="btn btn-default btn-sm" type="button" onclick="location.href='/images/capitalupload.zip'" ><spring:message code='capital.formatDown'/></button>
	                   		<button class="btn btn-default btn-sm" type="button" id="C12_btnDelete"><spring:message code='capital.deleteCashPosition'/></button>
                   		</div>			  		  
			  </div>
			</div> 			
			<div style="width:1650px;height:680px">
			<div class="panel panel-default" style="width:1600px;height:680px;color:black;">
			  <div class="panel-heading clearfix">
			  <div class="panel-title pull-left" style="font-size:12px;"><b><spring:message code='capital.capitalReportUpload'/></b></div>
			      <div class="btn-group pull-right">
			      </div>	
			  </div>
			  <div class="panel-body" style="width:100%;height:600px;color:black;">
			            <div id="C12_grid_wrap" style="width:100%;height:100%;color:black;">
			            </div>  
			  </div>
			</div>			
            </div>          
        </div>
	<jsp:include page="/WEB-INF/jsp/config/footer.jsp"/>
</div>
</body>
</html>
<jsp:include page="/WEB-INF/jsp/config/footer_naviTime_capital.jsp"/>
