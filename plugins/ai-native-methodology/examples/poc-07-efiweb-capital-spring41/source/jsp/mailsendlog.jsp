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
	border-width: 2px;
	border-color: gray;
	width:100%;	  	
}

.stable td {
 	border-style: solid;
	border-width: 2px;
	border-color: gray;
	height:30px;
	margin:3px;
	padding:3px;
	font-size:15px;
	color:black;
}	 

.stable th {
 	border-style: solid;
	border-width: 2px;
	border-color: gray;
	height:30px;
	background-color: yellow;
	text-align:center;
	margin:3px;
	padding:3px;
	font-size:14px;
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

var myGridID1;

// AUIGrid 를 생성합니다.
var auiGridProps1 = {
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

var columnLayout1 = [
						{
							dataField: "createDate",
							headerText: "<spring:message code='capital.date'/>",
						},{
							dataField: "fromnm",
							headerText: "<spring:message code='capital.sender'/>",
							filter : {
								showIcon : true
							},							
						},{
							dataField: "fromId",
							headerText: "<spring:message code='capital.senderId'/>",
							filter : {
								showIcon : true
							},							
						},{
							dataField: "fromMail",
							headerText: "<spring:message code='capital.senderEmail'/>",
							filter : {
								showIcon : true
							},							
						},{
							dataField: "tonm",
							headerText: "<spring:message code='capital.recipient'/>",
							filter : {
								showIcon : true
							},							
						},{
							dataField: "toId",
							headerText: "<spring:message code='capital.recipientId'/>",
							filter : {
								showIcon : true
							},							
						},{
							dataField: "toMail",
							headerText: "<spring:message code='capital.recipientEmail'/>",
							filter : {
								showIcon : true
							},							
						},{
							dataField: "alertSubject",
							headerText: "<spring:message code='capital.title'/>",
							filter : {
								showIcon : true
							},							
						},{
							dataField: "errMsg",
							headerText: "<spring:message code='capital.result'/>",
							filter : {
								showIcon : true
							},							
						}
	            	];	

$(document).ready(function(){
	
	$("#comNo").select2();
	
	// 일자 선택
	$("#sdate").datepicker({
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
	
	$("#sdate").val(year + "" + month + "" + day).change(); // 오늘 날짜 선택
	
	$("#grid_wrap1").empty();
	myGridID1 = AUIGrid.create("#grid_wrap1", columnLayout1, auiGridProps1);
	
	$("#btnSelect").click(function(){
		
		if(!isDate($("#sdate").val())){
			alert("<spring:message code='capital.date.validation' />");
			$("#sdate").focus();
			return;
		}
		
		var data = "sdate=" + $("#sdate").val();
		fn_ajax( "/ifrs/capital/mailsendlogAjax", data, function(result){
			
			//console.log(result.list);
			
			AUIGrid.setGridData(myGridID1, result.list);
			var colSizeList = AUIGrid.getFitColumnSizeList(myGridID1, true);
			AUIGrid.setColumnSizeList(myGridID1, colSizeList);				
			
		});
		
	});
	//전일조회

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
		
		var data = "sdate=" + $("#sdate").val();
		fn_ajax( "/ifrs/capital/mailsendlogAjax", data, function(result){
			
			//console.log(result.list);
			
			AUIGrid.setGridData(myGridID1, result.list);
			var colSizeList = AUIGrid.getFitColumnSizeList(myGridID1, true);
			AUIGrid.setColumnSizeList(myGridID1, colSizeList);				
			
		});
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
		
		var data = "sdate=" + $("#sdate").val();
		fn_ajax( "/ifrs/capital/mailsendlogAjax", data, function(result){
			
			//console.log(result.list);
			
			AUIGrid.setGridData(myGridID1, result.list);
			var colSizeList = AUIGrid.getFitColumnSizeList(myGridID1, true);
			AUIGrid.setColumnSizeList(myGridID1, colSizeList);				
			
		});
	});	
});
//날짜포맷 체크 Function
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
 
    if (dtMonth < 1 || dtMonth > 12)
        return false;
    else if (dtDay < 1 || dtDay > 31)
        return false;
    else if ((dtMonth == 4 || dtMonth == 6 || dtMonth == 9 || dtMonth == 11) && dtDay == 31)
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
	
        <div class="content">
 			 			
			<div class="panel panel-default" style="width:1650px;margin-bottom:10px;">
			  <div class="panel-body">

						<div style="float:left;">                   	
                   		&nbsp;&nbsp;<button class="btn btn-default btn-sm" type="button" id="btnPrev">◀</button>
                   		</div>

                   		<div style="float:left;">
                   			<input type="text" class="form-control input-sm" id="sdate" name="sdate" style="width:120px;"  placeholder="일자를 선택하세요.">
                   		</div>
						<div style="float:left;">                   	
                   		<button class="btn btn-default btn-sm" type="button" id="btnNext">▶</button>
                   		</div> 
                   		
						<div style="float:left;width:10px;">
							&nbsp;&nbsp;&nbsp;&nbsp;
						</div>                   		
                   		
                   		<div style="float:left;">
                   			<button class="btn btn-default btn-sm" type="button" id="btnSelect"><spring:message code='capital.search'/></button>	                   		                 		
                   		</div>                     		               		                   		 
		  
			  
			  </div>
			</div> 
			
					

            <div class="panel panel-default" style="width:1650px;margin-bottom:10px;">
            <div class="panel-body">

			            <div id="grid_wrap1" style="width:100%;height:700px;color:black;">
			            
			            </div> 				
		
			</div> 	
			</div>	
					
            
            </div>            


        </div>

	<jsp:include page="/WEB-INF/jsp/config/footer.jsp"/>
	
</div>

<div id="printimg">
</div>

</body>
</html>
<jsp:include page="/WEB-INF/jsp/config/footer_naviTime_capital.jsp"/>