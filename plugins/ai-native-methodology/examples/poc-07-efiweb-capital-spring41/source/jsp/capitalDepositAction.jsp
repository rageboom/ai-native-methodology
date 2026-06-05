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
	
	var SESSION = "${SESSION}"; // 소속 법인 번호
	
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
	
	
	// ERP 입금내역 컬럼
	var columnLayout1 = [
						{
	            			dataField: "accno",
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
							dataField: "remseqname1",
							headerText: "<spring:message code='capital.vendor'/>",
							style : "left-cell",
							width:150,
							filter : {showIcon : true},
							visible : true
						},{
							dataField: "remseqname2",
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
	            			dataField: "dramt",
	            			headerText: "차변금액",
	            			style : "money",
	            			dataType : "numeric",
	            			formatString : "#,##0.00",
	            			filter : {showIcon : true},
	            			visible : false
	            		},{
	            			dataField: "cramt",
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
	            			headerText: "전표번호",
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
						dataField : "cramt",
						positionField : "cramt",
						operation : "SUM",
						formatString : "#,##0.00",
						style : "money",
					}];	
	
	
		// CMS 입금내역 컬럼
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
			            			headerText: "입금일",
			            			style : "left-cell",
			            			filter : {showIcon : true},
			            			visible : false
			            		},{
			            			dataField: "tranHh",
			            			headerText: "입금시간",
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
			            			headerText: "<spring:message code='capital.amount3'/>",
			            			style : "money",
			            			dataType : "numeric",
			            			formatString : "#,##0.00",			 
			            			width:180,
			            			filter : {showIcon : true},
			            			visible : true
			            		},{
			            			dataField: "outAmount",
			            			headerText: "출금액",
			            			filter : {showIcon : true},
			            			visible : false
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
								dataField : "incomAmount",
								positionField : "incomAmount",
								operation : "SUM",
								formatString : "#,##0.00",
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
									dataField: "remseqname1",
									headerText: "<spring:message code='capital.vendor'/>/<spring:message code='capital.accountNumber'/>",
									style : "left-cell",
									width:150,
									filter : {showIcon : true},
									visible : true
								},{
									dataField: "remseqname2",
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
			            			dataField: "dramt",
			            			headerText: "차변금액",
			            			style : "money",
			            			dataType : "numeric",
			            			formatString : "#,##0.00",
			            			filter : {showIcon : true},
			            			visible : false
			            		},{
			            			dataField: "cramt",
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
			            			headerText: "전표번호",
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

		$("#comNo").val(SESSION);		
		
		
		  
		// AUIGrid 를 생성합니다.
		var auiGridProps = {
				editable : false,
				//rowIdField : "", // 행의 고유 필드명 그리드내에서의 키값
				processValidData : false, // dataType 에 맞게 validData 기능 사용
				showStateColumn : true, //상태값을 아이콘으로 삭제 등록 취소등
				softRemovePolicy : "exceptNew",
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
					dataFields : [ "incomAmount" ]
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
		function fn_selectList(SaveType) {
			
			if(!isDate($("#sdate").val())){
				alert("<spring:message code='capital.date.validation' />");
				$("#sdate").focus();
				return;
			}
			
			$.isLoading({ tpl: "<span class='isloading-wrapper %wrapper%'>Loading&nbsp;&nbsp;<i class='fa fa-refresh fa-spin'></i></span>" });
			
			fn_checkAllfalse();
			var data = "comNo=" + $("#comNo").val();
			data += "&sdate=" + $("#sdate").val();
			data += "&sType=2";
			data += "&SaveType=" + SaveType;
			
			
			
			var url = "<c:url value='/ifrs/capital/IfrsERPINListAjax' />";
			fn_ajax(url, data, function( result ){
				AUIGrid.setGridData(myGridID1, result.list);
				
		 		var url = "<c:url value='/ifrs/capital/IfrsCMSINListAjax' />";
				fn_ajax(url, data, function( result ){
					AUIGrid.setGridData(myGridID2, result.list);
					
			 		var url = "<c:url value='/ifrs/capital/IfrsERPINReportAjax' />";
			 		data += "&sType=2";
			 		//console.log(data);
					fn_ajax(url, data, function( result ){
						for ( var i=0 in result.list ) {
							result.list[i].accname = result.list[i].accname.replace(/percent_text/gi,"%").replace(/and_text/gi,"&").replace(/dblqt/gi,"\"").replace(/gtgt/gi,"\<").replace(/ltlt/gi,"\>");
							result.list[i].summary = result.list[i].summary.replace(/percent_text/gi,"%").replace(/and_text/gi,"&").replace(/dblqt/gi,"\"").replace(/gtgt/gi,"\<").replace(/ltlt/gi,"\>");
							//2020.10.05 김승희
							result.list[i].remseqname1 = result.list[i].remseqname1.replace(/percent_text/gi,"%").replace(/and_text/gi,"&").replace(/dblqt/gi,"\"").replace(/gtgt/gi,"\<").replace(/ltlt/gi,"\>");
							
						}						
						AUIGrid.setGridData(myGridID3, result.list);
						var colSizeList = AUIGrid.getFitColumnSizeList(myGridID3, true);
						AUIGrid.setColumnSizeList(myGridID3, colSizeList);		
						
						
				 		var url = "<c:url value='/ifrs/capital/IfrsERPINReportAjax' />";
						var data = "comNo=" + $("#comNo").val();
						data += "&sdate=" + $("#sdate").val();			 		
				 		data += "&sType=22";
				 		data += "&SaveType=" + SaveType;
				 		//console.log(data);
						fn_ajax(url, data, function( result ){
							for ( var i=0 in result.list ) {
								result.list[i].accname = result.list[i].accname.replace(/percent_text/gi,"%").replace(/and_text/gi,"&").replace(/dblqt/gi,"\"").replace(/gtgt/gi,"\<").replace(/ltlt/gi,"\>");
								result.list[i].summary = result.list[i].summary.replace(/percent_text/gi,"%").replace(/and_text/gi,"&").replace(/dblqt/gi,"\"").replace(/gtgt/gi,"\<").replace(/ltlt/gi,"\>");
								//2020.10.05 김승희
								result.list[i].remseqname1 = result.list[i].remseqname1.replace(/percent_text/gi,"%").replace(/and_text/gi,"&").replace(/dblqt/gi,"\"").replace(/gtgt/gi,"\<").replace(/ltlt/gi,"\>");
							}						
							AUIGrid.setGridData(myGridID33, result.list);
							var colSizeList = AUIGrid.getFitColumnSizeList(myGridID33, true);
							AUIGrid.setColumnSizeList(myGridID33, colSizeList);		
							setTimeout( function(){$.isLoading( "hide" );}, 10 );							
						});								
						
						
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
		

		// 자금일보 추가
		$("#btnAdd").unbind("click");
		$("#btnAdd").click(function(){
			
			var checkedItems = AUIGrid.getCheckedRowItems(myGridID1);
			
			var result = [];
			for(var i=0 in checkedItems) {
				result[i] = checkedItems[i].item;
			}
			
			//console.log(result);
			
			AUIGrid.addRow(myGridID3, result, 'last');
			var colSizeList = AUIGrid.getFitColumnSizeList(myGridID3, true);
			AUIGrid.setColumnSizeList(myGridID3, colSizeList);

			fn_checkAllfalse();			
			
		});
		
		$("#btnAdd1").unbind("click");
		$("#btnAdd1").click(function(){
			$("#btnAdd").trigger("click");
		});
		
		

		
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
		}
		
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
			
			if ( wrapId == "grid_wrap1" ) {
			
				var data = "comNo=" + $("#comNo").val() + "&sType=N&sType1=1";
				var url = "<c:url value='/ifrs/capital/IfrsERPINSetAjax' />";
								
				fn_ajax(url, data, function( result ){
					
					var w = Number($("#modal_div1").css("width").replace("px","")) - 30;
					
					AUIGrid.destroy("#grid_wrap4");
					myGridID4 = null;
					$("#setting1").modal({ show: true });
					
					myGridID4 = AUIGrid.create("#grid_wrap4", columnLayout4, auiGridPropsModal);
					AUIGrid.setGridData(myGridID4, result.list);
					AUIGrid.resize(myGridID4, w, '350');
					var colSizeList = AUIGrid.getFitColumnSizeList(myGridID4, true);
					AUIGrid.setColumnSizeList(myGridID4, colSizeList);
					
				});
				
				var data = "comNo=" + $("#comNo").val() + "&sType=Y&sType1=1";
				var url = "<c:url value='/ifrs/capital/IfrsERPINSetAjax' />";
				
				fn_ajax(url, data, function( result ){
					
					var w = Number($("#modal_div1").css("width").replace("px","")) - 30;
					
					AUIGrid.destroy("#grid_wrap4_1");
					myGridID4_1 = null;
					
					myGridID4_1 = AUIGrid.create("#grid_wrap4_1", columnLayout4, auiGridPropsModal);
					AUIGrid.setGridData(myGridID4_1, result.list);
					AUIGrid.resize(myGridID4_1, w, '300');
					var colSizeList = AUIGrid.getFitColumnSizeList(myGridID4, true);
					AUIGrid.setColumnSizeList(myGridID4_1, colSizeList);
					AUIGrid.setAllCheckedRows(myGridID4_1, true);
					
				}); 		
				
 				$('.modal-dialog').unbind("resize");
				$('.modal-dialog').resize(function(){
					
					AUIGrid.resize(myGridID4);
					var colSizeList = AUIGrid.getFitColumnSizeList(myGridID4, true);
					AUIGrid.setColumnSizeList(myGridID4, colSizeList);							
					
					AUIGrid.resize(myGridID4_1);
					var colSizeList = AUIGrid.getFitColumnSizeList(myGridID4_1, true);
					AUIGrid.setColumnSizeList(myGridID4_1, colSizeList);					
				});				
			
			}
			
			
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
								//console.log(grepRow);
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
								//console.log(grepRow);
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
			
			//console.log($(this).attr("name"));
			
			var item = new Object();
			var rowPos = "last";
			item.linkvalue = "";
			item.accname = "";
			item.remseqname1 = "";
			item.remseqname2 = "";
			item.summary = "";
			item.dramt = "";
			item.cramt = "";
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
		
		// 계정코드 추가 버튼
		$("#erpAccDown").unbind("click");
		$("#erpAccDown").click(function(){
			var checkedItems = AUIGrid.getCheckedRowItems(myGridID4);
			var result = [];
			for(var i=0 in checkedItems) {
				result[i] = checkedItems[i].item;
			}
			AUIGrid.addRow(myGridID4_1, result, 'last');
			AUIGrid.removeCheckedRows(myGridID4);
		});
		
		// 계정코드 제거 버튼
		$("#erpAccUp").unbind("click");
		$("#erpAccUp").click(function(){
			var checkedItems = AUIGrid.getCheckedRowItems(myGridID4_1);
			var result = [];
			for(var i=0 in checkedItems) {
				result[i] = checkedItems[i].item;
			}
			AUIGrid.addRow(myGridID4, result, 'last');
			AUIGrid.removeCheckedRows(myGridID4_1);
		});		
		
		// 계정코드 모달 저장
		$("#erpAccBtn1").unbind("click");
		$("#erpAccBtn1").click(function(){
			
			var comNo = $("#comNo").val();
			AUIGrid.setAllCheckedRows(myGridID4_1, true);
			var checkedItems = AUIGrid.getCheckedRowItems(myGridID4_1);
			
			var xml = "<ROOT>";

			for(var i=0 in checkedItems) {
				xml += "<DATAROW ";
				xml += " CompanySeq=\"" + comNo + "\"";
				xml += " sType=\"1\"";
				xml += " sData=\"" + checkedItems[i].item.accno + "\"";
				xml += "></DATAROW>";
			}
			
			xml += "</ROOT>";
			
			var data = "CompanySeq=" + $("#comNo").val();
			data += "&sType=1";
			data += "&xml=" + xml;
			
			var url = "<c:url value='/ifrs/capital/IfrsERPINSetSave' />";
			fn_ajax(url, data, function( result ){
				$("#setting1").modal('toggle');
				msg("적용 되었습니다.");
			});
			
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
			
			var url = "<c:url value='/ifrs/capital/IfrsERPINSetSave' />";
			fn_ajax(url, data, function( result ){});			
			
			var url = "<c:url value='/ifrs/capital/IfrsCMSINSetSave' />";
			fn_ajax(url, data, function( result ){
				$("#setting2").modal('toggle');
				msg("적용 되었습니다.");
			});			
		});
		
		
		// 입금내역 초기화
		$("#btnReset").unbind("click");
		$("#btnReset").click(function(){
			AUIGrid.setAllCheckedRows(myGridID3, true);
			AUIGrid.removeCheckedRows(myGridID3);
			
			AUIGrid.setAllCheckedRows(myGridID4, true);
			AUIGrid.removeCheckedRows(myGridID4);						
		});			
		
		 
		// 입금내역 자금일보 전달
		$("#save_row, #btnSave").unbind("click");
		$("#save_row, #btnSave").click(function(){
			$("#confirmmodal").modal({ show: true });
		});		
		
		$("#save_row1, #btnSaveBak").unbind("click");
		$("#save_row1, #btnSaveBak").click(function(){
			var comNo = $("#comNo").val();
			var sdate = $("#sdate").val();
			
			var id = $(this).attr("id");
			
			var SaveType = "";
			
			if ( id == 'save_row1' ) {
				SaveType = "R";
			} else {
				SaveType = "B";
			}			
			
			AUIGrid.setAllCheckedRows(myGridID3, true);
			var checkedItems = AUIGrid.getCheckedRowItems(myGridID3);
			
 			var xml = "<ROOT>";

			for(var i=0 in checkedItems) {
				xml += "<DATAROW ";
				xml += " sType=\"2\"";
				xml += " companyseq=\"" + comNo + "\"";
				xml += " sDate=\"" + sdate + "\"";
				xml += " accno=\"" + checkedItems[i].item.accno + "\"";
				xml += " accname=\"" + checkedItems[i].item.accname.replace(/%/gi,"percent_text").replace(/&/gi,"and_text").replace(/\"/gi,"dblqt").replace(/\</gi,"gtgt").replace(/\>/gi,"ltlt") + "\"";
				xml += " remseqname1=\"" + checkedItems[i].item.remseqname1.replace(/%/gi,"percent_text").replace(/&/gi,"and_text").replace(/\"/gi,"dblqt").replace(/\</gi,"gtgt").replace(/\>/gi,"ltlt") + "\"";
				xml += " summary=\"" + checkedItems[i].item.summary.replace(/%/gi,"percent_text").replace(/&/gi,"and_text").replace(/\"/gi,"dblqt").replace(/\</gi,"gtgt").replace(/\>/gi,"ltlt") + "\"";
				
				var cramt = 0;								
				if ( typeof(checkedItems[i].item.cramt) == "string" ) {															
					cramt = Number(checkedItems[i].item.cramt.replace(/,/gi,""));										
				} else {
					cramt = checkedItems[i].item.cramt;
				}					
								
				xml += " cramt=\"" + cramt + "\"";								
				xml += "></DATAROW>";
			}
			
			xml += "</ROOT>";
			
			var data = "CompanySeq=" + comNo;
			data += "&sType=2";
			data += "&sDate=" + sdate;
			data += "&xml=" + xml;
			data += "&SaveType=" + SaveType;
			
			//console.log(data);
			
			var url = "<c:url value='/ifrs/capital/IfrsERPINListSave' />";
			fn_ajax(url, data, function( result ){
				
				AUIGrid.setAllCheckedRows(myGridID33, true);
				var checkedItems = AUIGrid.getCheckedRowItems(myGridID33);
				
				//console.log(checkedItems);
				
	 			var xml = "<ROOT>";

				for(var i=0 in checkedItems) {
					xml += "<DATAROW ";
					xml += " sType=\"22\"";
					xml += " companyseq=\"" + comNo + "\"";
					xml += " sDate=\"" + sdate + "\"";
					xml += " accno=\"" + checkedItems[i].item.accno + "\"";
					xml += " accname=\"" + checkedItems[i].item.accname.replace(/%/gi,"percent_text").replace(/&/gi,"and_text").replace(/\"/gi,"dblqt").replace(/\</gi,"gtgt").replace(/\>/gi,"ltlt") + "\"";
					xml += " remseqname1=\"" + checkedItems[i].item.remseqname1.replace(/%/gi,"percent_text").replace(/&/gi,"and_text").replace(/\"/gi,"dblqt").replace(/\</gi,"gtgt").replace(/\>/gi,"ltlt") + "\"";
					xml += " summary=\"" + checkedItems[i].item.summary.replace(/%/gi,"percent_text").replace(/&/gi,"and_text").replace(/\"/gi,"dblqt").replace(/\</gi,"gtgt").replace(/\>/gi,"ltlt") + "\"";
					
					var cramt = 0;								
					if ( typeof(checkedItems[i].item.domamt) == "string" ) {
						cramt = Number(checkedItems[i].item.cramt.replace(/,/gi,""));										
					} else {
						cramt = checkedItems[i].item.cramt;
					}					
					
					xml += " cramt=\"" + cramt + "\"";
					xml += "></DATAROW>";
				}
				
				xml += "</ROOT>";
				
				var data = "CompanySeq=" + comNo;
				data += "&sType=22";
				data += "&sDate=" + sdate;
				data += "&xml=" + xml;
				data += "&SaveType=" + SaveType;
				
				//console.log(data);
				
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
		$("#sdate").val('20170103');
 */

		function cellEditEndBeforeHandler(event) {
			if(event.dataField == "cramt") {
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

	<!-- 환경설정 Modal1 -->
	<div id="setting1" class="modal fade">
	
	<div class="modal-dialog" id="modal_div1">
	<div class="modal-content">
	<div class="modal-header">
	<div class="btn-group">
	
	<button type="button" class="btn btn-default btn-sm" id="erpAccBtn1">적용</button>
	<button type="button" class="btn btn-default btn-sm" data-dismiss="modal">닫기</button>
	</div>
    </div>
   	
   	<div class="modal-body">
   	
            <div id="grid_wrap4" style="width:100%;height:350px;color:black;">
			            
            </div>   
            
            <div id="grid_wrap4_btn" style="width:100%;color:black;text-align:center;">
            <div class="btn-group">
            	
				<button type="button" class="btn btn-default btn-sm  btn-sm" id="erpAccDown" style="width:100px;">
					<i class="glyphicon glyphicon-chevron-down" aria-hidden="true"></i>
				</button>
				
				<button type="button" class="btn btn-default btn-sm  btn-sm" id="erpAccUp" style="width:100px;">
					<i class="glyphicon glyphicon-chevron-up" aria-hidden="true"></i>
				</button>            	
            	
            </div>
            </div>
            
            <div id="grid_wrap4_1" style="width:100%;height:300px;color:black;">
			            
            </div>            	

  	</div>

	
	</div>
	</div>
	
	</div>
	<!-- 환경설정 Modal1 -->
	
	
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
                   		
                   		<div>
	                   		&nbsp;&nbsp;
	                   		<button class="btn btn-default btn-sm" type="button" id="btnSelect"><spring:message code="capital.search"/></button>
	                   		<c:if test="${registAuth eq 'Y' }" >
	                   		<button class="btn btn-success btn-sm" type="button" id="btnAdd"><spring:message code="capital.addCashPosition"/></button>
	                   		<button class="btn btn-primary btn-sm" type="button" id="btnSave"><spring:message code="capital.saveCashPosition"/></button>
	                   		<button class="btn btn-default btn-sm" type="button" id="btnSaveBak"><spring:message code="capital.temporarySave"/></button>
	                   		</c:if>
	                   		<button class="btn btn-default btn-sm" type="button" id="btnSelect2"><spring:message code="capital.searchFrom"/></button>	                   		
	                   		<button class="btn btn-danger btn-sm" type="button" id="btnReset"><spring:message code="capital.init"/></button>
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
			       		<i class="glyphicon glyphicon-cog ahref settingbtn" aria-hidden="true"  name="grid_wrap1"></i>
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
			  <div class="panel-title pull-left" style="font-size:12px;"><b><spring:message code="capital.receipts"/></b></div>
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
			  <div class="panel-title pull-left" style="font-size:12px;"><b><spring:message code='capital.receiptsPlan'/></b></div>
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
<jsp:include page="/WEB-INF/jsp/config/footer_naviTime_capital.jsp"/>
</body>
</html>
