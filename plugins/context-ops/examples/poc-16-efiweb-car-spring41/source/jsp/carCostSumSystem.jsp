<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8" %>
<%@ page import="java.util.Calendar" %>
<%@ include file="/WEB-INF/jsp/config/include.jsp" %>
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
<script type="text/javascript" src="${scriptPath}/ifrs/common.js?1"></script>

<!-- AUIGrid 라이센스 파일입니다. 그리드 출력을 위해 꼭 삽입하십시오. -->
<link href="${auiGridPath}/3.0.9/AUIGrid_style.css" rel="stylesheet">
<script type="text/javascript" src="${auiGridPath}/3.0.9/AUIGridLicense.${domain}.js"></script>
<script type="text/javascript" src="${auiGridPath}/3.0.9/AUIGrid.js"></script>
<script type="text/javascript" src="${scriptPath}/ifrs/gridCommon.js?9"></script>
<style type="text/css">
.money {
	text-align:right;
}
</style>
<script type="text/javascript">
	//AUIGrid 생성 후 반환 ID
	var myGridID;
	
	var rentTypeCdList = ${rentTypeList};
	var yn = ["Y", "N"];

	$(document).ready(function(){
		
		$("#year").change( fn_selectList );
		$("#comCd").change( fn_selectList );
		
		var columnLayout = createColumnData();

		// AUIGrid 그리드를 생성합니다.
		createAUIGrid(columnLayout);
		
		fn_selectList();
				
	});
	
	
	function fn_selectList(){
		var url = "<c:url value='/ifrs/car/cost/carCostStatementListAjax' />";
		var data = "year=" + $("#year").val() +  "&comCd=" + $("#comCd").val();
		
		fn_ajax(url, data, function( result ){
			// 데이터 요청, 요청 성공 시 AUIGrid 에 데이터 삽입합니다.
			AUIGrid.setGridData(myGridID, result.result);
		});	
	}
	
	
	function fn_selectCallData(){
		var url = "<c:url value='/ifrs/car/cost/carCostSumSystemAjax' />";
		var data = "year=" + $("#year").val() +  "&comCd=" + $("#comCd").val();
		
		fn_ajax(url, data, function( result ){
			// 데이터 요청, 요청 성공 시 AUIGrid 에 데이터 삽입합니다.
			AUIGrid.setGridData(myGridID, result.result);
		});
	}
	
	
	// 칼럼 레이아웃을 생성하여 반환합니다.
	function createColumnData() {
		var columnLayout = [
		 { dataField: "termIdx",
			headerText: "일련번호",
			visible:false
		  },
		  { dataField: "carIdx",
			headerText: "차량일련번호",
			visible:false
		  },
		  { dataField: "costIdx",
			headerText: "비용일련번호",
			visible:false
		  },
		  { dataField: "carNo",
			headerText: "차량번호",
			editable : false
		  },
		  { dataField: "carType",
			headerText: "차종",
			dataType : "string",
			editable : false
		  },		  
		  { dataField: "rentTypeCd",
			headerText: "임차여부",
			editable : true,
			labelFunction : function(  rowIndex, columnIndex, value, headerText, item ) { 
				var retStr = value;
				for(var i=0,len=rentTypeCdList.length; i<len; i++) {
					if(rentTypeCdList[i]["code"] == value) {
						retStr = rentTypeCdList[i]["codeName"];
						break;
					}
				}
				return retStr;
			},
			editRenderer : {
				type : "DropDownListRenderer",
				showEditorBtnOver : true, // 마우스 오버 시 에디터버턴 보이기
				list : rentTypeCdList,
				keyField : "code",
				valueField : "codeName"
			}
		  },
		  { dataField: "insuranceYn",
			headerText: "보험가입여부",
			editRenderer : {
				type : "DropDownListRenderer",
				showEditorBtnOver : true, // 마우스 오버 시 에디터버턴 보이기
				list : yn
			}
		  },
		  { dataField: "driveDist",
			headerText: "총주행거리(km)",
			dataType : "numeric",
			formatString : "#,##0",
			editable : false
		  },
		  { dataField: "driveWorkDist",
			headerText: "업무사용거리(km)",
			dataType : "numeric",
			formatString : "#,##0",
			editable : false
		  },
		  { dataField: "driveWorkPct",
			headerText: "업무사용비율[6/5]",
			editable : false
		  },
		  { headerText : "업무용승용차 관리비용", 
				children : [
				   { dataField : "taxDeprCost", editable : true, headerText : "세무상감가상각비", dataType : "numeric", formatString : "#,##0", style : "money" },
				   { headerText : "임차료", children : [
													 { dataField : "rentCost", editable : true, headerText : "임차료", dataType : "numeric", formatString : "#,##0", style : "money" },
				                                     { dataField : "deprCost", editable : true, headerText : "감가상각비상당액", dataType : "numeric", formatString : "#,##0", style : "money" } ]
				   },
				   { dataField : "gasCost", editable : true, headerText : "유류비", dataType : "numeric", formatString : "#,##0", style : "money"},
				   { dataField : "insuranceCost", editable : true, headerText : "보험료", dataType : "numeric", formatString : "#,##0", style : "money"},
				   { dataField : "repairCost", editable : true, headerText : "수선비", dataType : "numeric", formatString : "#,##0", style : "money"},
				   { dataField : "taxCost", editable : true, headerText : "자동차세", dataType : "numeric", formatString : "#,##0", style : "money"},
				   { dataField : "etcCost", editable : true, headerText : "기타", dataType : "numeric", formatString : "#,##0", style : "money"},
				   { dataField : "sum", editable : false, headerText : "합계", dataType : "numeric", formatString : "#,##0", style : "money",
					   expFunction : function(  rowIndex, columnIndex, item, dataField  ){
							var sum = 0;
							sum = 	toNumber( item["taxDeprCost"])
									+ toNumber( item["rentCost"])
									+ toNumber( item["deprCost"])
									+ toNumber( item["gasCost"]) 
									+ toNumber( item["insuranceCost"])
									+ toNumber( item["repairCost"]) 
									+ toNumber( item["taxCost"]) 
									+ toNumber( item["etcCost"]); 
							
							if(isNaN(sum))
								return 0;
							else
								return sum;
						}  
				   }
		  ]},
		];


		return columnLayout;
	}
	
	
	function toNumber( val ){
		if( isNaN(val) ) val = 0;
		return Number(val);
	}
	
	var footerObject = [ {
		labelText : "합계",
		positionField : "#base"
	}, {
		dataField : "taxDeprCost",
		positionField : "taxDeprCost",
		operation : "SUM",
		style : "money",
		formatString : "#,##0"
	}, {
		dataField : "rentCost",
		positionField : "rentCost",
		operation : "SUM",
		style : "money",
		formatString : "#,##0"
	}, {
		dataField : "deprCost",
		positionField : "deprCost",
		operation : "SUM",
		style : "money",
		formatString : "#,##0"
	}, {	
		dataField : "gasCost",
		positionField : "gasCost",
		operation : "SUM",
		style : "money",
		formatString : "#,##0"
	}, {
	}, {
		dataField : "insuranceCost",
		positionField : "insuranceCost",
		operation : "SUM",
		style : "money",
		formatString : "#,##0"
	}, {
	}, {
		dataField : "repairCost",
		positionField : "repairCost",
		operation : "SUM",
		style : "money",
		formatString : "#,##0"
	}, {
	}, {
		dataField : "taxCost",
		positionField : "taxCost",
		operation : "SUM",
		style : "money",
		formatString : "#,##0"
	}, {
	}, {
		dataField : "etcCost",
		positionField : "etcCost",
		operation : "SUM",
		style : "money",
		formatString : "#,##0"
	}, {
		dataField : "sum",
		positionField : "sum",
		operation : "SUM",
		style : "money",
		formatString : "#,##0"
	}];
	
	
	// AUIGrid 를 생성합니다.
	function createAUIGrid(columnLayout) {
		
		var auiGridProps = {
			//selectionMode : "singleRow",
			editable : true,
			enableCellMerge : true,
			//editableOnFixedCell : true,
			//rowIdField : "no",
			enableFilter : true,
			useContextMenu : true,
			showStateColumn : true,
// 			fixedColumnCount : 8,
			softRemovePolicy : "exceptNew",
			//skipReadonlyColumns : true,
			showFooter : true
		};
		
		
		// 실제로 #grid_wrap 에 그리드 생성
		myGridID = AUIGrid.create("#grid_wrap", columnLayout, auiGridProps);
		
		// cellEditEndBefore 이벤트 바인딩
		//AUIGrid.bind(myGridID, "cellEditEndBefore", cellEditEndBeforeHandler);
		
		//AUIGrid.bind(myGridID, "cellEditCancel", cellEditCancelHandler);
		
		// 행추가 이벤트 바인딩
		//AUIGrid.bind(myGridID, "addRowFinish", auiAddRowHandler);
		
		// 푸터 객체 세팅
		AUIGrid.setFooter(myGridID, footerObject);
	}
	
	
	function doSaveGrid(){
		
		//var data = getModfiedDataFromMasterGrid(myGridID, 0, 1, 0);
		var data = {};
		data.update = AUIGrid.getGridData( myGridID );
		//alert(JSON.stringify(data));
		if( data == "NO CHANGE" ){
			//alert( "변경된 항목이 없습니다." );
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
		
		//if( confirm("저장하시겠습니까?") == false ) return;
		$.confirm({
            title : '',
            boxWidth : '30%',
            useBootstrap : false,
            content : "저장하시겠습니까?",	              
            buttons : {
                confirm: {
              	text : '확인',
              	action : function() {  
              		saveGridDataAjax("/ifrs/car/cost/saveCostSumSystemList", myGridID, data, function( result){
            			if(result.result == "success") { // DB 성공
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
            				//alert("DB 저장 실패!! message : ");
            				$.alert({
            	                title : '',
            	                content : 'DB 저장 실패!! message : ',
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

	
	function doExcelDown(){
		var fileName = $("#year").val() + "년_" + $("#comCd option:selected").text() + "_업무용차량비용명세서";
		gridExportTo(myGridID,  "xlsx", "/ifrs/common/car/exportAUI", fileName);		
	}
</script>
</head>


<body style="background:none;">

<jsp:include page="/WEB-INF/jsp/car/loading.jsp" />

<!--wrap div-->
<div id="wrap">
	

        <div class="content">
            
            
			<form name="searchForm" id="searchForm" method="post">
			 
        	<div class="seachGroup">
             	<fieldset>
             	<div class="fl">
                     <div class="basicSearch" style="width:830px;">
                         <div class="hGroup">
                             <ul class="firstChild" style="width: 830px;">
                                <li>
                               		<label for="state" style="width:70px;">사업년도</label>
                               		<select name="year" id="year">
								       <% final int thisYear = Calendar.getInstance().get(Calendar.YEAR);
								          for (int i=thisYear, len=2016; len<=i; i--) { %>
								       		<option value="<%=i %>" <%= (thisYear==i ? "selected" : "")%>><%=i %></option>
								       <% } %>
                               		</select> 
                               		&nbsp;&nbsp;
                                	<label for="state" style="width:35px;">법인</label>
                               		<select name="comCd" id="comCd">
                               		<c:forEach var="list" items="${companyList }">
                               			<option value="${list.companyseq }">${list.companyname }</option>
                               		</c:forEach>
                               		</select>
                               		&nbsp;&nbsp;
                               		<span class="grayButton"><button type="button" id="btnSelect" onclick="fn_selectList();">조&nbsp;&nbsp;회</button></span>
                               		<span class="grayButton"><button type="button" id="btnSelect" onclick="fn_selectCallData();">데이터 불러오기</button></span>
                  					<span class="grayButton"><button type="button" onclick="javascript:doExcelDown();" style="color:#008000; "><img src="/images/ifrs/icon_excel.gif" alt="엑셀 다운" style="margin-top:-2px; margin-right:3px;">엑셀 다운</button></span>	
                                 </li>
                             </ul> 
                          </div>  
                      </div>
                  </div>
                 </fieldset>
            </div>
 			
			</form>
			
            
            <div class="para" id="grid_wrap" style="width:1500px;height:600px;color:black;">
            
            </div>
            
			<div class="btnArea" style="width:1500px;margin-top:-10px;">
                <span class="grayButton" style="float:right"><button type="button" onclick="javascript:doSaveGrid();">저장</button></span>
            </div>
            
        </div>


</div>
<jsp:include page="/WEB-INF/jsp/car/carInclude.jsp"/>
</body>
</html>
