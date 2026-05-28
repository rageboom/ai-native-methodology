<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8" %>
<%@include file="/WEB-INF/jsp/config/include.jsp"%>
<c:choose>
<c:when test="${!empty driveList}">
<c:forEach var="list" items="${driveList }">
<tr id="${list.driveIdx }" mode='U'>
<%-- 	<td style="text-align:center">${list.driveNo}  --%>
<%-- 		<a href="#" onclick="modifyRow('${list.driveIdx }')">[U]</a>  --%>
<!-- 		<a href='#' onclick="deleteRow(this);">[D]</a> -->
<%-- 		<input type="hidden" name="driveNo" value="${list.driveNo }" /> --%>
<!-- 	</td> -->
<%-- 	<td style="text-align:center">${list.deptNm}</td> --%>
<%-- 	<td style="text-align:center">${list.duty}</td> --%>
<%-- 	<td style="text-align:center">${list.userNm}</td> --%>
<%-- 	<td style="text-align:left" purposeCd="${list.purposeCd}">${list.purpose}</td> --%>
<%-- 	<td style="text-align:center">${list.driveDate}</td> --%>
<%-- 	<td style="text-align:left">${list.depPoint}</td> --%>
<%-- 	<td style="text-align:right">${list.depAccDist}</td> --%>
<%-- 	<td style="text-align:left">${list.arrPoint}</td> --%>
<%-- 	<td style="text-align:right">${list.arrAccDist}</td> --%>
<%-- 	<td style="text-align:right">${list.driveDist}</td> --%>
<%-- 	<td style="text-align:right">${list.driveWorkDist}</td> --%>
<%-- 	<td style="text-align:left">${list.remark}</td> --%>
	<td style="text-align:center" date="${list.driveDate}" userId="${list.userId}" deptCd="${list.deptCd}" comCd="${list.comCd}">
		${list.driveDate}
		<span class="<c:if test="${list.holidayYn == 1 || list.yoil eq '토요일' || list.yoil eq '일요일'}">red</c:if>">${list.yoil}</span> 
		<a href="javascript:;" onclick="modifyRow('${list.driveIdx }')">[수정]</a> 
		<a href='javascript:;' onclick="deleteRow(this);">[삭제]</a>
		<input type="hidden" name="driveNo" value="${list.driveNo }" />
	</td>
	<td style="text-align:center">${list.deptNm}</td>
	<td style="text-align:center">${list.userNm}</td>
	<td style="text-align:right"><fmt:formatNumber value="${list.depAccDist}" pattern="#,###.##" /></td>
	<td style="text-align:right"><fmt:formatNumber value="${list.arrAccDist}" pattern="#,###.##" /></td>
	<td style="text-align:right"><fmt:formatNumber value="${list.driveDist}" pattern="#,###.##" /></td>
	<td style="text-align:right"><fmt:formatNumber value="${list.distance}" pattern="#,###.##" /></td>
	<td style="text-align:right"><fmt:formatNumber value="${list.driveWorkDist}" pattern="#,###.##" /></td>
	<td style="text-align:left">${list.remark}</td>
</tr>
</c:forEach>
</c:when>
<c:otherwise>
<tr id="noTr">
	<td colspan="13" style="text-align:center">조회된 내용이 없어요</td>
</tr>
</c:otherwise>
</c:choose>
