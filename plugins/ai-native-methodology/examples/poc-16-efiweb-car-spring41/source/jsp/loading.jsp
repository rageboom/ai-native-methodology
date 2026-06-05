 <%@ include file="/WEB-INF/jsp/config/include.jsp" %>  	
   	<!-- loading bar -->
    <style>
	.wrap-loading div{ /*로딩 이미지*/
	    position: fixed;
	    top:50%;
	    left:50%;
	    margin-left: -21px;
	    margin-top: -21px;
	    z-index:999999;
	}
	</style>
    <div class="wrap-loading" style="display:none;">
	    <div><img src="${imgPath}/ifrs/loading.gif" /></div>
	</div>