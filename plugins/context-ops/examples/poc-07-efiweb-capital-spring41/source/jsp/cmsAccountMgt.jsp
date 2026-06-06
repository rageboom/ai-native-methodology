<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8" %>
<%@ include file="/WEB-INF/jsp/config/include.jsp" %>
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">
<head>
<meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
<meta http-equiv="X-UA-Compatible" content="IE=9;FF=3;OtherUA=4" />
<title>IFRS</title>
<link rel="stylesheet" type="text/css" href="${cssPath}/ifrs/ifrs.css" />
<style type="text/css">
div#container { width:1900px; }
div#content { width:1500px; }
</style>
<script type="text/javascript" src="${scriptPath}/ifrs/jquery-1.7.1.js"></script>
<script type="text/javascript" src="${scriptPath}/ifrs/calendar_month5.js"></script>
<script type="text/javascript" src="${scriptPath}/ifrs/jqCommon.js"></script>
<script type="text/javascript" src="${scriptPath}/ifrs/common.js"></script>

<!-- AUIGrid 라이센스 파일입니다. 그리드 출력을 위해 꼭 삽입하십시오. -->
<link href="${auiGridPath}/3.0.9/AUIGrid_style.css" rel="stylesheet">
<script type="text/javascript" src="${auiGridPath}/3.0.9/AUIGridLicense.${domain}.js"></script>
<script type="text/javascript" src="${auiGridPath}/3.0.9/AUIGrid.js"></script>
<script type="text/javascript" src="${scriptPath}/ifrs/gridCommon.js?2"></script>

