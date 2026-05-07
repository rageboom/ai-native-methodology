package smilegate.ifrs.capital.service.impl;

import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Calendar;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import javax.annotation.Resource;
import javax.servlet.http.HttpServletRequest;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import net.sf.json.JSONArray;
import smilegate.ifrs.capital.service.CapitalService;
import smilegate.ifrs.cmm.util.IfrsUtil;
import smilegate.ifrs.cmm.util.StringUtil;
import smilegate.ifrs.comment.service.vo.CommentVO;

@Service("capitalService")
public class CapitalServiceImpl  implements CapitalService{
	
	private final Logger log = LoggerFactory.getLogger(this.getClass().getName());
	
	@Resource(name = "capitalDAO")
	private CapitalDAO capitalDAO;
	
	@Resource(name = "cmsDAO")
	private CmsDAO cmsDAO;
	
	@Override
	public List<Map> selectComBasicInfoListAjax(Map param) throws Exception {
		 return capitalDAO.selectComBasicInfoList( param ); 
	}

	@Override
	public void saveComBasicInfoList(Map<String, List<Map<String, String>>> map) throws Exception {
		List<Map<String, String>> iList = map.get("add");
		List<Map<String, String>> uList = map.get("update");
		if( iList != null ){
			for( Map<String, String>  imap  : iList ){
				if( !"".equals( StringUtil.nullToStr(imap.get("comNo"))) ) 
					capitalDAO.updateComCapitalInfo( imap );
			}
		}
		if( uList != null ){
			for( Map<String, String>  umap  : uList ){
				capitalDAO.updateComCapitalInfo( umap );
			}
		}
	}
	
	@Override
	public List<Map> selectCapitalBizAjax(Map param) throws Exception {
		return capitalDAO.selectCapitalBizAjax( param );
	}		
	
	@Override
	public List<Map> selectCapitalStdAjax(Map param) throws Exception {
		return capitalDAO.selectCapitalStdAjax( param );
	}	
	
	
	@Override
	public List<Map> insertComINSetList(Map param) throws Exception {
		return capitalDAO.insertComINSetList( param );
	}
	
	@Override
	public List<Map> selectIfrsERPINList(Map param) throws Exception {
		return capitalDAO.selectIfrsERPINList( param );
	}
	
	@Override
	public List<Map> selectIfrsERPINList2(Map param) throws Exception {
		return capitalDAO.selectIfrsERPINList2( param );
	}	
	

	@Override
	public List<Map> selectERPINSetList(Map param) throws Exception {
		return capitalDAO.selectERPINSetList( param );
	}
	
	@Override
	public List<Map> insertERPINSetList(Map param) throws Exception {
		return capitalDAO.insertERPINSetList( param );
	}
	
	@Override
	public List<Map> selectCmsDepositList(Map param) throws Exception {
		return cmsDAO.selectCmsDepositList( param );
	}
	
	@Override
	public List<Map> selectCMSINSetList(Map param) throws Exception {
		return capitalDAO.selectCMSINSetList( param );
	}
	
	@Override
	public List<Map> selectCmsAccountListAll(Map param) throws Exception {
		return cmsDAO.selectCmsAccountListAll( param );
	}
	
	@Override
	public List<Map> insertCMSINSetList(Map param) throws Exception {
		return cmsDAO.insertCMSINSetList( param );
	}
	
	@Override
	public List<Map> selectERPINReport(Map param) throws Exception {
		return capitalDAO.selectERPINReport( param );
	}
	
	@Override
	public List<Map> insertERPINList(Map param) throws Exception {
		return capitalDAO.insertERPINList( param );
	}
	
	@Override
	public List<Map> IfrsWEEKINListSave(Map param) throws Exception {
		return capitalDAO.IfrsWEEKINListSave( param );
	}	

	@Override
	public List<Map> selectIfrsERPOUTList(Map param) throws Exception {
		return capitalDAO.selectIfrsERPOUTList( param );
	}	
	
	@Override
	public List<Map> selectCmsWithdrawList(Map param) throws Exception {
		return cmsDAO.selectCmsWithdrawList( param );
	}	
	
