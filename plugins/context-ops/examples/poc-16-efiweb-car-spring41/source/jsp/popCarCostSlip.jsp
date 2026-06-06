<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8" %>
<%@ include file="/WEB-INF/jsp/config/include.jsp" %>
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">
<head>
<meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
<meta http-equiv="X-UA-Compatible" content="IE=9;FF=3;OtherUA=4" />
<title>IFRS</title>
<link rel="stylesheet" type="text/css" href="${cssPath}/ifrs/ifrs.css" />
<link type="text/css" rel="stylesheet" href="${cssPath}/ifrs/jquery-ui.css" />
<script type="text/javascript" src="${scriptPath}/ifrs/jquery-1.7.1.js"></script>
<script type="text/javascript" src="${scriptPath}/ifrs/jquery-ui-1.8.18.custom.min.js"></script>
<script type="text/javascript" src="${scriptPath}/ifrs/calendar_month5.js"></script>
<script type="text/javascript" src="${scriptPath}/ifrs/jqCommon.js"></script>
<script type="text/javascript" src="${scriptPath}/ifrs/common.js?1"></script>

<!-- AUIGrid 라이센스 파일입니다. 그리드 출력을 위해 꼭 삽입하십시오. -->
<link href="${auiGridPath}/3.0.9/AUIGrid_style.css" rel="stylesheet">
<script type="text/javascript" src="${auiGridPath}/3.0.9/AUIGridLicense.${domain}.js"></script>
<script type="text/javascript" src="${auiGridPath}/3.0.9/AUIGrid.js"></script>
<script type="text/javascript" src="${scriptPath}/ifrs/gridCommon.js"></script>
<style type="text/css">
.money {
	text-align:right;
}
</style>
<script type="text/javascript">
	//AUIGrid 생성 후 반환 ID
	var myGridID;
	
	$(document).ready(function(){
		var columnLayout = createColumnData();

		// AUIGrid 그리드를 생성합니다.
		createAUIGrid(columnLayout);
		
		AUIGrid.setGridData(myGridID, ${slipList});
				
	});
	
	
	// 칼럼 레이아웃을 생성하여 반환합니다.
	function createColumnData() {
		var columnLayout = [
   		  { dataField: "accname",
   			headerText: "계정과목",
   			filter : { showIcon : true},
   		  },
   		  { dataField: "accseq",
   			headerText: "계정코드",
   		  },
   		  { dataField: "minorname",
   			headerText: "비용구분"
   		  },		  
   		  { dataField: "dramt",
   			headerText: "차변금액",
   			dataType : "numeric",
   			style : "money"
   		  },
   		  { dataField: "cramt",
   			headerText: "대변금액",
   			dataType : "numeric",
   	   		style : "money"
   		  },
   		  { dataField: "accdate",
   			headerText: "회계일"
   		  },
   		  { dataField: "summary",
   			headerText: "적요"
   		  },
   		  { dataField: "slipid",
   			headerText: "전표기표번호"
   		  },
   		  { dataField: "deptname",
   			headerText: "귀속부서"
   		  },
   		  { dataField: "cctrname",
   			headerText: "활동센터"
   		  }
		];

		return columnLayout;
	}
	
	
	// AUIGrid 를 생성합니다.
	function createAUIGrid(columnLayout) {
		
		var auiGridProps = {
			editable : false,
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
		
	}
	
	
	function doExcelDown(){
		var type = "${param.costType}";
		var typeName = "";
		if( type == "G" ) typeName = "유류비";
		else if( type == "I" ) typeName = "보험료";
		else if( type == "R" ) typeName = "수선비";
		else if( type == "T" ) typeName = "자동차세";
		else if( type == "E" ) typeName = "기타";
			
		var fileName = typeName + "_전표목록";
		gridExportTo(myGridID,  "xlsx", "/ifrs/common/car/exportAUI", fileName);		
	}
	

</script>
</head>

<body style="background:none">
	<h3 style="padding:20px 0 0 30px;background:none">전표확인</h3>
	<div style="padding:0 50px 10px 900px;">
		<span class="grayButton"><button type="button" onclick="javascript:doExcelDown();" style="color:#008000; "><img src="/images/ifrs/icon_excel.gif" alt="엑셀 다운" style="margin-top:-2px; margin-right:3px;">엑셀 다운</button></span>
	</div>
	<div class="para" id="grid_wrap" style="padding-left:20px;width:1000px;color:black;">
            
    </div>
</body>
</html>
