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

<script type="text/javascript" src="${scriptPath}/ifrs/new/jQuery.print.js"></script>
<script type="text/javascript" src="${scriptPath}/ifrs/new/html2canvas.js"></script>
<script type="text/javascript" src="${scriptPath}/ifrs/new/canvas2image.js"></script>
<script type="text/javascript" src="${scriptPath}/ifrs/new/jquery.table2excel.js"></script>
<script type="text/javascript" src="${scriptPath}/ifrs/new/printThis.js"></script>
<script type="text/javascript" src="${scriptPath}/ifrs/new/tinymce/tinymce.min.js"></script>

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

<style type="text/css">
div#container {
	width: 1900px;
}

div#content {
	width: 1500px;
}

.ahref {
	font-size: 14px;
	margin-right: 10px;
}

.ahref:hover {
	color: red;
}

.ahref:hover {
	color: red;
}

.ahref:active {
	color: blue;
	background-color: lightgray;
}

.txt_right{
	text-align: right;
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
			<jsp:param name="menuId" value="${menuId }" />
		</jsp:include>
		<c:choose>
			<%--1.화면에 접근이 가능하다는 것은 기본 R 권한이 있음  
		    2.전사권한이거나 , W, A 권한이 있으면  registAuth 으로 체크값 비교 가능 (기본적으로 등록, 수정 버튼)
		    3.더 확장하고 싶은면 각화면에 각각 특정 권한에 대한 코딩하기 바람 --%>
			<c:when test="${authMap.authUseYn eq 'N' || authMap.writeAuth eq 'W' || authMap.adminAuth eq 'A' }">
				<c:set var="registAuth" value="Y" />
			</c:when>
			<c:otherwise>
				<c:set var="registAuth" value="N" />
			</c:otherwise>
		</c:choose>

		<div class="content">
			<div class="panel panel-default" style="width: 800px; height: 400px; color: black; float: left;" id="printDiv">
				<div class="panel-heading clearfix">
					<div class="panel-title pull-left" style="font-size: 12px;">
						<b>법인별 그래프 상한선 설정</b>
					</div>
					<div class="btn-group pull-right">
						<c:if test="${registAuth eq 'Y' }" >
						    
						</c:if> 
						    <i class="glyphicon glyphicon-plus ahref" aria-hidden="true" data-toggle="tooltip" title="행추가" onclick="fn_addRow()"></i> 
				            <i class="glyphicon glyphicon-minus ahref" aria-hidden="true" data-toggle="tooltip" title="행삭제" onclick="fn_removeRow()"></i> 
							<i class="glyphicon glyphicon-floppy-disk ahref" aria-hidden="true" data-toggle="tooltip" title="저장" onclick="fn_save();"></i>
					</div>
				</div>
				<div class="panel-body" style="width: 800px; height: 350px; color: black; float: left;">
					<div id="grid_wrap" style="width: 100%; height: 100%; color: black"></div>
				</div>			</div>
		</div>
		<jsp:include page="/WEB-INF/jsp/config/footer.jsp" />
	</div>
	<div id="printimg"></div>
	
	
<script type="text/javascript">
	
	var myGridID;     //그리드 객체
	var gridData;     //그리드의 데이터

	var companyList = ${companyList};
	var graphSettingList = ${graphSettingList};
	
	//AUIGrid 시작
	//컬럼 레이아웃 설정      
	var columnLayout = [ 
		{
			dataField: "comNoOld",  // 수정 변경용도
			headerText: "법인번호",
			visible : false,
		},
   		{
			dataField: "comNo",
   			headerText: "법인",
   			width:'40%',
   			editable : true,
   			editRenderer : {
    			type : "DropDownListRenderer",
    			showEditorBtnOver : true, // 마우스 오버 시 에디터버턴 보이기
    			list : companyList, //key-value Object 로 구성된 리스트
    			keyField : "comNo", // key 에 해당되는 필드명
    			valueField : "comNm" // value 에 해당되는 필드명
    		},
			labelFunction : function(  rowIndex, columnIndex, value, headerText, item ) {	
				var item   = null; 
				for (var i = 0, len = companyList.length; i < len; i++) {
					item = companyList[i];
					if (item.comNo == value) {
						return item.comNm;
					}
				}
				return value;
			}
   		},
   		{
			dataField: "maxAmt",
			headerText: "최고 상한액",
			dataType : 'numeric',
			editType : "amount",
			width:'40%',
			filter : {showIcon : true},
			visible : true,
			style : 'txt_right',
			formatString : "#,##0",
			editRenderer : {
				type : 'InputEditRenderer',
				showEditorBtnOver : false, // 마우스 오버 시 에디터버턴 보이기
				allowNegative : true, // 숫자만 입력 설정(onlyNumeric=true) 인 경우, 음수 부호 입력(-) 도 허용할지 여부를 지정합니다.
				onlyNumeric : true, // 0~9만 입력가능
				validator : function(oldValue, newValue, item) {
					var isValid = false;
					var numVal = Number(newValue);
					
					if(!isNaN(numVal) && numVal < 10000000000) {
						isValid = true;
					}
					
					return { "validate" : isValid, "message"  : "10자리까지만 입력 가능합니다." };
				}
			}
		},
		{
			<!-- ICM-8579, 21.05.25 박주연, 차트 변경으로 간격 갯수 대신 간격을 받는 것으로 변경 -->
			dataField: "splitInterval",
			headerText: "Y축 간격",
			dataType : 'numeric',
			editType : "amount",
			width:'20%',
			filter : {showIcon : true},
			visible : true,
			style : 'txt_right',
			formatString : "#,##0",
			editRenderer : {
				type : 'InputEditRenderer',
				showEditorBtnOver : false, // 마우스 오버 시 에디터버턴 보이기
				onlyNumeric : true, // 0~9만 입력가능
				allowNegative : false, // 숫자만 입력 설정(onlyNumeric=true) 인 경우, 음수 부호 입력(-) 도 허용할지 여부를 지정합니다.
			}
		}
	];
	
	//그리드 Properties 설정
	var auiGridProps = {
			// 편집 수정 가능 여부를 지정합니다. 기본값(default) : faitem.splitCnt = 1;lse.
			editable : true,
			
			// 더블클릭과 클릭 중 택할 수 있습니다. 유효값: doubleClick, click
			editBeginMode : "doubleClick",
			
			// 셀 선택모드를 지정합니다. 유효 속성값은 다음과 같습니다.
			// singleCell, singleRow, multipleCells, multipleRows, none
			selectionMode : "singleCell",
			
			// 그리드에 키보드 포커스 설정을 할지 여부를 지정합니다.
			enableFocus : true, 
			
			// 엔터키가 다음 행이 아닌 다음 칼럼으로 이동할지 여부 (기본값 : false)
			enterKeyColumnBase : true,
			
			//상태값을 아이콘으로 삭제 등록 취소등
			showStateColumn : true ,
			
			// 체크박스 표시 설정
			//showRowCheckColumn : true,
			// 전체 체크박스 표시 설정
			//showRowAllCheckBox : false,
	};
	
	//AUIGrid 를 생성합니다.
	function createAUIGrid(columnLayout) {
		// 그리드 생성
		myGridID = AUIGrid.create("#grid_wrap", columnLayout, auiGridProps);
	};

	$(document).ready(function(){
		createAUIGrid(columnLayout);
		setGridData(graphSettingList);
	});
	
	function setGridData(gridData) {
		var ndata = [];
  		var item = {};
  		// 그리드에 데이터 세팅
  		for(var i = 0; i < gridData.length; i++){
  			item = gridData[i];
  			/*
  			item = {
  				"comNo" : comNo,
  				"maxAmt" : maxAmt,
  				"splitCnt" : splitCnt
  			}
  			*/
  			ndata.push(item);
  		};
    	AUIGrid.setGridData(myGridID, ndata);
	}
	
	function fn_addRow() {
		var item = new Object();
		item.comNo    = "";
		item.maxAmt   = 0;
		item.splitCnt = 1000;
			
		// parameter
		// item : 삽입하고자 하는 아이템 Object 또는 배열(배열인 경우 다수가 삽입됨)
		// rowPos : rowIndex 인 경우 해당 index 에 삽입, first : 최상단, last : 최하단, selectionUp : 선택된 곳 위, selectionDown : 선택된 곳 아래
		AUIGrid.addRow(myGridID, item, "last");
	}

	function fn_removeRow() {	
		var items = AUIGrid.getSelectedItems(myGridID);
		
		if(items.length <= 0) {
			alert("삭제할 데이터를 선택해주세요.");
			return;
		}
		
		var item = items[0];
		if ('' === item.value) {
			return;
		}
		if (!confirm(item.value + '을(를) 삭제하시겠습니까?')) {
            return;
        }
        
		$.isLoading({ tpl: "<span class='isloading-wrapper %wrapper%'>Loading&nbsp;&nbsp;<i class='fa fa-refresh fa-spin'></i></span>" });
		
		$.ajax({
		    url : "<c:url value='/ifrs/capital/deleteCompanyGraphSetting'/>",
		    dataType : "json",
		    type : "POST",
		    contentType: "application/json; charset=utf-8",
		    data : JSON.stringify(item),
		    success: function(result) {
		    	$.isLoading( "hide" );
		    	
		    	if("Y" != result.success){
		    		alert("처리 중 오류가 발생하였습니다.\n\n스마일큐로 문의해 주세요");
		    		return;
		    	}	
		    	
	    		alert("삭제 되었습니다.");					
		    	setGridData(result.graphSettingList);
		    },
		    error:function(request, status, error){
		    	alert("처리 중 오류가 발생하였습니다.\n\n스마일큐로 문의해 주세요");
		    	$.isLoading( "hide" );
		    }		    
		});
	}
	
	fn_save = function(){	
		var addList = AUIGrid.getGridData(myGridID);
		
		var data = {};
		
		if(addList.length > 0){
			$.each(addList, function(n,v) { 
		        delete v._$uid; 
			});
			data.addList = addList;
		} else {
			data.addList = [];
		};
		
		
		if(0 === data.addList.length){
			alert("저장할 데이터가 없습니다.");
			return;
		};
		
		for (var i=0, len=data.addList.length-1; i<len; i++) {
			for (var j=i+1; j<len+1; j++) {
				if (data.addList[i].comNo === data.addList[j].comNo) {
					alert('중복된 법인이 존재합니다. 1개만 존재하도록 삭제후 저장 하여 주십시요.');
					return;
				}
			}
		}
		
		if(!confirm("저장 하시겠습니까?")){
			return;
		};

		
		$.isLoading({ tpl: "<span class='isloading-wrapper %wrapper%'>Loading&nbsp;&nbsp;<i class='fa fa-refresh fa-spin'></i></span>" });
		
		$.ajax({
		    url : "<c:url value='/ifrs/capital/saveCompanyGraphSetting'/>",
		    dataType : "json",
		    type : "POST",
		    contentType: "application/json; charset=utf-8",
		    data : JSON.stringify(data),
		    success: function(result) {
		    	$.isLoading( "hide" );
		    	
		    	if("Y" != result.success){
		    		alert("처리 중 오류가 발생하였습니다.\n\n스마일큐로 문의해 주세요");
		    		return;
		    	}	
		    	
	    		alert("저장 되었습니다.");	
				
		    	setGridData(result.graphSettingList);
		    },
		    error:function(request, status, error){
		    	alert("처리 중 오류가 발생하였습니다.\n\n스마일큐로 문의해 주세요");
		    	$.isLoading( "hide" );
		    }
		});
	};
</script>
<jsp:include page="/WEB-INF/jsp/config/footer_naviTime_ifrs.jsp"/>
</body>
</html>