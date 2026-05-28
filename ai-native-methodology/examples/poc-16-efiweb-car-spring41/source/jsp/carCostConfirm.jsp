<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"%>
<%@ page import="java.util.Calendar" %>

<%@ include file="/WEB-INF/jsp/config/include.jsp"%>
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">
<head>
<meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
<meta http-equiv="X-UA-Compatible" content="IE=9;FF=3;OtherUA=4" />
<title>IFRS</title>
<link rel="stylesheet" type="text/css" href="${cssPath}/ifrs/ifrs.css" />
<link rel="stylesheet" type="text/css" href="${cssPath}/ifrs/jquery-confirm.css" />
<script type="text/javascript" src="${scriptPath}/ifrs/jquery-1.7.1.js"></script>
<script type="text/javascript" src="${scriptPath}/ifrs/jquery-confirm.js"></script>
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

		var costAcceptCdList = ${costAcceptList};
		var erpComList = ${erpComList};

		$(document).ready(function() {
			$("#year").change( fn_selectList );
			$("#comCd").change( fn_selectList );
			
			var comSelect = "";
			for ( var i = 0; i < erpComList.length; i++) {
				comSelect += "<option value='" +  erpComList[i].companyseq + "'>"
						+ erpComList[i].companyname
						+ "</option>";
			}
			$("#comCd").html(comSelect);

			var columnLayout = createColumnData();

			// AUIGrid 그리드를 생성합니다.
			createAUIGrid(columnLayout);

			fn_selectList();

		});

		function fn_selectList() {
			var url = "<c:url value='/ifrs/car/cost/confirmListAjax' />";
			var data = "year=" + $("#year").val() + "&comCd="
					+ $("#comCd").val();

			fn_ajax(url, data, function(result) {
				// 데이터 요청, 요청 성공 시 AUIGrid 에 데이터 삽입합니다.
				AUIGrid.setGridData(myGridID, result.result);
			});
		}

		// 칼럼 레이아웃을 생성하여 반환합니다.
		function createColumnData() {
			var columnLayout = [
					{
						dataField : "termIdx",
						headerText : "일련번호",
						visible : false
					},
					{
						dataField : "carIdx",
						headerText : "차량일련번호",
						cellMerge : true,
						visible : false
					},
					{
						dataField : "costIdx",
						headerText : "차량비용일련번호",
						cellMerge : true,
						visible : false
					},
					{
						dataField : "comNm",
						headerText : "법인",
						filter : {
							showIcon : true
						},
						cellMerge : true,
						mergeRef : "carIdx", // 이전 칼럼(대분류) 셀머지의 값을 비교해서 실행함. (mergePolicy : "restrict" 설정 필수)
						mergePolicy : "restrict"
					},
					{
						dataField : "carGetDate",
						headerText : "취득일",
						cellMerge : true,
						mergeRef : "carIdx",
						mergePolicy : "restrict"
					},
					{
						dataField : "carType",
						headerText : "차종",
						filter : {
							showIcon : true
						},
						cellMerge : true,
						mergeRef : "carIdx",
						mergePolicy : "restrict"
					},
					{
						dataField : "carNo",
						headerText : "차량번호",
						filter : {
							showIcon : true
						},
						cellMerge : true,
						mergeRef : "carIdx",
						mergePolicy : "restrict"
					},
					{
						dataField : "userNm",
						headerText : "사용자",
						filter : {
							showIcon : true
						},
						cellMerge : true,
						mergeRef : "carIdx",
						mergePolicy : "restrict"
					},
					{
						dataField : "state",
						headerText : "차량상태",
						filter : {
							showIcon : true
						},
						cellMerge : true,
						mergeRef : "carIdx",
						mergePolicy : "restrict"
					},
					{
						dataField : "userComNm",
						headerText : "사용자 소속법인",
						filter : {
							showIcon : true
						}
					},
					{
						dataField : "sosokGigan",
						headerText : "사용기간",
						filter : {
							showIcon : true
						}
					},
					{
						dataField : "useComCd",
						headerText : "차량비용사용법인",
						labelFunction : function(rowIndex, columnIndex, value,
								headerText, item) {
							var retStr = value;
							for ( var i = 0, len = erpComList.length; i < len; i++) {
								if (erpComList[i]["companyseq"] == value) {
									retStr = erpComList[i]["companyname"];
									break;
								}
							}
							return retStr;
						},
						editRenderer : {
							type : "DropDownListRenderer",
							showEditorBtnOver : true, // 마우스 오버 시 에디터버턴 보이기
							list : erpComList,
							keyField : "companyseq",
							valueField : "companyname"
						}
					},
					{
						headerText : "비용기간",
						children : [
								{
									dataField : "useStrDate",
									editable : true,
									headerText : "시작일",
									dataType : "date",
									formatString : "yyyy.mm.dd",
									editRenderer : {
										type : "CalendarRenderer",
										onlyCalendar : true,
										// 에디팅 유효성 검사
										validator : function(oldValue,
												newValue, rowItem) {
											var isValid = false;

											// 리턴값은 Object 이며 validate 의 값이 true 라면 패스, false 라면 message 를 띄움
											return {
												"validate" : isValid,
												"message" : "사용기간은 사업년도를 벗어날 수 없습니다."
											};
										}
									}
								}, {
									dataField : "useEndDate",
									editable : true,
									headerText : "종료일",
									dataType : "date",
									formatString : "yyyy.mm.dd",
									editRenderer : {
										type : "CalendarRenderer",
										onlyCalendar : true
									}
								} ]
					},
					{
						dataField : "costAcceptCd",
						headerText : "비용(손금)인정여부",
						labelFunction : function(rowIndex, columnIndex, value,
								headerText, item) {
							var retStr = value;
							for ( var i = 0, len = costAcceptCdList.length; i < len; i++) {
								if (costAcceptCdList[i]["code"] == value) {
									retStr = costAcceptCdList[i]["codeName"];
									break;
								}
							}
							return retStr;
						},
						editRenderer : {
							type : "DropDownListRenderer",
							showEditorBtnOver : true, // 마우스 오버 시 에디터버턴 보이기
							list : costAcceptCdList,
							keyField : "code",
							valueField : "codeName"
						}
					} ];

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
				fixedColumnCount : 11,
				softRemovePolicy : "exceptNew",
				skipReadonlyColumns : true
			};

			// 실제로 #grid_wrap 에 그리드 생성
			myGridID = AUIGrid.create("#grid_wrap", columnLayout, auiGridProps);

			// cellEditEndBefore 이벤트 바인딩
			AUIGrid.bind(myGridID, "cellEditEndBefore",
					cellEditEndBeforeHandler);

			//AUIGrid.bind(myGridID, "cellEditCancel", cellEditCancelHandler);

			// 행추가 이벤트 바인딩
			//AUIGrid.bind(myGridID, "addRowFinish", auiAddRowHandler);

		}

		//셀 수정 전 체크
		function cellEditEndBeforeHandler(event) {

			var value = event.value;
			var oldValue = event.oldValue;
			var dataField = event.dataField;

			if (dataField == "useStrDate" || dataField == "useEndDate") { //사용기간 체크
				var date = new Date(value);
				if (date.getFullYear() != $("#year").val()) {
					//alert("사업기간은 사업년도를 벗어날 수 없습니다.");
					$.alert({
		                title : '',
		                content : '사업기간은 사업년도를 벗어날 수 없습니다.',
		                boxWidth : '30%',
		                useBootstrap : false,
		                buttons : {
		                    okay : {
		                        text: 'OK',
		                        btnClass: 'btn-blue'
		                    }
		                }
		            });
					
					return oldValue;
				}
			}

			return value;
		}

		function doSaveGrid() {
			var data = getModfiedDataFromMasterGrid(myGridID, 0, 1, 0);
			//alert(JSON.stringify(data));
			if (data == "NO CHANGE") {
				//alert("변경된 항목이 없습니다.");
				$.alert({
	                title : '',
	                content : '변경된 항목이 없습니다.',
	                boxWidth : '30%',
	                useBootstrap : false,
	                buttons : {
	                    okay : {
	                        text: 'OK',
	                        btnClass: 'btn-blue'
	                    }
	                }
	            });
				return;
			}

			//if (confirm("저장하시겠습니까?") == false)
			$.confirm({
	              title : '',
	              boxWidth : '30%',
	              useBootstrap : false,
	              content : "저장하시겠습니까?",	              
	              buttons : {
	                  confirm: {
	                	text : '확인',
	                	action : function() {  
		              		saveGridDataAjax("/ifrs/car/cost/saveConfirmList", myGridID, data,
	        					function(result) {
	        						if (result.result == "success") { // DB 성공
	        							//alert("저장 완료!!");
	        							$.alert({
	        				                title : '',
	        				                content : '저장 완료!!',
	        				                boxWidth : '30%',
	        				                useBootstrap : false,
	        				                buttons : {
	        				                    okay : {
	        				                        text: 'OK',
	        				                        btnClass: 'btn-blue'
	        				                    }
	        				                }
	        				            });
	        							
	        						} else { // DB 실패...데이터 Refresh
	        							//alert("DB 저장 실패!!");
	        							$.alert({
	        				                title : '',
	        				                content : 'DB 저장 실패!!',
	        				                boxWidth : '30%',
	        				                useBootstrap : false,
	        				                buttons : {
	        				                    okay : {
	        				                        text: 'OK',
	        				                        btnClass: 'btn-blue'
	        				                    }
	        				                }
	        				            });
	        						
	        							fn_selectList();
	        						}
	        					});
	                	}
	                  },
	                  cancel: {
	                      text : '취소',
	                      action : function() {
	                    	  return;
	                      }
	                	  
	                  }
	              }
	          });	
				
	
		}

		function doExcelDown() {
			var fileName = $("#year").val() + "년_" + $("#comCd option:selected").text() + "_비용귀속확인";
			gridExportTo(myGridID, "xlsx", "/ifrs/common/car/exportAUI", fileName);
		}
	</script>
