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
.wrap-loading div{ /*로딩 이미지*/
	    position: fixed;
	    top:50%;
	    left:50%; 
	    margin-left: -21px;
	    margin-top: -21px;
	    z-index:999999;
	}
</style>
<script type="text/javascript" src="${scriptPath}/ifrs/jquery-1.7.1.js"></script>
<script type="text/javascript" src="${scriptPath}/ifrs/jquery-confirm.js"></script>
<script type="text/javascript" src="${scriptPath}/ifrs/calendar_month5.js"></script>
<script type="text/javascript" src="${scriptPath}/ifrs/jqCommon.js"></script>
<script type="text/javascript" src="${scriptPath}/ifrs/common.js"></script>

<script type="text/javascript">
	if( "${param.result}" == "ins" ){
		//alert("등록하였습니다.");
		$.alert({
            title : '',
            content : '등록하였습니다.',
            boxWidth : '30%',
            useBootstrap : false,
            buttons : {
                okay : {
                    text: 'OK',
                    btnClass: 'btn-blue'
                }
            }
        });
		location.replace("/ifrs/car/carList");
	}
	if( "${param.result}" == "upt" ){
		//alert("수정하였습니다.");
		$.alert({
            title : '',
            content : '수정하였습니다.',
            boxWidth : '30%',
            useBootstrap : false,
            buttons : {
                okay : {
                    text: 'OK',
                    btnClass: 'btn-blue'
                }
            }
        });
		location.replace("/ifrs/car/carList");
	}
	if( "${param.result}" == "del" ){
		//alert("삭제하였습니다.");
		$.alert({
            title : '',
            content : '삭제하였습니다.',
            boxWidth : '30%',
            useBootstrap : false,
            buttons : {
                okay : {
                    text: 'OK',
                    btnClass: 'btn-blue'
                }
            }
        });
		location.replace("/ifrs/car/carList");
	}

	$(document).ready(function() {
		$("#carType").bind("keypress",  function(){pressEnterKey(event, fn_selectList);} );
		$("#userNm").bind("keypress",  function(){pressEnterKey(event, fn_selectList);} );
		
		$("#searcher").click(function(){  fn_selectList(1); });
		fn_selectList(1);
	});

	

	//목록 조회
	function fn_selectList( pageIndex ){
		
		document.searchForm.pageIndex.value = pageIndex;
		
		var data = $('#searchForm').serialize();
		var url = "/ifrs/car/carListAjax";
		
		fn_ajax(url, data, function(html){
			$("#resultBody").html( html );			
		});
	}
	
	
	function fn_selectCar(carIdx,carType,carNo,userNm){
		opener.carSelectCallBack( carIdx, carType, carNo, userNm );
		window.close();
	}
	

</script>
</head>


<body style="background:none;">

    <div class="wrap-loading" style="display:none;">
	    <div><img src="${imgPath}/ifrs/loading.gif" /></div>
	</div>


<!--wrap div-->
<div id="wrap">
	

        <div class="content">
            
            
			<form name="searchForm" id="searchForm" method="post">
			<input type="hidden" name="pageIndex" value="1" />
			<input type="hidden" name="carIdx" value="" />	
			<input type="hidden" name="flag" value=carSelectPopupAjax />
			 
        	<div class="seachGroup" style="width: 800px;">
                    <fieldset>
                    	<div class="fl">
                            <div class="basicSearch">
                                <div class="hGroup">
                                    <ul class="firstChild" style="width: 680px;">
                                       <li>
                                       		<label for="state" style="width:35px;">상태</label>
                                       		<select name="state" id="state" onchange="fn_selectList(1);">
                                       			<option value="">전체</option>
                                       			<option value="1" selected>사용중</option>
                                       			<option value="2">처분</option>
                                       			<option value="3">양도</option>
                                       		</select> 
                                       		
                                       		<label for="state" style="width:70px; padding-left:95px;">등록법인</label>
                                       		<select id="companySeq" name="companySeq" onchange="fn_selectList(1);">
                                       		    <option value="">전체</option>
									    		<c:forEach items="${comList}" var="list">
									    			<option value="${list.companyseq }">${list.companyname }</option>
									    		</c:forEach>
								    		</select>
                                       		<br/>
                                        	<label for="comNm" style="width:35px; padding-top: 10px;">차종</label>
											<input type="text" id="carType" name="carType" class="inptext"  />
											
											<label for="comNm" style="width:70px;padding-left:30px;">차량번호</label>
											<input type="text" id="carNo" name="carNo" class="inptext"  />
											
											<label for="userNm" style="width:35px;padding-left:30px;">이 름</label>
                                            <input type="text" id="userNm" name="userNm" class="inptext" />
                                        </li>
                                    </ul> 
                                 </div>  
                             </div>
                         </div>
                         <div class="fr" style="position:relative;">
                         	<p class="btnSearchBox">   
                         	<button type="button" id="searcher" class="btnSearch"><span class="blind">검색</span></button>                     
                            </p>
                          </div>
                        </fieldset>
            </div>
 			
			</form>
			
			<div class="btnArea" style="margin-top:-10px;">
				<span style="padding-left:720px;">&nbsp;</span>
                
            </div>
            
            <div class="para" id="resultBody" >
            
            </div>
            <div class="btnArea" style="margin-top:-10px;">
				<span style="padding-left:350px;">&nbsp;</span>
                <span class="grayButton" style=""><button type="button" onclick="javascript:self.close();">닫기</button></span>
            </div>

            
        </div>


</div>
<jsp:include page="/WEB-INF/jsp/car/carInclude.jsp"/>
</body>
</html>
