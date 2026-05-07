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
<%-- <link type="text/css" rel="stylesheet" href="${cssPath}/ifrs/jquery-ui-1.9.2.custom.css" /> --%>
<script type="text/javascript" src="${scriptPath}/ifrs/jquery-1.7.1.js"></script>
<script type="text/javascript" src="${scriptPath}/ifrs/jquery-ui-1.8.18.custom.min.js"></script>
<%-- <script type="text/javascript" src="${scriptPath}/ifrs/jquery-ui-1.9.2.custom.js"></script> --%>
<script type="text/javascript" src="${scriptPath}/ifrs/calendar_month5.js"></script>
<script type="text/javascript" src="${scriptPath}/ifrs/jqCommon.js"></script>
<script type="text/javascript" src="${scriptPath}/ifrs/common.js"></script>
<script type="text/javascript" src="${scriptPath}/ifrs/Address.js"></script>

<style type="text/css">
.mailButton {
	width:100%;
	height:30px;
	border-style:solid;
	border-color:gray;
	border-width:1px;
	border-radius: 4px;
	background-color:#d9d9d9;	
}
</style>


<script type="text/javascript">


	document.domain="${domain}";
	$(document).ready(function(){
		
		/* doSelectList(1); */
		
		fn_Select();
		
		window.addEventListener('message', (event) => {
			if (event.origin !== 'https://sfim.${domain}') {
		    	return;
		  	}
		  
		  	if (event.data.mode == "userPop") {
		  		choiceUser(event.data.userList);
			}else if(event.data.mode == "deptPop"){
				choiceDept(event.data.deptList);
			}
		  
		});
	
	});
	
	
	
/*     spanClick =  function(e)
    {
    	$('input[name=empNm]').each(function(index){
    	    if($(this).val() == $(e).attr("empNm")){
    	        $(this).remove();
    	        return false;
    	    }
    	});
    	$(e).remove();
    	doSelectList(1);
    }; */
	
/* 	function doSelectList(){
		
		var url = "/ifrs/bod/mailListAjax";
		var data  = $("#searchForm").serialize();
		
		fn_ajaxHtml(url, data, function( result ){
			$("#dataArea").html( result );			
		});
	} */
	
/* 	function goSave(e){
	    
	    if(!confirm("안내메일 수신기준을 변경하시겠습니까?")) return;
	    
	    var mailDay = "";
	    
	    if($(e).text() == "O"){
	        mailDay = $(e).parent().next().attr("mailDay");
	    } else 
	        mailDay = $(e).parent().attr("mailDay");
	    
	    var url = "/ifrs/bod/saveMail";
	    var data = "userId=" + $(e).closest("tr").find("td[name=userId]").text() + "&mailDay=" + mailDay;
	    
	    fn_ajax( url, data, function(result){
	        doSelectList(1);
	    });
	} */
	
