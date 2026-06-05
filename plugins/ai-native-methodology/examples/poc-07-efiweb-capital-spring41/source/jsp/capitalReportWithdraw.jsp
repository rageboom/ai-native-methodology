<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8" %>
<%@ include file="/WEB-INF/jsp/config/include.jsp" %>
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">
<head>
<meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
<meta http-equiv="X-UA-Compatible" content="IE=9;FF=3;OtherUA=4" />
<title>IFRS</title>
<link rel="stylesheet" type="text/css" href="${cssPath}/ifrs/ifrs.css" />
<link type="text/css" rel="stylesheet" href="${cssPath}/ifrs/jquery-ui-1.9.2.custom.css" />
<script type="text/javascript" src="${scriptPath}/ifrs/jquery-1.7.1.js"></script>
<script type="text/javaScript" src="<c:url value='${scriptPath}/ifrs/jquery-ui-1.9.2.custom.js'/>"></script>
<script type="text/javaScript" src="<c:url value='${scriptPath}/ifrs/jquery.ui.datepicker-ko.js'/>"></script>
<script type="text/javascript" src="${scriptPath}/ifrs/jqCommon.js"></script>
<script type="text/javascript" src="${scriptPath}/ifrs/common.js"></script>

<!-- AUIGrid 라이센스 파일입니다. 그리드 출력을 위해 꼭 삽입하십시오. -->
<link href="${auiGridPath}/3.0.9/AUIGrid_style.css" rel="stylesheet">
<script type="text/javascript" src="${auiGridPath}/3.0.9/AUIGridLicense.${domain}.js"></script>
<script type="text/javascript" src="${auiGridPath}/3.0.9/AUIGrid.js"></script>
<script type="text/javascript" src="${scriptPath}/ifrs/gridCommon.js?2"></script>
<style type="text/css">
div#container { width:1900px; }
div#content { width:1500px; }
.money {text-align:right;}
.left-cell {text-align:left;}
</style>

<script type="text/javascript">
	//AUIGrid 생성 후 반환 ID
	var erpGridID;
	var cmsGridID;

	$(document).ready(function(){
		
		var SESSION = "${SESSION}"; // 소속 법인 번호
		$("#comNo").val(SESSION);
		
		// 일자 선택
		$("#searchDate").datepicker({
			dateFormat:'yymmdd',
			changeMonth: true,
			changeYear: true
		});		
		
		//그리드 컬럼 정의
		var erpColumnLayout = createErpColumnData();
		var cmsColumnLayout = createCmsColumnData();

		// AUIGrid 그리드를 생성합니다.
		createErpGrid(erpColumnLayout);
		createCmsGrid(cmsColumnLayout);
				
	});
	
	
	
	// 칼럼 레이아웃을 생성하여 반환합니다.
	function createErpColumnData() {
		var columnLayout = [
		  { headerText : "ERP상 화면내역", 
			children : [
				{ 	dataField: "erpRemark",
					style : "left-cell",
					headerText: "ERP 적요내역",
					filter : { showIcon : true}
				},
				{ 	dataField: "erpAmount",
					headerText: "금액",
					style : "money",
					dataType : "numeric"
				},
				{ 	dataField: "mgt1",
					headerText: "관리항목 값"
				}        
			]
		  }	
		];

		return columnLayout;
	}
	
	// 칼럼 레이아웃을 생성하여 반환합니다.
	function createCmsColumnData() {
		var columnLayout = [
		  { headerText : "CMS상 화면내역", 
			children : [
				{ 	dataField: "cmsRemark",
					headerText: "CMS 적요내역",
					style : "left-cell",
					filter : { showIcon : true}
				},
				{ 	dataField: "currCd",
					headerText: "통화"
				},
				{ 	dataField: "cmsAmount",
					headerText: "금액",
					dataType : "numeric",
					style : "money"
				},
				{ 	dataField: "cmsAccount",
					headerText: "출금계좌번호"
				}        
			]
		  }	
		];

		return columnLayout;
	}
	
	
	// 칼럼 레이아웃을 생성하여 반환합니다.
	function createSumColumnData() {
		var columnLayout = [		  
			{ 	dataField: "accName",
				headerText: "계정",
				filter : { showIcon : true}
			},
			{ 	dataField: "customer",
				headerText: "거래처",
				filter : { showIcon : true}
			},
			{ 	dataField: "cmsAcctNo",
				headerText: "거래처",
				filter : { showIcon : true}
			}, 
			{ 	dataField: "remark",
				headerText: "적요",
			}, 
			{ 	dataField: "amount",
				headerText: "금액",
				dataType : "numeric"
			}, 
			{ 	dataField: "gubun",
				headerText: "구분"
			} 
		];

		return columnLayout;
	}
	
	
	var erpFooterObject = [ {
		labelText : "합계",
		positionField : "#base"
	}, {
		dataField : "erpAmount",
		positionField : "erpAmount",
		operation : "SUM",
		style : "money",
		formatString : "#,##0"
	}];
	
	var cmsFooterObject = [ {
		labelText : "합계",
		positionField : "#base"
	}, {
		dataField : "cmsAmount",
		positionField : "cmsAmount",
		operation : "SUM",
		style : "money",
		formatString : "#,##0"
	}];
	
	
	// AUIGrid 를 생성합니다.
	function createErpGrid(columnLayout) {
		
		var auiGridProps = {
			editable : true,
			enableCellMerge : false,
			enableFilter : true,
			useContextMenu : true,
			showStateColumn : true,
			softRemovePolicy : "exceptNew",
			skipReadonlyColumns : true,
			showFooter:true
			//editableOnFixedCell : true,
			//rowIdField : "no",
			//fixedColumnCount : 11
		};
		
		// 실제로 #grid_wrap 에 그리드 생성
		erpGridID = AUIGrid.create("#erp_grid_wrap", columnLayout, auiGridProps);
		
		// 푸터 객체 세팅
		AUIGrid.setFooter(erpGridID, erpFooterObject);
	}
	
	
	// AUIGrid 를 생성합니다.
	function createCmsGrid(columnLayout) {
		
		var auiGridProps = {
			editable : true,
			enableCellMerge : false,
			enableFilter : true,
			useContextMenu : true,
			showStateColumn : true,
			softRemovePolicy : "exceptNew",
			skipReadonlyColumns : true,
			showFooter:true
			//editableOnFixedCell : true,
			//rowIdField : "no",
			//fixedColumnCount : 11
		};
		
		// 실제로 #grid_wrap 에 그리드 생성
		cmsGridID = AUIGrid.create("#cms_grid_wrap", columnLayout, auiGridProps);
		
		// 푸터 객체 세팅
		AUIGrid.setFooter(cmsGridID, cmsFooterObject);
	}
	
	
	function fn_callData(){
		
		var url = "<c:url value='/ifrs/capital/withdrawListAjax' />";
		var data = "comNo=" + $("#comNo").val() + "&searchDate=" + $("#searchDate").val();
		
		fn_ajax(url, data, function( result ){
			// 데이터 요청, 요청 성공 시 AUIGrid 에 데이터 삽입합니다.
			AUIGrid.setGridData( erpGridID, result.erpList);
			AUIGrid.setGridData( cmsGridID, result.cmsList);
		});
		
		
		var url = "<c:url value='/ifrs/capital/withdrawListAjax' />";
		var data = "comNo=" + $("#comNo").val() + "&searchDate=" + $("#searchDate").val();
		
		fn_ajax(url, data, function( result ){
			//console.log(result);
		});		
		
	}
	
	
	function doExcelDown(){
		var fileName = $("#year").val() + "년_" + $("#comCd option:selected").text() + "_비용귀속확인";
		gridExportTo(myGridID,  "xlsx", "/ifrs/common/car/exportAUI", fileName);		
	}