	@Override
	public List<Map> selectIfrsERPMaxAjax(Map param) throws Exception {
		return capitalDAO.selectIfrsERPMaxAjax( param );
	}		
	
	
	@Override
	public List<Map> selectAssetListAjax1(Map param) throws Exception {
		return capitalDAO.selectAssetListAjax1( param );
	}	
	
	@Override
	public List<Map> selectAssetListAjax2(Map param) throws Exception {
		return cmsDAO.selectAssetListAjax2( param );
	}	
	
	@Override
	public List<Map> selectAssetListAjax3(Map param) throws Exception {
		return capitalDAO.selectAssetListAjax3( param );
	}		
	
	@Override
	public List<Map> selectAssetListAjax4(Map param) throws Exception {
		return capitalDAO.selectAssetListAjax4( param );
	}		
	
	@Override
	public List<Map> selectAssetListAjax5(Map param) throws Exception {
		return cmsDAO.selectAssetListAjax5( param );
	}	
	
	
	@Override
	public List<Map> insertAssetINSetList(Map param) throws Exception {
		return capitalDAO.insertAssetINSetList( param );
	}		
	
	@Override
	public List<Map> selectLoadSaveData(Map param) throws Exception {
		return capitalDAO.selectLoadSaveData( param );
	}			

	@Override
	public void IfrsCapitalDeleteAjax(Map param) {
		capitalDAO.IfrsCapitalDeleteAjax( param );
	}	
	
	@Override
	public void saveMail(Map param) {
		capitalDAO.saveMail( param );
	}	
	
	@Override
	public List<Map> selectMail(Map param) throws Exception {
		return capitalDAO.selectMail( param );
	}
	
	@Override
	public List<Map> selectDeptMail(Map param) throws Exception {
		return capitalDAO.selectDeptMail( param );
	}	
	
	@Override
	public List<Map> selectDeptCd(Map param) throws Exception {
		return capitalDAO.selectDeptCd( param );
	}		
	
	@Override
	public List<Map> holyday(Map param) throws Exception {
		return capitalDAO.holyday( param );
	}	
	
	public Map<String, Object> holydayChk(Map<String, Object> param) throws Exception {
		
		int year  = Integer.parseInt(((String) param.get("serdate")).substring(0, 4));
	    int month = Integer.parseInt(((String) param.get("serdate")).substring(4, 6));
	    int date  = Integer.parseInt(((String) param.get("serdate")).substring(6, 8));

	    Calendar cal = Calendar.getInstance();
	    cal.set(year, month - 1, date);
	    cal.add(Calendar.DATE, -1);  

	    SimpleDateFormat dateFormatter = new SimpleDateFormat("yyyyMMdd");

		param.put("serdate", dateFormatter.format(cal.getTime()));
		
		List<Map> holyday = capitalDAO.holyday( param );
		
		boolean holyDayChk = false;
		
		if("Y".equals(holyday.get(0).get("holyparam"))){
			if(!holyDayChk){
				
				int eyear  = Integer.parseInt(((String) param.get("edate")).substring(0, 4));
			    int emonth = Integer.parseInt(((String) param.get("edate")).substring(4, 6));
			    int edate  = Integer.parseInt(((String) param.get("edate")).substring(6, 8));
			    
			    cal.set(eyear, emonth - 1, edate);
			    cal.add(Calendar.DATE, -1);  

				param.put("seredate", dateFormatter.format(cal.getTime()));
				
				holyDayChk = true;
			}
			return holydayChk( param );
		}else{
			if(!holyDayChk){
				
				int eyear  = Integer.parseInt(((String) param.get("edate")).substring(0, 4));
			    int emonth = Integer.parseInt(((String) param.get("edate")).substring(4, 6));
			    int edate  = Integer.parseInt(((String) param.get("edate")).substring(6, 8));
			    
			    cal.set(eyear, emonth - 1, edate);
			    cal.add(Calendar.DATE, -1);  

				param.put("seredate", dateFormatter.format(cal.getTime()));
				
				holyDayChk = true;
			}
			
			param.put("holyDayChk",holyday.get(0).get("holyparam"));
			param.put("serdate", param.get("serdate"));
			param.put("seredate", param.get("seredate"));
			return param;
		}
	}
	
