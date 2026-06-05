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
<%-- <script type="text/javascript" src="${scriptPath}/ifrs/gridCommon.js?2"></script> --%>


<script src="${scriptPath}/ifrs/echarts/echarts-all.js"></script>



<style type="text/css">
div#container { width:1900px; }
div#content { width:1500px; }
/* .money {text-align:right;} */
.left-cell {text-align:left;}
/* .center {text-align:center;} */
#sdate {text-align:center;font-size:15px;}
#sdate1 {text-align:center;font-size:15px;background-color:#e6f0ff;}


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



</style>

<script type="text/javascript">
	
	//AUIGrid 생성 후 반환 ID
	var myGridID;
		
	// 컬럼 레이아웃
	var columnLayout = [
						{
	            			dataField: "sdate",
	            			headerText: "일자",
	            			filter : {showIcon : true},
	            		},{
	            			dataField: "wname",
	            			headerText: "요일",
	            			filter : {showIcon : true},
	            		},{
	            			dataField: "wyear",
	            			headerText: "연도",
	            			filter : {showIcon : true},
	            		},{
	            			dataField: "wmonth",
	            			headerText: "월",
	            			filter : {showIcon : true},
	            		},{
	            			dataField: "wweek",
	            			headerText: "주차",
	            			filter : {showIcon : true},
	            		}
	            	];		
	
	// AUIGrid 를 생성합니다.
	var auiGridProps = {
			editable : true,
			//rowIdField : "", // 행의 고유 필드명 그리드내에서의 키값
			processValidData : false, // dataType 에 맞게 validData 기능 사용
			//showStateColumn : true, //상태값을 아이콘으로 삭제 등록 취소등
			softRemovePolicy : "exceptNew",
			enableFocus : true, 
			editBeginMode : "doubleClick",
			editingOnKeyDown : true,
			selectionMode : "multipleCells",
			showRowNumColumn : false,
			showRowCheckColumn : false, 	//체크박스
			showRowAllCheckBox : false,
			enableFilter : true,
			showFooter :false,		
	};		
	
	

	$(document).ready(function(){
		
		
		// 엑셀 저장 버튼
		$('.exceldown').unbind("click");
		$('.exceldown').click(function () {
			var wrapId = $(this).attr("name");
			var exportProps = {fileName : wrapId};
			AUIGrid.setProp("#"+ wrapId, "exportURL", "/ifrs/capital/export.do");			
			AUIGrid.exportToXlsx("#"+ wrapId, true, exportProps);
		});		
		
		// 주차달력 만들기
		var monArrName = new Array('일','월','화','수','목','금','토'); // 요일
		var monArr = new Array(31,28,31,30,31,30,31,31,30,31,30,31); // 월말일
		
		var weekm = 0;
		var weekk = "";
		var weekw = 0;
		var resultw = [];
		var resultw1 = [];
		var dday = 0;
		
		for (a=2000;a<=2030;a++) { // 년도
			for (b=1;b<=12;b++) { // 월
				var b1=b;
				if ( b < 10 ) {b1 = "0" + b;}
				dday = monArr[Number(b)-1];
				for (c=1;c<=dday;c++) { // 일
					var c1=c;
					if ( c < 10 ) {c1 = "0" + c;}
					//console.log(a+'-'+b1+'-'+c1);
					var datelabel = a+'-'+b1+'-'+c1;
					var week = new Date(datelabel).getDay();

					var lastDay = 31;
					var day = 28;
					var pday = "";
					
					if( b1 != '02' ) {
						lastDay = monArr[Number(b)-1];
						pday = a+'-'+b1+'-'+c1+'='+monArrName[week];												
					} else {
						if( ((a%4 == 0 && a%100 != 0) || a%400 == 0 ) && c < 30 ) { // 윤달일 경우
							pday = a+'-'+b1+'-'+c1+'='+monArrName[week];
						}
						else { // 윤달이 아닐 경우
							if( c < 29 ) {
								pday = a+'-'+b1+'-'+c1+'='+monArrName[week];
							}
						}
					}
					
					if ( pday != "" ) {						
						if ( week == 1 ) {
							if ( weekm != b ) {
								weekw = 0;
								weekk=b1;
							} else {
								
							}
							weekw++;
							//console.log(pday + "-" + weekw);
							weekm=b;							
						}
						
						var aa = a;
						var b1a = weekk;
						var weekwa = weekw;
						
						if ( b == 1 && weekw == 0 ) { // 연도가 바뀌었을 경우
							
 							aa = Number(pday.split("=")[0].replace(/-/gi,"").substring(0,4))-1;
						
							//console.log(aa);
						
							b1a = "12";
							var wcount = 0;
							for (var d=0;d<=31;d++){
								if (d<10){d = "0"+d;}									
								var newday = aa+"-12-"+d;
								var weekz = new Date(newday).getDay();
								if ( weekz == 1 ) {
									wcount++;
								}
							}
							weekwa=wcount;
						}
												
						//console.log(pday+"="+aa+"/"+b1a+"/"+weekwa);
						
						var nyear = pday.split("=")[0].replace(/-/gi,"");
						
						
						if ( nyear.substr(4,2) == '01' &&  b1a == "12") {														
						
							//console.log(nyear.substr(4,2) + ":" + b1a);				
							aa = Number(nyear.substr(0,4))-1;
							
						}
						
						var obj = {};
						obj.sdate=nyear;
						obj.wname=pday.split("=")[1];
						obj.wyear=aa;
						obj.wmonth=b1a;
						obj.wweek=weekwa;
						resultw.push(obj);
						
						
					}
					
										
					
				}
			}
		}
		
		//console.log(resultw);
		
		myGridID = AUIGrid.create("#grid_wrap", columnLayout, auiGridProps);
		AUIGrid.setGridData(myGridID, resultw);
					

		});
	

		
	

