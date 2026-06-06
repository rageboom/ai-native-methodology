<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"%>
<%@ include file="/WEB-INF/jsp/config/include.jsp"%>
<script type="text/javascript" src="https://mstatic.${domain}/common/js/navilog.js"></script>

<script type="text/javascript">      
 var USERID = "<%=request.getHeader("SM_USER")%>"; // 사용자 아이디
 var DOCNAME = "CAR"; // 해당 시스템 명칭
 var ACCESSIP = "${accessIp}";

 navilog.init(DOCNAME, USERID, ACCESSIP);
 navilog.send();
 
 /*
 var timerateTotal = 0;      	
     if ( !('performance' in window) || !('timing' in window.performance) || !('navigation' in window.performance)) {
        document.getElementById('nt-unsupported').className = '';
     } else {
        window.addEventListener('load', function() {
           	var timings = window.performance.timing;
           	var timing_text = JSON.stringify(timings);
        	var datas = "USERID=" + USERID + "&";
        	datas += "DOCNAME=" + DOCNAME + "&";
        	datas += "clientIp=${accessIp}&";
        	datas += "NAVIGATION=" + timing_text;
                     
	     	$.ajax({
	    		method: "POST",
	    	    url: "http://mdi.${domain}/mdi/api/NavigationTimingAPI",
	    	    data: datas,
	    	    dataType: "jsonp"        	    
	    	});

        });
     }
 */
</script>