<script type="text/javascript">
	//AUIGrid 생성 후 반환 ID
	var myGridID;
	var searchGubun = "";
	
	var yn = ["Y", "N"];
	var accountTypeList = ${accountTypeList};

	$(document).ready(function(){
		
		var SESSION = "${SESSION}"; // 소속 법인 번호
		$("#comNo").val(SESSION);
			
		var columnLayout = createColumnData();

		// AUIGrid 그리드를 생성합니다.
		createAUIGrid(columnLayout);
		
		fn_selectList();
				
	});
	
	
	function fn_selectList(){
		
		var url = "<c:url value='/ifrs/capital/ifrsAccountListAjax' />";
		var data = "comNo=" + $("#comNo").val() ;
		
		fn_ajax(url, data, function( result ){
			// 데이터 요청, 요청 성공 시 AUIGrid 에 데이터 삽입합니다.
			AUIGrid.setGridData(myGridID, result.list);
			searchGubun = "select";
		});
		
	}
	
	
	function fn_callData(){

 		var url = "<c:url value='/ifrs/capital/cmsAccountListAjax' />";
		var data = "comNo=" + $("#comNo").val() ;
		
		fn_ajax(url, data, function( result ){
			// 데이터 요청, 요청 성공 시 AUIGrid 에 데이터 삽입합니다.
			AUIGrid.setGridData(myGridID, result.list);
			searchGubun = "call";
		}); 		
		
		
 		var url = "<c:url value='/ifrs/capital/IfrsERPINListAjax' />";
		var data = "comNo=" + $("#comNo").val() ;
		
		fn_ajax(url, data, function( result ){
			
			//console.log(result);
			
		}); 
		
		var url = "<c:url value='/ifrs/capital/IfrsCMSINListAjax' />";
		var data = "comNo=" + $("#comNo").val() ;
		
		fn_ajax(url, data, function( result ){
			
			//console.log(result);
			
		});		
		
	} 
	
	
	// 칼럼 레이아웃을 생성하여 반환합니다.
	function createColumnData() {
		var columnLayout = [
		  {	dataField: "comNo",
			headerText: "법인번호",
			visible : false
		  }, 
		  {	dataField: "cmsAccountId",
			headerText: "CMS계좌아이디",
			visible : false
		  },
		  {	dataField: "erpAccountId",
			headerText: "ERP계좌아이디",
			visible : false
		  },
		  { headerText : "CMS상 계좌 등록된 내역", 
			children : [
				{ 	dataField: "cmsBank",
					headerText: "금융회사",
					editable : false,
					filter : { showIcon : true}
				},
				{ 	dataField: "cmsAccount",
					headerText: "계좌번호",
					editable : false
				},
				{ 	dataField: "currCd",
					headerText: "통화",
					editable : false
				},
			            
			]
		  },
		  { headerText : "자금일보 내용", 
			children : [
				{	dataField: "accountType",
					headerText: "금융자산명세서 사용계정",
					labelFunction : function(rowIndex, columnIndex, value,
							headerText, item) {
						var retStr = value;
						for ( var i = 0, len = accountTypeList.length; i < len; i++) {
							if (accountTypeList[i]["code"] == value) {
								retStr = accountTypeList[i]["codeName"];
								break;
							}
						}
						return retStr;
					},
					editRenderer : {
						type : "DropDownListRenderer",
						showEditorBtnOver : true, // 마우스 오버 시 에디터버턴 보이기
						list : accountTypeList,
						keyField : "code",
						valueField : "codeName"
					}
				},
				{ 	dataField: "aka",
					headerText: "구분값(별칭) 등록",
					editable : true
				}
			            
			]
		  },
		  { headerText : "ERP상 등록된 값", 
			children : [
				{ 	dataField: "erpBank",
					headerText: "ERP상 등록된 금융기관지점",
					editable : false,
					filter : { showIcon : true}
				},
				{ 	dataField: "erpAccount",
					editable : false,
					headerText: "ERP상 등록된 계좌번호"
				},
			            
			]
		  },
		  { dataField: "reportUseYn",
			headerText: "자금일보 연동여부체크",
			editable:true,
			filter : { showIcon : true},
			editRenderer : {
				type : "DropDownListRenderer",
				showEditorBtnOver : true, // 마우스 오버 시 에디터버턴 보이기
				list : yn
			}
		  }		
		];


		return columnLayout;
	}
	
	
	// AUIGrid 를 생성합니다.
	function createAUIGrid(columnLayout) {
		
		var auiGridProps = {
			editable : true,
			enableCellMerge : true,
			//editableOnFixedCell : true,
			//rowIdField : "no",
			enableFilter : true,
			useContextMenu : true,
			showStateColumn : true,
			softRemovePolicy : "exceptNew",
			skipReadonlyColumns : true
		};
		
		// 실제로 #grid_wrap 에 그리드 생성
		myGridID = AUIGrid.create("#grid_wrap", columnLayout, auiGridProps);
		
		// cellEditEndBefore 이벤트 바인딩
		AUIGrid.bind(myGridID, "cellEditEndBefore", cellEditEndBeforeHandler);
		
		//AUIGrid.bind(myGridID, "cellEditCancel", cellEditCancelHandler);
		
		// 행추가 이벤트 바인딩
		//AUIGrid.bind(myGridID, "addRowFinish", auiAddRowHandler);
		
	}
	
	//셀 수정 전 체크
	function cellEditEndBeforeHandler( event ){
		
		var value = event.value;
		var oldValue = event.oldValue;
		var dataField = event.dataField;
		
		if(dataField == "useStrDate" || dataField == "useEndDate") { //사용기간 체크
			var date = new Date(value);
			if(date.getFullYear() != $("#year").val() ) {
				alert("사업기간은 사업년도를 벗어날 수 없습니다.");
				return oldValue;
			}
		}
		
		return value;
	}
	
	function doSaveGrid(){
		//var data = getModfiedDataFromMasterGrid(myGridID, 0, 1, 0);
		var data = {};
		if( searchGubun == "select"){
			data = getModfiedDataFromMasterGrid(myGridID, 0, 1, 0);
		}else if( searchGubun == "call"){
			data.update = AUIGrid.getGridData( myGridID );
		}
		
		//alert(JSON.stringify(data));
		if( data == "NO CHANGE" ){
			alert( "변경된 항목이 없습니다." );
			return;
		}
		
		if( confirm("저장하시겠습니까?") == false ) return;
		
		saveGridDataAjax("/ifrs/capital/saveAccountList", myGridID, data, function(result){
			if(result.result == "success") { // DB 성공
				alert("저장 완료!!");
				fn_selectList();
			} else { // DB 실패...데이터 Refresh
				alert("DB 저장 실패!! message : " + msg);
				//fn_selectList();
			}
		});
	}
	
	
	function doExcelDown(){
		var fileName = $("#comNo option:selected").text() + "_계좌정보";
		gridExportTo(myGridID,  "xlsx", "/ifrs/common/exportAUI", fileName);		
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
            
            
			<form name="searchForm" id="searchForm" method="post">
			
        	<div class="seachGroup">
             	<fieldset>
             	<div class="fl">
                     <div class="basicSearch">
                         <div class="hGroup">
                             <ul class="firstChild" style="width: 680px;">
                                <li>
                                	<label for="state" style="width:35px;">법인</label>
                               		<select name="comNo" id="comNo">
                               		<c:forEach var="list" items="${companyList}">	
                               			<option value="${list.COM_NO }">${list.COM_NM}</option>
                               		</c:forEach>
                               		</select>
                               		&nbsp;&nbsp;
                               		<span class="grayButton"><button type="button" id="btnSelect" onclick="fn_selectList();">조&nbsp;&nbsp;회</button></span>&nbsp;
                               		<span class="grayButton"><button type="button" id="btnSelect" onclick="fn_callData();">CMS 데이터 가져오기</button></span>&nbsp;
                  					<span class="grayButton"><button type="button" onclick="javascript:doExcelDown();" style="color:#008000; "><img src="/images/ifrs/icon_excel.gif" alt="엑셀 다운" style="margin-top:-2px; margin-right:3px;">엑셀 다운</button></span>	
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
            
            <div class="para" id="grid_wrap" style="width:1500px;height:500px;color:black;">
            
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