	@Override
	public List<Map> week(Map param) throws Exception {
		return capitalDAO.week( param );
	}	

	@Override
	public String IfrsPreviousWeekEndDate(Map param) throws Exception {
		return capitalDAO.IfrsPreviousWeekEndDate(param);
	}
	
	@Override
	public Map<String, Object> IfrsWeekReport1(Map param) throws Exception {
		
		Map<String, Object> rsltMap = new HashMap<String, Object>();
		
		List<Map> weekReport = new ArrayList<Map>();
		
		if("1000003".equals(param.get("companyseq")) || "2000019".equals(param.get("companyseq"))){
			param.put("curr", "USD");
		}else if("2000025".equals(param.get("companyseq"))){
			param.put("curr", "EUR");
		}
		
		param.put("serdate", param.get("sdate"));
		
		String sDate = (String) param.get("sdate");
		String edate = (String) param.get("edate");
		
		holydayChk(param);
		
		if("KRW".equals(param.get("curr"))){
			if(!("Y").equals(param.get("holyDayChk"))){
				param.put("serdate",sDate);
				param.put("sdate",sDate);
			}
			weekReport = capitalDAO.IfrsWeekReport1( param );
		}else if(!"KRW".equals(param.get("curr")) && "N".equals(param.get("cmsYn"))){
			//param.put("sdate", param.get("serdate"));
			//param.put("edate", param.get("seredate"));
			
			//holydayChk(param);
			param.put("sdate", prevDate(sDate));
			param.put("edate", prevDate(edate));
			param.put("serdate", prevDate((String)param.get("sdate")));
			
			
			weekReport = capitalDAO.IfrsWeekReport1( param );
		}else{
			param.put("sdate", prevDate(sDate));
			param.put("edate", prevDate(edate));
			param.put("serdate", prevDate((String)param.get("sdate")));
			
			List<String> weekList = capitalDAO.weekList( param );

			for(int i = 0; i < weekList.size(); i++){
				param.put("registDt", weekList.get(i));
				weekReport.add(capitalDAO.IfrsWeekReport2( param ));
			}
		}
		
		rsltMap.put("weekReport", weekReport);
		
		rsltMap.put("rateList", capitalDAO.selectDayExchangeList( param ));
		rsltMap.put("serdate", param.get("serdate"));
		
		return rsltMap;
	}		
	
	@Override
	public List<Map> IfrsWeekRate(Map param) throws Exception {
		return capitalDAO.IfrsWeekRate( param );
	}
	
	@Override
	public List<Map> IfrsWeekRateList(Map param) throws Exception {
		return capitalDAO.IfrsWeekRateList( param );
	}	
	
	@Override 
	public Map<String, Object> IfrsWeekReport3(Map param) throws Exception {
		
		Map<String, Object> rsltMap = new HashMap<String, Object>();
		
		List<Map> summaryList = new ArrayList<Map>();
		
		if("1000003".equals(param.get("companyseq")) || "2000019".equals(param.get("companyseq"))){
			param.put("curr", "USD");
		}else if("2000025".equals(param.get("companyseq"))){
			param.put("curr", "EUR");
		}
		
		param.put("serdate", param.get("sdate"));
		
		String sDate = (String) param.get("sdate");
		String edate = (String) param.get("edate");
		
		holydayChk(param);
		
		if("KRW".equals(param.get("curr"))){
			if(!("Y").equals(param.get("holyDayChk"))){
				param.put("serdate",sDate);
				param.put("sdate",sDate);
			}
			summaryList = capitalDAO.IfrsWeekReport3( param );
		}else if(!"KRW".equals(param.get("curr")) && "N".equals(param.get("cmsYn"))){
			//holydayChk(param);
			//param.put("sdate", param.get("serdate"));
			//param.put("edate", param.get("seredate"));
			
			//holydayChk(param);
			param.put("sdate", prevDate(sDate));
			param.put("edate", prevDate(edate));
			param.put("serdate", prevDate((String)param.get("sdate")));
			summaryList = capitalDAO.IfrsWeekReport3( param );
		}else{
			//holydayChk(param);
			param.put("sdate", prevDate(sDate));
			param.put("edate", prevDate(edate));
			param.put("serdate", prevDate((String)param.get("sdate")));
			summaryList = capitalDAO.IfrsWeekReport3( param );
		}
		
		rsltMap.put("summaryList", summaryList);
		
		return rsltMap;
	}	
	