</head>


<body style="background: none;">

<jsp:include page="/WEB-INF/jsp/car/loading.jsp" />

	<!--wrap div-->
	<div id="wrap">


		<div class="content">


			<form name="searchForm" id="searchForm" method="post">

				<div class="seachGroup">
					<fieldset>
						<div class="fl">
							<div class="basicSearch">
								<div class="hGroup">
									<ul class="firstChild" style="width: 680px;">
										<li><label for="state" style="width: 70px;">사업년도</label> 
										    <select name="year" id="year">
										       <% final int thisYear = Calendar.getInstance().get(Calendar.YEAR);
										          for (int i=thisYear, len=2016; len<=i; i--) { %>
										       		<option value="<%=i %>" <%= (thisYear==i ? "selected" : "")%>><%=i %></option>
										       <% } %>
											</select> &nbsp;&nbsp; 
											<label for="state" style="width: 35px;">법인</label> 
											<select name="comCd" id="comCd">
											</select> &nbsp;&nbsp; 
											<span class="grayButton">
												<button type="button" id="btnSelect" onclick="fn_selectList();">조&nbsp;&nbsp;회</button>
											</span> 
											<span class="grayButton">
												<button type="button" onclick="javascript:doExcelDown();" style="color: #008000;">
												<img src="/images/ifrs/icon_excel.gif" alt="엑셀 다운" style="margin-top: -2px; margin-right: 3px;">엑셀 다운
												</button>
											</span>
										</li>
									</ul>
								</div>
							</div>
						</div>
					</fieldset>
				</div>



				<div class="btnArea" style="margin-top: -10px; width: 1500px">
					<span style="padding-left: 1400px;">&nbsp;</span> <span class="grayButton"><button type="button" onclick="javascript:doSaveGrid();">저장</button></span>
				</div>

				<div class="para" id="grid_wrap" style="width: 1500px; height:600px;color: black;"></div>

				<div class="btnArea" style="margin-top: -10px; width: 1500px;">
					<span style="padding-left: 1400px;">&nbsp;</span> <span class="grayButton"><button type="button" onclick="javascript:doSaveGrid();">저장</button></span>
				</div>
		</div>


	</div>
<jsp:include page="/WEB-INF/jsp/car/carInclude.jsp"/>	
</body>
</html>
