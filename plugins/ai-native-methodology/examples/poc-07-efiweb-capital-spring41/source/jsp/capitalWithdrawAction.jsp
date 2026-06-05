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

</style>

<script type="text/javascript">
	//AUIGrid 생성 후 반환 ID
	var myGridID1;
	var myGridID2;
	var myGridID3;
	var myGridID33;
	var myGridID4;
	var myGridID4_1;
	var myGridID5;
	var myGridID5_1;
	
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
    
	
	// ERP 출금내역 컬럼
	var columnLayout1 = [
						{
	            			dataField: "accno",
	            			headerText: "계정코드",
	            			style : "left-cell",
	            			width:90,
	            			filter : {showIcon : true},
	            			visible : false
	            		},{
	            			dataField: "accno2",
	            			headerText: "계정코드",
	            			style : "left-cell",
	            			width:90,
	            			filter : {showIcon : true},
	            			visible : false
	            		},{
							dataField: "accname",
							headerText: "<spring:message code='capital.account'/>",
							style : "left-cell",
							filter : {showIcon : true},
							width:90,	
							visible : true
						},{
							dataField: "accname2",
							headerText: "계정명2",
							style : "left-cell",
							filter : {showIcon : true},
							width:90,	
							visible : false
						},{
							dataField: "remname1",
							headerText: "<spring:message code='capital.managementItem'/>",
							style : "left-cell",
							filter : {showIcon : true},
							width:90,	
							visible : true
						},{
							dataField: "remvalname1",
							headerText: "<spring:message code='capital.vendor'/>",
							style : "left-cell",
							width:150,
							filter : {showIcon : true},
							visible : true
						},{
							dataField: "remvalname2",
							headerText: "은행명",
							style : "left-cell",
							filter : {showIcon : true},
							visible : false
						},{
	            			dataField: "summary",
	            			headerText: "<spring:message code='capital.remarks'/>",
	            			style : "left-cell",
	            			//width:180,
	            			filter : {showIcon : true},
	            			visible : true
	            		},{
	            			dataField: "domamtbal",
	            			headerText: "차변금액",
	            			style : "money",
	            			dataType : "numeric",
	            			formatString : "#,##0.00",
	            			filter : {showIcon : true},
	            			visible : false
	            		},{
	            			dataField: "domamt",
	            			headerText: "<spring:message code='capital.amount'/>",
	            			style : "money",  
	            			dataType : "numeric",
	            			formatString : "#,##0.00",
	            			width:150,
	            			filter : {showIcon : true},
	            			visible : true
	            		},{
	            			dataField: "companyseq",
	            			headerText: "법인코드",
	            			filter : {showIcon : true},
	            			visible : false
	            		},{
	            			dataField: "slipmstseq",
	            			headerText: "전표코드",
	            			filter : {showIcon : true},
	            			visible : false
	            		},{
	            			dataField: "slipmstid",
	            			headerText: "전표ID",
	            			filter : {showIcon : true},
	            			visible : false
	            		},{
	            			dataField: "accdate",
	            			headerText: "전기일",
	            			filter : {showIcon : true},
	            			visible : false
	            		},{
	            			dataField: "slipno",
	            			headerText: "전표일련번호",
	            			filter : {showIcon : true},
	            			visible : false
	            		},{
	            			dataField: "regempseq",
	            			headerText: "작성자코드",
	            			filter : {showIcon : true},
	            			visible : false
	            		},{
	            			dataField: "regdeptseq",
	            			headerText: "작성자부서코드",
	            			filter : {showIcon : true},
	            			visible : false
	            		},{
	            			dataField: "regaccdate",
	            			headerText: "작성일자",
	            			filter : {showIcon : true},
	            			visible : false
	            		},{
	            			dataField: "slipid",
	            			headerText: "기표번호",
	            			filter : {showIcon : true},
	            			visible : false
	            		},{
	            			dataField: "rowno",
	            			headerText: "행번호",
	            			filter : {showIcon : true},
	            			visible : false
	            		},{
	            			dataField: "accseq",
	            			headerText: "계정시스템코드",
	            			filter : {showIcon : true},
	            			visible : false
	            		},{
	            			dataField: "drforamt",
	            			headerText: "차변금액(외화)",
	            			style : "money",
	            			dataType : "numeric",
	            			formatString : "#,##0.00",
	            			filter : {showIcon : true},
	            			visible : false
	            		},{
	            			dataField: "crforamt",
	            			headerText: "금액(외화)",
	            			style : "money",	            	
	            			dataType : "numeric",
	            			formatString : "#,##0.00",
	            			filter : {showIcon : true},
	            			visible : false
	            		},{
	            			dataField: "currseq",
	            			headerText: "통화코드",
	            			filter : {showIcon : true},
	            			visible : false
	            		},{
	            			dataField: "exrate",
	            			headerText: "환율",
	            			filter : {showIcon : true},
	            			visible : false
	            		},{
	            			dataField: "divexrate",
	            			headerText: "기타환율",
	            			filter : {showIcon : true},
	            			visible : false
	            		},{
	            			dataField: "cocustseq",
	            			headerText: "코스트센터코드",
	            			filter : {showIcon : true},
	            			visible : false
	            		},{
	            			dataField: "remseq",
	            			headerText: "관리코드",
	            			filter : {showIcon : true},
	            			visible : false
	            		},{
	            			dataField: "remvalseq",
	            			headerText: "관리값",
	            			filter : {showIcon : true},
	            			visible : false
	            		}
	            	];	
	
	
					var footerObject1 = [ {
						labelText : "",
						positionField : "#base"
					}, {
						dataField : "domamt",
						positionField : "domamt",
						operation : "SUM",
						formatString : "#,##0.00",
						style : "money",
					}];	
	
	
		// CMS 출금내역 컬럼
		var columnLayout2 = [
								{
			            			dataField: "curCd",
			            			headerText: "<spring:message code='capital.currency'/>",
			            			width:100,
			            			filter : {showIcon : true},
			            			visible : true
			            		},{
									dataField: "bankCd",
									headerText: "은행코드",
									style : "left-cell",
									filter : {showIcon : true},
									visible : false
								},{
									dataField: "realcdKornm",
									headerText: "은행명",
									style : "left-cell",
									filter : {showIcon : true},
									visible : false
								},{
									dataField: "acctNo",
									headerText: "<spring:message code='capital.accountNumber'/>",
									style : "left-cell",
									filter : {showIcon : true},
									width:150,
									visible : true
								},{
			            			dataField: "tranDd",
			            			headerText: "출금일",
			            			style : "left-cell",
			            			filter : {showIcon : true},
			            			visible : false
			            		},{
			            			dataField: "tranHh",
			            			headerText: "출금시간",
			            			style : "left-cell",
			            			filter : {showIcon : true},
			            			visible : false
			            		},{
			            			dataField: "tranRemk1",
			            			headerText: "<spring:message code='capital.remarks'/>",
			            			style : "left-cell",
			            			//width:280,
			            			filter : {showIcon : true},
			            			visible : true
			            		},{
			            			dataField: "incomAmount",
			            			headerText: "입금액",
			            			style : "money",
			            			dataType : "numeric",
			            			formatString : "#,##0.00",			 
			            			filter : {showIcon : true},
			            			visible : false
			            		},{
			            			dataField: "outAmount",
			            			headerText: "<spring:message code='capital.amount3'/>",
			            			style : "money",
			            			dataType : "numeric",
			            			formatString : "#,##0.00",			 
			            			width:180,
			            			filter : {showIcon : true},
			            			visible : true
			            		},{
			            			dataField: "tranAftbal",
			            			headerText: "잔액",
			            			filter : {showIcon : true},
			            			visible : false
			            		},{
			            			dataField: "tranRemk2",
			            			headerText: "tranRemk2",
			            			filter : {showIcon : true},
			            			visible : false
			            		},{
			            			dataField: "tranRemk3",
			            			headerText: "tranRemk3",
			            			filter : {showIcon : true},
			            			visible : false
			            		},{
			            			dataField: "tranRemk4",
			            			headerText: "tranRemk4",
			            			filter : {showIcon : true},
			            			visible : false
			            		},{
			            			dataField: "tranRemk5",
			            			headerText: "tranRemk5",
			            			filter : {showIcon : true},
			            			visible : false
			            		}
			            	];	
		
							var footerObject2 = [ {
								labelText : "",
								positionField : "#base"
							}, {
								dataField : "outAmount",
								positionField : "outAmount",
								operation : "SUM",
								formatString : "#,##0",
								style : "money",
							}];		
		
		
		// 자금일보 적용 내역
		var columnLayout3 = [
								{
			            			dataField: "accno",
			            			headerText: "계정코드",
			            			style : "left-cell",
			            			filter : {showIcon : true},
			            			visible : false
			            		},{
									dataField: "accname",
									headerText: "<spring:message code='capital.account'/>",
									style : "left-cell",
									width:150,
									filter : {showIcon : true},
									visible : true
								},{
									dataField: "remname1",
									headerText: "<spring:message code='capital.managementItem'/>",
									style : "left-cell",
									filter : {showIcon : true},
									width:90,	
									visible : true
								},{
									dataField: "remvalname1",
									headerText: "<spring:message code='capital.vendor'/>",
									style : "left-cell",
									width:150,
									filter : {showIcon : true},
									visible : true
								},{
									dataField: "remvalname2",
									headerText: "은행명",
									style : "left-cell",
									filter : {showIcon : true},
									visible : false
								},{
			            			dataField: "summary",
			            			headerText: "<spring:message code='capital.remarks'/>",
			            			style : "left-cell",
			            			filter : {showIcon : true},
			            			visible : true
			            		},{
			            			dataField: "domamtbal",
			            			headerText: "차변금액",
			            			style : "money",
			            			dataType : "numeric",
			            			formatString : "#,##0.00",
			            			filter : {showIcon : true},
			            			visible : false
			            		},{  //금액 텍스트 숫자타입으로 변경
			            			dataField: "domamt",
			            			headerText: "<spring:message code='capital.amount'/>",
			            			style : "money",  
			            			dataType : "numeric",
			            			formatString : "#,##0.00",
			            			width:150,
			            			filter : {showIcon : true},
			            			visible : true 
			            		},{
			            			dataField: "companyseq",
			            			headerText: "법인코드",
			            			filter : {showIcon : true},
			            			visible : false
			            		},{
			            			dataField: "slipmstseq",
			            			headerText: "전표코드",
			            			filter : {showIcon : true},
			            			visible : false
			            		},{
			            			dataField: "slipmstid",
			            			headerText: "전표ID",
			            			filter : {showIcon : true},
			            			visible : false
			            		},{
			            			dataField: "accdate",
			            			headerText: "전기일",
			            			filter : {showIcon : true},
			            			visible : false
			            		},{
			            			dataField: "slipno",
			            			headerText: "전표일련번호",
			            			filter : {showIcon : true},
			            			visible : false
			            		},{
			            			dataField: "regempseq",
			            			headerText: "작성자코드",
			            			filter : {showIcon : true},
			            			visible : false
			            		},{
			            			dataField: "regdeptseq",
			            			headerText: "작성자부서코드",
			            			filter : {showIcon : true},
			            			visible : false
			            		},{
			            			dataField: "regaccdate",
			            			headerText: "작성일자",
			            			filter : {showIcon : true},
			            			visible : false
			            		},{
			            			dataField: "slipid",
			            			headerText: "기표번호",
			            			filter : {showIcon : true},
			            			visible : false
			            		},{
			            			dataField: "rowno",
			            			headerText: "행번호",
			            			filter : {showIcon : true},
			            			visible : false
			            		},{
			            			dataField: "accseq",
			            			headerText: "계정시스템코드",
			            			filter : {showIcon : true},
			            			visible : false
			            		},{
			            			dataField: "drforamt",
			            			headerText: "차변금액(외화)",
			            			style : "money",
			            			dataType : "numeric",
			            			formatString : "#,##0.00",
			            			filter : {showIcon : true},
			            			visible : false
			            		},{
			            			dataField: "crforamt",
			            			headerText: "금액(외화)",
			            			style : "money",	            	
			            			dataType : "numeric",
			            			formatString : "#,##0.00",
			            			filter : {showIcon : true},
			            			visible : false
			            		},{
			            			dataField: "currseq",
			            			headerText: "통화코드",
			            			filter : {showIcon : true},
			            			visible : false
			            		},{
			            			dataField: "exrate",
			            			headerText: "환율",
			            			filter : {showIcon : true},
			            			visible : false
			            		},{
			            			dataField: "divexrate",
			            			headerText: "기타환율",
			            			filter : {showIcon : true},
			            			visible : false
			            		},{
			            			dataField: "cocustseq",
			            			headerText: "코스트센터코드",
			            			filter : {showIcon : true},
			            			visible : false
			            		},{
			            			dataField: "remseq",
			            			headerText: "관리코드",
			            			filter : {showIcon : true},
			            			visible : false
			            		},{
			            			dataField: "remvalseq",
			            			headerText: "관리값",
			            			filter : {showIcon : true},
			            			visible : false
			            		}
			            	];			
		
		

		
		
		// ERP 내역 설정 / 계정과목표
		var columnLayout4 = [
								{
									dataField: "accseq",
									headerText: "계정시스템코드",
									visible : false
								},{
									dataField: "accno",
									headerText: "계정코드",
									filter : {showIcon : true},								
									visible : true
								},{
									dataField: "accname",
									headerText: "계정명",
									style : "left-cell",
									filter : {showIcon : true},								
									visible : true
								},{
									dataField: "sType",
									headerText: "연동",
									filter : {showIcon : true},								
									visible : true
								}
			            	];		
		
		// ERP 계좌번호 내역
		var columnLayout5 = [
								{
									dataField: "bankaccname",
									headerText: "계좌종류",
									filter : {showIcon : true},	
									style : "left-cell",
									visible : false
								},{
									dataField: "bankname",
									headerText: "은행명",
									filter : {showIcon : true},
									style : "left-cell",
									visible : true
								},{
									dataField: "bankaccno",
									headerText: "계좌번호",
									filter : {showIcon : true},
									style : "left-cell",
									visible : true
								},{
									dataField: "cmsvalue",
									headerText: "CMS등록",
									filter : {showIcon : true},
									visible : true
								},{
									dataField: "sType",
									headerText: "연동",
									filter : {showIcon : true},								
									visible : true
								}
			            	];			
		


	$(document).ready(function(){
		
		var SESSION = "${SESSION}"; // 소속 법인 번호
		$("#comNo").val(SESSION);

		// AUIGrid 를 생성합니다.
		var auiGridProps = {
				editable : false,
				useGroupingPanel : false,
				//rowIdField : "", // 행의 고유 필드명 그리드내에서의 키값
				processValidData : false, // dataType 에 맞게 validData 기능 사용
				showStateColumn : true, //상태값을 아이콘으로 삭제 등록 취소등
				softRemovePolicy : "exceptNew",
				softRemoveRowMode : false,
				enableFocus : true, 
				editBeginMode : "doubleClick",
				editingOnKeyDown : true,
				selectionMode : "multipleCells",
				showRowNumColumn : true,
				showRowCheckColumn : true, 	//체크박스
				showRowAllCheckBox : true,
				enableFilter : true,
				showFooter :true,
				//headerHeight : 48,
				//wrapSelectionMove : true,
		};
		
		var auiGridPropsNochk = {
				editable : false,
				useGroupingPanel : true,
				groupingFields : ["curCd"],
				groupingSummary  : {
					dataFields : [ "outAmount" ]
				},				
				displayTreeOpen : true,
				enableCellMerge : true,
				showBranchOnGrouping : false,
				//rowIdField : "", // 행의 고유 필드명 그리드내에서의 키값
				processValidData : false, // dataType 에 맞게 validData 기능 사용
				showStateColumn : true, //상태값을 아이콘으로 삭제 등록 취소등
				softRemovePolicy : "exceptNew",
				enableFocus : true, 
				editBeginMode : "doubleClick",
				editingOnKeyDown : true,
				selectionMode : "multipleCells",
				showRowNumColumn : true,
				showRowCheckColumn : false, 	//체크박스
				showRowAllCheckBox : false,
				enableFilter : true,
				showFooter :false,
				//headerHeight : 48,
				//wrapSelectionMove : true,
		};		
		
		var auiGridPropsEdit = {
				editable : true,
				//rowIdField : "", // 행의 고유 필드명 그리드내에서의 키값
				processValidData : false, // dataType 에 맞게 validData 기능 사용
				showStateColumn : true, //상태값을 아이콘으로 삭제 등록 취소등
				//softRemovePolicy : "exceptNew",
				softRemoveRowMode : false,
				enableFocus : true, 
				editBeginMode : "doubleClick",
				editingOnKeyDown : true,
				selectionMode : "multipleCells",
				showRowNumColumn : true,
				showRowCheckColumn : true, 	//체크박스
				showRowAllCheckBox : true,
				enableFilter : true,
				showFooter :true,
				wrapSelectionMove : true,
				//headerHeight : 48,
				//wrapSelectionMove : true,
		};		
		
		var auiGridPropsModal = {
				editable : false,
				//rowIdField : "", // 행의 고유 필드명 그리드내에서의 키값
				processValidData : false, // dataType 에 맞게 validData 기능 사용
				showStateColumn : true, //상태값을 아이콘으로 삭제 등록 취소등
				//softRemovePolicy : "exceptNew",
				softRemoveRowMode : false,
				enableFocus : true, 
				editBeginMode : "doubleClick",
				editingOnKeyDown : true,
				selectionMode : "multipleCells",
				showRowNumColumn : true,
				showRowCheckColumn : true, 	//체크박스
				showRowAllCheckBox : true,
				enableFilter : true,
				//showFooter :true,
				//headerHeight : 48,
				//wrapSelectionMove : true,
		}		
		
		// Grid 그리기
		myGridID1 = AUIGrid.create("#grid_wrap1", columnLayout1, auiGridProps);
		AUIGrid.setFooter(myGridID1, footerObject1);
		
		myGridID2 = AUIGrid.create("#grid_wrap2", columnLayout2, auiGridPropsNochk);
		AUIGrid.setFooter(myGridID2, footerObject2);
		
		myGridID3 = AUIGrid.create("#grid_wrap3", columnLayout3, auiGridPropsEdit);
		AUIGrid.setFooter(myGridID3, footerObject1);		
		var colSizeList = AUIGrid.getFitColumnSizeList(myGridID3, true);
		AUIGrid.setColumnSizeList(myGridID3, colSizeList);
		
		AUIGrid.bind("#grid_wrap3", "cellEditEndBefore", cellEditEndBeforeHandler);
		
		myGridID33 = AUIGrid.create("#grid_wrap33", columnLayout3, auiGridPropsEdit);
		AUIGrid.setFooter(myGridID33, footerObject1);		
		var colSizeList = AUIGrid.getFitColumnSizeList(myGridID33, true);
		AUIGrid.setColumnSizeList(myGridID33, colSizeList);		
		
		AUIGrid.bind("#grid_wrap33", "cellEditEndBefore", cellEditEndBeforeHandler);
				
		// Grid 초기화
		function AUIGrid_reset() {
			AUIGrid.destroy("#grid_wrap1");
			myGridID1 = null;
			myGridID1 = AUIGrid.create("#grid_wrap1", columnLayout1, auiGridProps);
			AUIGrid.setFooter(myGridID1, footerObject1);

			AUIGrid.destroy("#grid_wrap2");
			myGridID2 = null;
			myGridID2 = AUIGrid.create("#grid_wrap2", columnLayout2, auiGridPropsNochk);
			AUIGrid.setFooter(myGridID2, footerObject2);

			AUIGrid.destroy("#grid_wrap3");
			myGridID3 = null;
			myGridID3 = AUIGrid.create("#grid_wrap3", columnLayout3, auiGridPropsEdit);
			AUIGrid.setFooter(myGridID3, footerObject1);			
			var colSizeList = AUIGrid.getFitColumnSizeList(myGridID3, true);
			AUIGrid.setColumnSizeList(myGridID3, colSizeList);
			
			AUIGrid.bind("#grid_wrap3", "cellEditEndBefore", cellEditEndBeforeHandler);
			
			AUIGrid.destroy("#grid_wrap33");
			myGridID33 = null;
			myGridID33 = AUIGrid.create("#grid_wrap33", columnLayout3, auiGridPropsEdit);
			AUIGrid.setFooter(myGridID33, footerObject1);			
			var colSizeList = AUIGrid.getFitColumnSizeList(myGridID33, true);
			AUIGrid.setColumnSizeList(myGridID33, colSizeList);			
			
			AUIGrid.bind("#grid_wrap33", "cellEditEndBefore", cellEditEndBeforeHandler);
		}
		
		
		// 조회
		function fn_selectList(smi,SaveType) {
			if (!$("#comNo").val()){
				alert("<spring:message code='capital.date.validation' />");
				return;
			}			
			if (!$("#sdate").val()){
				alert('날짜는 필수 값입니다.');
				return;
			}
			if(!isDate($("#sdate").val())){
				alert("<spring:message code='capital.date.validation' />");
				$("#sdate").focus();
				return;
			}
			
			
			$.isLoading({ tpl: "<span class='isloading-wrapper %wrapper%'>Loading&nbsp;&nbsp;<i class='fa fa-refresh fa-spin'></i></span>" });
			
			var sum1 = 0; // ERP 합계
			var sum2 = 0; // CMS 합계
			var sum3 = 0; // ERP - CMS
			
			fn_checkAllfalse();
			var data = "comNo=" + $("#comNo").val();
			data += "&sdate=" + $("#sdate").val();
			data += "&smi=" + smi;
			data += "&SaveType=" + SaveType;
			
			var url = "<c:url value='/ifrs/capital/IfrsERPOUTListAjax' />";
			fn_ajax(url, data, function( result ){
				
				var result_arr1 = result.list;
				var result_arr2 = [];
					
				var url = "<c:url value='/ifrs/capital/IfrsERPINListAjax2' />";
				fn_ajax(url, data, function( result ){
					
					result_arr2 = result.list;
					
					for ( var q=0 in result_arr2 ) {
						if ( result_arr2[q].accname == '여비교통비' && Number($("#sdate").val()) > 20170331 ) { //     2017.01.01~2017.03.31일자까지 여비교통비로 인식
							result_arr2[q].accname = '급여'; //     2017.04.01일 부터는 여비교통비 대신 "급여'로 인식 요청
							result_arr2[q].accname2 = '급여';
						}	
					}
					
					result_arr1 = $.merge( result_arr1, result_arr2 );
					
				for ( var i=0 in result_arr1 ) {
					sum1 = sum1 + result_arr1[i].domamt;
				}
				
				AUIGrid.setGridData(myGridID1, result_arr1);
				var sortingInfo = [{ dataField : "domamt", sortType : -1 }];
				AUIGrid.setSorting(myGridID1, sortingInfo);
				
		 		var url = "<c:url value='/ifrs/capital/IfrsCMSOUTListAjax' />";
				fn_ajax(url, data, function( result ){					

					for ( var i=0 in result.list ) {
						sum2 = sum2 + result.list[i].outAmount;
					}
					
					sum3 = sum1 - sum2;
					
					$("#erp_cms").val(sum3.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ","));
					
					AUIGrid.setGridData(myGridID2, result.list);
					
			 		var url = "<c:url value='/ifrs/capital/IfrsERPINReportAjax' />";
			 		data += "&sType=1";
			 		//(data);
					fn_ajax(url, data, function( result ){
						//(result.list);
						for ( var i=0 in result.list) {
							result.list[i].domamt=result.list[i].cramt;
							//2020.10.05 김승희
							//result.list[i].remname1=result.list[i].remname1;
							//result.list[i].remvalname1=result.list[i].remseqname1;
							
							result.list[i].remname1=result.list[i].remname1.replace(/percent_text/gi,"%").replace(/and_text/gi,"&").replace(/dblqt/gi,"\"").replace(/gtgt/gi,"\<").replace(/ltlt/gi,"\>");
							result.list[i].remvalname1=result.list[i].remseqname1.replace(/percent_text/gi,"%").replace(/and_text/gi,"&").replace(/dblqt/gi,"\"").replace(/gtgt/gi,"\<").replace(/ltlt/gi,"\>");
							
							result.list[i].accname = result.list[i].accname.replace(/percent_text/gi,"%").replace(/and_text/gi,"&").replace(/dblqt/gi,"\"").replace(/gtgt/gi,"\<").replace(/ltlt/gi,"\>");
							result.list[i].summary = result.list[i].summary.replace(/percent_text/gi,"%").replace(/and_text/gi,"&").replace(/dblqt/gi,"\"").replace(/gtgt/gi,"\<").replace(/ltlt/gi,"\>");
						}
						
						AUIGrid.setGridData(myGridID3, result.list);				
						var colSizeList = AUIGrid.getFitColumnSizeList(myGridID3, true);
						AUIGrid.setColumnSizeList(myGridID3, colSizeList);														
						
						var url = "<c:url value='/ifrs/capital/IfrsERPINReportAjax' />";
						var data = "comNo=" + $("#comNo").val();
						data += "&sdate=" + $("#sdate").val();
						data += "&smi=" + smi;			 		
				 		data += "&sType=11";
				 		data += "&SaveType=" + SaveType;
				 		//(data);
						fn_ajax(url, data, function( result ){
							//(result.list);
							for ( var i=0 in result.list) {
								result.list[i].domamt=result.list[i].cramt;
								//2020.10.05 김승희
								//result.list[i].remname1=result.list[i].remname1;
								//result.list[i].remvalname1=result.list[i].remseqname1; 
								
								result.list[i].remname1=result.list[i].remname1.replace(/percent_text/gi,"%").replace(/and_text/gi,"&").replace(/dblqt/gi,"\"").replace(/gtgt/gi,"\<").replace(/ltlt/gi,"\>");
								result.list[i].remvalname1=result.list[i].remseqname1.replace(/percent_text/gi,"%").replace(/and_text/gi,"&").replace(/dblqt/gi,"\"").replace(/gtgt/gi,"\<").replace(/ltlt/gi,"\>");
								
								result.list[i].accname = result.list[i].accname.replace(/percent_text/gi,"%").replace(/and_text/gi,"&").replace(/dblqt/gi,"\"").replace(/gtgt/gi,"\<").replace(/ltlt/gi,"\>");
								result.list[i].summary = result.list[i].summary.replace(/percent_text/gi,"%").replace(/and_text/gi,"&").replace(/dblqt/gi,"\"").replace(/gtgt/gi,"\<").replace(/ltlt/gi,"\>");
							}
							AUIGrid.setGridData(myGridID33, result.list);				
							var colSizeList = AUIGrid.getFitColumnSizeList(myGridID33, true);
							AUIGrid.setColumnSizeList(myGridID33, colSizeList);							
							setTimeout( function(){$.isLoading( "hide" );}, 10 );							
						});								
						
					});		
					
					
				});	
				
			}); 	
				
			});
			
		}		
		
		$("#btnSelect").unbind("click");
		$("#btnSelect").click(function(){
			$("#saveType").val("R");
			fn_selectList("4058001","R");
		});
		
		$("#btnSelect1").unbind("click");
		$("#btnSelect1").click(function(){
			$("#saveType").val("R");
			fn_selectList("4058002","R");
		});		
		
		
		$("#btnSelect2").unbind("click");
		$("#btnSelect2").click(function(){
			$("#saveType").val("B");
			fn_selectList("4058001","B");
		});			

		// 자금일보 추가
		$("#btnAdd").unbind("click");
		$("#btnAdd").click(function(){
			
			var checkedItems = AUIGrid.getCheckedRowItems(myGridID1);
			
			var result = [];
			for(var i=0 in checkedItems) {
				result[i] = checkedItems[i].item;
			}
			
			AUIGrid.addRow(myGridID3, result, 'last');
			var colSizeList = AUIGrid.getFitColumnSizeList(myGridID3, true);
			AUIGrid.setColumnSizeList(myGridID3, colSizeList);

			fn_checkAllfalse();			
			
		});
		
		$("#btnAdd1").unbind("click");
		$("#btnAdd1").click(function(){
			$("#btnAdd").trigger("click");
		});
		
		// 관리항목 재분류
		fn_withdrawalList = function(flag){
			
			$.isLoading({ tpl: "<span class='isloading-wrapper %wrapper%'>Loading&nbsp;&nbsp;<i class='fa fa-refresh fa-spin'></i></span>" });
			
			var data, sdate;
			var saveType = $("#saveType").val();
			var result_arr1 = [];
			var result_arr2 = [];
			
			if(flag == "T"){
				AUIGrid.setAllCheckedRows(myGridID1, true);
				var checkedItems = AUIGrid.getCheckedRowItems(myGridID1);
				for(var i=0 in checkedItems) {
					result_arr1[i] = checkedItems[i].item;
				}
			}else{				
				
				var smi = "4058002";
				
				sdate = Number($("#sdate").val()) + 1;
				data = "comNo=" + $("#comNo").val();
				data += "&sdate=" + sdate;
				data += "&smi=" + smi;
				data += "&SaveType=" + saveType;			
				
			
				var url = "<c:url value='/ifrs/capital/IfrsERPOUTListAjax' />";
				
				fn_ajaxAsync(url, data, function( result ){
					result_arr1 = result.list;
				});
				
				var url = "<c:url value='/ifrs/capital/IfrsERPINListAjax2' />";
				fn_ajaxAsync(url, data, function( result ){
					result_arr2 = result.list;
				});
				
				for ( var i=0 in result_arr2 ) {
					if ( result_arr2[i].accname == '여비교통비' && Number($("#sdate").val()) > 20170331 ) { //     2017.01.01~2017.03.31일자까지 여비교통비로 인식
						result_arr2[i].accname = '급여'; //     2017.04.01일 부터는 여비교통비 대신 "급여'로 인식 요청
						result_arr2[i].accname2 = '급여';
					}	
				}
				
				result_arr1 = $.merge( result_arr1, result_arr2 );
			}
			
			var sum1 = 0; // 사원
			var sum1_max = 0;
			var sum1_slipmstseq = "";
			var sum1_acc = "";
			var sum1_rem = "";
			var sum1_memo = "";
			
			var sum2 = 0; // 카드
			var sum2_max = 0;
			var sum2_slipmstseq = "";
			var sum2_acc = "";
			var sum2_rem = "";
			var sum2_memo = "";
			
			var arr1 = [];
			
 			for ( var i=0 in result_arr1 ) {
 				if ( result_arr1[i].del != "Y" ) {
					if ( result_arr1[i].remname1 == "사원" ) {
						sum1 = sum1 + result_arr1[i].domamt;
						if ( result_arr1[i].domamt > sum1_max ) {
							sum1_slipmstseq = result_arr1[i].slipmstseq;
							sum1_max = result_arr1[i].domamt;
							sum1_acc =  result_arr1[i].accname2 + " 외";
							sum1_rem =  result_arr1[i].remvalname1 + " 외";
							sum1_memo = result_arr1[i].summary + " 외";
						}
					} else if ( result_arr1[i].remname1 == "카드" ) {
						sum2 = sum2 + result_arr1[i].domamt;
						if ( result_arr1[i].domamt > sum2_max ) {
							sum2_slipmstseq = result_arr1[i].slipmstseq;
							sum2_max = result_arr1[i].domamt;
							sum2_acc =  result_arr1[i].accname2 + " 외";
							sum2_rem =  result_arr1[i].remvalname1 + " 외";
							sum2_memo = result_arr1[i].summary + " 외";
						}					
					} else {
						arr1.push(result_arr1[i]);		
					}
				} 
			}
			
 			if ( sum1 != 0 ) {
				var obj1 = {}; // 사원
				obj1.slipmstseq = sum1_slipmstseq;
				obj1.accname = sum1_acc;
				obj1.remname1 = "사원";
				obj1.remvalname1 =sum1_rem;
				obj1.summary = sum1_memo;
				obj1.domamt = sum1;
				
				if(flag == "T"){
					AUIGrid.addRow(myGridID3, [obj1], 'last');
					AUIGrid.setSorting(myGridID3, [{ dataField : "domamt", sortType : -1 }]);					
				}else{
					AUIGrid.addRow("#grid_wrap33", [obj1], 'last');
					AUIGrid.setSorting("#grid_wrap33", [{ dataField : "domamt", sortType : -1 }]);
				}
			}
			
			if ( sum2 != 0 ) {
				var obj2 = {}; // 카드
				obj2.slipmstseq = sum2_slipmstseq;
				obj2.accname = sum2_acc;
				obj2.remname1 = "카드";
				obj2.remvalname1 = sum2_rem;
				obj2.summary = sum2_memo;
				obj2.domamt = sum2;
				
				if(flag == "T"){
					AUIGrid.addRow(myGridID3, [obj2], 'last');
					AUIGrid.setSorting(myGridID3, [{ dataField : "domamt", sortType : -1 }]);					
				}else{
					AUIGrid.addRow("#grid_wrap33", [obj2], 'last');
					AUIGrid.setSorting("#grid_wrap33", [{ dataField : "domamt", sortType : -1 }]);
				}
			}
			
			var arr_sort = [];
			
			if ( arr1.length > 0 ) {
				for (var i=0 in arr1) {
					arr1[i].accseq = arr1[i].accseq2;
					arr1[i].accname = arr1[i].accname2;
					arr1[i].summary = arr1[i].summary;
					
					var arr_sting = arr1[i].accseq + "@@@" + arr1[i].remvalseq1 + "@@@" + arr1[i].slipmstseq;
					if ( arr_sort.indexOf(arr_sting) == -1 ) {
						arr_sort.push(arr_sting);
					}
				}				
			}
			
 			var arr_sort_data = [];
 			
 			for ( var i=0 in arr_sort){
 				
 				var arr_sort_slpit = arr_sort[i].split("@@@");
 				var accseq = arr_sort_slpit[0];
 				var remvalseq1 = arr_sort_slpit[1];
 				var slipmstseq = arr_sort_slpit[2];
 				
				var obj3 = {}; // 카드 	 					
				var domamt = 0;			
 				
 				for ( var z=0 in arr1 ) {
 					if ( arr1[z].accseq ==  accseq &&  arr1[z].remvalseq1 ==  remvalseq1 &&  arr1[z].slipmstseq ==  slipmstseq ) {
 						obj3.slipmstseq =  arr1[z].slipmstseq;
 						obj3.accname = arr1[z].accname;
 						obj3.remname1 = arr1[z].remname1;
 						obj3.remvalname1 = arr1[z].remvalname1;
 						obj3.summary = arr1[z].summary;
 						domamt = domamt + arr1[z].domamt;
 					}
 				}
 				obj3.domamt = domamt;
 				arr_sort_data.push(obj3);
 			}
 			
 			if(flag == "T"){
				AUIGrid.addRow(myGridID3, arr_sort_data, 'last');
				AUIGrid.setSorting(myGridID3, [{ dataField : "domamt", sortType : -1 }]);
				fn_checkAllfalse();
			}else{
				AUIGrid.addRow("#grid_wrap33", arr_sort_data, 'last');
				AUIGrid.setSorting("#grid_wrap33", [{ dataField : "domamt", sortType : -1 }]);
			}
 			
 			$.isLoading( "hide" );
		}
		
		// 체크 일괄 해제
		function fn_checkAllfalse() {

			AUIGrid.setAllCheckedRows(myGridID1, false);
			AUIGrid.setAllCheckedRows(myGridID2, false);
			AUIGrid.setAllCheckedRows(myGridID3, false);
			AUIGrid.setAllCheckedRows(myGridID33, false);
			AUIGrid.setAllCheckedRows(myGridID4, false);
			AUIGrid.setAllCheckedRows(myGridID5, false);
			
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
		
		$("#btnReset").unbind("click");
		$("#btnReset").click(function(){
			AUIGrid_reset();			
		});
		
		// 법인선택 Select2
		$("#comNo").select2();
		$("#linktype").select2();
		
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
		
		// 설정 버튼
		$('.settingbtn').unbind("click");
		$('.settingbtn').click(function () {
			
			$('body').on('hidden.bs.modal', '.modal', function () {$(this).removeData('bs.modal');});			
			
			
			var wrapId = $(this).attr("name");		
			
			if ( wrapId == "grid_wrap2" ) {
				
				
				var cmsAccList = [];
				
				var data = "comNo=" + $("#comNo").val();
				var url = "<c:url value='/ifrs/capital/CmsAccountListAjax' />";
				fn_ajax(url, data, function( result ){
					
					cmsAccList = result.list;
					
					var data = "comNo=" + $("#comNo").val() + "&sType=N&sType1=2";					
					var url = "<c:url value='/ifrs/capital/IfrsCMSINSetAjax' />";
					fn_ajax(url, data, function( result ){			
						
						var arr = [];
						for (var i=0 in cmsAccList) {
							arr.push(cmsAccList[i].cmsAccount);
						}
						
						for (var i=0 in result.list) {
							var grepRow =  jQuery.inArray(result.list[i].bankaccno.replace(/-/gi,""), arr );
							if ( grepRow > 0 ) {
								//(grepRow);
								result.list[i].cmsvalue = 'Y';
							} else {
								result.list[i].cmsvalue = 'N';
							}
						}
						
						var w = Number($("#modal_div2").css("width").replace("px","")) - 30;
						
						AUIGrid.destroy("#grid_wrap5");
						myGridID5 = null;
						$("#setting2").modal({ show: true });															
						myGridID5 = AUIGrid.create("#grid_wrap5", columnLayout5, auiGridPropsModal);
						AUIGrid.setGridData(myGridID5, result.list);	
						AUIGrid.resize(myGridID5, w, '350');
						var colSizeList = AUIGrid.getFitColumnSizeList(myGridID5, true);
						AUIGrid.setColumnSizeList(myGridID5, colSizeList);					
						
					}); 	
					
					var data = "comNo=" + $("#comNo").val() + "&sType=Y&sType1=2";					
					var url = "<c:url value='/ifrs/capital/IfrsCMSINSetAjax' />";
					fn_ajax(url, data, function( result ){			
						
						var arr = [];
						for (var i=0 in cmsAccList) {
							arr.push(cmsAccList[i].cmsAccount);
						}
						
						for (var i=0 in result.list) {
							var grepRow =  jQuery.inArray(result.list[i].bankaccno.replace(/-/gi,""), arr );
							if ( grepRow > 0 ) {
								//(grepRow);
								result.list[i].cmsvalue = 'Y';
							} else {
								result.list[i].cmsvalue = 'N';
							}
						}
						
						var w = Number($("#modal_div2").css("width").replace("px","")) - 30;
						
						AUIGrid.destroy("#grid_wrap5_1");
						myGridID5_1 = null;
						$("#setting2").modal({ show: true });															
						myGridID5_1 = AUIGrid.create("#grid_wrap5_1", columnLayout5, auiGridPropsModal);
						AUIGrid.setGridData(myGridID5_1, result.list);	
						AUIGrid.resize(myGridID5_1, w, '300');
						var colSizeList = AUIGrid.getFitColumnSizeList(myGridID5_1, true);
						AUIGrid.setColumnSizeList(myGridID5_1, colSizeList);
						AUIGrid.setAllCheckedRows(myGridID5_1, true);
												
					}); 					
					
				});
				
				
 				$('.modal-dialog').unbind("resize");
				$('.modal-dialog').resize(function(){
					AUIGrid.resize(myGridID5);
					var colSizeList = AUIGrid.getFitColumnSizeList(myGridID5, true);
					AUIGrid.setColumnSizeList(myGridID5, colSizeList);					
					AUIGrid.resize(myGridID5_1);
					var colSizeList = AUIGrid.getFitColumnSizeList(myGridID5_1, true);
					AUIGrid.setColumnSizeList(myGridID5_1, colSizeList);					
				});				
				
				
			}			
			
		});		
		
		
		// 행추가
		$('.add_row').unbind("click");
		$('.add_row').click(function () {
						
			var item = new Object();
			var rowPos = "last";
			item.linkvalue = "";
			item.accname = "";
			item.remname1 = "";
			item.remvalname1 = "";
			item.remvalname2 = "";
			item.summary = "";
			item.domamtbal = "";
			item.domamt = "";
			item.companyseq = "";
			item.slipmstseq = "";
			item.slipmstid = "";
			item.accdate = "";
			item.slipno = "";
			item.regempseq = "";
			item.regdeptseq = "";
			item.regaccdate = "";
			item.slipid = "";
			item.rowno = "";
			item.accseq = "";
			item.drforamt = "";
			item.crforamt = "";
			item.currseq = "";
			item.exrate = "";
			item.divexrate = "";
			item.cocustseq = "";
			item.accno = "";
			item.remseq = "";
			item.remvalseq = "";
			
			AUIGrid.addRow("#" + $(this).attr("name"), item, rowPos);
		});
		
		// 행삭제
		$('.del_row').unbind("click");
		$('.del_row').click(function () {
			AUIGrid.removeCheckedRows("#" + $(this).attr("name"));
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
		//$("#sdate").val("20170110");
		
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
			$("#saveType").val("R");
			fn_selectList("4058001","R");
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
			$("#saveType").val("R");
			fn_selectList("4058001","R");
		});		

		
		// 계좌번호 추가 버튼
		$("#erpAccDown1").unbind("click");
		$("#erpAccDown1").click(function(){
			var checkedItems = AUIGrid.getCheckedRowItems(myGridID5);
			var result = [];
			for(var i=0 in checkedItems) {
				result[i] = checkedItems[i].item;
			}
			AUIGrid.addRow(myGridID5_1, result, 'last');
			AUIGrid.removeCheckedRows(myGridID5);
		});
		
		// 계좌번호 제거 버튼
		$("#erpAccUp1").unbind("click");
		$("#erpAccUp1").click(function(){
			var checkedItems = AUIGrid.getCheckedRowItems(myGridID5_1);
			var result = [];
			for(var i=0 in checkedItems) {
				result[i] = checkedItems[i].item;
			}
			AUIGrid.addRow(myGridID5, result, 'last');
			AUIGrid.removeCheckedRows(myGridID5_1);
		});				
		
		
		// 계좌번호 모달 적용
		$("#erpAccBtn2").unbind("click");
		$("#erpAccBtn2").click(function(){
			var comNo = $("#comNo").val();
			AUIGrid.setAllCheckedRows(myGridID5_1, true);
			var checkedItems = AUIGrid.getCheckedRowItems(myGridID5_1);
			
			//(checkedItems);
			
			var xml = "<ROOT>";

			for(var i=0 in checkedItems) {
				xml += "<DATAROW ";
				xml += " CompanySeq=\"" + comNo + "\"";
				xml += " sType=\"2\"";
				xml += " sData=\"" + checkedItems[i].item.bankaccno + "\"";
				xml += "></DATAROW>";
			}
			
			xml += "</ROOT>";
			
			var data = "CompanySeq=" + $("#comNo").val();
			data += "&sType=2";
			data += "&xml=" + xml;
			
			//(data);
			
			var url = "<c:url value='/ifrs/capital/IfrsERPINSetSave' />";
			fn_ajax(url, data, function( result ){});			
			
			var url = "<c:url value='/ifrs/capital/IfrsCMSINSetSave' />";
			fn_ajax(url, data, function( result ){
				$("#setting2").modal('toggle');
				msg("적용 되었습니다.");
			});			
		});
		
		
		// 출금내역 초기화
		$("#btnReset").unbind("click");
		$("#btnReset").click(function(){
			AUIGrid.setAllCheckedRows(myGridID3, true);
			AUIGrid.removeCheckedRows(myGridID3);
			
			AUIGrid.setAllCheckedRows(myGridID33, true);
			AUIGrid.removeCheckedRows(myGridID33);			
		});			
		
		
		// 출금내역 자금일보 전달
		$("#save_row, #btnSave").unbind("click");
		$("#save_row, #btnSave").click(function(){
			$("#confirmmodal").modal({ show: true });
		});		
		
		$("#save_row1, #btnSaveBak").unbind("click");
		$("#save_row1, #btnSaveBak").click(function(){
			
			var id = $(this).attr("id");
			
			var SaveType = "";
			
			if ( id == 'save_row1' ) {
				SaveType = "R";
			} else {
				SaveType = "B";
			}				
			
			var comNo = $("#comNo").val();
			var sdate = $("#sdate").val();
			
			AUIGrid.setAllCheckedRows(myGridID3, true);
			var checkedItems = AUIGrid.getCheckedRowItems(myGridID3);
			
			//(checkedItems);
			
 			var xml = "<ROOT>";

			for(var i=0 in checkedItems) {
				xml += "<DATAROW ";
				xml += " sType=\"1\"";
				xml += " companyseq=\"" + comNo + "\"";
				xml += " sDate=\"" + sdate + "\"";
				xml += " accno=\"" + checkedItems[i].item.accno + "\"";
				xml += " accname=\"" + checkedItems[i].item.accname.replace(/%/gi,"percent_text").replace(/&/gi,"and_text").replace(/\"/gi,"dblqt").replace(/\</gi,"gtgt").replace(/\>/gi,"ltlt") + "\"";
				xml += " remname1=\"" + checkedItems[i].item.remname1.replace(/%/gi,"percent_text").replace(/&/gi,"and_text").replace(/\"/gi,"dblqt").replace(/\</gi,"gtgt").replace(/\>/gi,"ltlt") + "\"";
				xml += " remseqname1=\"" + checkedItems[i].item.remvalname1.replace(/%/gi,"percent_text").replace(/&/gi,"and_text").replace(/\"/gi,"dblqt").replace(/\</gi,"gtgt").replace(/\>/gi,"ltlt") + "\"";
				xml += " summary=\"" + checkedItems[i].item.summary.replace(/%/gi,"percent_text").replace(/&/gi,"and_text").replace(/\"/gi,"dblqt").replace(/\</gi,"gtgt").replace(/\>/gi,"ltlt") + "\"";
				
				var domamt = 0;								
				if ( typeof(checkedItems[i].item.domamt) == "string" ) {															
					domamt = Number(checkedItems[i].item.domamt.replace(/,/gi,""));										
				} else {
					domamt = checkedItems[i].item.domamt;
				}					
				
				xml += " cramt=\"" + domamt + "\"";
				xml += "></DATAROW>";
			}
			
			xml += "</ROOT>";
			
			var data = "CompanySeq=" + comNo;
			data += "&sType=1";
			data += "&sDate=" + sdate;
			data += "&xml=" + xml;
			data += "&SaveType=" + SaveType;
			
			//(data);
			
			var url = "<c:url value='/ifrs/capital/IfrsERPINListSave' />";
			fn_ajax(url, data, function( result ){
				
				
				AUIGrid.setAllCheckedRows(myGridID33, true);
				var checkedItems = AUIGrid.getCheckedRowItems(myGridID33);
				
				//(checkedItems);
				
	 			var xml = "<ROOT>";

				for(var i=0 in checkedItems) {
					xml += "<DATAROW ";
					xml += " sType=\"11\"";
					xml += " companyseq=\"" + comNo + "\"";
					xml += " sDate=\"" + sdate + "\"";
					xml += " accno=\"" + checkedItems[i].item.accno + "\"";
					xml += " accname=\"" + checkedItems[i].item.accname.replace(/%/gi,"percent_text").replace(/&/gi,"and_text").replace(/\"/gi,"dblqt").replace(/\</gi,"gtgt").replace(/\>/gi,"ltlt") + "\"";
					xml += " remname1=\"" + checkedItems[i].item.remname1.replace(/%/gi,"percent_text").replace(/&/gi,"and_text").replace(/\"/gi,"dblqt").replace(/\</gi,"gtgt").replace(/\>/gi,"ltlt") + "\"";
					xml += " remseqname1=\"" + checkedItems[i].item.remvalname1.replace(/%/gi,"percent_text").replace(/&/gi,"and_text").replace(/\"/gi,"dblqt").replace(/\</gi,"gtgt").replace(/\>/gi,"ltlt") + "\"";
					xml += " summary=\"" + checkedItems[i].item.summary.replace(/%/gi,"percent_text").replace(/&/gi,"and_text").replace(/\"/gi,"dblqt").replace(/\</gi,"gtgt").replace(/\>/gi,"ltlt") + "\"";
					
					var domamt = 0;								
					if ( typeof(checkedItems[i].item.domamt) == "string" ) {
						domamt = Number(checkedItems[i].item.domamt.replace(/,/gi,""));
					} else {
						domamt = checkedItems[i].item.domamt;
					}										
					xml += " cramt=\"" + domamt + "\"";
					xml += "></DATAROW>";
				}				
				xml += "</ROOT>";
				
				var data = "CompanySeq=" + comNo;
				data += "&sType=11";
				data += "&sDate=" + sdate;
				data += "&xml=" + xml;
				data += "&SaveType=" + SaveType;
				
				//(data);
				
				var url = "<c:url value='/ifrs/capital/IfrsERPINListSave' />";
				fn_ajax(url, data, function( result ){					
					if ( id == 'save_row1' ) {
					$("#confirmmodal").modal('toggle');
					}					
					msg("자금일보 적용 완료되었습니다.");
				});	 				

			});	 
			
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
		
/*  		$("#comNo").val('2').change();
		$("#sdate").val('20170103'); */
		
		function cellEditEndBeforeHandler(event) {
			if(event.dataField == "domamt") {
				return toNumber(event.value);
			};
		}
		
	});
	

	


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

	
	
	<!-- 환경설정 Modal2 -->
	<div id="setting2" class="modal fade">
	
	<div class="modal-dialog" id="modal_div2">
	<div class="modal-content">
	<div class="modal-header">
	<div class="btn-group">
	<button type="button" class="btn btn-default btn-sm" id="erpAccBtn2">적용</button>
	<button type="button" class="btn btn-default btn-sm" data-dismiss="modal">닫기</button>
	</div>
    </div>
   	
   	<div class="modal-body">
   	
            <div id="grid_wrap5" style="width:100%;height:350px;color:black;">
			            
            </div>   
            
            <div id="grid_wrap5_btn" style="width:100%;color:black;text-align:center;">
            <div class="btn-group">
            	
				<button type="button" class="btn btn-default btn-sm  btn-sm" id="erpAccDown1" style="width:100px;">
					<i class="glyphicon glyphicon-chevron-down" aria-hidden="true"></i>
				</button>
				
				<button type="button" class="btn btn-default btn-sm  btn-sm" id="erpAccUp1" style="width:100px;">
					<i class="glyphicon glyphicon-chevron-up" aria-hidden="true"></i>
				</button>            	
            	
            </div>
            </div>
            
            <div id="grid_wrap5_1" style="width:100%;height:300px;color:black;">
			            
            </div>    
            
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
 			<input type="hidden" id="saveType" value="R"/>
 			
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
	                   		<button class="btn btn-default btn-sm" type="button" id="btnSelect"><spring:message code="capital.completedSearch"/></button>
	                   		<button class="btn btn-default btn-sm" type="button" id="btnSelect1"><spring:message code="capital.nonCompletedSearch"/></button>
	                   		<c:if test="${registAuth eq 'Y' }" >
	                   		<button class="btn btn-success btn-sm btnSort" type="button" onclick="fn_withdrawalList('T');"><spring:message code="capital.addCompletedPayments"/></button>
	                   		<button class="btn btn-success btn-sm btnSort" type="button" onclick="fn_withdrawalList('F');"><spring:message code="capital.addPlannedPayments"/></button>
	                   		<!-- <button class="btn btn-success btn-sm" type="button" id="btnAdd">자금일보 추가</button> -->
	                   		<button class="btn btn-primary btn-sm" type="button" id="btnSave"><spring:message code="capital.saveCashPosition"/></button>
	                   		<button class="btn btn-default btn-sm" type="button" id="btnSaveBak"><spring:message code="capital.temporarySave"/></button>
	                   		</c:if>
	                   		<button class="btn btn-default btn-sm" type="button" id="btnSelect2"><spring:message code="capital.searchFrom"/></button>
	                   		<button class="btn btn-danger btn-sm" type="button" id="btnReset"><spring:message code="capital.init"/></button>
                   		</div>			  

                   		<div style="text-align:center;width:180px;float:right;">                   	
                   			<input type="text" class="form-control input-sm" id="erp_cms" value="0">
                   		</div>  			  
			  
			  </div>
			</div> 			

			
			<div style="width:1650px;height:410px;">
			
			<div class="panel panel-default" style="width:800px;height:400px;color:black;float:left;">
			  
			  <div class="panel-heading clearfix">
			  <div class="panel-title pull-left" style="font-size:12px;"><b><spring:message code="capital.erp"/></b></div>
			      <div class="btn-group pull-right">
			       		<i class="glyphicon glyphicon-save ahref" aria-hidden="true" data-toggle="tooltip" title="<spring:message code='capital.saveCashPosition'/>" id="btnAdd1"></i>
			       		<i class="glyphicon glyphicon-export ahref exceldown" aria-hidden="true" data-toggle="tooltip" title="<spring:message code='capital.saveExcel'/>" name="grid_wrap1"></i>
			      </div>	
			  </div>
			  
			  <div class="panel-body" style="width:800px;height:350px;color:black;float:left;">
			            <div id="grid_wrap1" style="width:100%;height:100%;color:black">
			            
			            </div>  
			  </div>
			</div>			


			<div class="panel panel-default" style="width:800px;height:400px;color:black;float:left;">

			  <div class="panel-heading clearfix">
			  <div class="panel-title pull-left" style="font-size:12px;"><b><spring:message code="capital.cms"/></b></div>
			      <div class="btn-group pull-right">
			       		<i class="glyphicon glyphicon-export ahref exceldown" aria-hidden="true" data-toggle="tooltip" title="<spring:message code='capital.saveExcel'/>" name="grid_wrap2"></i>
			       		<i class="glyphicon glyphicon-cog ahref settingbtn" aria-hidden="true"  name="grid_wrap2"></i>
			      </div>			  			  
			  </div>			  

			  <div class="panel-body" style="width:800px;height:350px;color:black;float:left;">
			            <div id="grid_wrap2" style="width:100%;height:100%;color:black">
			            
			            </div>  
			  </div>
			</div>            
            
            </div>
            
			<div style="width:1650px;height:390px">
			
			<div class="panel panel-default" style="width:1600px;height:390px;color:black;">
			  
			  <div class="panel-heading clearfix">
			  <div class="panel-title pull-left" style="font-size:12px;"><b><spring:message code="capital.payments"/></b></div>
			      <div class="btn-group pull-right">
			       		<i class="glyphicon glyphicon-plus ahref add_row" aria-hidden="true" data-toggle="tooltip" title=" <spring:message code='capital.addRow'/>" id="add_row" name="grid_wrap3"></i>
			       		<i class="glyphicon glyphicon-minus ahref del_row" aria-hidden="true" data-toggle="tooltip" title="<spring:message code='capital.delRow'/>" id="del_row" name="grid_wrap3"></i>
			       		<i class="glyphicon glyphicon-floppy-disk ahref save_row" aria-hidden="true" data-toggle="tooltip" title="<spring:message code='capital.save'/>" id="save_row" name="grid_wrap3"></i>
			       		<i class="glyphicon glyphicon-export ahref exceldown" aria-hidden="true" data-toggle="tooltip" title="<spring:message code='capital.saveExcel'/>" name="grid_wrap3"></i>
			      </div>	
			  </div>
			  
			  <div class="panel-body" style="width:100%;height:340px;color:black;">
			            <div id="grid_wrap3" style="width:100%;height:100%;color:black;">
			            
			            </div>  
			  </div>
			</div>			
            
            </div>          
            
            
	<div style="width:1650px;height:390px">
			
			<div class="panel panel-default" style="width:1600px;height:390px;color:black;">
			  
			  <div class="panel-heading clearfix">
			  <div class="panel-title pull-left" style="font-size:12px;"><b><spring:message code='capital.paymentsPlan'/></b></div>
			      <div class="btn-group pull-right">
			       		<i class="glyphicon glyphicon-plus ahref add_row" aria-hidden="true" data-toggle="tooltip" title=" <spring:message code='capital.addRow'/>" id="add_row" name="grid_wrap33"></i>
			       		<i class="glyphicon glyphicon-minus ahref del_row" aria-hidden="true" data-toggle="tooltip" title="<spring:message code='capital.delRow'/>" id="del_row" name="grid_wrap33"></i>
			       		<i class="glyphicon glyphicon-floppy-disk ahref save_row" aria-hidden="true" data-toggle="tooltip" title="<spring:message code='capital.save'/>" id="save_row" name="grid_wrap33"></i>
			       		<i class="glyphicon glyphicon-export ahref exceldown" aria-hidden="true" data-toggle="tooltip" title="<spring:message code='capital.saveExcel'/>" name="grid_wrap33"></i>
			      </div>	
			  </div>
			  
			  <div class="panel-body" style="width:100%;height:340px;color:black;">
			            <div id="grid_wrap33" style="width:100%;height:100%;color:black;">
			            
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