/* 	function doDelete(e){
		var url = "/ifrs/bod/deleteMail";
		var data = "userId=" + e;
		
		if( confirm("정말 삭제하시겠습니까?") ){
			fn_ajax(url, data, function( result ){
				alert("삭제되었습니다.");
			    doSelectList(1);
			});
		}
	} */
	
	function fn_Select() {
		var data = "companyseq=" + $("#companyseq").val();
		fn_ajax( "/ifrs/capital/selectMail", data, function(result){
			for ( var i=0 in result.list ) {
				 var fromuser = result.list[i].fromuser;
				 var fromuser_id = result.list[i].fromuserId;
				 var touser = result.list[i].touser;
				 var touser_id = result.list[i].touserId; 
				 var attuser = result.list[i].attuser;
				 var attuser_id = result.list[i].attuserId;
				 var bccuser = result.list[i].bccuser;
				 var bccuser_id = result.list[i].bccuserId;
				 
				 if ( fromuser ) {$("#fromuser").val(fromuser.replace(/@@@/gi,","));}
				 if ( fromuser_id ) {$("#fromuser_id").val(fromuser_id.replace(/@@@/gi,","));}
				 if ( touser ) {$("#touser").val(touser.replace(/@@@/gi,","));}
				 if ( touser_id ) {$("#touser_id").val(touser_id.replace(/@@@/gi,","));}
				 if ( attuser ) {$("#attuser").val(attuser.replace(/@@@/gi,","));}
				 if ( attuser_id ) {$("#attuser_id").val(attuser_id.replace(/@@@/gi,","));}
				 if ( bccuser ) {$("#bccuser").val(bccuser.replace(/@@@/gi,","));}
				 if ( bccuser_id ) {$("#bccuser_id").val(bccuser_id.replace(/@@@/gi,","));}
			}
		});		
	}
	
	function fn_Save() {
		var data = "";
		$("input").each(function(){						
			if ( $(this).val() ) {
				data += $(this).attr("id") + "=" + $(this).val().replace(/,/gi,"@@@") + "&";
			} else {
				data += $(this).attr("id") + "=" + $(this).val() + "&";
			}
		});		
		//console.log(data);		
		
		fn_ajax( "/ifrs/capital/saveMail", data, function(result){
			alert("저장 되었습니다.");
			window.close();
		});
	}
	
	function fn_userReset(id) {		
		$("input[id='" + id + "']").val('');
		$("input[id='" + id + "_id']").val('');
	}
	
	function fn_userSelect(id){
		$("#nowtext").val(id);
		fn_openWindow('https://sfim.${domain}/common/extUserPopup?deptCd=${deptCd}', 'userPopup', '1200', '665');
	}
	
	function fn_deptSelect(id){
		$("#nowtext").val(id);
		fn_openWindow('https://sfim.${domain}/common/extDeptPopup?deptCd=${deptCd}', 'deptPopup', '1200', '665');
	}	
	
	function choiceUser(choicedUserInfo) {
		var userInfo = choicedUserInfo;
		var userInfoLen = userInfo.length;
		
		if ($("#emptyData").length > 0) {
			$("#emptyData").remove();
		}
		
		for (var i = 0; i < userInfoLen; i++) {
			var value1 = userInfo[i].userNm;
			var value2 = userInfo[i].logonId;
			var nowtext = $("#nowtext").val();
			var prevtext1 = $("#" + nowtext ).val();
			var prevtext2 = $("#" + nowtext + "_id" ).val();
			if (prevtext1 == "" || prevtext1 == null) {
				$("#" + nowtext ).val(value1);
				$("#" + nowtext + "_id" ).val(value2);
			} else {
				$("#" + nowtext ).val(prevtext1 + "," + value1);
				$("#" + nowtext + "_id" ).val(prevtext2 + "," + value2);	
			}
		}
	}
	
	function choiceDept(choicedDeptInfo) {
		var deptInfo = choicedDeptInfo;
		var deptInfoLen = deptInfo.length;
		
		if ($("#emptyData").length > 0) {
			$("#emptyData").remove();
		}
		
		for (var i = 0; i < deptInfoLen; i++) {
			var value1 = deptInfo[i].data.deptNm;
			var value2 = deptInfo[i].data.deptMailId;
			var nowtext = $("#nowtext").val();
			var prevtext1 = $("#" + nowtext ).val();
			var prevtext2 = $("#" + nowtext + "_id" ).val();
			if ( prevtext1 == "" || prevtext1 == null ) {
				$("#" + nowtext ).val(value1);
				$("#" + nowtext + "_id" ).val(value2);
			} else {
				$("#" + nowtext ).val(prevtext1 + "," + value1);
				$("#" + nowtext + "_id" ).val(prevtext2 + "," + value2);	
			}
		}
	}
	
</script>
</head>


