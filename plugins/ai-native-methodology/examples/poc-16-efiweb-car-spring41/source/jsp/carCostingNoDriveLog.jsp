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
<link rel="stylesheet" type="text/css" href="${cssPath}/ifrs/jquery-confirm.css" />
<style type="text/css">
.money { text-align:right; }
.slipCell { color:blue; }
</style>
<script type="text/javascript" src="${scriptPath}/ifrs/jquery-1.7.1.js"></script>
<script type="text/javaScript" src="<c:url value='${scriptPath}/ifrs/jquery-ui-1.9.2.custom.js'/>"></script>
<script type="text/javaScript" src="<c:url value='${scriptPath}/ifrs/jquery.ui.datepicker-ko.js'/>"></script>
<script type="text/javascript" src="${scriptPath}/ifrs/jquery-confirm.js"></script>
<script type="text/javascript" src="${scriptPath}/ifrs/calendar_month5.js"></script>
<script type="text/javascript" src="${scriptPath}/ifrs/jqCommon.js"></script>
<script type="text/javascript" src="${scriptPath}/ifrs/common.js"></script>

<!-- AUIGrid 라이센스 파일입니다. 그리드 출력을 위해 꼭 삽입하십시오. -->
<link href="${auiGridPath}/3.0.9/AUIGrid_style.css" rel="stylesheet">
<script type="text/javascript" src="${auiGridPath}/3.0.9/AUIGridLicense.${domain}.js"></script>
<script type="text/javascript" src="${auiGridPath}/3.0.9/AUIGrid.js"></script>
<script type="text/javascript" src="${scriptPath}/ifrs/gridCommon.js?5"></script>

