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

	var myGridID1;
	
	var columnLayout1 = [
							{
								dataField: "<spring:message code='capital.relation'/>",
								headerText: "<spring:message code='capital.relation'/>",
								style : "left-cell",
								filter : {showIcon : true},
								visible : true
							},{
								dataField: "<spring:message code='capital.entity2'/>",
								headerText: "<spring:message code='capital.entity2'/>",
								style : "left-cell",
								filter : {showIcon : true},
								visible : true
							},{
								dataField: "<spring:message code='capital.group'/>",
								headerText: "<spring:message code='capital.group'/>",
								style : "left-cell",
								filter : {showIcon : true},
								visible : true
							},{
								dataField: "<spring:message code='capital.financialInstitution'/>",
								headerText: "<spring:message code='capital.financialInstitution'/>",
								style : "left-cell",
								filter : {showIcon : true},
								visible : true
							},{
								dataField: "계좌번호",
								headerText: "<spring:message code='capital.accountNumber'/>",
								style : "left-cell",
								filter : {showIcon : true},
								visible : true
							},{
								dataField: "통화",
								headerText: "<spring:message code='capital.currency'/>",
								style : "left-cell",
								filter : {showIcon : true},
								visible : true
							},{
		            			dataField: "전일잔액",
		            			headerText: "<spring:message code='capital.previousDayBalance'/>",
		            			style : "money",
		            			dataType : "numeric",
		            			formatString : "#,###",
		            			filter : {showIcon : true},
		            			visible : true
		            		},{
		            			dataField: "입금건수",
		            			headerText: "<spring:message code='capital.numberofReceipts'/>",
		            			style : "money",
		            			dataType : "numeric",
		            			formatString : "#,###",
		            			filter : {showIcon : true},
		            			visible : true
		            		},{
		            			dataField: "입금총액",
		            			headerText: "<spring:message code='capital.totalReceipts'/>",
		            			style : "money",
		            			dataType : "numeric",
		            			formatString : "#,###",
		            			filter : {showIcon : true},
		            			visible : true
		            		},{
		            			dataField: "출금건수",
		            			headerText: "<spring:message code='capital.numberofPayments'/>",
		            			style : "money",
		            			dataType : "numeric",
		            			formatString : "#,###",
		            			filter : {showIcon : true},
		            			visible : true
		            		},{
		            			dataField: "출금총액",
		            			headerText: "<spring:message code='capital.totalPayments'/>",
		            			style : "money",
		            			dataType : "numeric",
		            			formatString : "#,###",
		            			filter : {showIcon : true},
		            			visible : true
		            		},{
		            			dataField: "잔액",
		            			headerText: "<spring:message code='capital.balance'/>",
		            			style : "money",
		            			dataType : "numeric",
		            			formatString : "#,###",
		            			filter : {showIcon : true},
		            			visible : true
		            		}
		            	];	
	
	var auiGridProps1 = {
			editable : false,
			useGroupingPanel : true,
 			groupingFields : ["<spring:message code='capital.relation'/>","<spring:message code='capital.entity2'/>","<spring:message code='capital.group'/>","<spring:message code='capital.financialInstitution'/>"],			
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
			showFooter :true,
			//headerHeight : 48,
			//wrapSelectionMove : true,
	};			

	$(document).ready(function(){
		
		$("#comNo").hide();
		
		$("#comNo").val(SESSION);
		
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
			
			fn_selectList(); // 조회
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
			
			fn_selectList(); // 조회
		});				
		
		myGridID1 = AUIGrid.create("#grid_wrap1", columnLayout1, auiGridProps1);
		
		
		// 조회
		function fn_selectList() {
			
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
			
			var sdate3 = year + "" + month + "" + day;
			
			var data = "comNo=" + $("#comNo").val();
			data += "&sdate2=" + $("#sdate").val();
			
			var url = "<c:url value='/ifrs/capital/IfrsAssetListAjax5' />";
			fn_ajax(url, data, function( result ){
				
				var data1 = result.list;
				
				var data = "comNo=" + $("#comNo").val();
				data += "&sdate2=" + sdate3;				
				
				var url = "<c:url value='/ifrs/capital/IfrsAssetListAjax5' />";
				fn_ajax(url, data, function( result ){
					
					var data2 = result.list;
					
					//console.log(data1);
					
					for ( var i=0 in data1 ) {
						for ( var z=0 in data2 ) {
							if ( data1[i].계좌번호 == data2[z].계좌번호 ) {
								data1[i].전일잔액 = data2[z].잔액;
							} 							
						}
					}
					
					
					AUIGrid.setGridData(myGridID1, data1);
					var colSizeList = AUIGrid.getFitColumnSizeList(myGridID1, true);
					AUIGrid.setColumnSizeList(myGridID1, colSizeList);											
					
				});
				
			});
			
		}		
		
		$("#btnSelect").unbind("click");
		$("#btnSelect").click(function(){
			fn_selectList();
		});		
		
		
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
	}

</script>
</head>


<body>

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
	<c:set var="relation" value="<spring:message code='capital.relation'/>" />
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
	                   		<button class="btn btn-default btn-sm" type="button" id="btnSelect"><spring:message code='capital.search'/></button>
                   		</div>			  
			  
			  </div>
			</div> 			
            
			<div style="width:1650px;height:850px">
			
			<div class="panel panel-default" style="width:1600px;height:800px;color:black;">
			  
			  <div class="panel-heading clearfix">
			  <div class="panel-title pull-left" style="font-size:12px;"><b><spring:message code='capital.accountSearchDetails'/></b></div>
			      <div class="btn-group pull-right">
			       		<i class="glyphicon glyphicon-export ahref exceldown" name="grid_wrap1"></i>
			      </div>	
			  </div>
			  
			  <div class="panel-body" style="width:100%;height:750px;color:black;">
			            <div id="grid_wrap1" style="width:100%;height:700px;color:black;">
			            
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