</script>
</head>


<body style="background:none;">

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
            
            
			<form name="searchForm" id="searchForm" method="post">
			
        	<div class="seachGroup">
             	<fieldset>
             	<div class="fl">
                     <div class="basicSearch" style="width:1000px;">
                         <div class="hGroup">
                             <ul class="firstChild" style="width: 1000px;">
                                <li>
                                	<label for="comNo" style="width:35px;">법인</label>
                               		<select name="comNo" id="comNo">
                               		<c:forEach var="list" items="${companyList}">	
                               			<option value="${list.COM_NO }">${list.COM_NM}</option>
                               		</c:forEach>
                               		</select>
                               		&nbsp;&nbsp;
                               		<span class="grayButton"><button type="button" id="btnSelect" onclick="fn_selectList();">조&nbsp;&nbsp;회</button></span>&nbsp;
                  					<span class="grayButton"><button type="button" id="btnSelect" onclick="fn_callData();">ERP 및 CMS 데이터 가져오기</button></span>&nbsp;
                                 </li>
                                 <li>
                                 	<label for="searchSDate" style="width:120px;">출금내역 조회일</label>
                                 	<input type="text" name="searchDate" id="searchDate" value="${searchDate }" size="10" readonly class="" />
                                 	<span style="padding-left:150px;">&nbsp;</span>
                                 	<span class="grayButton"><button type="button" onclick="javascript:doExcelDown();" style="color:#008000; "><img src="/images/ifrs/icon_excel.gif" alt="ERP 내역 엑셀 다운" style="margin-top:-2px; margin-right:3px;">ERP 내역 엑셀 다운</button></span>
                                 	<span class="grayButton"><button type="button" onclick="javascript:doExcelDown();" style="color:#008000; "><img src="/images/ifrs/icon_excel.gif" alt="CMS 내역 엑셀 다운" style="margin-top:-2px; margin-right:3px;">CMS 내역 엑셀 다운</button></span>
                                 </li>
                             </ul> 
                          </div>  
                      </div>
                  </div>
                 </fieldset>
            </div>
 			
			
			
			<div class="btnArea" style="margin-top:-10px;width:1500px">
				<span style="padding-left:1400px;">&nbsp;</span>
                <span class="grayButton"><button type="button" onclick="javascript:doSaveGrid();">저장</button></span>
            </div>
            
            <div style="width:1500px">
	            <div class="para" id="erp_grid_wrap" style="width:800px;height:600px;color:black;float:left">
	            
	            </div>
	            
	            <div class="para" id="cms_grid_wrap" style="width:630px;height:600px;color:black;float:left;padding-left:20px;">
	            
	            </div>
            </div>
            
			<div class="btnArea" style="margin-top:-10px;width:1500px;">
				<span style="padding-left:1400px;">&nbsp;</span>
                <span class="grayButton"><button type="button" onclick="javascript:doSaveGrid();">저장</button></span>
            </div>

        </div>
        
	<jsp:include page="/WEB-INF/jsp/config/footer.jsp"/>

</div>
</body>
</html>
<jsp:include page="/WEB-INF/jsp/config/footer_naviTime_capital.jsp"/>