<script type="text/javascript">
	//AUIGrid 생성 후 반환 ID
	var myGridID;
	
	var yn = ["Y", "N"];

	$(document).ready(function(){
        
		$("#useStrDate").datepicker();
		$("#useEndDate").datepicker();
		
		$("#useStrDate").val( "${today}".substring(0, 4) + "-01-01" );
		$("#useEndDate").val( "${today}" );
		
		var columnLayout = createColumnData();

		// AUIGrid 그리드를 생성합니다.
		createAUIGrid(columnLayout);
		
		fn_selectList();
				
	});
	
	
	function fn_selectList(){
		var url = "<c:url value='/ifrs/car/cost/costingNoDriveLogAjax' />";
		var data = "useStrDate=" + $("#useStrDate").val() + "&useEndDate=" + $("#useEndDate").val() + "&comCd=" + $("#comCd").val();
		
		fn_ajax(url, data, function( result ){
			// 데이터 요청, 요청 성공 시 AUIGrid 에 데이터 삽입합니다.
			AUIGrid.setGridData(myGridID, result.result);
			$("#deleteSpan").show();
		});	
	}
	
	
	// 칼럼 레이아웃을 생성하여 반환합니다.
	function createColumnData() {
		var columnLayout = [
     	 { dataField: "idx",
   			headerText: "일련번호",
   			visible:false
   		  },
   		  { dataField: "comCd",
     		headerText: "법인번호",
     		visible:false
     	  },
   		  { dataField: "comNm",
   			headerText: "법인",
   			filter : { showIcon : true},
   		  },
   		  { headerText : "사용기간", 
   				children : [
   				   { dataField : "useStrDate", editable : false, headerText : "시작일" },
   				   { dataField : "useEndDate", editable : false, headerText : "종료일" }
   		  ]},
		  { dataField: "gasCost",
			headerText: "유류비",
			dataType : "numeric",
			editable : false,
			style : "money slipCell"
		  },
		  { dataField: "insuranceCost",
			headerText: "보험료",
			dataType : "numeric",
			editable : false,
			style : "money slipCell"
		  },
		  { dataField: "repairCost",
			headerText: "수선비",
			dataType : "numeric",
			editable : false,
			style : "money slipCell"
		  },
		  { dataField: "taxCost",
			headerText: "자동차세",
			dataType : "numeric",
			editable : false,
			style : "money slipCell"
		  },
		  { dataField: "etcCost",
			headerText: "기타",
			dataType : "numeric",
			editable : false,
			style : "money slipCell"
		  },
		  { dataField: "gasSlipseq",
			headerText: "유류비전표",
			visible: false
		  },
		  { dataField: "insuranceSlipseq",
			headerText: "보험료전표",
			visible: false
		  },
		  { dataField: "repairSlipseq",
			headerText: "수선비전표",
			visible: false
		  },
		  { dataField: "taxSlipseq",
			headerText: "자동차세전표",
			visible: false
		  },
		  { dataField: "etcSlipseq",
			headerText: "기타전표",
			visible: false
		  },
		  { dataField: "sum",
			headerText: "합계",
			dataType : "numeric",
			formatString : "#,##0",
			style : "money",
			labelFunction : function(  rowIndex, columnIndex, labelText, headerText, item, dataField  ){
				var sum = 0;
				sum = toNumber( item["gasCost"]) 
						+ toNumber( item["insuranceCost"])
						+ toNumber( item["repairCost"]) 
						+ toNumber( item["taxCost"]) 
						+ toNumber( item["etcCost"]); 
				
				if(isNaN(sum))
					return 0;
				else
					return commafy(sum);
			}
		  }
		];

		return columnLayout;
	}
	
	
	function toNumber( val ){
		if( isNaN(val) ) val = 0;
		return Number(val);
	}
	
	// AUIGrid 를 생성합니다.
	function createAUIGrid(columnLayout) {
		
		var auiGridProps = {
			editable : true,
			//enableCellMerge : true,
			//editableOnFixedCell : true,
			rowIdField : "idx",
			enableFilter : true,
			useContextMenu : true,
			showStateColumn : true,
// 			fixedColumnCount : 8,
			//softRemovePolicy : "exceptNew",
			skipReadonlyColumns : true
		};
		
		// 실제로 #grid_wrap 에 그리드 생성
		myGridID = AUIGrid.create("#grid_wrap", columnLayout, auiGridProps);
		
		//셀 더블 클릭 이벤트 바인딩. - 전표 팝업
		AUIGrid.bind(myGridID, "cellClick",   auiGridCellClickHandler);
		
		// cellEditEndBefore 이벤트 바인딩
		//AUIGrid.bind(myGridID, "cellEditEndBefore", cellEditEndBeforeHandler);
		
	}
	
	
	//계산하기
	function fn_calculate(){
		var url = "<c:url value='/ifrs/car/cost/costingNoLogCalculateAjax' />";
		var data = "userNm=김형진&useStrDate="+ $("#useStrDate").val() + "&useEndDate="+ $("#useEndDate").val() + "&comCd=" + $("#comCd").val() + "&comNm=" + $("#comCd option:selected").text();
		
		fn_ajax(url, data, function( result ){
			// 데이터 요청, 요청 성공 시 AUIGrid 에 데이터 삽입합니다.
			AUIGrid.setGridData(myGridID, result.result);
			$("#deleteSpan").hide();
		});			
	}
	
	//전표 팝업
	function auiGridCellClickHandler( event ){
		
		var value = event.value;
		var dataField = event.dataField;
		var item = event.item;
		var costType = "";
		
		var slipIds = "";
		if(dataField == "gasCost") { //유류비
			slipIds = item["gasSlipseq"]; 
			costType = "G";
		}else if(dataField == "insuranceCost") { 
			slipIds = item["insuranceSlipseq"];
			costType = "I";
		}else if(dataField == "repairCost") { 
			slipIds = item["repairSlipseq"];
			costType = "R";
		}else if(dataField == "taxCost") { 
			slipIds = item["taxSlipseq"];	
			costType = "T";
		}else if(dataField == "etcCost") { 
			slipIds = item["etcSlipseq"];
			costType = "E";
		}
		
		
		if( slipIds != "" ) popSlipInfo(slipIds, costType);
		
		return false;
	} 

	
	function popSlipInfo( slipIds, costType ){
		fn_openWindow("", "carCostSlipPop", "1100", "500");
		$("#slipForm").attr("target", "carCostSlipPop");
		$("#slipForm").attr("action", "/ifrs/car/cost/selectSlipInfo");
		$("#slipForm").find("[name='companySeq']").val( $("#comCd").val() );
		$("#slipForm").find("[name='slipSeq']").val( slipIds );
		$("#slipForm").find("[name='costType']").val( costType );
		$("#slipForm").submit();
	}
	
	
	function doSaveGrid(){
		
		var data = {};
		data.data = AUIGrid.getGridData( myGridID );
		var removeData = getModfiedDataFromMasterGrid(myGridID, 0, 0, 1);
		data.remove = removeData.remove;
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
              		saveGridDataAjax("/ifrs/car/cost/saveCostingNoLog", myGridID, data, function(result){
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
            				fn_selectList();
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
	
	// 행 삭제
	function removeRow() {
		AUIGrid.removeRow(myGridID, "selectedIndex");
	}
	
	function doExcelDown(){
		var fileName = $("#useStrDate").val() + "~" + $("#useEndDate").val() + "_" +  $("#comCd option:selected").text() + "_업무일지_미작성_비용산출";
		gridExportTo(myGridID,  "xlsx", "/ifrs/common/car/exportAUI", fileName);		
	}
</script>
</head>


<body style="background:none;">

<jsp:include page="/WEB-INF/jsp/car/loading.jsp" />

<form name="slipForm" id="slipForm" method="post">
	<input type="hidden" name="companySeq" value="" />
	<input type="hidden" name="slipSeq" value="" /> 
	<input type="hidden" name="costType" value="" />
</form>

<!--wrap div-->
<div id="wrap">
	

        <div class="content" style="width:1500px;">
            
            
			<form name="searchForm" id="searchForm" method="post">

        	<div class="seachGroup">
             	<fieldset>
             	<div class="fl">
                     <div class="basicSearch" style="width:900px;">
                         <div class="hGroup">
                             <ul class="firstChild" style="width: 880px;">
                                <li>
                                	<!-- 
                               		<label for="state" style="width:70px;">사업년도</label>
                               		<select name="year" id="year" onchange="fn_selectList();">
                               			<option value="2016" selected>2016</option>
                               			<option value="2017">2017</option>
                               		</select> 
                               		&nbsp;&nbsp;
                               		 -->
                                	<label for="state" style="width:35px;">법인</label>
                               		<select name="comCd" id="comCd">
                               		<c:forEach var="list" items="${companyList }">
                               			<option value="${list.companyseq }">${list.companyname }</option>
                               		</c:forEach>
                               		</select>
                               		&nbsp;&nbsp;
                               		<label for="state" style="width:55px;">사용기간</label>
                               		<input type='text' name='useStrDate' id="useStrDate" value='' class='inptext' size='10' /> ~ 
									<input type='text' name='useEndDate' id="useEndDate" value='' class='inptext' size='10' />
                               		&nbsp;&nbsp;
                               		<span class="grayButton"><button type="button" id="btnSelect" onclick="fn_selectList();">조&nbsp;&nbsp;회</button></span>
                               		<span class="grayButton"><button type="button" id="btnCalculate" onclick="fn_calculate();">계산하기</button></span>
                  					<span class="grayButton"><button type="button" onclick="javascript:doExcelDown();" style="color:#008000; "><img src="/images/ifrs/icon_excel.gif" alt="엑셀 다운" style="margin-top:-2px; margin-right:3px;">엑셀 다운</button></span>	
                                 </li>
                             </ul> 
                          </div>  
                      </div>
                  </div>
                 </fieldset>
            </div>
             			
			</form>
			
			<div class="btnArea" style="margin-top:-10px;">
				<span style="padding-left:720px;">&nbsp;</span>
<!--                 <span class="grayButton"><button type="button" onclick="javascript:goInsertView();">등록</button></span> -->
            </div>
            
            <div class="para" id="grid_wrap" style="width:1500px;color:black;">
            
            </div>
            <div  style="float:right;">
            	<span class="grayButton" id="deleteSpan"><button type="button" onclick="removeRow();">삭제</button></span>
			 	<span class="grayButton"><button type="button" onclick="doSaveGrid();">저장</button></span>
            </div>

        </div>

</div>


</body>
</html>
