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
	#container {width:1600px;}
	.exctxt { width:80px;text-align:right }
	.listType td.excTd {text-align:right}
</style>
<script type="text/javascript" src="${scriptPath}/ifrs/jquery-1.7.1.js"></script>
<script type="text/javascript" src="${scriptPath}/ifrs/calendar_month5.js"></script>
<script type="text/javascript" src="${scriptPath}/ifrs/jqCommon.js"></script>
<script type="text/javascript" src="${scriptPath}/ifrs/common.js"></script>

<script type="text/javascript">
	var gList = null; //환율목록
	
	var gCurrCd, gYyyyMM;

	$(document).ready(function() {

		$("#year").change(function(){
			fn_selectList();	
		});
		
		$("#year").val( "${thisYear}" );
		fn_selectList();	
		
	});

	function doMigration() {
		var data = $('#searchForm').serialize();
		var url = "/ifrs/exchange/exchangeMigration";
		
		fn_ajax(url, data, function(result){
			fn_selectList();
			
			var result = result.result;
			
			if (!result){
				alert('전월 환율정보가 이미 생성되었습니다.');
				return;
			} 

			const messages = result.split(':');
			
			var noInfo, months;			
			if (1 == messages.length) {
				if (messages[0].includes(',')) {	
					months = messages[0];
				} else {
					noInfo = messages[0];
				}
			} else {
				months = messages[0];
				noInfo = messages[1];
			}
			
			if (noInfo){
				alert(noInfo + ' 기말 환율정보가 없습니다. 환율정보 확인 후 다시 실행하십시오.');
			}
			
			if (months) {	
				alert(months.substring(1) + ' 환율정보를 생성하였습니다.');
				
			}
		});
	}
	
	function popupExRateDetail(currCd, yyyyMM){	
		gCurrCd = currCd;
		gYyyyMM = yyyyMM;
		
		var data = "currCd=" + currCd + "&yyyyMM=" + yyyyMM;		
		var url = "/ifrs/exchange/getDayExchangeList";
		
		fn_ajax(url, data, function( result ){
			makeDayExchangeRow( result.list );			
			$("#spanCurrCd").html(currCd + '  (' + yyyyMM.substring(0, 4) + '-' + yyyyMM.substring(4) + ')');
			$("#divDayExchangeDetail").show();
		});
	}
	
	function makeDayExchangeRow( list ){
		var html = "";
		
		for(var i = 0 ; i < list.length; i++ ){
			html += "<tr>";
			html += " <td>" + list[i].registDt     + "</td>";
			html += " <td>" + list[i].exchangeRate + "</td>";
			html += "</tr>";
		}
		
		if( html == "" ) html = "<tr><td colspan='2'>데이타가 없습니다.</td></tr>";
		
		$("#dayExchangeBody").html( html );
	}
	
	function fn_excel(){
		location.href="/ifrs/exchange/downloadDayExchangeExcel?currCd=" + gCurrCd + "&yyyyMM=" + gYyyyMM;
	}
	
	
	//목록 조회
	function fn_selectList(){
		
		var data = $('#searchForm').serialize();
		var url = "/ifrs/exchange/exchangeViewAjax";
		
		fn_ajax(url, data, function(result){
			makeList(result.list);
			gList = result.list;
		});
	}
	
	
	function makeList( list ){
		var html = "";
		
		for( var i=0; i < list.length; i++ ){
			html += "<tr>";
			if( list[i].gubun == "E" ){
				html += "<td rowspan='2'>" + list[i].currCd + "<br/>(" + list[i].currNm + ")</td>";	
			}
			html += "<td>" + (list[i].gubun == "E"  ? "기말" : "평균")  + "</td>";
			html += "<td class='excTd'>" + makeViewType(list[i], '01') + "</td>";
			html += "<td class='excTd'>" + makeViewType(list[i], '02') + "</td>";
			html += "<td class='excTd'>" + makeViewType(list[i], '03') + "</td>";
			html += "<td class='excTd'>" + makeViewType(list[i], '04') + "</td>";
			html += "<td class='excTd'>" + makeViewType(list[i], '05') + "</td>";
			html += "<td class='excTd'>" + makeViewType(list[i], '06') + "</td>";
			html += "<td class='excTd'>" + makeViewType(list[i], '07') + "</td>";
			html += "<td class='excTd'>" + makeViewType(list[i], '08') + "</td>";
			html += "<td class='excTd'>" + makeViewType(list[i], '09') + "</td>";
			html += "<td class='excTd'>" + makeViewType(list[i], '10') + "</td>";
			html += "<td class='excTd'>" + makeViewType(list[i], '11') + "</td>";
			html += "<td class='excTd'>" + makeViewType(list[i], '12') + "</td>";
			html += "</tr>";			
		}
		
		$("#resultBody").html( html );
	}
	
	function makeViewType(val, MM){		
		var amt = val['mon' + parseInt(MM)];
		 
		if(amt == 0 ) return "";
		else if( amt == null  || amt == "" ) return "";
		else {
			return "<a href=javascript:popupExRateDetail('" + val.currCd + "','" + $('#year').val() + MM + "');>" + (val.currCd == "VND" ? amt.toString() : fn_change_comma(amt.toString())) + "</a>";
		}
	}
	
	function viewUpdate(){
		var list  = gList;
		var html = "";
		
		for( var i=0; i < list.length; i++ ){
			html += "<tr>";
			if( list[i].gubun == "E" ){
				html += "<td rowspan='2'>" + list[i].currCd + "<br/>(" + list[i].currNm + ")</td>";	
			}
			html += "<td>" + (list[i].gubun == "E"  ? "기말" : "평균");
			html += "	<input type='hidden' name='currCd' value='" + list[i].currCd + "' />";
			html += "	<input type='hidden' name='gubun' value='" + list[i].gubun + "' />";
			html += "</td>";
			html += "<td><input type='text' class='inptext exctxt' name='mon1'  value='" + makeViewType(list[i].mon1 ) + "' /></td>";
			html += "<td><input type='text' class='inptext exctxt' name='mon2'  value='" + makeViewType(list[i].mon2 ) + "' /></td>";
			html += "<td><input type='text' class='inptext exctxt' name='mon3'  value='" + makeViewType(list[i].mon3 ) + "' /></td>";
			html += "<td><input type='text' class='inptext exctxt' name='mon4'  value='" + makeViewType(list[i].mon4 ) + "' /></td>";
			html += "<td><input type='text' class='inptext exctxt' name='mon5'  value='" + makeViewType(list[i].mon5 ) + "' /></td>";
			html += "<td><input type='text' class='inptext exctxt' name='mon6'  value='" + makeViewType(list[i].mon6 ) + "' /></td>";
			html += "<td><input type='text' class='inptext exctxt' name='mon7'  value='" + makeViewType(list[i].mon7 ) + "' /></td>";
			html += "<td><input type='text' class='inptext exctxt' name='mon8'  value='" + makeViewType(list[i].mon8 ) + "' /></td>";
			html += "<td><input type='text' class='inptext exctxt' name='mon9'  value='" + makeViewType(list[i].mon9 ) + "' /></td>";
			html += "<td><input type='text' class='inptext exctxt' name='mon10' value='" + makeViewType(list[i].mon10)  + "' /></td>";
			html += "<td><input type='text' class='inptext exctxt' name='mon11' value='" + makeViewType(list[i].mon11)  + "' /></td>";
			html += "<td><input type='text' class='inptext exctxt' name='mon12' value='" + makeViewType(list[i].mon12)  + "' /></td>";
			html += "</tr>";
			
		}
		
		$("#resultBody").html( html );
		
		$("#updateBtn").hide();
		$("#saveBtn").show();
		$("#cancelBtn").show();
	}
	
	
	function doCancel(){
		makeList( gList );
		
		$("#updateBtn").show();
		$("#saveBtn").hide();
		$("#cancelBtn").hide();
	}
	
	
	function doUpdate(){
		
		if( !confirm("저장하시겠습니까?") ) return;
		
		var data = $('#listForm').serialize();
		data += "&year=" + $("#year").val();
		var url = "/ifrs/exchange/updateExchange";
		
		fn_ajax(url, data, function(result){
			alert("처리되었습니다.");
			fn_selectList();
			
			$("#updateBtn").show();
			$("#saveBtn").hide();
			$("#cancelBtn").hide();
		});
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

        <div class="content" style="width:1300px;">

			<form name="searchForm" id="searchForm" method="post">
			
        	<div class="seachGroup">
                    <fieldset>
                    	<div class="fl">
                            <div class="basicSearch">
                                <div class="hGroup">
                                    <ul class="firstChild" style="width: 680px;">
                                       <li>
                                        	<label for="comNm" class="wid65"><spring:message code='exc.yr'/></label>
											<select name="year" id="year">
												<c:forEach begin="2015" end="${thisYear }" step="1" var="yyyy">
												<option value="${yyyy}">${yyyy}</option>
												</c:forEach>
											</select>
											&nbsp;&nbsp;
									        <span class="grayButton"><button type="button" onclick="doMigration();">환율등록</button></span>
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
                          </div>
                           -->
                        </fieldset>
            </div>

			</form>
			
			
			<form name="listForm" id="listForm" method="post" action="">
			
            <div class="para">
                <table class="listType">
                    <colgroup>
                        <col width="11%"/>
                        <col width="5%"/>
                        <col width="7"/>
                        <col width="7%"/>
                        <col width="7%"/>
                        <col width="7%"/>
                        <col width="7%"/>
                        <col width="7%"/>
                        <col width="7%"/>
                        <col width="7%"/>
                        <col width="7%"/>
                        <col width="7%"/>
                        <col width="7%"/>
                        <col width="7%"/>
                    </colgroup>
                    <thead>
                        <tr>
                        	<th><spring:message code='exc.currency'/></th>
                            <th><spring:message code='exc.type'/></th>
                            <th><spring:message code='exc.jan'/></th>
                            <th><spring:message code='exc.feb'/></th>
                            <th><spring:message code='exc.mar'/></th>
                            <th><spring:message code='exc.apr'/></th>
                            <th><spring:message code='exc.may'/></th>
                            <th><spring:message code='exc.jun'/></th>
                            <th><spring:message code='exc.jul'/></th>
                            <th><spring:message code='exc.aug'/></th>
                            <th><spring:message code='exc.sep'/></th>
                            <th><spring:message code='exc.oct'/></th>
                            <th><spring:message code='exc.nov'/></th>
                            <th><spring:message code='exc.dec'/></th>
                        </tr>
                    </thead>                    
                    <tbody id="resultBody">
					</tbody>
                </table>
                <br>
                                         ※ 통합자금일보작성의 일 환율정보 기준으로 이전월 환율정보를 생성합니다. (일 환율정보는 ERP 환율정보를 기준으로 매일 오전 배치 생성 )<br>
			   &nbsp;&nbsp;&nbsp;만약, 기말 환율 정보가 등록되지 않은 경우 해당월 환율정보가 생성되지 않습니다. 확인 후 다시 처리하십시오.
            </div>
            </form>
        </div>

		<div id="divDayExchangeDetail" style="display:none;position: absolute; border: 2px solid rgb(56, 93, 138); top: 180px; left: 450px; width: 500px; padding: 10px; z-index: 100; background-color: rgb(255, 255, 255);">
			<span id="approvalLayerDrag" style="font-size:13px;font-family:맑은 고딕;font-weight:bold;cursor: move;">화폐단위 : <span id=spanCurrCd></span></span>
			&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
			&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
			&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
			<span class="grayButton"><button type="button" onclick="fn_excel();" style="color:#008000; "><img src="/images/ifrs/icon_excel.gif" alt="엑셀 다운" style="margin-top:-2px; margin-right:3px;"/><spring:message code='data.excelDown'/></button></span>
			<p style="margin-top:10px;border-bottom:2px solid #e8e8e8;width:500px;"></p>
			<div style="margin-top:10px;overflow-x:hidden;overflow-y:auto;height:360px;">
				<!-- 조회 테이블 시작 -->
			    <div class="para">
				    <table class="listType" id="tableId" style=";">
					 	 <colgroup>
					        <col width="200" class="colAcc"/>
					        <col width="150" class="colSum" />
					     </colgroup>
					     <thead>
					     	<tr>
						       <th style="width:150px;">고시일</th>
						       <th style="width:200px;" class="thAcc">환율</th>
					     	</tr>
					     </thead>
						<tfoot></tfoot>
					    <tbody class="dataArea" id="dayExchangeBody">		
						</tbody>
					</table>
			    </div>
				<!-- 조회 테이블 끝 -->
			</div>
			<div style="text-align:center;margin-top:10px;">
				<span style="border:1px solid #385D8A;color:#FFFFE9;background-color:#4F81BD;width:50px;height:22px;text-align:center;font-size:13px;font-family:맑은 고딕;font-weight:bold;cursor:pointer;" onclick="javascript:$('#divDayExchangeDetail').hide();">닫 기</span>        
		    </div> 	
		</div>

<jsp:include page="/WEB-INF/jsp/config/footer.jsp"/>

</div>
</body>
</html>
