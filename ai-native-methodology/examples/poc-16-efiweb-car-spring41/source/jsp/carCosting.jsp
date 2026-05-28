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
<link type="text/css" rel="stylesheet" href="${cssPath}/ifrs/jquery-ui.css" />
<link rel="stylesheet" type="text/css" href="${cssPath}/ifrs/jquery-confirm.css" />
<script type="text/javascript" src="${scriptPath}/ifrs/jquery-1.7.1.js"></script>
<script type="text/javascript" src="${scriptPath}/ifrs/jquery-ui-1.8.18.custom.min.js"></script>
<script type="text/javascript" src="${scriptPath}/ifrs/jquery-confirm.js"></script>
<script type="text/javascript" src="${scriptPath}/ifrs/calendar_month5.js"></script>
<script type="text/javascript" src="${scriptPath}/ifrs/jqCommon.js"></script>
<script type="text/javascript" src="${scriptPath}/ifrs/common.js?1"></script>

<!-- AUIGrid 라이센스 파일입니다. 그리드 출력을 위해 꼭 삽입하십시오. -->
<link href="${auiGridPath}/3.0.9/AUIGrid_style.css" rel="stylesheet">
<script type="text/javascript" src="${auiGridPath}/3.0.9/AUIGridLicense.${domain}.js"></script>
<script type="text/javascript" src="${auiGridPath}/3.0.9/AUIGrid.js"></script>
<script type="text/javascript" src="${scriptPath}/ifrs/gridCommon.js?4"></script>
<style type="text/css">
.money { text-align:right; }
.slipCell { color:blue; }
</style>
<script type="text/javascript">
	//AUIGrid 생성 후 반환 ID
	var myGridID;
	
	var yn = ["Y", "N"];
	var erpComList = ${companyList};
	
	$(document).ready(function(){
		
		$("#year").change( fn_selectList );
		$("#comCd").change( fn_selectList );
		
		//탭 조정
		$("#costAccept${costAcceptCd}").removeClass("off");
		$("#costAccept${costAcceptCd}").addClass("on");
		$("#costAccept${costAcceptCd}").attr("href", "#");
		
		var comSelect = "";
		for(var i=0; i < erpComList.length; i++ ){
			comSelect += "<option value='" +  erpComList[i].companyseq + "'>" + erpComList[i].companyname + "</option>";
		}
		$("#comCd").html( comSelect );
		
        $("input[role=dateInput]").datepicker ({
	            dateFormat : 'yy-mm-dd'
	          , changeYear : true
	          , changeMonth : true
	          , monthNamesShort : ['1월','2월','3월','4월','5월','6월','7월','8월','9월','10월','11월','12월']             
   		});
		var columnLayout = createColumnData();

		// AUIGrid 그리드를 생성합니다.
		createAUIGrid(columnLayout);
		
		if( "${param.year}" != "" ) $("#year").val( "${param.year}" );
		if( "${param.comCd}" != "" ) $("#comCd").val( "${param.comCd}" );
		
		fn_selectList();
				
	});
	
	
	function fn_selectList(){
		var url = "<c:url value='/ifrs/car/cost/costingListAjax' />";
		var data = "year="+ $("#year").val() + "&comCd=" + $("#comCd").val() + "&costAcceptCd=${costAcceptCd}";
		
		fn_ajax(url, data, function( result ){
			// 데이터 요청, 요청 성공 시 AUIGrid 에 데이터 삽입합니다.
			AUIGrid.setGridData(myGridID, result.result);
		});	
	}
	
	//계산하기
	function fn_calculate(){
		var url = "<c:url value='/ifrs/car/cost/costingCalculateAjax' />";
		var data = "year="+ $("#year").val() + "&comCd=" + $("#comCd").val() + "&costAcceptCd=${costAcceptCd}";
		
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
   		  { dataField: "comNm",
   			headerText: "법인",
   			filter : { showIcon : true},
   			mergePolicy : "restrict"
   		  },
   		  { dataField: "carGetDate",
   			headerText: "취득일",
   		  },
   		  { dataField: "carType",
   			headerText: "차종",
   			filter : { showIcon : true},
   		  },		  
   		  { dataField: "carNo",
   			headerText: "차량번호",
   			filter : { showIcon : true},
   		  },
   		  { dataField: "userNm",
   			headerText: "사용자",
   			filter : { showIcon : true},
   		  },
   		  { dataField: "state",
   			headerText: "차량상태",
   			filter : { showIcon : true},
   		  },
   		  { dataField: "useComCd",
 			headerText: "차량비용사용법인코드",
 			visible : false
 		  },
   		  { dataField: "useComNm",
   			headerText: "차량비용사용법인",
   			filter : { showIcon : true}
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
			enableCellMerge : true,
			//editableOnFixedCell : true,
			//rowIdField : "no",
			enableFilter : true,
			useContextMenu : true,
			showStateColumn : true,
 			fixedColumnCount : 13,
			softRemovePolicy : "exceptNew",
			skipReadonlyColumns : true
		};
		
		
		
		// 실제로 #grid_wrap 에 그리드 생성
		myGridID = AUIGrid.create("#grid_wrap", columnLayout, auiGridProps);
		
		//셀 더블 클릭 이벤트 바인딩. - 전표 팝업
		AUIGrid.bind(myGridID, "cellClick",   auiGridCellClickHandler);
		
		// cellEditEndBefore 이벤트 바인딩
		//AUIGrid.bind(myGridID, "cellEditEndBefore", cellEditEndBeforeHandler);
		
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
		
		if( slipIds != "" ) popSlipInfo(slipIds, costType, item["useComCd"]);
		
		return false;
	} 

	
	function popSlipInfo( slipIds, costType, useComCd ){
		fn_openWindow("", "carCostSlipPop", "1100", "500");
		$("#slipForm").attr("target", "carCostSlipPop");
		$("#slipForm").attr("action", "/ifrs/car/cost/selectSlipInfo");
		$("#slipForm").find("[name='companySeq']").val( useComCd );
		$("#slipForm").find("[name='slipSeq']").val( slipIds );
		$("#slipForm").find("[name='costType']").val( costType );
		$("#slipForm").submit();
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
              		saveGridDataAjax("/ifrs/car/cost/saveCostingList", myGridID, data, function(result){
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
	
	
	function doExcelDown(){
		var fileName = $("#year").val() + "년_" + $("#comCd option:selected").text() + "_비용산출";
		gridExportTo(myGridID,  "xlsx", "/ifrs/common/car/exportAUI", fileName);		
	}
	
	function changeTab( costAcceptCd ){
		location.href = "/ifrs/car/cost/costing?costAcceptCd=" + costAcceptCd + "&year=" + $("#year").val() + "&comCd=" + $("#comCd").val();
	}

</script>
</head>


<body style="background:none;">

<jsp:include page="/WEB-INF/jsp/car/loading.jsp" />

<!--wrap div-->
<div id="wrap">
	

        <div class="content" style="width:1500px;">
            
         	<div class="btn_link" style="padding-bottom:30px;" id="tabDiv">
        		<a href="javascript:changeTab('1');" id="costAccept1" class="off">인정 비용</a>
        		<a href="javascript:changeTab('2');" id="costAccept2" class="off">미인정 비용</a>
        	</div>   
            
            <form name="slipForm" id="slipForm" method="post">
            	<input type="hidden" name="companySeq" value="" />
            	<input type="hidden" name="slipSeq" value="" />
            	<input type="hidden" name="costType" value="" />
            </form>
            
			<form name="searchForm" id="searchForm" method="post">
			<input type="hidden" name="carIdx" value="" />	
			 
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
                               		</select>
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
            
            <div class="para" id="grid_wrap" style="width:1500px;height:600px;color:black;">
            
            </div>
			 <span class="grayButton" style="float:right;"><button type="button" onclick="javascript:doSaveGrid();">저장</button></span>
            

            
        </div>

</div>

<jsp:include page="/WEB-INF/jsp/car/carInclude.jsp"/>
</body>
</html>