</script>
</head>


<body>


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
   	<h1 style="font-size:25px;font-color:red;">개발중인 화면입니다. (사용금지)</h1>
   	</div>

		<div>
			<input type="text" id="mailaddr" class="form-control" readonly value="">
		</div>
   	   	
		<div>
			<input type="text" id="mailtitle" class="form-control" placeholder="메일 제목을 입력하세요.">
		</div>
		
		<div id="mailcontent">
			<textarea style="width:100%;" id="bbs"></textarea>
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

						<div style="float:left;width:10px;">
						&nbsp;&nbsp;
						</div>

                   		<div style="float:left;">
                   		<input type="text" class="form-control input-sm" id="sdate" name="sdate" placeholder="시작일자를 선택하세요.">
                   		</div>
                   		
                   		<div style="float:left;">
                   		<input type="text" class="form-control input-sm" readonly style="width:35px;font-size:16px;font-weight:bolder;" value="=">
                   		</div>
                   		
                   		<div style="float:left;">
                   		<input type="text" class="form-control input-sm" id="sdate1" name="sdate1" readonly>
                   		</div>                   		 
                		
                   		
                   		<div>
	                   		&nbsp;&nbsp;
	                   		<button class="btn btn-default btn-sm" type="button" id="btnSelect">조&nbsp;회</button>
	                   		<button class="btn btn-success btn-sm" type="button" id="btnSelect">저&nbsp;장</button>
	                   		<button class="btn btn-danger btn-sm" type="button" id="btnSelect">초기화</button>
	                   		<button class="btn btn-default btn-sm" type="button" id="sendMailModal">메일 발송</button>
	                   		<button class="btn btn-default btn-sm" type="button" id="setMail">메일 설정</button>
                   		</div>			  
			  
			  </div>
			</div> 			

            
			<div style="width:1650px;">
			
			<div class="panel panel-default" style="width:800px;height:100%;color:black;float:left;">
			  
			  <div class="panel-heading clearfix">
			  <div class="panel-title pull-left" style="font-size:12px;"><b>주차구하기</b></div>
			      <div class="btn-group pull-right">
			       		<i class="glyphicon glyphicon-export ahref exceldown" aria-hidden="true" data-toggle="tooltip" title="엑셀저장" name="grid_wrap"></i>
			      </div>	
			  </div>
			  
			  <div class="panel-body" style="width:100%;height:100%;color:black;">
		
			            <div id="grid_wrap" style="width:100%;height:700px;color:black;">
			            
			            </div>  		
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