	@Override
	public List<Map> IfrsWeekReport4(Map param) throws Exception {
		
		List<Map> getHistories = new ArrayList<Map>();
		
		param.put("serdate", param.get("sdate"));
		
		String sDate = (String) param.get("sdate");
		String edate = (String) param.get("edate");
		
		holydayChk(param);
		
		if("KRW".equals(param.get("curr"))){
			if(!("Y").equals(param.get("holyDayChk"))){
				param.put("serdate",sDate);
				param.put("sdate",sDate);
			}
			getHistories = capitalDAO.IfrsWeekReport4( param );
		}else if(!"KRW".equals(param.get("curr")) && "N".equals(param.get("cmsYn"))){
			//holydayChk(param);
			//param.put("sdate", param.get("serdate"));
			//param.put("edate", param.get("seredate"));
			
			//holydayChk(param);
			param.put("sdate", prevDate(sDate));
			param.put("edate", prevDate(edate));
			param.put("serdate", prevDate((String)param.get("sdate")));
			getHistories = capitalDAO.IfrsWeekReport4( param );
		}else{
			//holydayChk(param);
			param.put("sdate", prevDate(sDate));
			param.put("edate", prevDate(edate));
			param.put("serdate", prevDate((String)param.get("sdate")));
			
			List<String> weekList = capitalDAO.weekList( param );

			for(int i = 0; i < weekList.size(); i++){
				param.put("registDt", weekList.get(i));
				getHistories.add(capitalDAO.IfrsWeekReportCms( param ));
			}
		}
		
		return getHistories;
	}			
	
	@Override
	public List<Map> IfrsWeekReport5(Map param) throws Exception {
		
		if("1000003".equals(param.get("companyseq")) || "2000019".equals(param.get("companyseq"))){
			param.put("curr", "USD");
		}else if("2000025".equals(param.get("companyseq"))){
			param.put("curr", "EUR");
		}
		
		return capitalDAO.IfrsWeekReport5( param );
	}		
	
	@Override
	public List<Map> IfrsWeekReport6(Map param) throws Exception {
		return capitalDAO.IfrsWeekReport6( param );
	}		
	
	@Override
	public List<Map> IfrsWeekReport7(Map param) throws Exception {
		return capitalDAO.IfrsWeekReport7( param );
	}		
	
	@Override
	public void IfrsWeekReport8(Map param) {
		capitalDAO.IfrsWeekReport8( param );
	}		
	
	@Override
	public List<Map> IfrsWeekReport9(Map param) throws Exception {
		return capitalDAO.IfrsWeekReport9( param );
	}	
	
	@Override
	public List<Map> IfrsWeekReport10(Map param) throws Exception {
		return capitalDAO.IfrsWeekReport10( param );
	}		
	
	@Override
	public void IfrsWeekReport11(Map param) {
		capitalDAO.IfrsWeekReport11( param );
	}	
	
	@Override
	public List<Map> IfrsWeekReport12(Map param) throws Exception {
		return capitalDAO.IfrsWeekReport12( param );
	}
	
	@Override
	public List<Map> IfrsWeekReport13(Map param) throws Exception {
		return capitalDAO.IfrsWeekReport13( param );
	}		
	
	@Override
	public List<Map> IfrsWeekReport14(Map param) throws Exception {
		return capitalDAO.IfrsWeekReport14( param );
	}		
	

	@Override
	public void insertSendMail(Map param) {
		capitalDAO.insertSendMail( param );
	}		
	
	@Override
	public List<Map> mailsendlogAjax(Map param) throws Exception {
		return capitalDAO.mailsendlogAjax( param );
	}		

	@Override
	public String selectCapitalVrify(Map<String, Object> param) throws Exception {
		return capitalDAO.selectCapitalVrify( param );
	}
	
