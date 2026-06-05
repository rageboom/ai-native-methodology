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
	//AUIGrid 생성 후 반환 ID
	var myGridID;
	
	
	function fn_selectList(){
		
		var url = "<c:url value='/ifrs/capital/comBasicInfoListAjax' />";
		data = {};
		fn_ajax(url, data, function( result ){
			// 데이터 요청, 요청 성공 시 AUIGrid 에 데이터 삽입합니다.
			//console.log(result.result);
			AUIGrid.setGridData(myGridID, result.result);
		});	
	
	}
	
	
	// 컬럼 레이아웃
	var columnLayout = [
						{
	            			dataField: "comNo",
	            			headerText: "법인번호",
	            			style : "left-cell",
	            			filter : {showIcon : true},
	            			visible : false
	            		},{
							dataField: "comNm",
							headerText: '<spring:message code="capital.entity" />',
							style : "left-cell",
							filter : {showIcon : true},
							visible : true
						},{
							dataField: "comNmEn",
							headerText: "법인코드",
							style : "left-cell",
							filter : {showIcon : true},
							visible : false
						},{
							dataField: "currCd",
							headerText: "거래통화",
							filter : {showIcon : true},
							visible : false
						},{
	            			dataField : "capitalYn",
	            			headerText : '<spring:message code="capital.entityLinking" />',
	            			width: 100,
	            			renderer : {
	            				type : "CheckBoxEditRenderer",
	            				showLabel : false, // 참, 거짓 텍스트 출력여부( 기본값 false )
	            				editable : true, // 체크박스 편집 활성화 여부(기본값 : false)
	            				checkValue : "Y", // true, false 인 경우가 기본
	            				unCheckValue : "N"
	            			}
	            		},{
	            			dataField : "cmsUseYn",
	            			headerText : 'cmsUseYn',
	            			visible : false
	            		}
	            	];	
	

	
	$(document).ready(function(){
		
		var SESSION = "${SESSION}"; // 소속 법인 번호
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
				showRowCheckColumn : false, 	//체크박스
				showRowAllCheckBox : false,
				enableFilter : true,
				showFooter :false,
				//headerHeight : 48,
				//wrapSelectionMove : true,
				// row Styling 함수
				rowStyleFunction : function(rowIndex, item) {
					if(item.capitalYn == "Y") {
						return "my-row-style";
					}
					return "";
				}				
		};
		
		dataLoad();
		
		function dataLoad() {
			AUIGrid.destroy("#grid_wrap");
			myGridID = null;
			
			myGridID = AUIGrid.create("#grid_wrap", columnLayout, auiGridProps);
			fn_selectList();
		}
		
		// 버튼 툴팁 적용
		$('[data-toggle="tooltip"]').tooltip(); 
		
		// 모달 드레그
		$('.modal-dialog').draggable({
			handle: ".modal-header",
			containment : "document"
		});			
		
		// 저장 모달
		$("#saveBtn").unbind("click");
		$("#saveBtn").click(function(){
			$("#confirmmodal").modal({ show: true });
		});
		
		// 저장 실행
		$("#saveBtn1").unbind("click");
		$("#saveBtn1").click(function(){
			
			var checkedItems = AUIGrid.getEditedRowItems(myGridID);
			
			var xml = "<ROOT>";
		
			for(var i=0 in checkedItems) {
				xml += "<DATAROW ";
				xml += " comNo=\"" + checkedItems[i].comNo + "\"";
				xml += " capitalYn=\"" + checkedItems[i].capitalYn + "\"";
				xml += "></DATAROW>";
			}
			
			xml += "</ROOT>";
			
			var data = "xml=" + xml;
			
 			var url = "<c:url value='/ifrs/capital/IfrsComINSetSave' />";
			fn_ajax(url, data, function( result ){
				$("#confirmmodal").modal('toggle');
				msg("저장 되었습니다.");
				dataLoad();	
			});						
		
		});		

		$("#reflashBtn").unbind("click");
		$("#reflashBtn").click(function(){
			dataLoad();
		});
		
		// 엑셀 저장 버튼
		$('.exceldown').unbind("click");
		$('.exceldown').click(function () {
			var wrapId = $(this).attr("name");
			var exportProps = {fileName : wrapId};
			AUIGrid.setProp("#"+ wrapId, "exportURL", "/ifrs/capital/export.do");			
			AUIGrid.exportToXlsx("#"+ wrapId, true, exportProps);
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
		
		
	});
	

</script>
</head>


<body style="background:none;">

<!-- 메세지 Modal -->
<div id="msgModal" title="SmileGate Capital" style="display: none;"><br><br>
<div class="confirmModalContentText" id="confirmModalContentText">저장 되었습니다.</div>
</div><!-- 메세지 Modal -->

<!-- 저장 Modal -->
<div class="modal fade" id="confirmmodal" role="dialog">
<div class="modal-dialog modal-sm"><div class="modal-content">
<div class="modal-header"><button type="button" class="close" data-dismiss="modal">&times;</button>
<div class="modal-title">&nbsp;</div></div><div class="modal-body">
<p align="center"><div id="confirmModalContent" class="confirmModalContent">저장 하시겠습니까?</div>
</p></div><div class="modal-footer">
<button type="button" class="btn btn-primary btn-sm" id="saveBtn1">저장</button>
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

        
			<div class="panel panel-default" style="width:800px;color:black;">
			  
			  <div class="panel-heading clearfix">
			  <div class="panel-title pull-left" style="font-size:12px;"><b><spring:message code="capital.entityLinkingOptions" /></b></div>
			      <div class="btn-group pull-right">	
			      		<c:if test="${registAuth eq 'Y' }" >       		
			       		<i class="glyphicon glyphicon-floppy-disk ahref" aria-hidden="true" data-toggle="tooltip" title="<spring:message code='capital.save' />" id="saveBtn"></i>
			       		<i class="glyphicon glyphicon-export ahref exceldown" aria-hidden="true" data-toggle="tooltip" title="<spring:message code='capital.saveExcel' />" name="grid_wrap"></i>
			       		</c:if>
			       		<i class="glyphicon glyphicon-repeat ahref" aria-hidden="true" id="reflashBtn"></i>
			      </div>	
			  </div>
			  
			  <div class="panel-body" style="width:100%;height:800px;color:black;">
			            <div id="grid_wrap" style="width:100%;height:100%;color:black;">
			            
			            </div>  
			  </div>
			</div>	        
        

     </div>

	<jsp:include page="/WEB-INF/jsp/config/footer.jsp"/>
</div>


</body>
</html>
<jsp:include page="/WEB-INF/jsp/config/footer_naviTime_capital.jsp"/>