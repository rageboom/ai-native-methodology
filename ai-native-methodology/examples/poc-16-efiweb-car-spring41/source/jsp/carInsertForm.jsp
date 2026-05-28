<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8" %>
<%@ include file="/WEB-INF/jsp/config/include.jsp" %>
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">
<head>
<meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
<meta http-equiv="X-UA-Compatible" content="IE=9;FF=3;OtherUA=4" />
<title>IFRS</title>
<link rel="stylesheet" type="text/css" href="${cssPath}/ifrs/ifrs.css" />
<link rel="stylesheet" type="text/css" href="${cssPath}/ifrs/jquery-confirm.css" />
<style type="text/css">
.listType tr td { text-align:left; padding-left:20px; }	
li.endDept span{ color:#A6A6A6 }
thead th {text-align:center}
</style>
<link type="text/css" rel="stylesheet" href="${cssPath}/ifrs/jquery-ui-1.9.2.custom.css" />
<script type="text/javascript" src="${scriptPath}/ifrs/jquery-1.7.1.js"></script>
<script type="text/javaScript" src="<c:url value='${scriptPath}/ifrs/jquery-ui-1.9.2.custom.js'/>"></script>
<script type="text/javascript" src="${scriptPath}/ifrs/jquery-confirm.js"></script>
<script type="text/javaScript" src="<c:url value='${scriptPath}/ifrs/jquery.ui.datepicker-ko.js'/>"></script>
<script type="text/javascript" src="${scriptPath}/ifrs/jqCommon.js"></script>
<script type="text/javascript" src="${scriptPath}/ifrs/common.js"></script>
<script type="text/javascript" src="${scriptPath}/ifrs/Address.js"></script>
<script type="text/javascript" src="${scriptPath}/ifrs/validation.js"></script>
<script type="text/javascript">
	var type="";
	var deptObj = "";
	
	document.domain="${domain}";

	$(document).ready(function() {
		
		$(document).find("input[name=strDate]").removeClass('hasDatepicker').datepicker();
		$(document).find("input[name=endDate]").removeClass('hasDatepicker').datepicker();
		
		$("input[name='state']").click(function(){
			if($(this).val() == "2"){
				$("#carDisposeDate").removeProp("disabled");		
			}else{
				$("#carDisposeDate").val("");
				$("#carDisposeDate").prop("disabled", "disabled");
			}	
		});
		
		if( "${mode}" == "update" ){
			if( "${carMap.userId}" == "" ){
				$("#notAuto").click();
				$("#userNm").val( "${carMap.userNm}" );
				$("#userNm").removeProp("readonly");
			}
			//alert("${carMap.state}");
			$("input[name='state'][value='${carMap.state}']").click();
		}
		
		//엔터키 처리
		$("#searchDept").bind("keypress",  function(){pressEnterKey(event, fn_selectDeptList);} );
		$("#companySeq").change(function(){ fn_selectDeptList(); });
		$("#isDelDept").click(function(){ fn_selectDeptList(); });
		fn_selectDeptList();
		
		$("#userDate").datepicker();
		$("#carGetDate").datepicker();
		$("#carDisposeDate").datepicker();
		
		
		window.addEventListener('message', (event) => {
			if (event.origin !== 'https://sfim.${domain}') {
		    	return;
		  	}
		  
		  	if (event.data.mode == "userPop") {
		  		choiceUser(event.data.userList);
			}		  
		});
		
	});
	
	 //사용자 선택 
	function fn_userSelect(){
		if ($("#notAuto").attr("checked")) {
			return;
		}
		
		fn_openWindow('https://sfim.${domain}/common/extUserPopup?deptCd=${deptCd}&onlyOne=Y', 'userPopup', '1200', '665');
	}
	
	function choiceUser(choicedUserInfo) {
		var userInfo = choicedUserInfo[0];
		
		$("#userNm").val(userInfo.userNm);
		$("#userId").val(userInfo.userId);
	}
	
	//validation.js에서 분리해 옴
	$.fn.emptyCheckForCar = function() {
		var value = $.trim(this.val() + '');
		if (!value) {
			//alert($(this).attr('title') + '는(은) 반드시 입력(선택)해 주세요.');
			$.alert({
                title : '',
                content : $(this).attr('title') + '는(은) 반드시 입력(선택)해 주세요.',
                boxWidth : '30%',
                useBootstrap : false,
                buttons : {
                    okay : {
                        text: 'OK',
                        btnClass: 'btn-blue'
                    }
                }
            });
			$(this).select();
			return false;
		}
		return true;
	};	 
	
	//저장
	function doInsert(){
		
		if( !$("#carType").emptyCheckForCar() ) return;
		if( !$("#carNo").emptyCheckForCar() ) return;
		if( $.trim($("#comText").val()) == "/" ){
			//alert("차량등록법인/부서를 선택해주세요");
			$.alert({
                title : '',
                content : "차량등록법인/부서를 선택해주세요",
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
		
		if( !$("#userNm").emptyCheckForCar() ) return;
		
		//사용자 소속 입력 값 체크
		var comTextArr = document.getElementsByName("usercomText");
		var strDateArr = document.getElementsByName("strDate");
		var endDateArr = document.getElementsByName("endDate");
		
		//alert(  comTextArr.length );
		for( var i =0; i < comTextArr.length; i++ ){
			if( $.trim( comTextArr[i].value ) == "" ){
				//alert("사용자소속법인을 선택하세요");
				$.alert({
	                title : '',
	                content : "사용자소속법인을 선택하세요",
	                boxWidth : '30%',
	                useBootstrap : false,
	                buttons : {
	                    okay : {
	                        text: 'OK',
	                        btnClass: 'btn-blue'
	                    }
	                }
	            });
				$(comTextArr[i]).click();
				return;
			}
			if( $.trim( strDateArr[i].value ) == "" ){
				//alert("재직기간 시작일을 입력하세요");
				$.alert({
	                title : '',
	                content : "재직기간 시작일을 입력하세요",
	                boxWidth : '30%',
	                useBootstrap : false,
	                buttons : {
	                    okay : {
	                        text: 'OK',
	                        btnClass: 'btn-blue'
	                    }
	                }
	            });
				$(strDateArr[i]).focus();
				return;
			}
			if( $.trim( endDateArr[i].value ) == "" ){
				//alert("재직기간 종료일을 입력하세요");
				$.alert({
	                title : '',
	                content : "재직기간 종료일을 입력하세요",
	                boxWidth : '30%',
	                useBootstrap : false,
	                buttons : {
	                    okay : {
	                        text: 'OK',
	                        btnClass: 'btn-blue'
	                    }
	                }
	            });
				$(endDateArr[i]).focus();
				return;
			}
			
			if( strDateArr[i].value > endDateArr[i].value  ){
				//alert( "시작일이 종료일보다 큽니다." );
				$.alert({
	                title : '',
	                content : "시작일이 종료일보다 큽니다.",
	                boxWidth : '30%',
	                useBootstrap : false,
	                buttons : {
	                    okay : {
	                        text: 'OK',
	                        btnClass: 'btn-blue'
	                    }
	                }
	            });
				strDateArr[i].focus();
				return;
			}
		}
		
		
		//if( !confirm("저장하시겠습니까?") ) return;
		$.confirm({
            title : '',
            boxWidth : '30%',
            useBootstrap : false,
            content : "저장하시겠습니까?",	              
            buttons : {
                confirm: {
              	text : '확인',
              	action : function() {  
              		if( "${mode}" == "update"  ){
            			$("#insertForm").attr("action", "/ifrs/car/updateCar");
            		}
            		$("#insertForm").submit();	
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
	
	
	//삭제
	function doDelete(){
		//if( !confirm("삭제하시겠습니까?") ) return;		
		$.confirm({
            title : '',
            boxWidth : '30%',
            useBootstrap : false,
            content : "삭제하시겠습니까?",	              
            buttons : {
                confirm: {
              	text : '확인',
              	action : function() {  
              		location.href = "/ifrs/car/deleteCar?carIdx=" + $("#carIdx").val();
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
	
	//목록
	function goList(){
		location.href = "/ifrs/car/carList?pageIndex=${param.pageIndex}&carType=${param.carType}&userNm=${param.userNm}";
	}
	
	
	//회사선택 팝업
	function fn_companyPop( obj){
		deptObj = obj;
		var offset = $(obj).offset();
		$("#layerPop").css({ top : offset.top + 30, left:  offset.left});
		$("#layerPop").show();
	}
	
	
	//회사선택 팝업2
	function fn_companyPop2( obj){
		deptObj = obj;
		var offset = $(obj).offset();
		$("#layerPop2").css({ top : offset.top + 30, left:  offset.left});
		$("#layerPop2").show();
	}
	
	
	function fn_selectDeptList(){
		
		//if( $("#searchDept").val().trim() == "" ){
		//	alert("부서명을 입력 후 조회하세요");
		//	return;
		//}
		
		var data = "companySeq=" + $("#companySeq").val()  + "&searchDept=" + $("#searchDept").val() + "&isDelDept=" + $("#isDelDept:checked").val();
		var url = "/ifrs/car/erpDeptListAjax";
		
		fn_ajax(url, data, function( result ){
			makeDeptList( result.deptList );
		});
	}
	
	
	function makeDeptList(list ){
		var html = "";
		if( list != null ){
			for(var i = 0; i < list.length; i++ ){
				html += "<li id='" + list[i].companyseq + "|" + list[i].deptseq + "'  class='" + (list[i].isUse == "종료" ? "endDept" : "") + "'>"
					 +  "<a href=\"javascript:;\" >"
					 +		"<span id=''>" + list[i].uppDeptNm + " / <b>" + list[i].deptname + "</b></span></a></li>";
			}
		}
		
		if( html == "") html = "<li><span>검색 결과가 없습니다.</span></li>"
		
		$("#ulCodeItemList1").html( html );
		
		//부서목록 클릭시 선택표시 되도록 처리
		$("#ulCodeItemList1 li").click(function(){
			if( $(this).hasClass("selected") ){
				$(this).removeClass("selected");
			}else{
				$("#ulCodeItemList1 li").removeClass("selected");
				$(this).addClass("selected");
			}
		});
	}
	
	function chooseDept(  ){
		var $target = $(deptObj).parent().parent();
		
		var $li = $("#ulCodeItemList1 li.selected");
		if($li.length  > 0){
			var id = $li.attr("id");
			$target.find("[name$='comText']").val( $("#companySeq").find("option:selected").text() + " / " + $li.find("span").text().split("/")[1] );
			$target.find("[name$='comCd']").val( id.split("|")[0] );
			$target.find("[name$='deptCd']").val( id.split("|")[1] );
			$("#layerPop").hide();
		}else{
			//alert("선택된 부서가 없습니다.");
			$.alert({
                title : '',
                content : "선택된 부서가 없습니다.",
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
	}
	
	
	function chooseCom(  ){
		var $target = $(deptObj).parent().parent();
		
		$target.find("[name$='comText']").val( $("#companySeq2").find("option:selected").text());
		$target.find("[name$='comCd']").val($("#companySeq2").val());
		$target.find("[name$='deptCd']").val( 0 );
		$("#layerPop2").hide();
	}
	
	function fn_inputChange( obj ){
		if($(obj).prop("checked")){
			$("#userNm").removeProp("readonly");
			$("#userId").val("");
			$("#userNm").val("");
		}else{
			$("#userNm").attr("readonly", true);
			$("#userNm").val("");
		}
	}
	
	//사용자 소속 추가
	function fn_addSosok(){
		var html = "";
		html = "<tr><td><input type='text' name='usercomText' value='' class='inptext' size='50' onclick='fn_companyPop2(this)' readonly />"
			 +			"<input type='hidden' name='termIdx' value='0' />"	 
			 +			"<input type='hidden' name='usercomCd' value='' />"
			 +			"<input type='hidden' name='userdeptCd' value='0' />"
			 +		"</td><td>"
			 +			"<input type='text' name='strDate' value='' class='inptext' size='12' /> ~ "
			 +			"<input type='text' name='endDate' value='' class='inptext' size='12' />"
			 +			" <a href=\"javascript:;\" onclick='fn_delSosok(this);' >[삭제]</a>"
			 +		"</td></tr>";
			 
		$("#sosokArea").append( html );	
		
		$(document).find("input[name=strDate]").removeClass('hasDatepicker').datepicker();
		$(document).find("input[name=endDate]").removeClass('hasDatepicker').datepicker();
	}
	
	
	function fn_delSosok( obj ){
		
		//차량비용에 연동된 데이터가 있는지 체크
		var cnt = 0;
		
		var termIdx = $(obj).parent().parent().find("[name='termIdx']").val(); 
		
		var url = "/ifrs/car/selectCarUserTermCost";
		var data = "termIdx=" + termIdx;
		
		
		fn_ajax(url, data, function( result ){
			cnt = result.cnt;
			
			if( cnt != "0" ){
				//if( !confirm("차량비용 산출시에 이미 연동된 데이터가 존재합니다.\n삭제할 경우 차량비용 연동 데이터도 함께 삭제됩니다.\n삭제하시겠습니까?\n(*확인이 필요한 경우 관리자에게 문의해주세요)") ) return;
				$.confirm({
		            title : '',
		            boxWidth : '30%',
		            useBootstrap : false,
		            content : "차량비용 산출시에 이미 연동된 데이터가 존재합니다.\n삭제할 경우 차량비용 연동 데이터도 함께 삭제됩니다.\n삭제하시겠습니까?\n(*확인이 필요한 경우 관리자에게 문의해주세요)",	              
		            buttons : {
		                confirm: {
		              	text : '확인',
		              	action : function() {  
		              		$(obj).parent().parent().remove();
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
			
			//$(obj).parent().parent().remove();
		});
	}
	
</script>
</head>


<body style="background:none;">



<!--wrap div-->
<div id="wrap">

		<form name="insertForm" id="insertForm" action="/ifrs/car/insertCar"  method="post">
		<input type="hidden" id="carIdx" name="carIdx" value="${carMap.carIdx}" />	
			
        <div class="content">
			
        				
            <div class="para" id="resultBody" >
                <table class="listType">
                    <colgroup>
                    	<col width="20%"/>
                        <col width="80%"/>
                    </colgroup>
                    <tbody>					
						<tr>
							<th>차종</th>
							<td>
								<input type="text" id="carType" name="carType" title="차종" value="${carMap.carType}" class='inptext' size="60" /> 
							</td>
						</tr>
						<tr>
							<th>차량번호</th>
							<td>
								<input type="text" id="carNo" name="carNo" title="차량번호" value="${carMap.carNo}" class='inptext' size="60" /> 
							</td>
						</tr>
						<tr>
							<th>취득일</th>
							<td>
								<input type="text" id="carGetDate" name="carGetDate" title="차량취득일" value="${carMap.carGetDate}" class='inptext' size="12" />
							</td>
						</tr>
						<tr>
							<th>차량등록법인<br/>/사용자부서</th>
							<td>
								<input type="text" id="comText" name="comText" title="차량등록법인 및 사용자부서" value="${carMap.comNm} / ${carMap.deptNm}" onclick="fn_companyPop(this)" class='inptext' size="60" readonly/>
								<input type="hidden" id="comCd" name="comCd" value="${carMap.comCd}" />
								<input type="hidden" id="deptCd" name="deptCd" value="${carMap.deptCd}" /> 
							</td>
						</tr>
						<tr>
							<th>사업자등록번호</th>
							<td>
								<input type="text" id="bizNo" name="bizNo" title="사업자등록번호" value="${carMap.bizNo}" class='inptext' size="20" /> 
							</td>
						</tr>
						<!-- 
						<tr>
							<th>사업년도</th>
							<td>
								<select id="bizYear" name="bizYear">
									<option value="2016">2016</option>	
									<option value="2017">2017</option>
									<option value="2018">2018</option>
								</select> 년 
							</td>
						</tr>
						 -->
						<tr>
							<th>직책</th>
							<td>
								<input type="text" id="duty" name="duty" title="직책" value="${carMap.duty}" class='inptext' size="30" />
							</td>
						</tr>
						<tr>
							<th>구분</th>
							<td>
								<input type="radio" name="state" value="1" checked /> 사용중인 차량 &nbsp;&nbsp;
								<input type="radio" name="state" value="2" /> 처분된 차량 &nbsp;&nbsp;
								<input type="radio" name="state" value="3" /> 임직원 양수도
							</td>
						</tr>
						<tr>
							<th>처분일</th>
							<td>
								<input type="text" id="carDisposeDate" name="carDisposeDate" title="차량처분일" value="${carMap.carDisposeDate}" class='inptext' size="12"  />
							</td>
						</tr>
						<tr>
							<th>사용자 성함</th>
							<td>
								<input type="text" id="userNm" name="userNm" title="사용자명" value="${carMap.userNm}" class='inptext' size="30"  onclick="fn_userSelect();" readonly  />
								<input type="hidden" name="userId" id="userId" value="${carMap.userId}" />
								&nbsp;&nbsp; * 재직일 선택 :
								<input type="text" id="userDate" name="userDate" value=""  class='inptext' size="10" /> (퇴사자의 경우에만 해당 재직일 선택 ) 
								<!-- &nbsp;<input type="checkbox" name="notAuto" id="notAuto" onclick="fn_inputChange(this);" />직접입력(사용자가 퇴사자인 경우) -->
							</td>
						</tr>
						<tr>
							<th>사용자소속법인</th>
							<td style="padding:0 0 0 0;">
								<table class="listType" style="width:100%;height:100%">
								  	<colgroup>
				                    	<col width="55%"/>
				                        <col width="45%"/>
				                    </colgroup>
				                    <thead>
										<tr>
											<th>사용자소속법인 <a href="javascript:fn_addSosok()">[추가]</a></th>
											<th>사용기간</th>
										</tr>
									</thead>
									<tbody id="sosokArea">
									<c:if test="${!empty carUserTermList }">
										<c:forEach var="list" items="${carUserTermList }">
										<tr>
											<td><input type="text" name="usercomText" value="${list.comNm }" class="inptext" size="50" onclick="fn_companyPop2(this)" readonly="">
												<input type="hidden" name="termIdx" value="${list.termIdx }" />
												<input type="hidden" name="usercomCd" value="${list.comCd }" />
												<input type="hidden" name="userdeptCd" value="0" />
											</td>
											<td><input type="text" name="strDate" value="${list.strDate }" class="inptext hasDatepicker" size="12">
											 ~ <input type="text" name="endDate" value="${list.endDate }" class="inptext hasDatepicker" size="12"> 
												<a href="javascript:;" onclick="fn_delSosok(this);">[삭제]</a>
											</td>
										</tr>	
										</c:forEach>
									</c:if>		
									</tbody>
								</table>
							</td>
						</tr>
					</tbody>
                </table>
            </div>
            
            <div class="btnArea">
            	<span class="grayButton"><button type="button" onclick="javascript:goList();">목록</button></span>
            	<span style="padding-right:600px;">&nbsp;</span>
               	<span class="grayButton"><button type="button" onclick="javascript:doInsert();">저 장</button></span>
               	<c:if test="${mode eq 'update'}">
               	<span class="grayButton"><button type="button" onclick="javascript:doDelete();">삭 제</button></span>
               	</c:if>
            </div>
            
        </div>
		</form>

</div>

<div id="layerPop" class="layerWrap" style="display:none;width:356px; ">
    <div class="layerHeader">
        <span class="title" style="color:#fff;">부서선택</span>
    </div>
    <div class="layerContent">
    	<p>* 법&nbsp;&nbsp;인
    		<select id="companySeq" name="companySeq" style="height:20px;">
    		<c:forEach items="${comList}" var="list">
    			<option value="${list.companyseq }">${list.companyname }</option>
    		</c:forEach>
    		</select>
    	</p>
    	<p style="padding-top:10px;">* 부서명 <input type="text" class="inptext" name="searchDept" id="searchDept" value="" placeHolder="부서명 입력후 Enter키를 눌러주세요" size="45" /></p>
    	<p style="padding-top:10px;">* 미사용 부서 포함 &nbsp;<input type="checkbox" name="isDelDept" id="isDelDept" value="1"/></p>
        <ul id='ulCodeItemList1' class="listItemEdit" style="margin-top:15px;">
			<li id="">
				<a href="javascript:;">
					<span id="" >부서를 검색하세요</span>
				</a>
			</li>
        </ul>
        </div>
        <div class="layerFooter">
            <span class="grayButton"><button type="button" onclick="javascript:chooseDept();" >선택</button></span>
            &nbsp;
            <span class="grayButton"><button type="button" onclick="$('#layerPop').hide()" >취소</button></span>
        </div>
</div>

<div id="layerPop2" class="layerWrap" style="display:none;width:356px; ">
    <div class="layerHeader">
        <span class="title" style="color:#fff;">부서선택</span>
    </div>
    <div class="layerContent">
    	<p>* 법&nbsp;&nbsp;인
    		<select id="companySeq2" name="companySeq" style="height:20px;">
    		<c:forEach items="${comList}" var="list">
    			<option value="${list.companyseq }">${list.companyname }</option>
    		</c:forEach>
    		</select>
    	</p>
        </div>
        <div class="layerFooter">
            <span class="grayButton"><button type="button" onclick="javascript:chooseCom();" >선택</button></span>
            &nbsp;
            <span class="grayButton"><button type="button" onclick="$('#layerPop2').hide()" >취소</button></span>
        </div>
</div>

</body>
</html>