	@Override
	public void insertCapitalVrify(Map<String, Object> param) throws Exception {
		capitalDAO.insertCapitalVrify( param );
	}

	@Override
	public List<Map> getComment(Map param) throws Exception {
		return capitalDAO.getComment(param);
	}
	
	@Override
	public List<Map<String, Object>> selectCapitalCompanyList() throws Exception{
		return capitalDAO.selectCapitalCompanyList();
	}
	
	@Override
	public void insertCapitalHistory (Map<String, Object> param) throws Exception{
		
		List<Map<String, Object>> insertMap = (List<Map<String, Object>>) param.get("insertData");
		List<Map<String, Object>> deleteMap = (List<Map<String, Object>>) param.get("removeData");
		
		List<Map<String, Object>> oldMapList = new ArrayList<Map<String,Object>>();
		
		boolean insertFlag = true;
		
		if(!insertMap.isEmpty()){
			for(int i = 0; i < insertMap.size(); i++){
				oldMapList = capitalDAO.selectCapitalHistory(insertMap.get(i));
				
				if(!oldMapList.isEmpty()){
					for(int j = 0; j < oldMapList.size(); j++){
						if(insertMap.get(i).get("docNo").equals(oldMapList.get(j).get("docNo"))){
							// 수정
							capitalDAO.updateCapitalHistory(insertMap.get(i));
							insertFlag = false;
						}
					}
					if(insertFlag){
						capitalDAO.insertCapitalHistory(insertMap.get(i));
					}
				}else{
					// 등록
					capitalDAO.insertCapitalHistory(insertMap.get(i));
				}
			}
		}
		
		if(!deleteMap.isEmpty()){
			// 삭제
			for(int i = 0; i < deleteMap.size(); i++){
				capitalDAO.deleteCapitalHistory(deleteMap.get(i));
			}
		}
		
		Map<String, Object> commentMap = new HashMap<String, Object>();
		
		commentMap.put("companyseq", (String) param.get("companyseq"));
		commentMap.put("comment", (String) param.get("comment"));
		commentMap.put("datevalue", (String) param.get("datevalue"));
		commentMap.put("registId", (String) param.get("registId"));
		
		capitalDAO.insertCapitalComment(commentMap);
	};

	@Override
	public void deleteCapitalHistory (Map<String, Object> param) throws Exception{
		
		List<Map<String, Object>> deleteMap = (List<Map<String, Object>>) param.get("removeData");
		
		if(null != deleteMap){
			// 삭제
			for(int i = 0; i < deleteMap.size(); i++){
				capitalDAO.deleteCapitalHistory(deleteMap.get(i));
			}
		}
		
		Map<String, Object> userSetMap = new HashMap<String, Object>();
		
		userSetMap.put("sYear", (String) param.get("sYear"));
		userSetMap.put("sMonth", (String) param.get("sMonth"));
		userSetMap.put("week", (String) param.get("week"));
		
		capitalDAO.deleteUserSet(userSetMap);
	}
	
	/**
	 * 이전 날짜 구하기
	 * @return
	 */
	public String prevDate(String regDate) throws Exception {
		regDate = regDate.replaceAll("-", "");
		
		SimpleDateFormat formatter = new SimpleDateFormat("yyyyMMdd");
		Date date = formatter.parse(regDate);
		date = new Date(date.getTime() - (1000*60*60*24*+1));
		
		Calendar cal = Calendar.getInstance() ;
		cal.setTime(date); 
		
		int dayNum = cal.get(Calendar.DAY_OF_WEEK);
		
		formatter = new SimpleDateFormat("yyyyMMdd");
		regDate = formatter.format(date);
		
		if (1 == dayNum || 7 == dayNum) {
			return prevDate(regDate);
		} else {
			return regDate;
		}
	}
	
	
	public List<Map> selectCompanyGraphSetting() throws Exception{
		return capitalDAO.selectCompanyGraphSetting(null);
	}
	
