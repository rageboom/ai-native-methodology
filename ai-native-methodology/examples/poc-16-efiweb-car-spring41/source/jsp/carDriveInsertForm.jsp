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
<link rel="stylesheet" type="text/css" href="${cssPath}/ifrs/defaultTheme.css" media="screen" />
<link type="text/css" rel="stylesheet" href="${cssPath}/ifrs/jquery-ui-1.9.2.custom.css" />
<link rel="stylesheet" type="text/css" href="${cssPath}/ifrs/jquery-confirm.css" />
<style type="text/css">
div.content {width : 1527px;}
span.lp20 { padding-left:20px; }
.listType tr td { text-align:center; }
.listType thead td { vertical-align:middle; height:30px; border:solid 1px #c1c2c6 !important;  }
.listType thead th { vertical-align:middle }
.listType tfoot th { vertical-align:middle; height:30px; border:solid 1px #c1c2c6 !important; background:#D4F4FA}
.listType tbody td{ border:solid 1px #c1c2c6 !important;}

.wrap-loading div{ /*로딩 이미지*/
	    position: fixed;
	    top:50%;
	    left:50%; 
	    margin-left: -21px;
	    margin-top: -21px;
	    z-index:999999;
	}	
	
.ui-datepicker select.ui-datepicker-year {width: 60px;}
.ui-datepicker select.ui-datepicker-month {width: 60px;}	
</style>
<script type="text/javascript" src="${scriptPath}/ifrs/jquery-1.7.1.js"></script>
<script type="text/javaScript" src="<c:url value='${scriptPath}/ifrs/jquery-ui-1.9.2.custom.js'/>"></script>
<script type="text/javascript" src="${scriptPath}/ifrs/jquery-confirm.js"></script>
<script type="text/javaScript" src="<c:url value='${scriptPath}/ifrs/jquery.ui.datepicker-ko.js'/>"></script>
<script type="text/javascript" src="${scriptPath}/ifrs/jqCommon.js"></script>
<script type="text/javascript" src="${scriptPath}/ifrs/common.js?2"></script>
<script type="text/javascript" src="${scriptPath}/ifrs/validation.js"></script>
<script type="text/javascript" src="${scriptPath}/ifrs/jquery.fixedheadertable.js"></script><!-- 수정본이므로 min파일로 엎으면 안됨 -->
<script type="text/javascript">
	var carInfo;
	var T = Number('1e'+ 5);
	
	$(document).ready(function(){
// 		$("#saveBtnDiv").hide();
		$("input[name='recentDays']").click(function(){
			var today = new Date(); 
			$("#year").val( today.getFullYear() );
			$("#month").val("");
			fn_selectList();
		});
		
		$('#dataTbl').fixedHeaderTable({autoShow:true, height:720 });
	});
	

	$(document ).on( "change", "input[name='depAccDist']", function(){ calcDist(this); } );
	$(document ).on( "change", "input[name='arrAccDist']", function(){ calcDist(this); } );
	
	//주행거리 계산 
	function calcDist( obj ){
		var $depObj = $(obj).parent().parent().find("input[name='depAccDist']");
		var $arrObj = $(obj).parent().parent().find("input[name='arrAccDist']");
		
		if( $depObj.val().trim() != "" && $arrObj.val().trim() != "" ){
			if(isNumCheck( $depObj.val() ) == false ){
				//alert("숫자만 입력해주세요.");
				$.alert({
	                title : '',
	                content : '숫자만 입력해주세요.',
	                boxWidth : '30%',
	                useBootstrap : false,
	                buttons : {
	                    okay : {
	                        text: 'OK',
	                        btnClass: 'btn-blue'
	                    }
	                }
	            });
				$depObj.val("");
				return;
			}
			if(isNumCheck( $arrObj.val() ) == false ){
				//alert("숫자만 입력해주세요.");
				$.alert({
	                title : '',
	                content : '숫자만 입력해주세요.',
	                boxWidth : '30%',
	                useBootstrap : false,
	                buttons : {
	                    okay : {
	                        text: 'OK',
	                        btnClass: 'btn-blue'
	                    }
	                }
	            });
				$arrObj.val("");
				return;
			}
			
			var distance = Math.round((Number($arrObj.val()) - Number($depObj.val() ) ) *T)/T;
			
			$(obj).parent().parent().find("input[name='driveDist']").val( distance );
		}
		
	}

	function fn_selectList(){
		var data = "carIdx=" + $('#carIdx').val() 
					+ "&year=" + $("#year").val()
					+ "&month=" + $("#month").val()
					+ "&recentDays=" + $("input[name='recentDays']:checked").val();
		var url = "/ifrs/car/carDriveListAjax";
		
		fn_ajax(url, data, function(html){
// 			$("#saveBtnDiv").hide();
			$("#dataArea").html( html );
			
			calcTotDist();
		});	
	}
	
	function calcTotDist(){
		
		var distance = 0;
		var driveWorkDist = 0;
		
		var totDist = 0.0;
		var totWorkDist = 0.0;
		
		var startKm = 0;
		var endKm = 0;
		
		$("tbody#dataArea tr").each(function( index ){
			
			$tds = $(this).find("td");
// 			totDist = Math.round((Number(totDist) + Number( $tds.eq(10).text() ) ) *T)/T;
// 			totWorkDist = Math.round((Number(totWorkDist) + Number( $tds.eq(11).text() ) ) *T)/T;		 
// 			totDist = Math.round((Number(totDist) + Number( $tds.eq(5).text() ) ) *T)/T;

			distance = Math.round((Number(distance) + Number( removeComma($tds.eq(6).text()) ) ) *T)/T;
			driveWorkDist = Math.round((Number(driveWorkDist) + Number( removeComma($tds.eq(7).text()) ) ) *T)/T;
			
			totWorkDist = distance + driveWorkDist;
			
			if( index == 0 ){
				startKm =  $tds.eq(3).text();
			}
			if( index == $("tbody#dataArea tr").length - 1  ){
				endKm = $tds.eq(4).text();
			}
			 
		});
		
		//totDist = $("#totDist").val();
		totDist = Math.round(( Number( removeComma(endKm) ) - Number( removeComma(startKm) ) ) *T)/T;
		$("#spanTotDist").text( makeComma("" + totDist));
		$("#totWorkDist").text( makeComma("" + totWorkDist) );
		
		if(totDist!=null && totDist!=""){
			$("#workPercent").text( (totWorkDist/totDist*100).toFixed(4)+"%" );
		}else{
			$("#workPercent").text( "" );
		}
	}
	
	
	function selectCarInfo(){
		$("#deleteIdx").val("");
		//$("#totDist").val("");
		
		var data = "carIdx=" + $('#carIdx').val();
		var url = "/ifrs/car/carInfoAjax";
		
		$.ajax({
			url: url,
			type:"post",
			data:data,
			datatype:"json",
			datatype:"json",
			beforeSend:function(){
		        //(이미지 보여주기 처리)
		        $('.wrap-loading').show();
		    },
			success : function(result){
				carInfo = result.carInfo;
				$("#startDate").html( $("#year").val() + "-01-01" );
				$("#endDate").html( $("#year").val() + "-12-31" );
				$("#comNm").html( carInfo.comNm );
				$("#bizNo").html( carInfo.bizNo );
				$("#carType").html( carInfo.carType );
				$("#carNo").html( carInfo.carNo );
				
				//$("#totDist").val( carInfo.totDist );
				
				
//	 			$("#homeAddr").html( carInfo.userHomeAddr );
//	 			$("#workAddr").html( carInfo.userWorkAddr );
//	 			$("#distance").html( carInfo.distance );
				fn_selectList();		
			},
			error : function(request){
				//alert("처리 중 오류가 발생하였습니다.\n\n스마일큐로 문의해 주세요");
				$.alert({
	                title : '',
	                content : '처리 중 오류가 발생하였습니다.\n\n스마일큐로 문의해 주세요',
	                boxWidth : '30%',
	                useBootstrap : false,
	                buttons : {
	                    okay : {
	                        text: 'OK',
	                        btnClass: 'btn-blue'
	                    }
	                }
	            });
			}
		});
	}
	
	
	//ROW 삭제
	function deleteRow( obj ){
		if( $(obj).parent().parent().attr("mode") != "I" ){
			$("#deleteIdx").val( $("#deleteIdx").val() + "|" +  $(obj).parent().parent().attr("id"));
// 			$("#saveBtnDiv").show();
		}
		
		$(obj).parent().parent().remove();
	}
	
	
	//ROW 추가
	function addRow(){
		
		if( $("#carIdx").val() == "" ){
			//alert("차량을 선택해주세요.");
			$.alert({
                title : '',
                content : '차량을 선택해주세요.',
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
		
		var html = "";
// 		html = "<tr mode='I'><td>&nbsp;<a href='#' onclick=\"deleteRow(this)\">[D]</a><input type='hidden' name='mode' value='I' /><input type='hidden' name='driveIdx' value='0' /></td>" //일련번호
// 			 + 		"<td>" + carInfo.deptNm + "</td>" //사용자 부서
// 			 + 		"<td>" + carInfo.duty + "</td>" //사용자 직책
// 			 + 		"<td>" + carInfo.userNm + "</td>" //사용자 성명
// 			 + 		"<td>" + $("#purposeDiv").html() + "</td>" //사용목적
// 			 + 		"<td><input type='text' name='driveDate'	value=''  class='inptext' size='12' title='사용일자' /></td>" //사용일자
// 			 + 		"<td><input type='text' name='depPoint' 	value=''  class='inptext'  size='23' title='출발지' /></td>" //출발지
// 			 + 		"<td><input type='text' name='depAccDist' 	value=''  class='inptext'  size='10' title='출발시 누적거리'  /></td>" //출발시 누적거리
// 			 + 		"<td><input type='text' name='arrPoint' 	value=''  class='inptext'  size='23' title='도착지' /></td>" //도착지
// 			 + 		"<td><input type='text' name='arrAccDist' 	value=''  class='inptext'  size='10' title='도착시 누적거리'  /></td>" //도착시 누적거리
// 			 + 		"<td><input type='text' name='driveDist' 	value=''  class='inptext'  size='10' title='주행거리' /></td>" //주행거리
// 			 + 		"<td><input type='text' name='driveWorkDist' value=''  class='inptext' size='10' title='업무용 주행거리'  /></td>" //업무용 주행거리
// 			 + 		"<td><input type='text' name='remark' 		value=''  class='inptext' size='23' title='비고'  /></td>" //비고

		html = "<tr mode='I'>"
			+ 		"<td style=''>"
			+		"<input type='text' name='driveDate'	value=''  class='inptext' size='15' title='사용일자' />"
			+		"&nbsp;<a href='#' onclick=\"deleteRow(this)\">[삭제]</a><input type='hidden' name='mode' value='I' /><input type='hidden' name='driveIdx' value='0' />"
			+		"</td>" //사용일자
			+ 		"<td style=''>" + carInfo.deptNm + "<input type='hidden' name='comCd' value='" + carInfo.comCd + "' /><input type='hidden' name='deptCd' value='" + carInfo.deptCd + "' /></td>" //사용자 부서
			+ 		"<td style=''>" + carInfo.userNm + "<input type='hidden' name='userId' value='" + carInfo.userId + "' /></td>" //사용자 성명
			+ 		"<td style=''><input type='text' name='depAccDist'	value=''  class='inptext' size='15' title='주행전계기판거리' /></td>" //사용일자
			+ 		"<td style=''><input type='text' name='arrAccDist'	value=''  class='inptext' size='15' title='주행후계기판거리' /></td>" //사용일자
			+ 		"<td style=''><input type='text' name='driveDist'	value=''  class='inptext' size='15' title='주행거리' /></td>" //사용일자
			+ 		"<td style=''><input type='text' name='distance'		value=''  class='inptext' size='15' title='출퇴근용' /></td>" //사용일자
			+ 		"<td style=''><input type='text' name='driveWorkDist'	value=''  class='inptext' size='15' title='일반업무용' /></td>" //사용일자
			+ 		"<td><input type='text' name='remark'		value=''  class='inptext' size='25' title='비고' /></td>" //사용일자
			+ "</tr>";
		
		$("#noTr").remove();	 
		$("#dataArea").append( html );
		
		$(document).find("input[name=driveDate]").removeClass('hasDatepicker').datepicker({changeYear: true,changeMonth:true});
		
// 		$("#saveBtnDiv").show();
	}
	
	//ROW수장
	function modifyRow( driveIdx ){
		var $obj = $("tr#" + driveIdx).find("td");
		
		var html = "";
// 		html = "<td>" + $obj.eq(0).find("[name='driveNo']").val()
// 	         +	" <a href='#' onclick='deleteRow(this);'>[D]</a>"
// 			 +  "<input type='hidden' name='mode' value='U' /><input type='hidden' name='driveIdx' value='" + driveIdx + "' /></td>" //일련번호
// 			 + 	"<td>" + carInfo.deptNm + "</td>" //사용자 부서
// 			 + 	"<td>" + carInfo.duty + "</td>" //사용자 직책
// 			 + 	"<td>" + carInfo.userNm + "</td>" //사용자 성명
// 			 + 	"<td>" + $("#purposeDiv").html() + "</td>" //사용목적
// 			 + 	"<td><input type='text' name='driveDate'	value='" + $obj.eq(5).text() + "'  class='inptext' size='12' title='사용일자' /></td>" //사용일자
// 			 + 	"<td><input type='text' name='depPoint' 	value='" + $obj.eq(6).text() + "'  class='inptext'  size='23' title='출발지' /></td>" //출발지
// 			 + 	"<td><input type='text' name='depAccDist' 	value='" + $obj.eq(7).text() + "'  class='inptext'  size='10' title='출발시 누적거리'  /></td>" //출발시 누적거리
// 			 + 	"<td><input type='text' name='arrPoint' 	value='" + $obj.eq(8).text() + "'  class='inptext'  size='23' title='도착지' /></td>" //도착지
// 			 +  "<td><input type='text' name='arrAccDist' 	value='" + $obj.eq(9).text() + "'  class='inptext'  size='10' title='도착시 누적거리'  /></td>" //도착시 누적거리
// 			 + 	"<td><input type='text' name='driveDist' 	value='" + $obj.eq(10).text() + "'  class='inptext'  size='10' title='주행거리' /></td>" //주행거리
// 			 + 	"<td><input type='text' name='driveWorkDist' value='" + $obj.eq(11).text() + "'  class='inptext' size='10' title='업무용 주행거리'  /></td>" //업무용 주행거리
// 			 + 	"<td><input type='text' name='remark' 		value='" + $obj.eq(12).text() + "'  class='inptext' size='23' title='비고'  /></td>"; //비고

		html = "<td><input type='text' name='driveDate'	value='" + $obj.eq(0).attr("date") + "'  class='inptext' size='15' title='사용일자' />"
	         +	" <a href='#' onclick='deleteRow(this);'>[삭제]</a>"
			 +  "<input type='hidden' name='mode' value='U' /><input type='hidden' name='driveIdx' value='" + driveIdx + "' /></td>" //일련번호
			 + 	"<td>" + carInfo.deptNm + "<input type='hidden' name='comCd' value='" +  $obj.eq(0).attr("comCd") + "' /><input type='hidden' name='deptCd' value='" + $obj.eq(0).attr("deptCd") + "' /></td>" //사용자 부서
			 + 	"<td>" + carInfo.userNm + "<input type='hidden' name='userId' value='" + $obj.eq(0).attr("userId") + "' /></td>" //사용자 성명
			 + 	"<td><input type='text' name='depAccDist'	value='" + removeComma($obj.eq(3).text()) + "'  class='inptext' size='15' title='주행전계기판거리' /></td>" //사용일자
			 + 	"<td><input type='text' name='arrAccDist' 	value='" + removeComma($obj.eq(4).text()) + "'  class='inptext'  size='15' title='주행후계기판거리' /></td>" //출발지
			 + 	"<td><input type='text' name='driveDist' 	value='" + removeComma($obj.eq(5).text()) + "'  class='inptext'  size='15' title='주행거리'  /></td>" //출발시 누적거리
			 + 	"<td><input type='text' name='distance' 	value='" + removeComma($obj.eq(6).text()) + "'  class='inptext'  size='15' title='출퇴근용' /></td>" //도착지
			 +  "<td><input type='text' name='driveWorkDist' 	value='" + removeComma($obj.eq(7).text()) + "'  class='inptext'  size='15' title='일반업무용'  /></td>" //도착시 누적거리
			 + 	"<td><input type='text' name='remark' 	value='" + $obj.eq(8).text() + "'  class='inptext'  size='25' title='비고' /></td>"; //주행거리
			 
// 		html = "<tr mode='I'>"
// 			+ 		"<td>"
// 			+		"<input type='text' name='driveDate'	value=''  class='inptext' size='15' title='사용일자' />"
// 			+		"&nbsp;<a href='#' onclick=\"deleteRow(this)\">[삭제]</a><input type='hidden' name='mode' value='I' /><input type='hidden' name='driveIdx' value='0' />"
// 			+		"</td>" //사용일자
// 			+ 		"<td>" + carInfo.deptNm + "</td>" //사용자 부서
// 			+ 		"<td>" + carInfo.userNm + "</td>" //사용자 성명
// 			+ 		"<td><input type='text' name='depAccDist'	value=''  class='inptext' size='15' title='주행전계기판거리' /></td>" //사용일자
// 			+ 		"<td><input type='text' name='arrAccDist'	value=''  class='inptext' size='15' title='주행후계기판거리' /></td>" //사용일자
// 			+ 		"<td><input type='text' name='driveDist'	value=''  class='inptext' size='15' title='주행거리' /></td>" //사용일자
// 			+ 		"<td><input type='text' name='distance'		value=''  class='inptext' size='15' title='출퇴근용' /></td>" //사용일자
// 			+ 		"<td><input type='text' name='driveWorkDist'	value=''  class='inptext' size='15' title='일반업무용' /></td>" //사용일자
// 			+ 		"<td><input type='text' name='remark'		value=''  class='inptext' size='25' title='비고' /></td>" //사용일자
// 			+ "</tr>";
		
		var pCd = $obj.eq(4).attr("purposeCd"); //사용목적코드	 
		$("tr#" + driveIdx).html( html );
		$("tr#" + driveIdx).find("[name='purposeCd']").val( pCd );
		$(document).find("input[name=driveDate]").removeClass('hasDatepicker').datepicker({changeYear: true,changeMonth:true});
		
		$("tr#" + driveIdx).find("[name='depAccDist']").focus();
// 		$("#saveBtnDiv").show();
	}
	
	//저장
	function doSave(){
		
		if( $("#carIdx").val() =="" ){
			//alert("차량을 선택해주세요");
			$.alert({
                title : '',
                content : '차량을 선택해주세요',
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
		
		if(elementsCheck("empty",  "purposeCd") == false) return;
		if(elementsCheck("empty",  "driveDate") == false) return;
// 		if(elementsCheck("empty",  "depPoint") == false) return;
		if(elementsCheck("empty",  "depAccDist") == false) return;
		if(elementsCheck("number", "depAccDist") == false) return;
// 		if(elementsCheck("empty",  "arrPoint") == false) return;
		if(elementsCheck("empty",  "arrAccDist") == false) return;
		if(elementsCheck("number", "arrAccDist") == false) return;
		if(elementsCheck("empty",  "driveDist") == false) return;
		if(elementsCheck("number", "driveDist") == false) return;
		if(elementsCheck("empty",  "driveWorkDist") == false) return;
		if(elementsCheck("number", "driveWorkDist") == false) return;
		if(elementsCheck("empty",  "distance") == false) return;
		if(elementsCheck("number", "distance") == false) return;
		//if(elementsCheck("empty",  "totDist") == false) return;
		//if(elementsCheck("number", "totDist") == false) return;
		
		$.confirm({
            title : '',
            boxWidth : '30%',
            useBootstrap : false,
            content : "저장하시겠습니까?",	              
            buttons : {
                confirm: {
              	text : '확인',
              	action : function() {  
              		var data = $("#driveForm").serialize();
        			var url = "/ifrs/car/carDriveRowSave";
        			
        			fn_ajax(url, data, function( result ){
        				//alert("저장되었습니다.");
        				$.alert({
        	                title : '',
        	                content : '저장되었습니다.',
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
		
		/* if( confirm("저장하시겠습니까?") ){
			var data = $("#driveForm").serialize();
			var url = "/ifrs/car/carDriveRowSave";
			
			fn_ajax(url, data, function( result ){
				//alert("저장되었습니다.");
				$.alert({
	                title : '',
	                content : '저장되었습니다.',
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
			});
		} */
	}
	
	
	function elementsCheck( gubun, name ){
		
		var $objs = $("#driveForm").find( "[name='" + name + "']" );
		
		var flag = "true";
		
		$objs.each(function(){
			switch( gubun ){
				case "empty" :
					var value = $(this).val().trim();
					
					if(value == ""){
						//alert($(this).attr("title") + "을(를) 입력하세요");
						$.alert({
			                title : '',
			                content : $(this).attr("title") + "을(를) 입력하세요",
			                boxWidth : '30%',
			                useBootstrap : false,
			                buttons : {
			                    okay : {
			                        text: 'OK',
			                        btnClass: 'btn-blue'
			                    }
			                }
			            });
						flag = false;
						return false;
					}
					
					if (name == "driveDate") {
						if (!dateCheck(value)) {
							//alert("사용일자는 yyyy-mm-dd 형식으로 입력해주세요.");
							$.alert({
				                title : '',
				                content : "사용일자는 yyyy-mm-dd 형식으로 입력해주세요.",
				                boxWidth : '30%',
				                useBootstrap : false,
				                buttons : {
				                    okay : {
				                        text: 'OK',
				                        btnClass: 'btn-blue'
				                    }
				                }
				            });
							flag = false;
							return false;
						}
					}
					
					break;
				
				case "number" :
					var value = $.trim($(this).val());
					var trIndex = $(this).closest('tr').prevAll().length;
					
					if(isNumCheck(value) == false){
						//alert($(this).attr("title") + "은(는) 숫자만 입력 가능합니다.");
						$.alert({
			                title : '',
			                content : $(this).attr("title") + "은(는) 숫자만 입력 가능합니다.",
			                boxWidth : '30%',
			                useBootstrap : false,
			                buttons : {
			                    okay : {
			                        text: 'OK',
			                        btnClass: 'btn-blue'
			                    }
			                }
			            });
						flag = false;
						return false;
					}
					
					if (name == "depAccDist" && trIndex > 0) {
						var value = $.trim($(this).val());
						var beforeIndex = trIndex-1;
						var thisDriveDate = $(this).closest('tr').find('input').eq(0).val();
						var beforeTrMode = $('#dataArea tr').eq(beforeIndex).attr('mode');
						var beforeValue = 0;
						
						if (beforeTrMode == "I") {
							beforeValue = $('#dataArea tr').eq(beforeIndex).find('td').eq(4).find('input').eq(0).val();
						} else {
							beforeValue = $('#dataArea tr').eq(beforeIndex).find('td').eq(4).text();
						}
						
						beforeValue = beforeValue.replace(/,/gi, '');
						
						if (beforeValue != value) {
							//alert(thisDriveDate + "의 주행 전 계기판의 거리를 확인 바랍니다.\n전일 주행 후 계기판의 거리와 다릅니다.");
							$.alert({
				                title : '',
				                content : thisDriveDate + "의 주행 전 계기판의 거리를 확인 바랍니다.\n전일 주행 후 계기판의 거리와 다릅니다.",
				                boxWidth : '30%',
				                useBootstrap : false,
				                buttons : {
				                    okay : {
				                        text: 'OK',
				                        btnClass: 'btn-blue'
				                    }
				                }
				            });
							flag = false;
							return false;
						}
					}
					
					break;
				default :
					;
			}
		});
		
		return flag;
	}
	
	
	function fn_excel(){
		var eHtml = "<html>"
			+ "<head>"
			+ 	"<style type='text/css'>"
			+ 	"tbody td{background-color:#FFFFFF;text-align:right; border:solid 1px #e3e3e3;} \n"
			+ 	".listType tr td { text-align:center; } \n"
			+ 	"thead td { border:solid 1px #c1c2c6 !important;  } \n"
			+ 	"tfoot th { height:30px; border:solid 1px #c1c2c6 !important; background:#D4F4FA} \n"
			+ 	"tbody td{ border:solid 1px #c1c2c6 !important;} \n"
			+	"thead th{background-color:#e8e8e8;border:solid 1px #a0a0a0;}\n"
			+	"</style>"
			+	"</head><body>";
	
		//var $body = $("#resultBody").clone();
		var $body = $("div.fht-tbody").clone();
		var $thead = $("div.fht-thead").clone();
		$body.find("a").remove();
		$thead.find("a").remove();
		$thead.find("span.delspan").remove();
		$body.find("thead").remove();
		$body.find("table").prepend( $thead.find("thead") );
		
		//$body.find("[id='totDist']").parent().html( makeComma($body.find("[id='totDist']").val()) ); //사업년도 총 주행거리 입력란을 일반 텍스트로
		
		if (navigator.userAgent.indexOf('Trident') > 0)      //ie11. ie11 은  열기가 안된다. 저장해서 보면 문제가 없는데...
	    {	
	    	var oWin = window.open("about:blank","_blank", "");
	    	oWin.document.write(eHtml + $body.html() + "</body></html>" );
	    	oWin.document.close();
	    	oWin.focus();
	        var sa=oWin.document.execCommand("SaveAs",true, "차량운행일지-" + $("#year").val() + "년_" + $("#carIdx option:selected").text().replace("/", "_")+ ".xls");
	        oWin.close();
	    }else{
			$("#excelTbl").val( eHtml + $body.html() + "</body></html>" );
			$("#excelTitle").val( "차량운행일지-" + $("#year").val() + "년_" + $("#carIdx option:selected").text() );
			$("#excelForm").attr("action", "/ifrs/car/excelDown");
			$("#excelForm").submit();
	    }
	}
	
	function fn_selectCar(){
		fn_openWindow('/ifrs/car/carSelectPopup', 'popPlace', '870', '730');
		
	}
	
	function carSelectCallBack(carIdx,carType,carNo,userNm){
		$("#carInfo").val(carType+'('+carNo+')'+'/'+userNm);
		$("#carIdx").val(carIdx);
		
		selectCarInfo();
// 		$("#workPercent").text( (totWorkDist/totDist)*100+"%" );
	}
	
	
</script>
</head>


<body style="background:none;">

<form name="excelForm" id="excelForm" method="post">
	<input type="hidden" name="excelTitle" id="excelTitle" value="" />
	<input type="hidden" name="excelTbl" id="excelTbl" value="" />
</form>

<div class="wrap-loading" style="display:none;">
  <div><img src="${imgPath}/ifrs/loading.gif" /></div>
</div>

<!--wrap div-->
<div id="wrap">

        <div class="content" style="padding-bottom:0px;">
			
			<form name="driveForm" id="driveForm" method="post">
				<input type="hidden" id="deleteIdx" name="deleteIdx" value="" />
				<input type="hidden" id="carIdx" name="carIdx" value="" />
			
			<div class="seachGroup">
            	<fieldset>
            	<div class="fl">
                    <div class="basicSearch" style="width:1000px;">
                        <div class="hGroup">
                            <ul class="firstChild" style="width: 1000px;">
                               <li>
                                	<label for="year" class="wid15">사용년도</label>
									<select id="year" name="year" onchange="selectCarInfo();">
								       <% final int thisYear = Calendar.getInstance().get(Calendar.YEAR);
								          for (int i=thisYear, len=2016; len<=i; i--) { %>
								       		<option value="<%=i %>" <%= (thisYear==i ? "selected" : "")%>><%=i %></option>
								       <% } %>
									</select> 년
									&nbsp;&nbsp;
									<label for="month" class="wid15">사용월</label>
									<select id="month" name="month" onchange="selectCarInfo();">
										<option value=''>전체</option>
										<option value='01'>1</option>
										<option value='02'>2</option>
										<option value='03'>3</option>
										<option value='04'>4</option>
										<option value='05'>5</option>
										<option value='06'>6</option>
										<option value='07'>7</option>
										<option value='08'>8</option>
										<option value='09'>9</option>
										<option value='10'>10</option>
										<option value='11'>11</option>
										<option value='12'>12</option>
									</select>  월
			
									<label for="carIdx" class="wid65" style="padding-left:30px;">차량선택</label>
									<%-- <select id="carIdx" name="carIdx" onchange="selectCarInfo();" style="max-width:330px;">
										<option value="">선택</option>
										<c:forEach var="list" items="${carList }">
											<option value="${list.carIdx }">${list.carType}(${list.carNo}) / <b>${list.userNm }</b></option>
										</c:forEach>
									</select> --%>
									<input type="text" id="carInfo" name="carInfo" class="inptext" value=""  readonly="readonly" style="max-width:330px; width: 200px" />
									&nbsp;&nbsp;
									<span class="grayButton"><button type="button" onclick="javascript:fn_selectCar();">차량선택</button></span>
									<span class="grayButton"><button type="button" onclick="javascript:selectCarInfo();">조회</button></span>
                                    <span class="grayButton"><button type="button" onclick="javascript:fn_excel();" style="color:#008000; "><img src="/images/ifrs/icon_excel.gif" alt="엑셀 다운" style="margin-top:-2px; margin-right:3px;"/>엑셀 다운</button></span>
                               </li>
                               <li> <span><input type="radio" name="recentDays" value="" checked />전체</span>
                               		<span class="lp20"><input type="radio" name="recentDays" value="5" />최근 5일</span>
                               		<span class="lp20"><input type="radio" name="recentDays" value="10" />최근 10일</span>
                               		<span class="lp20"><input type="radio" name="recentDays" value="30" />최근 30일</span>				
                               </li>
                            </ul> 
                         </div>  
                     </div>
                 </div>
                 <!-- 
                 <div class="fr" style="position:relative;">
                 	<p class="btnSearchBox">   
                 		<button type="button" id="searcher" class="btnSearch"><span class="blind">검색</span></button>                     
                    </p>
                  </div> -->
                </fieldset>
         	</div>
        				
            <div class="para" id="resultBody" style="margin-bottom:20px;">
            
                <table class="listType" id="dataTbl">
                    
                    <thead>					
						<tr>
							<th rowspan="2">사업년도</th>
							<th colspan="2" id="startDate"></th>
							<th rowspan="2" colspan="2">업무용승용차 운행기록부</th>
							<th colspan="2">법인명</th>
							<th colspan="2" id="comNm"></th>
						</tr>
						<tr>
							<th colspan="2" id="endDate"></th>
							<th colspan="2">사업자등록번호</th>
							<th colspan="2" id="bizNo"></th>
						</tr>
						
						<tr>
							<td style="text-align:left;padding-left:10px;" colspan="9"><b>1. 기본정보</b></td>
						</tr>
						
						<tr>
							<th colspan="2"><b>1. 차종</b></th>
							<th colspan="3"><b>2. 자동차등록번호</b></th>
							<td colspan="4" rowspan="2"></td>
						</tr>
						<tr>
							<td colspan="2" id="carType"></td>
							<td colspan="3" id="carNo"></td>
						</tr>
						
						<tr>
							<td style="text-align:left;padding-left:10px;" colspan="9"><b>2. 업무용 사용비율 계산</b>
								<span class="delspan" style="padding-left:1250px;">&nbsp;</span><span class="grayButton delspan"><button type="button" onclick="javascript:doSave();">저 장</button></span>
							</td>
						</tr>
						
						<tr>
							<th rowspan="3" style="width:200px;">3. 사용일자<br/><br/><a href="javascript:addRow();"><span style="color:blue">[행 추가]</span></a></th>
							<th colspan="2" style="width:300px;">사용자</th>
							<th colspan="6">운행내역</th>
						</tr>
						
						<tr>
							<th rowspan="2" style="width:150px;">7. 부서</th>
							<th rowspan="2" style="width:150px;">9. 성명</th>
							
							<th rowspan="2" style="width:150px;">5. 주행 전 계기판의<br/> 거리(km)</th>
							<th rowspan="2" style="width:150px;">6. 주행 후 계기판의<br/> 거리(Km)</th>
							<th rowspan="2" style="width:150px;">7.주행거리(km)</th>
							<th colspan="2" style="width:300px;">업무용사용거리(Km)</th>
							<th rowspan="2">18. 비고</th>
						</tr>
						
						<tr>
							<th style="width:150px;">8. 출퇴근용(km)</th>
							<th style="width:150px;">9. 일반 업무용(km)</th>
						</tr>
					</thead>
					<tbody id="dataArea">
						
					</tbody>
					<tfoot style="border-top:solid 1px #c1c2c6 !important;">
						<tr>
							<th rowspan="2" colspan="3"></th>
							<th colspan="3">11. 조회기간 총 주행거리(km)</th>
							<th colspan="2">12. 조회기간 업무용 사용거리(km)</th>
							<th>13. 업무사용비율(12/11)</th>
						</tr>
						<tr>
							
<!-- 							<th colspan="3" id="totDist">&nbsp;</th> -->
							<th colspan="3">
								<!-- <input type='text' id="totDist" name='totDist' class='inptext' size='15' title='사업년도총주행거리' onchange="calcTotDist();" onkeydown="javascript: if (event.keyCode == 13) { calcTotDist(); return false; }" /> -->
								<input type="hidden" id="totDist" name="totDist" value="0" /><!-- 자동계산으로 처리. 에러 안나게 할라고 이거 냄겨둠 -->
								<span id="spanTotDist"></span>
							</th>
							<th colspan="2" id="totWorkDist">&nbsp;</th>
							<th id="workPercent">&nbsp;</th>
						</tr>
					</tfoot>
                </table>
             
            </div>
            </form>
            <!-- 
            <div id="saveBtnDiv" class="btnArea ar " style="margin:0;">
               	<span class="grayButton"><button type="button" onclick="javascript:doSave();">저 장</button></span>
            
            </div>
             -->
            
        </div>

</div>

<div id="purposeDiv" style="display:none">
	<select name="purposeCd" style="width:140px;" title="사용목적">
		<option value="">선택</option>
	<c:forEach items="${purposeList}" var="list">
		<option value="${list.code }">${list.codeName }</option>
	</c:forEach>
	</select>
</div>
<jsp:include page="/WEB-INF/jsp/car/carInclude.jsp"/>
</body>
</html>
