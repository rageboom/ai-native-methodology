<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8" %>
<%@ include file="/WEB-INF/jsp/config/include.jsp" %>
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">
<head>
<meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
<meta http-equiv="X-UA-Compatible" content="IE=edge" />
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
<%-- <script type="text/javascript" src="${scriptPath}/ifrs/gridCommon.js?2"></script> --%>

<style type="text/css">
div#container { width:1900px; }
div#content { width:1500px; }
.money {text-align:right;}
.left-cell {text-align:left;}
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

.border-top-style {
	border-top-color:#dddddd;
	border-top-style:solid;
	border-top-width:1px;
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

</style>

<script type="text/javascript">
	
	var SESSION = "${SESSION}"; // 소속 법인 번호
	
	//2020.07.21 김승희 
	var userId = "${userId}";	//유저아이디
	
	var BizNo;
	var BizName;
	
	//AUIGrid 생성 후 반환 ID
	var myGridID1;
	var myGridID2;
	var myGridID2_1;
	var myGridID3;
	var myGridID3_1;
	var myGridID4;
	var myGridID5;
	var myGridID6;
	var myGridID7;
	var myGridID8;
	var myGridID9;
	var myGridID10;
	
	var myGridID11_1;
	var myGridID11_2;
	var myGridID11_3;
	var myGridID11;
	
	//Number check
	function toNumber( val ){
		var str;
		if( isNaN(val) ){
			str = val.replace(/,/g,''); //콤마 제거
			if(isNaN(str) ) str = 0; //잘못된 문자열 입력시 기본 0으로 세팅
		}else{
			str=val;
		}
		return Number(str);
	}
	
	// 현금 컬럼
	var columnLayout1 = [
		{
			dataField: "accno",
			headerText: "계정코드",
			style : "left-cell",
			filter : {showIcon : true},
			width:90,
			visible : false
		},{
			dataField: "accname",
			headerText: "<spring:message code='capital.account'/>",
			style : "left-cell",
			filter : {showIcon : true},
			width:90,	
			visible : true
		},{
			dataField: "forwarddramt",
			headerText: "<spring:message code='capital.beginning'/>",
			style : "money",
			dataType : "numeric",
			editRenderer : {
				type : "InputEditRenderer",
				onlyNumeric : true,
				allowPoint : true
			},
			formatString : "#,##0.00",
			filter : {showIcon : true},
			visible : true
		},{
			dataField: "dramt",
			headerText: "<spring:message code='capital.receiptsInc'/>",
			style : "money",
			dataType : "numeric",
			editRenderer : {
				type : "InputEditRenderer",
				onlyNumeric : true,
				allowPoint : true
			},
			formatString : "#,##0.00",
			filter : {showIcon : true},
			visible : true
		},{
			dataField: "cramt",
			headerText: "<spring:message code='capital.paymentsDec'/>",
			style : "money",
			dataType : "numeric",
			editRenderer : {
				type : "InputEditRenderer",
				onlyNumeric : true,
				allowPoint : true
			},
			formatString : "#,##0.00",
			filter : {showIcon : true},
			visible : true
		},{
			dataField: "remainamt",
			headerText: "<spring:message code='capital.closing'/>",
			style : "money",
			dataType : "numeric",
			formatString : "#,##0.00",
			filter : {showIcon : true},
			visible : true,
			editable : false
		}
	];
	
	var footerObject1 = [
		{
			labelText : "",
			positionField : "#base"
		}, {
			dataField : "forwarddramt",
			positionField : "forwarddramt",
			operation : "SUM",
			formatString : "#,##0.00",
			style : "money",
		}, {
			dataField : "dramt",
			positionField : "dramt",
			operation : "SUM",
			formatString : "#,##0.00",
			style : "money",
		}, {
			dataField : "cramt",
			positionField : "cramt",
			operation : "SUM",
			formatString : "#,##0.00",
			style : "money",
		}, {
			dataField : "remainamt",
			positionField : "remainamt",
			operation : "SUM",
			formatString : "#,##0.00",
			style : "money",
		}
	];
	
	
	// 보통예금
	var columnLayout2 = [
		{
			dataField: "remvalue",
			headerText: "<spring:message code='capital.type'/>",
			style : "left-cell",
			filter : {showIcon : true},
			width:90,	
			visible : true
		},{
			dataField: "forwarddramt",
			headerText: "<spring:message code='capital.beginning'/>",
			style : "money",
			dataType : "numeric",
			editRenderer : {
				type : "InputEditRenderer",
				onlyNumeric : true,
				allowPoint : true
			},
			formatString : "#,##0.00",
			filter : {showIcon : true},
			visible : true
		},{
			dataField: "dramt",
			headerText: "<spring:message code='capital.receiptsInc'/>",
			style : "money",
			dataType : "numeric",
			editRenderer : {
				type : "InputEditRenderer",
				onlyNumeric : true,
				allowPoint : true
			},
			formatString : "#,##0.00",
			filter : {showIcon : true},
			visible : true
		},{
			dataField: "cramt",
			headerText: "<spring:message code='capital.paymentsDec'/>",
			style : "money",
			dataType : "numeric",
			editRenderer : {
				type : "InputEditRenderer",
				onlyNumeric : true,
				allowPoint : true
			},
			formatString : "#,##0.00",
			filter : {showIcon : true},
			visible : true
		},{
			dataField: "remainamt",
			headerText: "<spring:message code='capital.closing'/>",
			style : "money",
			dataType : "numeric",
			formatString : "#,##0.00",
			filter : {showIcon : true},
			visible : true,
			editable : false
		}
	];
				
	var footerObject2 = [
		{
			labelText : "",
			positionField : "#base"
		}, {
			dataField : "forwarddramt",
			positionField : "forwarddramt",
			operation : "SUM",
			formatString : "#,##0.00",
			style : "money",
		}, {
			dataField : "dramt",
			positionField : "dramt",
			operation : "SUM",
			formatString : "#,##0.00",
			style : "money",
		}, {
			dataField : "cramt",
			positionField : "cramt",
			operation : "SUM",
			formatString : "#,##0.00",
			style : "money",
		}, {
			dataField : "remainamt",
			positionField : "remainamt",
			operation : "SUM",
			formatString : "#,##0.00",
			style : "money",
		}
	];
	
	
	// 현금, 보통예금, 외화에금 외 나머지
	var columnLayout3 = [
		{
			dataField: "accseq",
			headerText: "계정코드",
			style : "left-cell",
			filter : {showIcon : true},
			width:90,
			visible : false
		},{
			dataField: "accname",
			headerText: "<spring:message code='capital.account'/>",
			style : "left-cell",
			filter : {showIcon : true},
			width:90,
			visible : true
		},{
			dataField: "remrefseq",
			headerText: "거래처코드",
			style : "left-cell",
			filter : {showIcon : true},
			width:90,
			visible : false
		},{
			dataField: "remrefvalue",
			headerText: "<spring:message code='capital.vendor'/>",
			style : "left-cell",
			filter : {showIcon : true},
			width:90,
			visible : true
		},{
			dataField: "remvalue",
			headerText: "<spring:message code='capital.accountNumber'/>",
			style : "left-cell",
			filter : {showIcon : true},
			width:90,
			visible : true
		},{
			dataField: "forwarddramt",
			headerText: "<spring:message code='capital.beginning'/>",
			style : "money",
			dataType : "numeric",
			editRenderer : {
				type : "InputEditRenderer",
				onlyNumeric : true,
				allowPoint : true
			},
			formatString : "#,##0.00",
			filter : {showIcon : true},
			visible : true
		},{
			dataField: "dramt",
			headerText: "<spring:message code='capital.receiptsInc'/>",
			style : "money",
			dataType : "numeric",
			editRenderer : {
				type : "InputEditRenderer",
				onlyNumeric : true,
				allowPoint : true
			},
			formatString : "#,##0.00",
			filter : {showIcon : true},
			visible : true
		},{
			dataField: "cramt",
			headerText: "<spring:message code='capital.paymentsDec'/>",
			style : "money",
			dataType : "numeric",
			editRenderer : {
				type : "InputEditRenderer",
				onlyNumeric : true,
				allowPoint : true
			},
			formatString : "#,##0.00",
			filter : {showIcon : true},
			visible : true
		},{
			dataField: "remainamt",
			headerText: "<spring:message code='capital.closing'/>",
			style : "money",
			dataType : "numeric",
			formatString : "#,##0.00",
			filter : {showIcon : true},
			visible : true,
			editable : false
		}
	];
								
	var footerObject3 = [
		{
			labelText : "",
			positionField : "#base"
		}, {
			labelText : "",
			positionField : "#base"
		}, {
			labelText : "",
			positionField : "#base"
		}, {
			dataField : "forwarddramt",
			positionField : "forwarddramt",
			operation : "SUM",
			formatString : "#,##0.00",
			style : "money",
		}, {
			dataField : "dramt",
			positionField : "dramt",
			operation : "SUM",
			formatString : "#,##0.00",
			style : "money",
		}, {
			dataField : "cramt",
			positionField : "cramt",
			operation : "SUM",
			formatString : "#,##0.00",
			style : "money",
		}, {
			dataField : "remainamt",
			positionField : "remainamt",
			operation : "SUM",
			formatString : "#,##0.00",
			style : "money",
		}
	];
	
	
	// 금융상품 변동내역
	var columnLayout4 = [
		{
			dataField: "accseq",
			headerText: "계정코드",
			style : "left-cell",
			filter : {showIcon : true},
			width:90,
			visible : false
		},{
			dataField: "accname",
			headerText: "<spring:message code='capital.account'/>",
			style : "left-cell",
			filter : {showIcon : true},
			width:180,
			visible : true
		},{
			dataField: "remseqname2",
			headerText: "<spring:message code='capital.vendor'/>",
			style : "left-cell",
			filter : {showIcon : true},
			width:180,
			visible : true
		},{
			dataField: "remseqname1",
			headerText: "<spring:message code='capital.accountNumber'/>",
			style : "left-cell",
			filter : {showIcon : true},
			width:180,
			visible : true
		},{
			dataField: "summary",
			headerText: "<spring:message code='capital.remarks'/>",
			style : "left-cell",
			filter : {showIcon : true},
			visible : true
		},{
			dataField: "cramt",
			headerText: "<spring:message code='capital.amount'/>",
			style : "money",
			dataType : "numeric",
			formatString : "#,##0.00",
			filter : {showIcon : true},
			visible : true
		}
	];
								
	var footerObject4 = [
		{
			labelText : "",
			positionField : "#base"
		}, {
			labelText : "",
			positionField : "#base"
		}, {
			labelText : "",
			positionField : "#base"
		}, {
			labelText : "",
			positionField : "#base"
		}, {
			dataField : "cramt",
			positionField : "cramt",
			operation : "SUM",
			formatString : "#,##0.00",
			style : "money",
		}
	];
	
	
	// 금융상품 변동내역
	var columnLayout5 = [
		{
			dataField: "accname",
			headerText: "<spring:message code='capital.account'/>",
			style : "left-cell",
			width:180,
			visible : true
		},{
			dataField: "type",
			headerText: "<spring:message code='capital.type'/>",
			style : "left-cell",
			width:90,
			editRenderer : { // 편집 모드 진입 시 콤보박스리스트 출력하고자 할 때
				type : "DropDownListRenderer",
				list : ["가입", "추가가입", "연장", "해지", "이자", "상환"]
			},
			visible : true
		},{
			headerText: "<spring:message code='capital.changeHistory'/>",
			children: [{
				headerText: "<spring:message code='capital.paymentsDec'/>",
				colSpan: 2,
				dataField: "remrefvalueDec",
				style : "left-cell",
				width:180,
				visible : true
			},{
				dataField: "remvalueDec",
				style : "left-cell",
				width:180,
				visible : true
			},{
				headerText: "<spring:message code='capital.receiptsInc'/>",
				colSpan: 2,
				dataField: "remrefvalueInc",
				style : "left-cell",
				width:180,
				visible : true
			},{
				dataField: "remvalueInc",
				style : "left-cell",
				width:180,
				visible : true
			},{
				dataField: "amount",
				headerText: "<spring:message code='capital.amount'/>",
				style : "money",
				width:120,
				dataType : "numeric",
				editRenderer : {
					type : "InputEditRenderer",
					onlyNumeric : true,
					allowPoint : true
				},
				formatString : "#,##0.00",
				visible : true
			}]
		},{
			dataField: "summary",
			headerText: "<spring:message code='capital.desc'/>",
			style : "left-cell",
			visible : true
		}
	];
								
	var footerObject5 = [
		{
			labelText : "",
			positionField : "#base"
		}, {
			labelText : "",
			positionField : "#base"
		}, {
			labelText : "",
			positionField : "#base"
		}, {
			labelText : "",
			positionField : "#base"
		}, {
			labelText : "",
			positionField : "#base"
		}, {
			labelText : "",
			positionField : "#base"
		}, {
			labelText : "",
			positionField : "#base"
		}, {
			dataField : "amount",
			positionField : "amount",
			operation : "SUM",
			formatString : "#,##0.00",
			style : "money",
		}, {
			labelText : "",
			positionField : "#base"
		}
	];

	

	$(document).ready(function(){

		$("#comNo").val(SESSION);
		
		// AUIGrid 를 생성합니다.
		var auiGridProps = {
				editable : true,
				//rowIdField : "", // 행의 고유 필드명 그리드내에서의 키값
				processValidData : false, // dataType 에 맞게 validData 기능 사용
				showStateColumn : true, //상태값을 아이콘으로 삭제 등록 취소등
				softRemoveRowMode : false,
				//softRemovePolicy : "exceptNew",
				enableFocus : true, 
				editBeginMode : "doubleClick",
				editingOnKeyDown : true,
				selectionMode : "multipleCells",
				showRowNumColumn : false,
				showRowCheckColumn : false, 	//체크박스
				showRowAllCheckBox : false,
				enableFilter : true,
				showFooter :true,
				//headerHeight : 48,
				//wrapSelectionMove : true,
		};
		
		var auiGridProps2_1 = {
				editable : true,
				//rowIdField : "", // 행의 고유 필드명 그리드내에서의 키값
				processValidData : false, // dataType 에 맞게 validData 기능 사용
				showStateColumn : true, //상태값을 아이콘으로 삭제 등록 취소등
				softRemoveRowMode : false,
				//softRemovePolicy : "exceptNew",
				enableFocus : true, 
				editBeginMode : "doubleClick",
				editingOnKeyDown : true,
				selectionMode : "multipleCells",
				showRowNumColumn : false,
				showRowCheckColumn : true, 	//체크박스
				showRowAllCheckBox : true,
				enableFilter : true,
				showFooter :true,
				//headerHeight : 48,
				//wrapSelectionMove : true,
		};
		
		var auiGridProps3 = {
				editable : false,
				//rowIdField : "", // 행의 고유 필드명 그리드내에서의 키값
				processValidData : false, // dataType 에 맞게 validData 기능 사용
				softRemoveRowMode : false,
				enableFocus : true,
				selectionMode : "multipleCells",
				showRowNumColumn : false,
				showRowCheckColumn : false, 	//체크박스
				showRowAllCheckBox : false,
				enableFilter : true,
				showFooter :true
		};
	
		
		// Grid 그리기
 		/* myGridID1 = AUIGrid.create("#grid_wrap1", columnLayout1, auiGridProps);
		AUIGrid.setFooter(myGridID1, footerObject1);
		AUIGrid.bind("#grid_wrap1", "cellEditEndBefore", cellEditEndBeforeHandler);
		
 		myGridID2 = AUIGrid.create("#grid_wrap2", columnLayout2, auiGridProps);
		AUIGrid.setFooter(myGridID2, footerObject2);
		AUIGrid.bind("#grid_wrap2", "cellEditEndBefore", cellEditEndBeforeHandler);
		
 		myGridID3 = AUIGrid.create("#grid_wrap3", columnLayout2, auiGridProps);
		AUIGrid.setFooter(myGridID3, footerObject2);
		AUIGrid.bind("#grid_wrap3", "cellEditEndBefore", cellEditEndBeforeHandler);
		
 		myGridID4 = AUIGrid.create("#grid_wrap4", columnLayout1, auiGridProps);
		AUIGrid.setFooter(myGridID4, footerObject1);	
		AUIGrid.bind("#grid_wrap4", "cellEditEndBefore", cellEditEndBeforeHandler);
		
 		myGridID5 = AUIGrid.create("#grid_wrap5", columnLayout1, auiGridProps);
		AUIGrid.setFooter(myGridID5, footerObject1);			
		AUIGrid.bind("#grid_wrap5", "cellEditEndBefore", cellEditEndBeforeHandler);
		
 		myGridID6 = AUIGrid.create("#grid_wrap6", columnLayout1, auiGridProps);
		AUIGrid.setFooter(myGridID6, footerObject1);			
		AUIGrid.bind("#grid_wrap6", "cellEditEndBefore", cellEditEndBeforeHandler);
		
 		myGridID7 = AUIGrid.create("#grid_wrap7", columnLayout1, auiGridProps);
		AUIGrid.setFooter(myGridID7, footerObject1);			
		AUIGrid.bind("#grid_wrap7", "cellEditEndBefore", cellEditEndBeforeHandler);
		
 		myGridID8 = AUIGrid.create("#grid_wrap8", columnLayout1, auiGridProps);
		AUIGrid.setFooter(myGridID8, footerObject1);	
		AUIGrid.bind("#grid_wrap8", "cellEditEndBefore", cellEditEndBeforeHandler);
		
		myGridID9 = AUIGrid.create("#grid_wrap9", columnLayout1, auiGridProps);
		AUIGrid.setFooter(myGridID9, footerObject1);		
		AUIGrid.bind("#grid_wrap9", "cellEditEndBefore", cellEditEndBeforeHandler);
		
		myGridID10 = AUIGrid.create("#grid_wrap10", columnLayout1, auiGridProps);
		AUIGrid.setFooter(myGridID10, footerObject1);			
		AUIGrid.bind("#grid_wrap10", "cellEditEndBefore", cellEditEndBeforeHandler);
 */
				
		// Grid 초기화
		function AUIGrid_reset() {
			AUIGrid.destroy("#grid_wrap1");
			myGridID1 = null;
			myGridID1 = AUIGrid.create("#grid_wrap1", columnLayout1, auiGridProps);
			AUIGrid.bind("#grid_wrap1", "cellEditEndBefore", cellEditEndBeforeHandler);
			AUIGrid.setFooter(myGridID1, footerObject1);
			
			AUIGrid.destroy("#grid_wrap2");
			myGridID2 = null;
			myGridID2 = AUIGrid.create("#grid_wrap2", columnLayout2, auiGridProps);
			AUIGrid.bind("#grid_wrap2", "cellEditEndBefore", cellEditEndBeforeHandler);
			AUIGrid.setFooter(myGridID2, footerObject2);
			
			AUIGrid.destroy("#grid_wrap3");
			myGridID3 = null;
			myGridID3 = AUIGrid.create("#grid_wrap3", columnLayout2, auiGridProps);
			AUIGrid.bind("#grid_wrap3", "cellEditEndBefore", cellEditEndBeforeHandler);
			AUIGrid.setFooter(myGridID3, footerObject2);
			
			AUIGrid.destroy("#grid_wrap4");
			myGridID4 = null;
//			myGridID4 = AUIGrid.create("#grid_wrap4", columnLayout1, auiGridProps);
			myGridID4 = AUIGrid.create("#grid_wrap4", columnLayout3, auiGridProps);	/* [HSLA-4158] 자금일보 개선 : 계정명 / 기초 / 입금_증가 / 출금_감소 / 마감 --> 계정명 / 금융기관 / 계좌번호 / 기초 / 입금_증가 / 출금_감소 / 마감 ( 2022-03-21 : 김연준 ) */
			AUIGrid.bind("#grid_wrap4", "cellEditEndBefore", cellEditEndBeforeHandler);
//			AUIGrid.setFooter(myGridID4, footerObject1);
			AUIGrid.setFooter(myGridID4, footerObject3);	/* [HSLA-4158] 자금일보 개선 : 계정명 / 기초 / 입금_증가 / 출금_감소 / 마감 --> 계정명 / 금융기관 / 계좌번호 / 기초 / 입금_증가 / 출금_감소 / 마감 ( 2022-03-21 : 김연준 ) */
			
			AUIGrid.destroy("#grid_wrap5");
			myGridID5 = null;
//			myGridID5 = AUIGrid.create("#grid_wrap5", columnLayout1, auiGridProps);
			myGridID5 = AUIGrid.create("#grid_wrap5", columnLayout3, auiGridProps);	/* [HSLA-4158] 자금일보 개선 : 계정명 / 기초 / 입금_증가 / 출금_감소 / 마감 --> 계정명 / 금융기관 / 계좌번호 / 기초 / 입금_증가 / 출금_감소 / 마감 ( 2022-03-21 : 김연준 ) */
			AUIGrid.bind("#grid_wrap5", "cellEditEndBefore", cellEditEndBeforeHandler);
//			AUIGrid.setFooter(myGridID5, footerObject1);
			AUIGrid.setFooter(myGridID5, footerObject3);	/* [HSLA-4158] 자금일보 개선 : 계정명 / 기초 / 입금_증가 / 출금_감소 / 마감 --> 계정명 / 금융기관 / 계좌번호 / 기초 / 입금_증가 / 출금_감소 / 마감 ( 2022-03-21 : 김연준 ) */
			
			AUIGrid.destroy("#grid_wrap6");
			myGridID6 = null;
//			myGridID6 = AUIGrid.create("#grid_wrap6", columnLayout1, auiGridProps);
			myGridID6 = AUIGrid.create("#grid_wrap6", columnLayout3, auiGridProps);	/* [HSLA-4158] 자금일보 개선 : 계정명 / 기초 / 입금_증가 / 출금_감소 / 마감 --> 계정명 / 금융기관 / 계좌번호 / 기초 / 입금_증가 / 출금_감소 / 마감 ( 2022-03-21 : 김연준 ) */
			AUIGrid.bind("#grid_wrap6", "cellEditEndBefore", cellEditEndBeforeHandler);
//			AUIGrid.setFooter(myGridID6, footerObject1);
			AUIGrid.setFooter(myGridID6, footerObject3);	/* [HSLA-4158] 자금일보 개선 : 계정명 / 기초 / 입금_증가 / 출금_감소 / 마감 --> 계정명 / 금융기관 / 계좌번호 / 기초 / 입금_증가 / 출금_감소 / 마감 ( 2022-03-21 : 김연준 ) */
			
			AUIGrid.destroy("#grid_wrap7");
			myGridID7 = null;
//			myGridID7 = AUIGrid.create("#grid_wrap7", columnLayout1, auiGridProps);
			myGridID7 = AUIGrid.create("#grid_wrap7", columnLayout3, auiGridProps);	/* [HSLA-4158] 자금일보 개선 : 계정명 / 기초 / 입금_증가 / 출금_감소 / 마감 --> 계정명 / 금융기관 / 계좌번호 / 기초 / 입금_증가 / 출금_감소 / 마감 ( 2022-02-22 : 김연준 ) */
			AUIGrid.bind("#grid_wrap7", "cellEditEndBefore", cellEditEndBeforeHandler);
//			AUIGrid.setFooter(myGridID7, footerObject1);
			AUIGrid.setFooter(myGridID7, footerObject3);	/* [HSLA-4158] 자금일보 개선 : 계정명 / 기초 / 입금_증가 / 출금_감소 / 마감 --> 계정명 / 금융기관 / 계좌번호 / 기초 / 입금_증가 / 출금_감소 / 마감 ( 2022-02-22 : 김연준 ) */
			
			AUIGrid.destroy("#grid_wrap8");
			myGridID8 = null;
//			myGridID8 = AUIGrid.create("#grid_wrap8", columnLayout1, auiGridProps);
			myGridID8 = AUIGrid.create("#grid_wrap8", columnLayout3, auiGridProps);	/* [HSLA-4158] 자금일보 개선 : 계정명 / 기초 / 입금_증가 / 출금_감소 / 마감 --> 계정명 / 금융기관 / 계좌번호 / 기초 / 입금_증가 / 출금_감소 / 마감 ( 2022-03-21 : 김연준 ) */
			AUIGrid.bind("#grid_wrap8", "cellEditEndBefore", cellEditEndBeforeHandler);
//			AUIGrid.setFooter(myGridID8, footerObject1);
			AUIGrid.setFooter(myGridID8, footerObject3);	/* [HSLA-4158] 자금일보 개선 : 계정명 / 기초 / 입금_증가 / 출금_감소 / 마감 --> 계정명 / 금융기관 / 계좌번호 / 기초 / 입금_증가 / 출금_감소 / 마감 ( 2022-03-21 : 김연준 ) */
			
			AUIGrid.destroy("#grid_wrap9");
			myGridID9 = null;
			myGridID9 = AUIGrid.create("#grid_wrap9", columnLayout1, auiGridProps);
			AUIGrid.bind("#grid_wrap9", "cellEditEndBefore", cellEditEndBeforeHandler);
			AUIGrid.setFooter(myGridID9, footerObject1);
			
			AUIGrid.destroy("#grid_wrap10");
			myGridID10 = null;
//			myGridID10 = AUIGrid.create("#grid_wrap10", columnLayout1, auiGridProps);
			myGridID10 = AUIGrid.create("#grid_wrap10", columnLayout3, auiGridProps);	/* [HSLA-4158] 자금일보 개선 : 계정명 / 기초 / 입금_증가 / 출금_감소 / 마감 --> 계정명 / 금융기관 / 계좌번호 / 기초 / 입금_증가 / 출금_감소 / 마감 ( 2022-03-21 : 김연준 ) */
			AUIGrid.bind("#grid_wrap10", "cellEditEndBefore", cellEditEndBeforeHandler);
//			AUIGrid.setFooter(myGridID10, footerObject1);
			AUIGrid.setFooter(myGridID10, footerObject3);	/* [HSLA-4158] 자금일보 개선 : 계정명 / 기초 / 입금_증가 / 출금_감소 / 마감 --> 계정명 / 금융기관 / 계좌번호 / 기초 / 입금_증가 / 출금_감소 / 마감 ( 2022-03-21 : 김연준 ) */
			
			/* [HSLA-4158] 자금일보 개선 : 11) 금융상품 변동내역 상세 ( 2022-03-24 : 김연준 ) */
			AUIGrid.destroy("#grid_wrap11_1");
			myGridID11_1 = null;
			myGridID11_1 = AUIGrid.create("#grid_wrap11_1", columnLayout3, auiGridProps3);
			AUIGrid.setColumnSizeList(myGridID11_1, [null, 180, null, 180, 180]);
			AUIGrid.setFooter(myGridID11_1, footerObject3);
			
			AUIGrid.destroy("#grid_wrap11_2");
			myGridID11_2 = null;
			myGridID11_2 = AUIGrid.create("#grid_wrap11_2", columnLayout4, auiGridProps3);
			AUIGrid.setFooter(myGridID11_2, footerObject4);
			
			AUIGrid.destroy("#grid_wrap11_3");
			myGridID11_3 = null;
			myGridID11_3 = AUIGrid.create("#grid_wrap11_3", columnLayout4, auiGridProps3);
			AUIGrid.setFooter(myGridID11_3, footerObject4);
			
			AUIGrid.destroy("#grid_wrap11");
			myGridID11 = null;
			myGridID11 = AUIGrid.create("#grid_wrap11", columnLayout5, auiGridProps);
			AUIGrid.setFooter(myGridID11, footerObject5);
			
			AUIGrid.bind(myGridID1, 'cellEditEnd', function(event) {
				ingView();
				var regNumber = /^-?(\d{1,20}([.]\d{0,15})?)?$/;
				if ('accname' != event.dataField) {
					var val = toNumber(event.value);
					
					if(!regNumber.test(val)) {
						var data = event.item;
						var item = {};
						if ('forwarddramt' == event.dataField) {
							item['cramt'] = toNumber(data['cramt']);
							item['dramt'] = toNumber(data['dramt']);
							item['remainamt'] = event.oldValue + toNumber(data['dramt']) - toNumber(data['cramt']);
						} else if ('dramt' == event.dataField) {
							item['cramt'] = toNumber(data['cramt']);
							item['forwarddramt'] = toNumber(data['forwarddramt']);
							item['remainamt'] = event.oldValue + toNumber(data['forwarddramt']) - toNumber(data['cramt']);
						} else if ('cramt' == event.dataField) {
							item['forwarddramt'] = toNumber(data['forwarddramt']);
							item['dramt'] =toNumber( data['dramt']);
							item['remainamt'] = toNumber(data['forwarddramt']) + toNumber(data['dramt']) - event.oldValue;
						}
						item[event.dataField] = event.oldValue;
						AUIGrid.updateRow(myGridID1, item , event.rowIndex);
						return;
					}
				}
			});
			
			AUIGrid.bind(myGridID2, 'cellEditEnd', function(event) {
				ingView();
				var regNumber = /^-?(\d{1,20}([.]\d{0,15})?)?$/;
				if ('remvalue' != event.dataField) {
					var val = toNumber(event.value);
					
					if(!regNumber.test(val)) {
						var data = event.item;
						var item = {};
						if ('forwarddramt' == event.dataField) {
							item['cramt'] = toNumber(data['cramt']);
							item['dramt'] = toNumber(data['dramt']);
							item['remainamt'] = event.oldValue + toNumber(data['dramt']) - toNumber(data['cramt']);
						} else if ('dramt' == event.dataField) {
							item['cramt'] = toNumber(data['cramt']);
							item['forwarddramt'] = toNumber(data['forwarddramt']);
							item['remainamt'] = event.oldValue + toNumber(data['forwarddramt']) - toNumber(data['cramt']);
						} else if ('cramt' == event.dataField) {
							item['forwarddramt'] = toNumber(data['forwarddramt']);
							item['dramt'] = toNumber(data['dramt']);
							item['remainamt'] = toNumber(data['forwarddramt']) + toNumber(data['dramt']) - event.oldValue;
						}
						item[event.dataField] = event.oldValue;
						AUIGrid.updateRow(myGridID2, item , event.rowIndex);
						return;
					}
				}
			});
			
			AUIGrid.bind(myGridID3, 'cellEditEnd', function(event) {
				ingView();
				var regNumber = /^-?(\d{1,20}([.]\d{0,15})?)?$/;
				if ('remvalue' != event.dataField) {
					var val = toNumber(event.value);
					
					if(!regNumber.test(val)) {
						var data = event.item;
						var item = {};
						if ('forwarddramt' == event.dataField) {
							item['cramt'] = toNumber(data['cramt']);
							item['dramt'] = toNumber(data['dramt']);
							item['remainamt'] = event.oldValue + toNumber(data['dramt']) - toNumber(data['cramt']);
						} else if ('dramt' == event.dataField) {
							item['cramt'] = toNumber(data['cramt']);
							item['forwarddramt'] = toNumber(data['forwarddramt']);
							item['remainamt'] = event.oldValue + toNumber(data['forwarddramt']) - toNumber(data['cramt']);
						} else if ('cramt' == event.dataField) {
							item['forwarddramt'] = toNumber(data['forwarddramt']);
							item['dramt'] = toNumber(data['dramt']);
							item['remainamt'] = toNumber(data['forwarddramt']) + toNumber(data['dramt']) - event.oldValue;
						}
						item[event.dataField] = event.oldValue;
						AUIGrid.updateRow(myGridID3, item , event.rowIndex);
						return;
					}
				}
			});
			
			AUIGrid.bind(myGridID4, 'cellEditEnd', function(event) {
				ingView();
				var regNumber = /^-?(\d{1,20}([.]\d{0,15})?)?$/;
//				if ('accname' != event.dataField) {
				if ('accname' != event.dataField && 'remrefvalue' != event.dataField && 'remvalue' != event.dataField) {	/* [HSLA-4158] 자금일보 개선 : 계정명 / 기초 / 입금_증가 / 출금_감소 / 마감 --> 계정명 / 금융기관 / 계좌번호 / 기초 / 입금_증가 / 출금_감소 / 마감 ( 2022-03-21 : 김연준 ) */
					var val = toNumber(event.value);
					
					if(!regNumber.test(val)) {
						var data = event.item;
						var item = {};
						if ('forwarddramt' == event.dataField) {
							item['cramt'] = toNumber(data['cramt']);
							item['dramt'] = toNumber(data['dramt']);
							item['remainamt'] = event.oldValue + toNumber(data['dramt']) - toNumber(data['cramt']);
						} else if ('dramt' == event.dataField) {
							item['cramt'] = toNumber(data['cramt']);
							item['forwarddramt'] = toNumber(data['forwarddramt']);
							item['remainamt'] = event.oldValue + toNumber(data['forwarddramt']) - toNumber(data['cramt']);
						} else if ('cramt' == event.dataField) {
							item['forwarddramt'] = toNumber(data['forwarddramt']);
							item['dramt'] = toNumber(data['dramt']);
							item['remainamt'] = toNumber(data['forwarddramt']) + toNumber(data['dramt']) - event.oldValue;
						}
						item[event.dataField] = event.oldValue;
						AUIGrid.updateRow(myGridID4, item , event.rowIndex);
						return;
					}
				}
			});
			
			AUIGrid.bind(myGridID5, 'cellEditEnd', function(event) {
				ingView();
				var regNumber = /^-?(\d{1,20}([.]\d{0,15})?)?$/;
//				if ('accname' != event.dataField) {
				if ('accname' != event.dataField && 'remrefvalue' != event.dataField && 'remvalue' != event.dataField) {	/* [HSLA-4158] 자금일보 개선 : 계정명 / 기초 / 입금_증가 / 출금_감소 / 마감 --> 계정명 / 금융기관 / 계좌번호 / 기초 / 입금_증가 / 출금_감소 / 마감 ( 2022-03-21 : 김연준 ) */
					var val = toNumber(event.value);
					
					if(!regNumber.test(val)) {
						var data = event.item;
						var item = {};
						if ('forwarddramt' == event.dataField) {
							item['cramt'] = toNumber(data['cramt']);
							item['dramt'] = toNumber(data['dramt']);
							item['remainamt'] = event.oldValue + toNumber(data['dramt']) - toNumber(data['cramt']);
						} else if ('dramt' == event.dataField) {
							item['cramt'] = toNumber(data['cramt']);
							item['forwarddramt'] = toNumber(data['forwarddramt']);
							item['remainamt'] = event.oldValue + toNumber(data['forwarddramt']) - toNumber(data['cramt']);
						} else if ('cramt' == event.dataField) {
							item['forwarddramt'] = toNumber(data['forwarddramt']);
							item['dramt'] = toNumber(data['dramt']);
							item['remainamt'] = toNumber(data['forwarddramt']) + toNumber(data['dramt']) - event.oldValue;
						}
						item[event.dataField] = event.oldValue;
						AUIGrid.updateRow(myGridID5, item , event.rowIndex);
						return;
					}
				}
			});
			
			AUIGrid.bind(myGridID6, 'cellEditEnd', function(event) {
				ingView();
				var regNumber = /^-?(\d{1,20}([.]\d{0,15})?)?$/;
//				if ('accname' != event.dataField) {
				if ('accname' != event.dataField && 'remrefvalue' != event.dataField && 'remvalue' != event.dataField) {	/* [HSLA-4158] 자금일보 개선 : 계정명 / 기초 / 입금_증가 / 출금_감소 / 마감 --> 계정명 / 금융기관 / 계좌번호 / 기초 / 입금_증가 / 출금_감소 / 마감 ( 2022-03-21 : 김연준 ) */
					var val = toNumber(event.value);
					
					if(!regNumber.test(val)) {
						var data = event.item;
						var item = {};
						if ('forwarddramt' == event.dataField) {
							item['cramt'] = toNumber(data['cramt']);
							item['dramt'] = toNumber(data['dramt']);
							item['remainamt'] = event.oldValue + toNumber(data['dramt']) - toNumber(data['cramt']);
						} else if ('dramt' == event.dataField) {
							item['cramt'] = toNumber(data['cramt']);
							item['forwarddramt'] = toNumber(data['forwarddramt']);
							item['remainamt'] = event.oldValue + toNumber(data['forwarddramt']) - toNumber(data['cramt']);
						} else if ('cramt' == event.dataField) {
							item['forwarddramt'] = toNumber(data['forwarddramt']);
							item['dramt'] = toNumber(data['dramt']);
							item['remainamt'] = toNumber(data['forwarddramt']) + toNumber(data['dramt']) - event.oldValue;
						}
						item[event.dataField] = event.oldValue;
						AUIGrid.updateRow(myGridID6, item , event.rowIndex);
						return;
					}
				}
			});
			
			AUIGrid.bind(myGridID7, 'cellEditEnd', function(event) {
				ingView();
				var regNumber = /^-?(\d{1,20}([.]\d{0,15})?)?$/;
//				if ('accname' != event.dataField) {
				if ('accname' != event.dataField && 'remrefvalue' != event.dataField && 'remvalue' != event.dataField) {	/* [HSLA-4158] 자금일보 개선 : 계정명 / 기초 / 입금_증가 / 출금_감소 / 마감 --> 계정명 / 금융기관 / 계좌번호 / 기초 / 입금_증가 / 출금_감소 / 마감 ( 2022-03-21 : 김연준 ) */
					var val = toNumber(event.value);
					
					if(!regNumber.test(val)) {
						var data = event.item;
						var item = {};
						if ('forwarddramt' == event.dataField) {
							item['cramt'] = toNumber(data['cramt']);
							item['dramt'] = toNumber(data['dramt']);
							item['remainamt'] = event.oldValue + toNumber(data['dramt']) - toNumber(data['cramt']);
						} else if ('dramt' == event.dataField) {
							item['cramt'] = toNumber(data['cramt']);
							item['forwarddramt'] = toNumber(data['forwarddramt']);
							item['remainamt'] = event.oldValue + toNumber(data['forwarddramt']) - toNumber(data['cramt']);
						} else if ('cramt' == event.dataField) {
							item['forwarddramt'] = toNumber(data['forwarddramt']);
							item['dramt'] = toNumber(data['dramt']);
							item['remainamt'] = toNumber(data['forwarddramt']) + toNumber(data['dramt']) - event.oldValue;
						}
						item[event.dataField] = event.oldValue;
						AUIGrid.updateRow(myGridID7, item , event.rowIndex);
						return;
					}
				}
			});
			
			AUIGrid.bind(myGridID8, 'cellEditEnd', function(event) {
				ingView();
				var regNumber = /^-?(\d{1,20}([.]\d{0,15})?)?$/;
//				if ('accname' != event.dataField) {
				if ('accname' != event.dataField && 'remrefvalue' != event.dataField && 'remvalue' != event.dataField) {	/* [HSLA-4158] 자금일보 개선 : 계정명 / 기초 / 입금_증가 / 출금_감소 / 마감 --> 계정명 / 금융기관 / 계좌번호 / 기초 / 입금_증가 / 출금_감소 / 마감 ( 2022-03-21 : 김연준 ) */
					var val = toNumber(event.value);
					
					if(!regNumber.test(val)) {
						var data = event.item;
						var item = {};
						if ('forwarddramt' == event.dataField) {
							item['cramt'] = toNumber(data['cramt']);
							item['dramt'] = toNumber(data['dramt']);
							item['remainamt'] = event.oldValue + toNumber(data['dramt']) - toNumber(data['cramt']);
						} else if ('dramt' == event.dataField) {
							item['cramt'] = toNumber(data['cramt']);
							item['forwarddramt'] = toNumber(data['forwarddramt']);
							item['remainamt'] = event.oldValue + toNumber(data['forwarddramt']) - toNumber(data['cramt']);
						} else if ('cramt' == event.dataField) {
							item['forwarddramt'] = toNumber(data['forwarddramt']);
							item['dramt'] = toNumber(data['dramt']);
							item['remainamt'] = toNumber(data['forwarddramt']) + toNumber(data['dramt']) - event.oldValue;
						}
						item[event.dataField] = event.oldValue;
						AUIGrid.updateRow(myGridID8, item , event.rowIndex);
						return;
					}
				}
			});
			
			AUIGrid.bind(myGridID9, 'cellEditEnd', function(event) {
				ingView();
				var regNumber = /^-?(\d{1,20}([.]\d{0,15})?)?$/;
//				if ('accname' != event.dataField) {
				if ('accname' != event.dataField && 'remrefvalue' != event.dataField && 'remvalue' != event.dataField) {	/* [HSLA-4158] 자금일보 개선 : 계정명 / 기초 / 입금_증가 / 출금_감소 / 마감 --> 계정명 / 금융기관 / 계좌번호 / 기초 / 입금_증가 / 출금_감소 / 마감 ( 2022-03-21 : 김연준 ) */
					var val = toNumber(event.value);
					if(!regNumber.test(val)) {
						var data = event.item;
						var item = {};
						if ('forwarddramt' == event.dataField) {
							item['cramt'] = toNumber(data['cramt']);
							item['dramt'] = toNumber(data['dramt']);
							item['remainamt'] = event.oldValue + toNumber(data['dramt']) - toNumber(data['cramt']);
						} else if ('dramt' == event.dataField) {
							item['cramt'] = toNumber(data['cramt']);
							item['forwarddramt'] = toNumber(data['forwarddramt']);
							item['remainamt'] = event.oldValue + toNumber(data['forwarddramt']) - toNumber(data['cramt']);
						} else if ('cramt' == event.dataField) {
							item['forwarddramt'] = toNumber(data['forwarddramt']);
							item['dramt'] = toNumber(data['dramt']);
							item['remainamt'] = toNumber(data['forwarddramt']) + toNumber(data['dramt']) - event.oldValue;
						}
						item[event.dataField] = event.oldValue;
						AUIGrid.updateRow(myGridID9, item , event.rowIndex);
						return;
					}
				}
			});
			
			AUIGrid.bind(myGridID10, 'cellEditEnd', function(event) {
				ingView();
				var regNumber = /^-?(\d{1,20}([.]\d{0,15})?)?$/;
//				if ('accname' != event.dataField) {
				if ('accname' != event.dataField && 'remrefvalue' != event.dataField && 'remvalue' != event.dataField) {	/* [HSLA-4158] 자금일보 개선 : 계정명 / 기초 / 입금_증가 / 출금_감소 / 마감 --> 계정명 / 금융기관 / 계좌번호 / 기초 / 입금_증가 / 출금_감소 / 마감 ( 2022-03-21 : 김연준 ) */
					var val = toNumber(event.value);
					if(!regNumber.test(val)) {
						var data = event.item;
						var item = {};
						if ('forwarddramt' == event.dataField) {
							item['cramt'] = toNumber(data['cramt']);
							item['dramt'] = toNumber(data['dramt']);
							item['remainamt'] = event.oldValue + toNumber(data['dramt']) - toNumber(data['cramt']);
						} else if ('dramt' == event.dataField) {
							item['cramt'] = toNumber(data['cramt']);
							item['forwarddramt'] = toNumber(data['forwarddramt']);
							item['remainamt'] = event.oldValue + toNumber(data['forwarddramt']) - toNumber(data['cramt']);
						} else if ('cramt' == event.dataField) {
							item['forwarddramt'] = toNumber(data['forwarddramt']);
							item['dramt'] = toNumber(data['dramt']);
							item['remainamt'] = toNumber(data['forwarddramt']) + toNumber(data['dramt']) - event.oldValue;
						}
						item[event.dataField] = event.oldValue;
						AUIGrid.updateRow(myGridID10, item , event.rowIndex);
						return;
					}
				}
			});
			
			AUIGrid.bind(myGridID11, 'cellEditEnd', function(event) {
				ingView();
				var regNumber = /^-?(\d{1,20}([.]\d{0,15})?)?$/;
				if ('amount' == event.dataField) {
					var val = toNumber(event.value);
					if(!regNumber.test(val)) {
						var data = event.item;
						var item = {};
						item['amount'] = toNumber(data['amount']);
						item[event.dataField] = event.oldValue;
						AUIGrid.updateRow(myGridID11, item , event.rowIndex);
						return;
					}
				}
			});
			
			//2020.07.22 김승희
			ingView();
		}
		

		
		// 조회
		function fn_selectList(SaveType) {
			
			var trueDate = "";
			
			if(!isDate($("#sdate").val())){
				alert("<spring:message code='capital.date.validation' />");
				$("#sdate").focus();
				return;
			}
			
			//2020.07.16 김승희
			//법인 권한이 없는경우 null , null 처리 하여 미연에 방지
			if(null == $("#comNo").val() || "" == $("#comNo").val()){
				alert("<spring:message code='capital.comno.validation' />");
				$("#comNo").focus();
				return;
			}
			
			
			$.isLoading({ tpl: "<span class='isloading-wrapper %wrapper%'>Loading&nbsp;&nbsp;<i class='fa fa-refresh fa-spin'></i></span>" });
			
			AUIGrid_reset();

			// 사업자 등록번호
			var data = "comNo=" + $("#comNo").val();
			data += "&SaveType=" + SaveType;
			data += "&sdate=" + $("#sdate").val();
			
			var url = "<c:url value='/ifrs/capital/IfrsCapitalBizAjax' />";
			fn_ajax(url, data, function( result ){	
				
				//console.log(result);
				
				if ( result.result.length > 0 ) {

					BizNo = result.result[0].taxno;
					BizName = result.result[0].taxname;
				
				}
				
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
				
				var data = "comNo=" + $("#comNo").val();
				data += "&sdate1=" + sdate1;
				var url="";
				// 검색일 기준 조회대상의 법인이 ERP 미사용법인이고 자금일보 저장 내역이 있다고 한다면 최종 저장일의 내용을 호출 
				if(result.erpYn=='N'&&result.sdate!='0'&& result.sdate !=$("#sdate").val()){
					data += "&sdate2=" + 	result.sdate ;	
					url = "<c:url value='/ifrs/capital/IfrsLoadNonErpSaveData' />";
				}else{
					data += "&sdate2=" + $("#sdate").val();
					url = "<c:url value='/ifrs/capital/IfrsLoadSaveData' />";
				}
				data += "&bizNo=" + BizNo;
				data += "&curr=KRW";
				data += "&SaveType=" + SaveType;
				
				//console.log(data);
				//trueDate = result.sdate;
				
				var LoadSaveData;
				
				// 자금일보 저장 내역이 있을 경우
				fn_ajax(url, data, function( result ){
					
					LoadSaveData = result.list;			
				
					if ( LoadSaveData.length > 0 ) {
						//console.log(LoadSaveData);
						
						//2020.07.22 김승희
						var saveDt = LoadSaveData[0].insDt;
						//2020.10.28 김승희 
						var saveSdate = LoadSaveData[0].sdate;
						
						if($("#sdate").val() == saveSdate){
							dateView(saveDt);
						}else{
							ingView();
						}
						
						
						
						/* $("#saveTimeMsg").css("color","black");
						$("#saveTimeMsg").show(); */
						
		
						for ( var i=0 in LoadSaveData ) {
						
/*							if ( LoadSaveData[i].stype != 1 && LoadSaveData[i].stype != 2 ) {
								var obj = {};
								var num = Number( LoadSaveData[i].stype)+1;
								obj.accname = LoadSaveData[i].sdata1.replace(/percent_text/gi,"%").replace(/and_text/gi,"&").replace(/dblqt/gi,"\"").replace(/gtgt/gi,"\<").replace(/ltlt/gi,"\>");
								obj.forwarddramt = LoadSaveData[i].sum1;
								obj.dramt = LoadSaveData[i].sum2;
								obj.cramt = LoadSaveData[i].sum3;
								obj.remainamt = LoadSaveData[i].sum4;						
								AUIGrid.addRow(eval("myGridID"+ num), [obj], 'last');
							} else {
								var obj = {};
								var num = Number( LoadSaveData[i].stype)+1;
								obj.remvalue = LoadSaveData[i].sdata1.replace(/percent_text/gi,"%").replace(/and_text/gi,"&").replace(/dblqt/gi,"\"").replace(/gtgt/gi,"\<").replace(/ltlt/gi,"\>");
								obj.forwarddramt = LoadSaveData[i].sum1;
								obj.dramt = LoadSaveData[i].sum2;
								obj.cramt = LoadSaveData[i].sum3;
								obj.remainamt = LoadSaveData[i].sum4;						
								AUIGrid.addRow(eval("myGridID"+ num), [obj], 'last');
							} */
							if( LoadSaveData[i].stype == 1 || LoadSaveData[i].stype == 2 ) {	// 보통예금, 외화예금
								
								var obj = {};
								var num = Number(LoadSaveData[i].stype) + 1;
								obj.remvalue = LoadSaveData[i].sdata1.replace(/percent_text/gi,"%").replace(/and_text/gi,"&").replace(/dblqt/gi,"\"").replace(/gtgt/gi,"\<").replace(/ltlt/gi,"\>");
								obj.forwarddramt = LoadSaveData[i].sum1;
								obj.dramt = LoadSaveData[i].sum2;
								obj.cramt = LoadSaveData[i].sum3;
								obj.remainamt = LoadSaveData[i].sum4;
								AUIGrid.addRow(eval("myGridID"+ num), [obj], 'last');
								
//							} else if ( LoadSaveData[i].stype == 0 ) {	// 현금
							} else if ( LoadSaveData[i].stype == 0 || LoadSaveData[i].stype == 8 ) {	// 현금, 담보 및 차입금 현황
	
								var obj = {};
								var num = Number(LoadSaveData[i].stype)+1;
								obj.accname = LoadSaveData[i].sdata1.replace(/percent_text/gi,"%").replace(/and_text/gi,"&").replace(/dblqt/gi,"\"").replace(/gtgt/gi,"\<").replace(/ltlt/gi,"\>");
								obj.forwarddramt = LoadSaveData[i].sum1;
								obj.dramt = LoadSaveData[i].sum2;
								obj.cramt = LoadSaveData[i].sum3;
								obj.remainamt = LoadSaveData[i].sum4;
								AUIGrid.addRow(eval("myGridID"+ num), [obj], 'last');
								
							} else if ( LoadSaveData[i].stype == 10 ) {	// 금융상품 변동내역
								
								var obj = {};
								var num = Number(LoadSaveData[i].stype) + 1;
								obj.accname = LoadSaveData[i].sdata1.replace(/percent_text/gi,"%").replace(/and_text/gi,"&").replace(/dblqt/gi,"\"").replace(/gtgt/gi,"\<").replace(/ltlt/gi,"\>");
								obj.type = LoadSaveData[i].sdata2.replace(/percent_text/gi,"%").replace(/and_text/gi,"&").replace(/dblqt/gi,"\"").replace(/gtgt/gi,"\<").replace(/ltlt/gi,"\>");
								obj.remrefvalueDec = LoadSaveData[i].sdata3.replace(/percent_text/gi,"%").replace(/and_text/gi,"&").replace(/dblqt/gi,"\"").replace(/gtgt/gi,"\<").replace(/ltlt/gi,"\>");
								obj.remvalueDec = LoadSaveData[i].sdata4.replace(/percent_text/gi,"%").replace(/and_text/gi,"&").replace(/dblqt/gi,"\"").replace(/gtgt/gi,"\<").replace(/ltlt/gi,"\>");
								obj.remrefvalueInc = LoadSaveData[i].sdata5.replace(/percent_text/gi,"%").replace(/and_text/gi,"&").replace(/dblqt/gi,"\"").replace(/gtgt/gi,"\<").replace(/ltlt/gi,"\>");
								obj.remvalueInc = LoadSaveData[i].sdata6.replace(/percent_text/gi,"%").replace(/and_text/gi,"&").replace(/dblqt/gi,"\"").replace(/gtgt/gi,"\<").replace(/ltlt/gi,"\>");
								obj.amount = LoadSaveData[i].sum1;
								obj.summary = LoadSaveData[i].summary.replace(/percent_text/gi,"%").replace(/and_text/gi,"&").replace(/dblqt/gi,"\"").replace(/gtgt/gi,"\<").replace(/ltlt/gi,"\>");
								AUIGrid.addRow(eval("myGridID"+ num), [obj], 'last');
								
							} else {
								
								var obj = {};
								var num = Number(LoadSaveData[i].stype) + 1;
								
								var dramt = LoadSaveData[i].sum2;
								var cramt = LoadSaveData[i].sum3;
								
								obj.accname = LoadSaveData[i].sdata1.replace(/percent_text/gi,"%").replace(/and_text/gi,"&").replace(/dblqt/gi,"\"").replace(/gtgt/gi,"\<").replace(/ltlt/gi,"\>");
								obj.remrefvalue = LoadSaveData[i].sdata2.replace(/percent_text/gi,"%").replace(/and_text/gi,"&").replace(/dblqt/gi,"\"").replace(/gtgt/gi,"\<").replace(/ltlt/gi,"\>");
								obj.remvalue = LoadSaveData[i].sdata3.replace(/percent_text/gi,"%").replace(/and_text/gi,"&").replace(/dblqt/gi,"\"").replace(/gtgt/gi,"\<").replace(/ltlt/gi,"\>");
								obj.forwarddramt = LoadSaveData[i].sum1;
								obj.dramt = dramt;
								obj.cramt = cramt;
								obj.remainamt = LoadSaveData[i].sum4;
								AUIGrid.addRow(eval("myGridID"+ num), [obj], 'last');
								
								if(dramt != 0 || cramt != 0) {
									//console.log("[" + i + "] dramt : " + dramt + ", cramt : " + cramt);
									AUIGrid.addRow(myGridID11_1, [obj], 'last');
								}
							}
							
						}
						
						setTimeout( function(){$.isLoading( "hide" );}, 10 );	
						
						if("B" == SaveType){
							 ingView();
						 }
						
					} else {
					
						// 자금일보 저장 내역이 없을 경우
						//2020.07.22 김승희
						ingView();
						
						var url = "<c:url value='/ifrs/capital/IfrsAssetListAjax1' />";
						fn_ajax(url, data, function( result ){
							
							//console.log(result.list);
							
							// 현금
							var ndata = [];
							for ( var i=0 in result.list) {
								if ( result.list[i].accseq == 5 || result.list[i].accseq == 334 ) {
									ndata.push(result.list[i]);
								}
							}					
							AUIGrid.setGridData(myGridID1, ndata);
							
							// 단기 금융상품
/*							var ndata1 = [];
							
							if ( $("#comNo").val() == '8' ) { // 메가포트(SGP)
								
								for ( var i=0 in result.list) {				 
									if ( result.list[i].accseq == 10 ) {
										ndata1.push(result.list[i]);
									}
								}					
								
								var url = "<c:url value='/ifrs/capital/IfrsAssetListAjax3?AccSeq=333&RemSeq=1004' />"; // 단기금융상품(C)
								fn_ajax(url, data, function( result1 ){
									
									for ( var u=0 in result1.list ) {
										var obj = {};
										obj.accname = result1.list[u].remvalue+"(C)";
										obj.forwarddramt = result1.list[u].forwarddramt;
										obj.dramt = result1.list[u].dramt;
										obj.cramt = result1.list[u].cramt;
										obj.remainamt = result1.list[u].remainamt;
										ndata1.push(obj);
									}
									AUIGrid.setGridData(myGridID4, ndata1);
								});					
								
							} else if ( $("#comNo").val() == '5' ) { // , 알피지(SGR)		
								
								var url = "<c:url value='/ifrs/capital/IfrsAssetListAjax3?AccSeq=333&RemSeq=1004' />"; // 단기금융상품(C)
								fn_ajax(url, data, function( result1 ){
									
									for ( var u=0 in result1.list ) {
										var obj = {};
										obj.accname = result1.list[u].remvalue+"(C)("+result1.list[u].remrefvalue+")";
										obj.forwarddramt = result1.list[u].forwarddramt;
										obj.dramt = result1.list[u].dramt;
										obj.cramt = result1.list[u].cramt;
										obj.remainamt = result1.list[u].remainamt;
										ndata1.push(obj);
									}
									
									var url = "<c:url value='/ifrs/capital/IfrsAssetListAjax3?AccSeq=10&RemSeq=1004' />"; // 단기금융상품
									fn_ajax(url, data, function( result1 ){
										
										for ( var u=0 in result1.list ) {
											var obj = {};
											obj.accname = result1.list[u].remvalue+"("+result1.list[u].remrefvalue+")";
											obj.forwarddramt = result1.list[u].forwarddramt;
											obj.dramt = result1.list[u].dramt;
											obj.cramt = result1.list[u].cramt;
											obj.remainamt = result1.list[u].remainamt;
											ndata1.push(obj);
										}
										AUIGrid.setGridData(myGridID4, ndata1);
									});								
									
								});	
								
							} else if ( $("#comNo").val() == '20') { // , 스토브				
								
								var url = "<c:url value='/ifrs/capital/IfrsAssetListAjax3?AccSeq=333&RemSeq=1004' />"; // 단기금융상품(C)
								fn_ajax(url, data, function( result1 ){
									
									for ( var u=0 in result1.list ) {
										var obj = {};
										obj.accname = result1.list[u].remvalue+"(C)";
										obj.forwarddramt = result1.list[u].forwarddramt;
										obj.dramt = result1.list[u].dramt;
										obj.cramt = result1.list[u].cramt;
										obj.remainamt = result1.list[u].remainamt;
										ndata1.push(obj);
									}
									
									var url = "<c:url value='/ifrs/capital/IfrsAssetListAjax3?AccSeq=10&RemSeq=1004' />"; // 단기금융상품(C)
									fn_ajax(url, data, function( result1 ){
										
										for ( var u=0 in result1.list ) {
											var obj = {};
											obj.accname = result1.list[u].remvalue+"(C)";
											obj.forwarddramt = result1.list[u].forwarddramt;
											obj.dramt = result1.list[u].dramt;
											obj.cramt = result1.list[u].cramt;
											obj.remainamt = result1.list[u].remainamt;
											ndata1.push(obj);
										}
										AUIGrid.setGridData(myGridID4, ndata1);
									});								
									
								});							
								
								
							} else {
								for ( var i=0 in result.list) {
									if ( result.list[i].accseq == 333 || result.list[i].accseq == 10 ) {
										ndata1.push(result.list[i]);
									}
								}			
								AUIGrid.setGridData(myGridID4, ndata1);
							}				
							
									
							
							// 장기 금융상품
							var ndata = [];
							for ( var i=0 in result.list) {
								if ( result.list[i].accseq == 61 ) {
									ndata.push(result.list[i]);
								}
							}					
							AUIGrid.setGridData(myGridID5, ndata);					
							
							
							// 단기 매매 증권
							var ndata = [];
							for ( var i=0 in result.list) {
								if ( result.list[i].accseq == 11 || result.list[i].accseq == 619 ) {
									ndata.push(result.list[i]);
								}
							}					
							AUIGrid.setGridData(myGridID6, ndata);						
							
							// 매도 가능 증권
							var ndata = [];
							for ( var i=0 in result.list) {
								if ( result.list[i].accseq == 12 || result.list[i].accseq == 57 ) {
									ndata.push(result.list[i]);
								}
							}					
							AUIGrid.setGridData(myGridID7, ndata);
			
							
							// 만기 보유 증권
							//ICM-2292 : accseq 값 58추가 연동 
							var ndata = [];
							for ( var i=0 in result.list) {
								if ( result.list[i].accseq == 13 || result.list[i].accseq == 58 ) {
									ndata.push(result.list[i]);
								}
							}					
							
							AUIGrid.setGridData(myGridID8, ndata);
							*/
							// 담보 및 차입금 현황
							
							var forwarddramt = 0;
							var dramt = 0;
							var cramt = 0;
							var remainamt = 0;
							
							for ( var i=0 in result.list) {
								if ( result.list[i].accseq == 121 || result.list[i].accseq == 106 || result.list[i].accseq == 445 ) {	// 106 : 단기차입금(금융), 121 : 장기차입금, 445 : 단기차입금(거래처)
								
									//console.log(result.list[i]);
									
									//if ( result.list[i].accseq == 121 || result.list[i].accseq == 449 ) {
									//ndata.push(result.list[i]);
									forwarddramt = forwarddramt + result.list[i].forwarddramt;
									dramt = dramt + result.list[i].dramt;
									cramt = cramt + result.list[i].cramt;
									remainamt = remainamt + result.list[i].remainamt;
									
								}
							}
							
							var ndata = [];				
							ndata.push({
								accname:"담보제공금액",
								forwarddramt:0,
								dramt:0,
								cramt:0,
								remainamt:0,
								});
							
							ndata.push({
								accname:"차입금",
								forwarddramt:forwarddramt,
								dramt:dramt,
								cramt:cramt,
								remainamt:remainamt,
								});					
							
							AUIGrid.setGridData(myGridID9, ndata);
							
							// ICM-2292 :“만기보유증권(금융)[13]”이 9)담보 및 차입금 현황에서 제외 처리
// 							for ( var i=0 in result.list) {
// 								if ( result.list[i].accseq == 13 ) {
// 									ndata.push(result.list[i]);
// 								}
// 							}
// 							AUIGrid.setGridData(myGridID9, ndata);
						});
				
						// 보통예금
 						if ( $("#comNo").val() == '20' || $("#comNo").val() == '8') { // SGS, SGP, SGR
							var url = "<c:url value='/ifrs/capital/IfrsAssetListAjax3?AccSeq=7&RemSeq=1004' />"; // 보통예금 ERP
							fn_ajax(url, data, function( result ){
								AUIGrid.setGridData(myGridID2, result.list);
							});
						} else if( $("#comNo").val() == '5' ) {
							var ndata2 = [];
							var url = "<c:url value='/ifrs/capital/IfrsAssetListAjax3?AccSeq=7&RemSeq=1004' />"; // 보통예금 ERP
							fn_ajax(url, data, function( result ){

								for ( var u=0 in result.list ) {
									var obj = {};
									obj.remvalue = result.list[u].remvalue+"("+result.list[u].remrefvalue+")";
									obj.forwarddramt = result.list[u].forwarddramt;
									obj.dramt = result.list[u].dramt;
									obj.cramt = result.list[u].cramt;
									obj.remainamt = result.list[u].remainamt;
									ndata2.push(obj);
								}
								
								AUIGrid.setGridData(myGridID2, ndata2);
							});
						} else {
							var url = "<c:url value='/ifrs/capital/IfrsAssetListAjax3?AccSeq=7&RemSeq=1003' />"; // 보통예금 ERP
							fn_ajax(url, data, function( result ){
								AUIGrid.setGridData(myGridID2, result.list);
							});
						}
						
						
						// 외화예금
						var url = "";
						if ( $("#comNo").val() == '5' ) {//SGR
							var ndata3 = [];				
							url = "<c:url value='/ifrs/capital/IfrsAssetListAjax3?AccSeq=8&RemSeq=1004' />"; // 외화예금 ERP
							fn_ajax(url, data, function( result ){
								
								for ( var u=0 in result.list ) {
									var obj = {};
									obj.remvalue = result.list[u].remvalue+"("+result.list[u].remrefvalue+")";
									obj.forwarddramt = result.list[u].forwarddramt;
									obj.dramt = result.list[u].dramt;
									obj.cramt = result.list[u].cramt;
									obj.remainamt = result.list[u].remainamt;
									ndata3.push(obj);
								}
								
								AUIGrid.setGridData(myGridID3, ndata3);
								
//								setTimeout( function(){$.isLoading( "hide" );}, 100 );
								
							});
						}else{
							url = "<c:url value='/ifrs/capital/IfrsAssetListAjax3?AccSeq=8&RemSeq=1003' />"; // 외화예금 ERP
							fn_ajax(url, data, function( result ){
								//console.log(result.list);
								AUIGrid.setGridData(myGridID3, result.list);
								
//								setTimeout( function(){$.isLoading( "hide" );}, 100 );
							});
							
						}
						
						var ndata4 = [];	// 4) 단기금융상품
						var ndata5 = [];	// 5) 장기금융상품
						var ndata6 = [];	// 6) 단기매매증권
						var ndata7 = [];	// 7) 매도가능증권
						var ndata8 = [];	// 8) 만기보유증권
						var ndata10 = [];	// 10) 기타
						var ndata11 = [];	// 11) 금융상품 변동내역 상세
						
						var url = "<c:url value='/ifrs/capital/IfrsAssetListAjax6?RemSeq=1004' />";
						fn_ajax(url, data, function( result ) {
							
							for( var i = 0 in result.list) {
								
								var dramt = result.list[i].dramt;
								var cramt = result.list[i].cramt;
								
								if( result.list[i].accseq == 10 || result.list[i].accseq == 333 ) {	// 10 : 단기금융상품, 333 : 단기금융상품(C)
									
									ndata4.push(result.list[i]);
								
									if( dramt != 0 || cramt != 0 ) {	// 기초 - 마감 간 금액 변동이 있는 경우
										
										ndata11.push(result.list[i]);
									}
									
								} else if( result.list[i].accseq == 61 ) {	// 61 : 장기금융상품
									
									ndata5.push(result.list[i]);
								
									if( dramt != 0 || cramt != 0 ) {	// 기초 - 마감 간 금액 변동이 있는 경우
										
										ndata11.push(result.list[i]);
									}
									
								} else if( result.list[i].accseq == 11 || result.list[i].accseq == 619 ) {	// 11 : 단기매매증권(금융), 619 : 단기매매증권(주식)
									
									ndata6.push(result.list[i]);
								
									if( dramt != 0 || cramt != 0 ) {	// 기초 - 마감 간 금액 변동이 있는 경우
										
										ndata11.push(result.list[i]);
									}
									
								} else if( result.list[i].accseq == 12 || result.list[i].accseq == 57 ) {	// 12 : 매도가능증권(금융), 57 : 장기매도가능증권(금융)
									
									ndata7.push(result.list[i]);
								
									if( dramt != 0 || cramt != 0 ) {	// 기초 - 마감 간 금액 변동이 있는 경우
										
										ndata11.push(result.list[i]);
									}
									
								} else if( result.list[i].accseq == 13 || result.list[i].accseq == 58 ) {	// 13 : 만기보유증권(금융), 58 : 만기보유증권(금융)_비유동
									
									ndata8.push(result.list[i]);
								
									if( dramt != 0 || cramt != 0 ) {	// 기초 - 마감 간 금액 변동이 있는 경우
										
										ndata11.push(result.list[i]);
									}
								
								} else if( result.list[i].accseq == 725 ) {	// 725 : 당기손익인식지정금융자산
									
									ndata10.push(result.list[i]);
								
									if( dramt != 0 || cramt != 0 ) {	// 기초 - 마감 간 금액 변동이 있는 경우
										
										ndata11.push(result.list[i]);
									}
								}
							}
							
							AUIGrid.setGridData(myGridID4, ndata4);
							AUIGrid.setGridData(myGridID5, ndata5);
							AUIGrid.setGridData(myGridID6, ndata6);
							AUIGrid.setGridData(myGridID7, ndata7);
							AUIGrid.setGridData(myGridID8, ndata8);
							AUIGrid.setGridData(myGridID10, ndata10);
							AUIGrid.setGridData(myGridID11_1, ndata11);
							
							setTimeout( function(){$.isLoading( "hide" );}, 100 );
						});
					
					}
					
					var ndata11_2 = [];	// ①-2 금융상품 변동내역(출금-감소)
					
					data = "comNo=" + $("#comNo").val();
					data += "&sdate=" + $("#sdate").val();
					url = "<c:url value='/ifrs/capital/IfrsAssetListAjax7' />";
					fn_ajax(url, data, function( result ) {
						
						var result_arr1 = [];
						
						for( var i = 0 in result.list ) {
						
							result_arr1.push({
								accseq : result.list[i].accseq,
								accname : result.list[i].accname,
								remseqname2 : result.list[i].remvalname1,
								remseqname1 : result.list[i].bankaccno,
								summary : result.list[i].summary,
								cramt : result.list[i].cramt
							});
						}
						
						AUIGrid.setGridData(myGridID11_2, result_arr1);
						var sortingInfo = [{ dataField : "cramt", sortType : -1 }];
					});
					
					var ndata11_3 = [];	// ①-3 금융상품 변동내역(입금-증가)
					data = "comNo=" + $("#comNo").val();
					data += "&sdate=" + $("#sdate").val();
					url = "<c:url value='/ifrs/capital/IfrsERPINListAjax' />";
					fn_ajax(url, data, function( result ) {
						
						for( var i = 0 in result.list) {
							if( result.list[i].accseq != 7 && result.list[i].accseq != 8 ) {
								
								ndata11_3.push(result.list[i]);
							}
						}
						AUIGrid.setGridData(myGridID11_3, ndata11_3);
					});
				});
			});
		}
		
		$("#btnSelect").unbind("click");
		$("#btnSelect").click(function(){
			fn_selectList("R");
		});
		
		$("#btnSelect2").unbind("click");
		$("#btnSelect2").click(function(){
			fn_selectList("B");
		});		
		
		$("#btnReset").unbind("click");
		$("#btnReset").click(function(){
			AUIGrid_reset();			
		});
		
		// 법인선택 Select2
		$("#comNo").select2();
		
		// 법인 선택 시
		$("#comNo").change(function(){
			AUIGrid_reset();
		});
		
		// 일자 선택
		$("#sdate").datepicker({
			dateFormat:'yymmdd',
			changeMonth: true,
			changeYear: true
		});
		
		// 버튼 툴팁 적용
		$('[data-toggle="tooltip"]').tooltip(); 
		
		// 엑셀 저장 버튼
		$('.exceldown').unbind("click");
		$('.exceldown').click(function () {
			var wrapId = $(this).attr("name");
			var exportProps = {fileName : wrapId};
			AUIGrid.setProp("#"+ wrapId, "exportURL", "/ifrs/capital/export.do");			
			AUIGrid.exportToXlsx("#"+ wrapId, true, exportProps);
		});
		
		
		// 초기화
		$("#btnReset").unbind("click");
		$("#btnReset").click(function(){
			AUIGrid_reset();
			var data = "companyseq=" + $("#comNo").val();
			data += "&sdate=" + $("#sdate").val();
			var xml = "<ROOT></ROOT>";
			data += "&xml=" + xml;
			data += "&SaveType=A";
			
			//console.log(data);
			
			var url = "<c:url value='/ifrs/capital/IfrsAssetINSetSave' />";
			fn_ajax(url, data, function( result ){
				//$("#confirmmodal").modal('toggle');
				msg("초기화 되었습니다.");
			});		
			
		});
		
		
		// 자금일보 저장
		$('#btnSave').unbind("click");
		$('#btnSave').click(function () {
			$("#confirmmodal").modal({ show: true });
		});
		
		
		$('#save_row1, #btnSaveBak').unbind("click");
		$('#save_row1, #btnSaveBak').click(function () {
			
			var id = $(this).attr("id");
			
			var SaveType = "";
			
			if ( id == 'save_row1' ) {
				SaveType = "R";

			} else {
				SaveType = "B";
				
				//2020.07.22 김승희
				ingView();
				
			}
			
			//console.log(SaveType);
			
			var data = "companyseq=" + $("#comNo").val();
			data += "&sdate=" + $("#sdate").val();
			data += "&SaveType=" + SaveType;
						
			var checkedItems = [];
			var checkedItems1 = AUIGrid.getGridData(myGridID1);
			var checkedItems2 = AUIGrid.getGridData(myGridID2);
			var checkedItems3 = AUIGrid.getGridData(myGridID3);
			var checkedItems4 = AUIGrid.getGridData(myGridID4);
			var checkedItems5 = AUIGrid.getGridData(myGridID5);
			var checkedItems6 = AUIGrid.getGridData(myGridID6);
			var checkedItems7 = AUIGrid.getGridData(myGridID7);
			var checkedItems8 = AUIGrid.getGridData(myGridID8);
			var checkedItems9 = AUIGrid.getGridData(myGridID9);
			var checkedItems10 = AUIGrid.getGridData(myGridID10);
			var checkedItems11 = AUIGrid.getGridData(myGridID11);
			
			checkedItems.push(checkedItems1);
			checkedItems.push(checkedItems2);
			checkedItems.push(checkedItems3);
			checkedItems.push(checkedItems4);
			checkedItems.push(checkedItems5);
			checkedItems.push(checkedItems6);
			checkedItems.push(checkedItems7);
			checkedItems.push(checkedItems8);
			checkedItems.push(checkedItems9);
			checkedItems.push(checkedItems10);
			checkedItems.push(checkedItems11);
			
			//console.log(checkedItems);
			
			//2020.07.22 김승희 시간구하기.. 
			var getNowDate = getTimeStamp();
			
			var xml = "<ROOT>";

			for(var i=0 in checkedItems) {
				
				var panelTitle = "";
				
				switch(i) {
					case "0" :
						panelTitle = "1) 현금";
						break;
					case "1" :
						panelTitle = "2) 보통예금";
						break;
					case "2" :
						panelTitle = "3) 외화예금";
						break;
					case "3" :
						panelTitle = "4) 단기금융상품";
						break;
					case "4" :
						panelTitle = "5) 장기금융상품";
						break;
					case "5" :
						panelTitle = "6) 단기매매증권";
						break;
					case "6" :
						panelTitle = "7) 매도가능증권";
						break;
					case "7" :
						panelTitle = "8) 만기보유증권";
						break;
					case "8" :
						panelTitle = "9) 담보 및 차입금 현황";
						break;
					case "9" :
						panelTitle = "10) 기타";
						break;
					default :
						panelTitle = "② 금융상품 변동내역";
				}
				//console.log("[" + i + "] : " + panelTitle);
							
				for(var z=0 in checkedItems[i]) {
					xml += "<DATAROW ";					
					xml += " stype=\"" + i + "\"";
					xml += " companyseq=\"" + $("#comNo").val() + "\"";
					xml += " sdate=\"" + $("#sdate").val() + "\"";
					
					var accname = "";			/* 계정명 */
					var remrefvalue = "";		/* 금융기관 */
					var remvalue = "";			/* 계좌번호 */
					
					var forwarddramt = 0;		/* 기초 */
					var dramt = 0;				/* 입금_증가 */
					var cramt = 0;				/* 출금_감소 */
					var remainamt = 0;			/* 마감 */
					
					var type = "";				/* 금융상품 변동내역 > 구분 ( 가입, 추가가입, 연장, 해지, 이자, 상환 ) */
					var remrefvalueDec = "";	/* 금융상품 변동내역 > 출금_감소 > 거래처 */
					var remvalueDec = "";		/* 금융상품 변동내역 > 출금_감소 > 계좌번호 */
					var remrefvalueInc = "";	/* 금융상품 변동내역 > 입금_증가 > 거래처 */
					var remvalueInc = "";		/* 금융상품 변동내역 > 입금_증가 > 계좌번호 */
					var amount = 0;				/* 금융상품 변동내역 > 금액 */
					var summary = "";			/* 금융상품 변동내역 > 내용 */
					
					if ( typeof(checkedItems[i][z].forwarddramt) == "string" ) {
						
						forwarddramt = Number(checkedItems[i][z].forwarddramt.replace(/,/gi,""));
						
					} else {
						
						forwarddramt = checkedItems[i][z].forwarddramt;
					}
					
					if ( typeof(checkedItems[i][z].dramt) == "string" ) {
						
						dramt = Number(checkedItems[i][z].dramt.replace(/,/gi,""));
						
					} else {
						
						dramt = checkedItems[i][z].dramt;
					}
					
					if ( typeof(checkedItems[i][z].cramt) == "string" ) {
						
						cramt = Number(checkedItems[i][z].cramt.replace(/,/gi,""));
						
					} else {
						
						cramt = checkedItems[i][z].cramt;
					}
					
					if ( typeof(checkedItems[i][z].remainamt) == "string" ) {
						
						remainamt = Number(checkedItems[i][z].remainamt.replace(/,/gi,""));
						
					} else {
						
						remainamt = checkedItems[i][z].remainamt;
					}
					
					if ( i == 1 || i == 2 ) {
						
						remvalue = checkedItems[i][z].remvalue;
						//console.log("[" + i + "][" + z + "] remvalue : " + remvalue);
						
						if( typeof remvalue == "undefined" || remvalue == "" ) {
							
							alert("'" + panelTitle + "'의 구분을 입력해 주세요.");
							return;
						}
						
						xml += " sdata1=\"" + remvalue.replace(/%/gi,"percent_text").replace(/&/gi,"and_text").replace(/\"/gi,"dblqt").replace(/\</gi,"gtgt").replace(/\>/gi,"ltlt") + "\"";
						xml += " sdata2=\"\"";
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
						xml += " sdata6=\"\"";
						xml += " summary=\"\"";
						
//					} else if ( i == 0 ) {
					} else if ( i == 0 || i == 8 ) {	// ICM-12242 : '담보 및 차입금 현황'을 계정별 집계 금액으로 표시 ( 2022-05-19 : 김연준 )
						
						accname = checkedItems[i][z].accname;
						//console.log("[" + i + "][" + z + "] accname : " + accname);
						
						if( typeof accname == "undefined" || accname == "" ) {
							
							alert("'" + panelTitle + "'의 계정명을 입력해 주세요.");
							return;
						}

						xml += " sdata1=\"" + accname.replace(/%/gi,"percent_text").replace(/&/gi,"and_text").replace(/\"/gi,"dblqt").replace(/\</gi,"gtgt").replace(/\>/gi,"ltlt") + "\"";
						xml += " sdata2=\"\"";
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
						xml += " sdata6=\"\"";
						xml += " summary=\"\"";
						
					} else if ( i == 10 ) {
						
						accname = checkedItems[i][z].accname;
						type = checkedItems[i][z].type;
						remrefvalueDec = checkedItems[i][z].remrefvalueDec;
						remvalueDec = checkedItems[i][z].remvalueDec;
						remrefvalueInc = checkedItems[i][z].remrefvalueInc;
						remvalueInc = checkedItems[i][z].remvalueInc;
						summary = checkedItems[i][z].summary;
/*						console.log("[" + i + "][" + z + "] accname : " + accname);
						console.log("[" + i + "][" + z + "] type : " + type);
						console.log("[" + i + "][" + z + "] remrefvalueDec : " + remrefvalueDec);
						console.log("[" + i + "][" + z + "] remvalueDec : " + remvalueDec);
						console.log("[" + i + "][" + z + "] remrefvalueInc : " + remrefvalueInc);
						console.log("[" + i + "][" + z + "] remvalueInc : " + remvalueInc);
						console.log("[" + i + "][" + z + "] summary : " + summary); */
						
						if( typeof accname == "undefined" || accname == "" ) {
							
							alert("'" + panelTitle + "'의 계정명을 입력해 주세요.");
							return;
							
						} else if( typeof type == "undefined" || type == "" ) {
							
							alert("'" + panelTitle + "'의 구분을 선택해 주세요.");
							return;
							
						} else if( typeof remrefvalueDec == "undefined" || remrefvalueDec == "" ) {
							
							alert("'" + panelTitle + "'의 출금_감소 거래처를 입력해 주세요.");
							return;
							
						} else if( typeof remvalueDec == "undefined" || remvalueDec == "" ) {
							
							alert("'" + panelTitle + "'의 출금_감소 계좌번호를 입력해 주세요.");
							return;
							
						} else if( typeof remrefvalueInc == "undefined" || remrefvalueInc == "" ) {
							
							alert("'" + panelTitle + "'의 입금_증가 거래처를 입력해 주세요.");
							return;
							
						} else if( remvalueInc == "" ) {
							
							alert("'" + panelTitle + "'의 입금_증가 계좌번호를 입력해 주세요.");
							return;
							
						} else if( summary == "" ) {
							
							alert("'" + panelTitle + "'의 내용을 입력해 주세요.");
							return;
						}
						
						if ( typeof(checkedItems[i][z].amount) == "string" ) {
							
							amount = Number(checkedItems[i][z].amount.replace(/,/gi,""));
							
						} else {
							
							amount = checkedItems[i][z].amount;
						}
						
						xml += " sdata1=\"" + accname.replace(/%/gi,"percent_text").replace(/&/gi,"and_text").replace(/\"/gi,"dblqt").replace(/\</gi,"gtgt").replace(/\>/gi,"ltlt") + "\"";
						xml += " sdata2=\"" + type + "\"";
						xml += " sdata3=\"" + remrefvalueDec.replace(/%/gi,"percent_text").replace(/&/gi,"and_text").replace(/\"/gi,"dblqt").replace(/\</gi,"gtgt").replace(/\>/gi,"ltlt") + "\"";
						xml += " sdata4=\"" + remvalueDec.replace(/%/gi,"percent_text").replace(/&/gi,"and_text").replace(/\"/gi,"dblqt").replace(/\</gi,"gtgt").replace(/\>/gi,"ltlt") + "\"";
						xml += " sdata5=\"" + remrefvalueInc.replace(/%/gi,"percent_text").replace(/&/gi,"and_text").replace(/\"/gi,"dblqt").replace(/\</gi,"gtgt").replace(/\>/gi,"ltlt") + "\"";
						xml += " sum1=\"" + amount + "\"";
						xml += " sum2=\"0\"";
						xml += " sum3=\"0\"";
						xml += " sum4=\"0\"";
						xml += " sum5=\"0\"";
						xml += " sum6=\"0\"";
						xml += " sum7=\"0\"";
						xml += " sum8=\"0\"";
						xml += " sum9=\"0\"";
						xml += " sdata6=\"" + remvalueInc.replace(/%/gi,"percent_text").replace(/&/gi,"and_text").replace(/\"/gi,"dblqt").replace(/\</gi,"gtgt").replace(/\>/gi,"ltlt") + "\"";
						xml += " summary=\"" + summary.replace(/%/gi,"percent_text").replace(/&/gi,"and_text").replace(/\"/gi,"dblqt").replace(/\</gi,"gtgt").replace(/\>/gi,"ltlt") + "\"";
						
					} else {
						
						accname = checkedItems[i][z].accname;
						remrefvalue = checkedItems[i][z].remrefvalue;
						remvalue = checkedItems[i][z].remvalue;
/*						console.log("[" + i + "][" + z + "] accname : " + accname);
						console.log("[" + i + "][" + z + "] remrefvalue : " + remrefvalue);
						console.log("[" + i + "][" + z + "] remvalue : " + remvalue); */
						
						if( typeof accname == "undefined" || accname == "" ) {
							
							alert("'" + panelTitle + "'의 계정명을 입력해 주세요.");
							return;
							
						} else if ( i != 8 && ( typeof remrefvalue == "undefined" || remrefvalue == "" )) {
							
							alert("'" + panelTitle + "'의 거래처를 입력해 주세요.");
							return;
							
						} else if ( i != 8 && ( typeof remvalue == "undefined" || remvalue == "" )) {
							
							alert("'" + panelTitle + "'의 계좌번호를 입력해 주세요.");
							return;
						}
						
						xml += " sdata1=\"" + accname.replace(/%/gi,"percent_text").replace(/&/gi,"and_text").replace(/\"/gi,"dblqt").replace(/\</gi,"gtgt").replace(/\>/gi,"ltlt") + "\"";
						xml += " sdata2=\"" + remrefvalue.replace(/%/gi,"percent_text").replace(/&/gi,"and_text").replace(/\"/gi,"dblqt").replace(/\</gi,"gtgt").replace(/\>/gi,"ltlt") + "\"";
						xml += " sdata3=\"" + remvalue.replace(/%/gi,"percent_text").replace(/&/gi,"and_text").replace(/\"/gi,"dblqt").replace(/\</gi,"gtgt").replace(/\>/gi,"ltlt") + "\"";
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
						xml += " sdata6=\"\"";
						xml += " summary=\"\"";
					}
					
					//if ( id == 'save_row1' ) {
						//2020.07.21 김승희 유저아이디 xml 에 추가
						xml += " ins_id=\"" + userId + "\"";
						xml += " ins_dt=\"" + getNowDate + "\"";
						xml += " upt_id=\"" + userId + "\"";
						xml += " upt_dt=\"" + getNowDate + "\"";
					//}
					
					xml += "></DATAROW>";				
				}								
				
			}
			
			xml += "</ROOT>";		
			
			xml = xml.replace(/undefined/gi,"0");
		
			data += "&xml=" + xml;
									
			//console.log(data);

			var url = "<c:url value='/ifrs/capital/IfrsAssetINSetSave' />";
			fn_ajax(url, data, function( result ){
				if ( id == 'save_row1' ) {
				$("#confirmmodal").modal('toggle');
				
				//2020.07.22 김승희
				var saveDt = getNowDate;
				dateView(saveDt);
				
				}
				msg("적용 되었습니다.");
				
				fn_selectList("R"); // 조회
			});		
			
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

		$("#sdate").val(year + "" + month + "" + day);
		
		// 전일조회
		
		$("#btnPrev").unbind("click");
		$("#btnPrev").click(function(){
			
			if(!isDate($("#sdate").val())){
				alert("<spring:message code='capital.date.validation' />");
				$("#sdate").focus();
				return;
			}
			
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
			
			$("#sdate").val(year + "" + month + "" + day);	
			
			fn_selectList("R"); // 조회
		});
		
		// 다음날조회
		$("#btnNext").unbind("click");
		$("#btnNext").click(function(){
			
			if(!isDate($("#sdate").val())){
				alert("<spring:message code='capital.date.validation' />");
				$("#sdate").focus();
				return;
			}
			
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
			
			$("#sdate").val(year + "" + month + "" + day);	
			
			fn_selectList("R"); // 조회
		});		
		

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
		
		
		// 행추가/삭제
		$('.rowedit').unbind("click");
		$('.rowedit').click(function () {
			
			if ( $(this).attr("id") == "add_row" ) { // 행추가
				var item = new Object();
				var rowPos = "last";
				item.accno = "";
				item.accname = "";
				item.forwarddramt = "";
				item.dramt = "";
				item.cramt = "";
				item.remainamt = "";
									
				AUIGrid.addRow("#" + $(this).attr("name"), item, rowPos);
			}
			
			if ( $(this).attr("id") == "del_row" ) { // 행삭제								
				var rowPos = AUIGrid.getGridData("#" + $(this).attr("name")).length - 1;				
				//console.log(rowPos);				
				AUIGrid.removeRow("#" + $(this).attr("name"), rowPos);				
			}
			
		});
		
/* 		$("#comNo").val('2').change();
		$("#sdate").val('20170103'); */
		
		AUIGrid_reset();
	});
	
	
	function cellEditEndBeforeHandler(event) {	// 마감 금액 자동 계산	
		
		//console.log(event.dataField);
		if ( event.dataField != "accname" && event.dataField != "remvalue" && event.dataField != "remrefvalue" ) {
		
			var value = 0;
			var nowvalue = Number(event.value.toFixed(2));
			
			if ( $.type( nowvalue ) == "string" ) {
				nowvalue = nowvalue.replace(/,/gi,"");
			}
			
			if ( event.dataField == "forwarddramt" ) {
				
				value = Number(nowvalue) + event.item.dramt - event.item.cramt;
				
			} else if ( event.dataField == "dramt" ) {
				
				value = event.item.forwarddramt + Number(nowvalue) - event.item.cramt;
				
			} else if ( event.dataField == "cramt" ) {
				
				value = event.item.forwarddramt + event.item.dramt - Number(nowvalue);
			}
			
			AUIGrid.updateRow(event.pid, { "remainamt" : value }, event.rowIndex);
			
			return nowvalue;
		
		} else {
			return event.value;	
		}	
		
	}
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
		
		if (dtMonth < 1 || dtMonth > 12 || dtYear.length != 4)
			return false;
		else if (dtDay < 1 || dtDay > 31 || dtDay.length != 2)
			return false;
		else if ((dtMonth == 4 || dtMonth == 6 || dtMonth == 9 || dtMonth == 11) && dtDay == 31 || dtMonth.length != 2)
			return false;
		else if (dtMonth == 2) {
			var isleap = (dtYear % 4 == 0 && (dtYear % 100 != 0 || dtYear % 400 == 0));
			if (dtDay > 29 || (dtDay == 29 && !isleap))
				return false;
		}
		return true;
	}
	
	
	function getTimeStamp() {
		var d = new Date();
		var s =
		leadingZeros(d.getFullYear(), 4) + '-' +
		leadingZeros(d.getMonth() + 1, 2) + '-' +
		leadingZeros(d.getDate(), 2) + ' ' +

		leadingZeros(d.getHours(), 2) + ':' +
		leadingZeros(d.getMinutes(), 2) + ':' +
		leadingZeros(d.getSeconds(), 2);

		return s;
	}
	
	function getTimeStamp2(val) {
		
		if("" == val || null == val){
			return "";
		}
		
		//var d = new Date(val);
		//var d = new Date(val.replace(/[.-]/gi, "/"));
		
		var str;
		if( isNaN(val) ){
			str = val.replace("-","/"); //IE 에서 오류나서 수정함
		} else {
			str=val;
		}
		
		var d = new Date(str);
		
		var s =
		leadingZeros(d.getFullYear(), 4) + '-' +
		leadingZeros(d.getMonth() + 1, 2) + '-' +
		leadingZeros(d.getDate(), 2) + ' ' +

		leadingZeros(d.getHours(), 2) + ':' +
		leadingZeros(d.getMinutes(), 2) + ':' +
		leadingZeros(d.getSeconds(), 2);

		return s;
	}


	
	function leadingZeros(n, digits) {
		var zero = '';
		n = n.toString();

		if (n.length < digits) {
		for (i = 0; i < digits - n.length; i++)
			zero += '0';
		}
		return zero + n;
	}
	
	function dateView(saveDt){
		//2020.07.22 김승희
		//var saveDt = getNowDate;
		var saveDate = getTimeStamp2(saveDt);
		$("#ingMsg").html("저장됨");
		$("#ingMsg").css("color","black");
		$("#ingMsg").show();
		
		if("" == saveDate){
			$("#saveTimeMsg").html("");
		}else{
			$("#saveTimeMsg").html("최종 저장 일시 " + saveDate);
		}
		
		$("#saveTimeMsg").css("color","black");
		$("#saveTimeMsg").show();
	}
	
	function ingView(){
		//2020.07.22 김승희
		$("#ingMsg").html("작성중...");
		$("#ingMsg").css("color","blue");
		$("#ingMsg").show();
		
		$("#saveTimeMsg").hide();
	}




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
			2.전사권한이거나 , W, A 권한이 있으면 registAuth 으로 체크값 비교 가능 (기본적으로 등록, 수정 버튼)
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
							<c:choose>
								<c:when test="${locale eq 'ko'}"><option value="${list.COM_NO }">${list.COM_NM}</option></c:when>
								<c:otherwise><option value="${list.COM_NO }">${list.COM_NM_EN}</option></c:otherwise>
							</c:choose>
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
				
				<div style="float:left;">
					&nbsp;&nbsp;
					<button class="btn btn-default btn-sm" type="button" id="btnSelect"><spring:message code='capital.search'/></button>
					<c:if test="${registAuth eq 'Y' }" >
						<%-- <button class="btn btn-primary btn-sm" type="button" id="btnSave"><spring:message code='capital.saveCashPosition'/></button> --%>
						<button class="btn btn-default btn-sm" type="button" id="btnSaveBak"><spring:message code='capital.temporarySave'/></button>
					</c:if>
					<button class="btn btn-default btn-sm" type="button" id="btnSelect2"><spring:message code='capital.searchFrom'/></button>
					<button class="btn btn-danger btn-sm" type="button" id="btnReset"><spring:message code='capital.init'/></button>
					
					
				</div>
				
				<!-- 2020.07.22 김승희 추가 -->
				<div class="pull-right">
					<font color="black" id="saveTimeMsg" style="display:none"></font>
					&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
					<font color="blue" id="ingMsg" style="display:none">작성중...</font>
					&nbsp;&nbsp;&nbsp;&nbsp;
					<c:if test="${registAuth eq 'Y' }" >
						<button class="btn btn-primary btn-sm" type="button" id="btnSave"><spring:message code='capital.saveCashPosition'/></button>
					</c:if> 
				</div>
				
			</div>
		</div> 			






		<div style="width:1650px;height:269px;">
			
			<div class="panel panel-default" style="width:795px;height:259px;color:black;float:left;">
			
				<div class="panel-heading clearfix">
					<div class="panel-title pull-left" style="font-size:12px;"><b>1) <spring:message code='capital.cash'/></b></div>
					<div class="btn-group pull-right">
						<i class="glyphicon glyphicon-plus ahref rowedit" aria-hidden="true" data-toggle="tooltip" title="<spring:message code='capital.addRow'/>" id="add_row" name="grid_wrap1"></i>
						<i class="glyphicon glyphicon-minus ahref rowedit" aria-hidden="true" data-toggle="tooltip" title="<spring:message code='capital.delRow'/>" id="del_row" name="grid_wrap1"></i>
						<i class="glyphicon glyphicon-export ahref exceldown" aria-hidden="true" name="grid_wrap1"></i>
					</div>	
				</div>
				
				<div class="panel-body" style="width:795px;height:219px;color:black;float:left;">
					<div id="grid_wrap1" style="width:100%;height:100%;color:black">
					</div>
				</div>
			</div>
			
			<div style="width:10px;height:269px;float:left;">
			</div>

			<div class="panel panel-default" style="width:795px;height:259px;color:black;float:left;">

				<div class="panel-heading clearfix">
					<div class="panel-title pull-left" style="font-size:12px;"><b>2) <spring:message code='capital.savingAccount'/></b></div>
					<div class="btn-group pull-right">
						<i class="glyphicon glyphicon-plus ahref rowedit" aria-hidden="true" data-toggle="tooltip" title="<spring:message code='capital.addRow'/>" id="add_row" name="grid_wrap2"></i>
						<i class="glyphicon glyphicon-minus ahref rowedit" aria-hidden="true" data-toggle="tooltip" title="<spring:message code='capital.delRow'/>" id="del_row" name="grid_wrap2"></i>
						<i class="glyphicon glyphicon-export ahref exceldown" aria-hidden="true" name="grid_wrap2"></i>
					</div>
				</div>
	
				<div class="panel-body" style="width:795px;height:219px;color:black;float:left;">
					<div id="grid_wrap2" style="width:100%;height:100%;color:black">
					</div>
				</div>
			</div>

		</div>








		<div style="width:1650px;height:269px;">

			<div class="panel panel-default" style="width:795px;height:259px;color:black;float:left;">
			
				<div class="panel-heading clearfix">
					<div class="panel-title pull-left" style="font-size:12px;"><b>3) <spring:message code='capital.foreignCurrencyDeposit'/></b></div>
					<div class="btn-group pull-right">
						<i class="glyphicon glyphicon-plus ahref rowedit" aria-hidden="true" data-toggle="tooltip" title="<spring:message code='capital.addRow'/>" id="add_row" name="grid_wrap3"></i>
						<i class="glyphicon glyphicon-minus ahref rowedit" aria-hidden="true" data-toggle="tooltip" title="<spring:message code='capital.delRow'/>" id="del_row" name="grid_wrap3"></i>
						<i class="glyphicon glyphicon-export ahref exceldown" aria-hidden="true" name="grid_wrap3"></i>
					</div>	
				</div>

				<div class="panel-body" style="width:795px;height:219px;color:black;float:left;">
					<div id="grid_wrap3" style="width:100%;height:100%;color:black">
					</div>
				</div>
			</div>

			<div style="width:10px;height:269px;float:left;">
			</div>

			<div class="panel panel-default" style="width:795px;height:259px;color:black;float:left;">

				<div class="panel-heading clearfix">
					<div class="panel-title pull-left" style="font-size:12px;"><b>4) <spring:message code='capital.shortTermFinInst'/></b></div>
					<div class="btn-group pull-right">
						<i class="glyphicon glyphicon-plus ahref rowedit" aria-hidden="true" data-toggle="tooltip" title="<spring:message code='capital.addRow'/>" id="add_row" name="grid_wrap4"></i>
						<i class="glyphicon glyphicon-minus ahref rowedit" aria-hidden="true" data-toggle="tooltip" title="<spring:message code='capital.delRow'/>" id="del_row" name="grid_wrap4"></i>
						<i class="glyphicon glyphicon-export ahref exceldown" aria-hidden="true" name="grid_wrap4"></i>
					</div>
				</div>

				<div class="panel-body" style="width:795px;height:219px;color:black;float:left;">
					<div id="grid_wrap4" style="width:100%;height:100%;color:black">
					</div>
				</div>
			</div>

		</div>










		<div style="width:1650px;height:269px;">

			<div class="panel panel-default" style="width:795px;height:259px;color:black;float:left;">

				<div class="panel-heading clearfix">
					<div class="panel-title pull-left" style="font-size:12px;"><b>5) <spring:message code='capital.longTermFinInst'/></b></div>
					<div class="btn-group pull-right">
						<i class="glyphicon glyphicon-plus ahref rowedit" aria-hidden="true" data-toggle="tooltip" title="<spring:message code='capital.addRow'/>" id="add_row" name="grid_wrap5"></i>
						<i class="glyphicon glyphicon-minus ahref rowedit" aria-hidden="true" data-toggle="tooltip" title="<spring:message code='capital.delRow'/>" id="del_row" name="grid_wrap5"></i>
						<i class="glyphicon glyphicon-export ahref exceldown" aria-hidden="true" name="grid_wrap5"></i>
					</div>	
				</div>

				<div class="panel-body" style="width:795px;height:219px;color:black;float:left;">
					<div id="grid_wrap5" style="width:100%;height:100%;color:black">
					</div>
				</div>
			</div>			

			<div style="width:10px;height:269px;float:left;">
			</div>

			<div class="panel panel-default" style="width:795px;height:259px;color:black;float:left;">

				<div class="panel-heading clearfix">
					<div class="panel-title pull-left" style="font-size:12px;"><b>6) <spring:message code='capital.shortTermTradSec'/></b></div>
					<div class="btn-group pull-right">
						<i class="glyphicon glyphicon-plus ahref rowedit" aria-hidden="true" data-toggle="tooltip" title="<spring:message code='capital.addRow'/>" id="add_row" name="grid_wrap6"></i>
						<i class="glyphicon glyphicon-minus ahref rowedit" aria-hidden="true" data-toggle="tooltip" title="<spring:message code='capital.delRow'/>" id="del_row" name="grid_wrap6"></i>
						<i class="glyphicon glyphicon-export ahref exceldown" aria-hidden="true" name="grid_wrap6"></i>
					</div>
				</div>

				<div class="panel-body" style="width:795px;height:219px;color:black;float:left;">
					<div id="grid_wrap6" style="width:100%;height:100%;color:black">
					</div>
				</div>
			</div>

		</div>










		<div style="width:1650px;height:269px;">

			<div class="panel panel-default" style="width:795px;height:259px;color:black;float:left;">

				<div class="panel-heading clearfix">
					<div class="panel-title pull-left" style="font-size:12px;"><b>7) <spring:message code='capital.assetAvailableSale'/></b></div>
					<div class="btn-group pull-right">
						<i class="glyphicon glyphicon-plus ahref rowedit" aria-hidden="true" data-toggle="tooltip" title="<spring:message code='capital.addRow'/>" id="add_row" name="grid_wrap7"></i>
						<i class="glyphicon glyphicon-minus ahref rowedit" aria-hidden="true" data-toggle="tooltip" title="<spring:message code='capital.delRow'/>" id="del_row" name="grid_wrap7"></i>
						<i class="glyphicon glyphicon-export ahref exceldown" aria-hidden="true" name="grid_wrap7"></i>
					</div>	
				</div>

				<div class="panel-body" style="width:795px;height:219px;color:black;float:left;">
					<div id="grid_wrap7" style="width:100%;height:100%;color:black">
					</div>
				</div>
			</div>

			<div style="width:10px;height:269px;float:left;">
			</div>

			<div class="panel panel-default" style="width:795px;height:259px;color:black;float:left;">

				<div class="panel-heading clearfix">
					<div class="panel-title pull-left" style="font-size:12px;"><b>8) <spring:message code='capital.heldtoMaturity'/></b></div>
					<div class="btn-group pull-right">
						<i class="glyphicon glyphicon-plus ahref rowedit" aria-hidden="true" data-toggle="tooltip" title="<spring:message code='capital.addRow'/>" id="add_row" name="grid_wrap8"></i>
						<i class="glyphicon glyphicon-minus ahref rowedit" aria-hidden="true" data-toggle="tooltip" title="<spring:message code='capital.delRow'/>" id="del_row" name="grid_wrap8"></i>
						<i class="glyphicon glyphicon-export ahref exceldown" aria-hidden="true" name="grid_wrap8"></i>
					</div>
				</div>

				<div class="panel-body" style="width:795px;height:219px;color:black;float:left;">
					<div id="grid_wrap8" style="width:100%;height:100%;color:black">
					</div>
				</div>
			</div>

		</div>



		<div style="width:1650px;height:269px;">

			<div class="panel panel-default" style="width:795px;height:259px;color:black;float:left;">

				<div class="panel-heading clearfix">
					<div class="panel-title pull-left" style="font-size:12px;"><b>9) <spring:message code='capital.secLoanState'/></b></div>
					<div class="btn-group pull-right">
						<i class="glyphicon glyphicon-plus ahref rowedit" aria-hidden="true" data-toggle="tooltip" title="<spring:message code='capital.addRow'/>" id="add_row" name="grid_wrap9"></i>
						<i class="glyphicon glyphicon-minus ahref rowedit" aria-hidden="true" data-toggle="tooltip" title="<spring:message code='capital.delRow'/>" id="del_row" name="grid_wrap9"></i>
						<i class="glyphicon glyphicon-export ahref exceldown" aria-hidden="true" name="grid_wrap9"></i>
					</div>	
				</div>

				<div class="panel-body" style="width:795px;height:219px;color:black;float:left;">
					<div id="grid_wrap9" style="width:100%;height:100%;color:black">
					</div>
				</div>
			</div>

			<div style="width:10px;height:269px;float:left;">
			</div>

			<div class="panel panel-default" style="width:795px;height:259px;color:black;float:left;">

				<div class="panel-heading clearfix">
					<div class="panel-title pull-left" style="font-size:12px;"><b>10) <spring:message code='capital.etc'/></b></div>
					<div class="btn-group pull-right">
						<i class="glyphicon glyphicon-plus ahref rowedit" aria-hidden="true" data-toggle="tooltip" title="<spring:message code='capital.addRow'/>" id="add_row" name="grid_wrap10"></i>
						<i class="glyphicon glyphicon-minus ahref rowedit" aria-hidden="true" data-toggle="tooltip" title="<spring:message code='capital.delRow'/>" id="del_row" name="grid_wrap10"></i>
						<i class="glyphicon glyphicon-export ahref exceldown" aria-hidden="true" name="grid_wrap10"></i>
					</div>
				</div>

				<div class="panel-body" style="width:795px;height:219px;color:black;float:left;">
					<div id="grid_wrap10" style="width:100%;height:100%;color:black">
					</div>
				</div>
			</div>

		</div>



		<div style="width:1650px;height:1076px;">

			<div class="panel panel-default" style="width:1600px;height:1066px;color:black;float:left;">

				<div class="panel-heading clearfix">
					<div class="panel-title pull-left" style="font-size:12px;"><b>11) <spring:message code='capital.financialProductsChangesDetail'/></b></div>
				</div>
				
				<div class="panel-heading clearfix">
					<div class="panel-title pull-left" style="font-size:12px;"><b>①-1 <spring:message code='capital.financialInstututionAccount'/></b></div>
					<div class="btn-group pull-right">
						<i class="glyphicon glyphicon-export ahref exceldown" aria-hidden="true" name="grid_wrap11_1"></i>
					</div>
				</div>
				
				<div class="panel-body" style="width:1600px;height:219px;color:black;">
					<div id="grid_wrap11_1" style="width:100%;height:100%;color:black">
					</div>
				</div>
				
				<div class="panel-heading clearfix border-top-style">
					<div class="panel-title pull-left" style="font-size:12px;"><b>①-2 <spring:message code='capital.financialProductsChangesWithdrawal'/></b></div>
					<div class="btn-group pull-right">
						<i class="glyphicon glyphicon-export ahref exceldown" aria-hidden="true" name="grid_wrap11_2"></i>
					</div>
				</div>
				
				<div class="panel-body" style="width:1600px;height:219px;color:black;">
					<div id="grid_wrap11_2" style="width:100%;height:100%;color:black">
					</div>
				</div>
				
				<div class="panel-heading clearfix border-top-style">
					<div class="panel-title pull-left" style="font-size:12px;"><b>①-3 <spring:message code='capital.financialProductsChangesDeposit'/></b></div>
					<div class="btn-group pull-right">
						<i class="glyphicon glyphicon-export ahref exceldown" aria-hidden="true" name="grid_wrap11_3"></i>
					</div>
				</div>
				
				<div class="panel-body" style="width:1600px;height:219px;color:black;">
					<div id="grid_wrap11_3" style="width:100%;height:100%;color:black">
					</div>
				</div>
				
				<div class="panel-heading clearfix border-top-style">
					<div class="panel-title pull-left" style="font-size:12px;"><b>② <spring:message code='capital.financialProductsChanges'/></b></div>
					<div class="btn-group pull-right">
						<i class="glyphicon glyphicon-plus ahref rowedit" aria-hidden="true" data-toggle="tooltip" title="<spring:message code='capital.addRow'/>" id="add_row" name="grid_wrap11"></i>
						<i class="glyphicon glyphicon-minus ahref rowedit" aria-hidden="true" data-toggle="tooltip" title="<spring:message code='capital.delRow'/>" id="del_row" name="grid_wrap11"></i>
						<i class="glyphicon glyphicon-export ahref exceldown" aria-hidden="true" name="grid_wrap11"></i>
					</div>
				</div>
				
				<div class="panel-body" style="width:1600px;height:219px;color:black;">
					<div id="grid_wrap11" style="width:100%;height:100%;color:black">
					</div>
				</div>
			</div>
		
		</div>

	</div>

	<jsp:include page="/WEB-INF/jsp/config/footer.jsp"/>

</div>
<jsp:include page="/WEB-INF/jsp/config/footer_naviTime_capital.jsp"/>
</body>
</html>