	@Transactional
	public void saveCompanyGraphSetting(String userId, Map param) throws Exception{
		List<Map<String, Object>> addList = (List<Map<String, Object>>) param.get("addList");
		
		List<Map> list = null;
		
		for(Map<String, Object> map : addList){
			if (StringUtil.isEmpty(String.valueOf(map.get("comNo")))) {
				continue;
			}			
			
			map.put("userId", userId);
			
			list = capitalDAO.selectCompanyGraphSetting(map);
			if (list.isEmpty()) {
				capitalDAO.insertCompanyGraphSetting(map);
			} else {
				capitalDAO.updateCompanyGraphSetting(map);
			}
			
			/* 변경된 것은 삭제한다 .*/
			if (!map.get("comNo").equals(map.get("comNoOld"))) {
				map.put("comNo", map.get("comNoOld"));
				capitalDAO.deleteCompanyGraphSetting(map);
			}
		}
	}
	
	public void deleteCompanyGraphSetting(Map param) throws Exception{
		Map<String, Object> item = (Map<String, Object>) param.get("item");
		
		if (!StringUtil.isEmpty(String.valueOf(item.get("comNo")))) {
			capitalDAO.deleteCompanyGraphSetting(item);
		}
	}
	/**
	 * erp법인 여부 체크 :E(ERP사용법인), N(ERP미사용법인) 
	 */
	@Override
	public String selectErpYn(Map param) throws Exception {
		return capitalDAO.selectErpYn( param );
	}		
	/**
	 * ERP 미사용법인일 경우 최근 저장일 리턴
	 */
	@Override
	public String selectLastSaveSdate(Map param) throws Exception {
		return capitalDAO.selectLastSaveSdate( param );
	}
	/**
	 * ERP 법인이 아닌 법인의 자금일보 저장 데이터 호출(마감->기초)
	 */
	@Override
	public List<Map> selectLoadNonErpSaveData(Map param) throws Exception {
		return capitalDAO.selectLoadNonErpSaveData( param );
	}	

	@Override
	public void setFcmmnLog(String level, List<Map> list, HttpServletRequest request) throws Exception {
		// TODO Auto-generated method stub
			
			//2020.08.14 김승희 로그남기기
			Map<String, String> logParam = new HashMap<String, String>();
			//JSONArray mapResult = JSONArray.fromObject(list);
			logParam.put("systemCd", "EFI");
			logParam.put("level", level);
			logParam.put("logJson", IfrsUtil.ListToJsonArray(list).toString());
			logParam.put("reqUri", request.getRequestURI());
			
			capitalDAO.setFcmmnLog(logParam);
	}
	
	//2021.02.15 김승희
	public Map<String, Object> holydayChk2(Map<String, Object> param) throws Exception {
		
		int year  = Integer.parseInt(((String) param.get("serdate")).substring(0, 4));
	    int month = Integer.parseInt(((String) param.get("serdate")).substring(4, 6));
	    int date  = Integer.parseInt(((String) param.get("serdate")).substring(6, 8));

	    Calendar cal = Calendar.getInstance();
	    cal.set(year, month - 1, date);
	    cal.add(Calendar.DATE, -1);  

	    SimpleDateFormat dateFormatter = new SimpleDateFormat("yyyyMMdd");

		param.put("serdate", dateFormatter.format(cal.getTime()));
		
		List<Map> holyday = capitalDAO.holyday( param );
		
		boolean holyDayChk = false;
		
		if("Y".equals(holyday.get(0).get("holyparam"))){

			return holydayChk2( param );
		}else{
			
			param.put("holyDayChk",holyday.get(0).get("holyparam"));
			param.put("serdate", param.get("serdate"));
			return param;
		}
	}	
	
	@Override
	public List<Map> selectAssetListAjax6(Map<String, Object> param) throws Exception {
				
		return capitalDAO.selectAssetListAjax6( param );
	}
	
	@Override
	public List<Map> selectLoadSaveDataForReport(Map param) throws Exception {
		
		return capitalDAO.selectLoadSaveDataForReport( param );
	}
	
	@Override
	public List<Map> selectAssetListAjax7(Map<String, Object> param) throws Exception {
				
		return capitalDAO.selectAssetListAjax7( param );
	}
	
}
