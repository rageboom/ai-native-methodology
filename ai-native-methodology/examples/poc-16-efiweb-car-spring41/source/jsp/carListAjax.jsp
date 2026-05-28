<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8" %>
<%@include file="/WEB-INF/jsp/config/include.jsp"%>
 <div>
 <table class="listType">
     <colgroup>
    	<col width="20%"/>
        <col width="15%"/>
        <col width="20%"/>
        <col width="20%"/>
        <col width="10%"/>
        <col width="15%"/>
     </colgroup>
     <thead>
         <tr>
             <th>차종</th>
             <th>차량번호</th>
             <th>차량등록법인</th>
             <th>사용자부서</th>
             <th>사용자이름</th>
             <th>상태</th>
         </tr>
     </thead>
     
    <tbody>
    
  <c:choose>
    <c:when test="${resultList != null && !empty resultList }">
    <c:forEach items="${resultList}" var="list" varStatus="status">			
		<tr>
			<td><a href="javascript:goUpdateForm('${list.carIdx}');">${list.carType}</a></td>
			<td>${list.carNo}</td>
			<td>${list.comNm}</td>
			<td>${list.deptNm}</td>
			<td>${list.userNm }</td>
			<td>${list.stateNm }
				<c:if test="${list.state eq '1' && !empty list.carGetDate}"><br/>(취득:${list.carGetDate })</c:if>
				<c:if test="${list.state eq '2' && !empty list.carDisposeDate}"><br/>(처분:${list.carDisposeDate })</c:if>
			</td>
		</tr>
	</c:forEach>
	</c:when>
	<c:otherwise>
		<tr>
			<td colspan="6">조회 결과가 없습니다..</td>
		</tr>
	</c:otherwise>
  </c:choose>
  		
	</tbody>
</table>
</div>
<%--
<div class="pagingWrap">
<span class="pagingNumber">
	<ui:pagination paginationInfo="${paginationInfo}" type="" jsFunction="fn_selectList"  />
</span>
</div>
 --%>   