<body>


	<input type="hidden" id="nowtext">
	<input type="hidden" id="companyseq" value="${companyseq}">

	<div style="width:100%;height:30px;border-style:solid;border-color:black;border-width:1px;background-color:gray">
		<div style="margin-left:0px;margin-top:4px;font-size:18px;font-weight:bold;color:white;text-align:center;">메 일 설 정</div>		
	</div>

	
	<br>
	<div style="width:100%;height:75px;">
	<div style="width:100%;height:30px;border-style:solid;border-color:gray;border-width:1px;background-color:#f2f2f2">
		<div style="margin-left:8px;margin-top:8px;font-size:14px;font-weight:bold;">발 신</div>		
	</div>
	<div style="width:100%;height:40px;">
		<table style="width:100%;border-style:solid;border-color:gray;border-width:1px;">
		<tr>
			<td style="width:76%;">
				<input type="text" id="fromuser" name="fromuser" style="width:99%;height:30px;font-size:14px;" readonly>
				<input type="hidden" id="fromuser_id" name="fromuser_id" style="width:99%;height:30px;font-size:14px;">
			</td>
			<td style="width:8%;align:center;"><button class="mailButton" onclick="javascript:fn_userSelect('fromuser');">직원</button></td>
			<td style="width:8%;align:center;"><button class="mailButton" onclick="javascript:fn_deptSelect('fromuser');">부서</button></td>
			<td style="width:8%;align:center;"><button class="mailButton" onclick="javascript:fn_userReset('fromuser');">리셋</button></td>
		</tr>
		</table>		
	</div>
	</div>
	

	<div style="width:100%;height:75px;">
	<div style="width:100%;height:30px;border-style:solid;border-color:gray;border-width:1px;background-color:#f2f2f2">
		<div style="margin-left:8px;margin-top:8px;font-size:14px;font-weight:bold;">수 신</div>		
	</div>
	<div style="width:100%;height:40px;">
		<table style="width:100%;border-style:solid;border-color:gray;border-width:1px;">
		<tr>
			<td style="width:76%;">
				<input type="text" id="touser" name="touser" style="width:99%;height:30px;font-size:14px;" readonly>
				<input type="hidden" id="touser_id" name="touser_id" style="width:99%;height:30px;font-size:14px;">
			</td>
			<td style="width:8%;align:center;"><button class="mailButton" onclick="javascript:fn_userSelect('touser');">직원</button></td>
			<td style="width:8%;align:center;"><button class="mailButton" onclick="javascript:fn_deptSelect('touser');">부서</button></td>
			<td style="width:8%;align:center;"><button class="mailButton" onclick="javascript:fn_userReset('touser');">리셋</button></td>
		</tr>
		</table>		
	</div>
	</div>	
	

	<div style="width:100%;height:75px;">
	<div style="width:100%;height:30px;border-style:solid;border-color:gray;border-width:1px;background-color:#f2f2f2">
		<div style="margin-left:8px;margin-top:8px;font-size:14px;font-weight:bold;">참 조</div>		
	</div>
	<div style="width:100%;height:40px;">
		<table style="width:100%;border-style:solid;border-color:gray;border-width:1px;">
		<tr>
			<td style="width:76%;">
				<input type="text" id="attuser" name="attuser" style="width:99%;height:30px;font-size:14px;" readonly>
				<input type="hidden" id="attuser_id" name="attuser_id" style="width:99%;height:30px;font-size:14px;">
			</td>
			<td style="width:8%;align:center;"><button class="mailButton" onclick="javascript:fn_userSelect('attuser');">직원</button></td>
			<td style="width:8%;align:center;"><button class="mailButton" onclick="javascript:fn_deptSelect('attuser');">부서</button></td>
			<td style="width:8%;align:center;"><button class="mailButton" onclick="javascript:fn_userReset('attuser');">리셋</button></td>
		</tr>
		</table>		
	</div>
	</div>		
	
	<c:if test="${bccuserFlag eq 'Y' }">
	<div style="width:100%;height:75px;">
	<div style="width:100%;height:30px;border-style:solid;border-color:gray;border-width:1px;background-color:#f2f2f2">
		<div style="margin-left:8px;margin-top:8px;font-size:14px;font-weight:bold;">숨 은 참 조</div>		
	</div>
	<div style="width:100%;height:40px;">
		<table style="width:100%;border-style:solid;border-color:gray;border-width:1px;">
		<tr>
			<td style="width:76%;">
				<input type="text" id="bccuser" name="bccuser" style="width:99%;height:30px;font-size:14px;" readonly>
				<input type="hidden" id="bccuser_id" name="bccuser_id" style="width:99%;height:30px;font-size:14px;">
			</td>
			<td style="width:8%;align:center;"><button class="mailButton" onclick="javascript:fn_userSelect('bccuser');">직원</button></td>
			<td style="width:8%;align:center;"><button class="mailButton" onclick="javascript:fn_deptSelect('bccuser');">부서</button></td>
			<td style="width:8%;align:center;"><button class="mailButton" onclick="javascript:fn_userReset('bccuser');">리셋</button></td>
		</tr>
		</table>		
	</div>
	</div>		
	</c:if>

	
	<br>
		<table style="width:100%;">
		<tr>
			<td style="width:39%;"></td>
			<td style="width:10%;align:center;"><button class="mailButton" onclick="javascript:fn_Save();">저장</button></td>
			<td style="width:2%;align:center;"></td>
			<td style="width:10%;align:center;"><button class="mailButton" onclick="javascript:window.close();">취소</button></td>
			<td style="width:39%;"></td>
		</tr>
		</table>		


</body>
</html>
<jsp:include page="/WEB-INF/jsp/config/footer_naviTime_capital.jsp"/>