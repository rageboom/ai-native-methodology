package smilegate.ifrs.capital.service;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

import javax.servlet.http.HttpServletRequest;

public interface CapitalService {

	List<Map> selectComBasicInfoListAjax(Map param) throws Exception;

	void saveComBasicInfoList(Map<String, List<Map<String, String>>> map) throws Exception;
	
	List<Map> selectCapitalBizAjax(Map param) throws Exception;
	
	List<Map> selectCapitalStdAjax(Map param) throws Exception;
	
	List<Map> insertComINSetList(Map param) throws Exception;
	List<Map> selectIfrsERPINList(Map param) throws Exception;
	List<Map> selectIfrsERPINList2(Map param) throws Exception;
	List<Map> selectERPINSetList(Map param) throws Exception;
	List<Map> insertERPINSetList(Map param) throws Exception;
	List<Map> selectCmsDepositList(Map param) throws Exception;
	List<Map> selectCMSINSetList(Map param) throws Exception;
	List<Map> selectCmsAccountListAll(Map param) throws Exception;
	List<Map> insertCMSINSetList(Map param) throws Exception;
	List<Map> selectERPINReport(Map param) throws Exception;	 
	List<Map> insertERPINList(Map param) throws Exception;
	
	List<Map> IfrsWEEKINListSave(Map param) throws Exception;
	
	List<Map> selectIfrsERPOUTList(Map param) throws Exception;
	List<Map> selectCmsWithdrawList(Map param) throws Exception;
	List<Map> selectIfrsERPMaxAjax(Map param) throws Exception;
	
	List<Map> selectAssetListAjax1(Map param) throws Exception;
	List<Map> selectAssetListAjax2(Map param) throws Exception;
	List<Map> selectAssetListAjax3(Map param) throws Exception;
	List<Map> selectAssetListAjax4(Map param) throws Exception;
	List<Map> selectAssetListAjax5(Map param) throws Exception;
	
	List<Map> insertAssetINSetList(Map param) throws Exception;
	
	List<Map> selectLoadSaveData(Map param) throws Exception;
	
	void IfrsCapitalDeleteAjax(Map param) throws Exception;
	
	void saveMail(Map param) throws Exception;

	List<Map> selectMail(Map param) throws Exception;
	List<Map> selectDeptMail(Map param) throws Exception;
	List<Map> selectDeptCd(Map param) throws Exception;
	
	List<Map> holyday(Map param) throws Exception;
	List<Map> week(Map param) throws Exception;
	
	String IfrsPreviousWeekEndDate(Map param) throws Exception;
	Map<String, Object> IfrsWeekReport1(Map param) throws Exception;
	List<Map> IfrsWeekRate(Map param) throws Exception;
	List<Map> IfrsWeekRateList(Map param) throws Exception;
	
	
	Map<String, Object> IfrsWeekReport3(Map param) throws Exception;
	List<Map> IfrsWeekReport4(Map param) throws Exception;
	List<Map> IfrsWeekReport5(Map param) throws Exception;
	List<Map> IfrsWeekReport6(Map param) throws Exception;
	List<Map> IfrsWeekReport7(Map param) throws Exception;
	void IfrsWeekReport8(Map param) throws Exception;
	List<Map> IfrsWeekReport9(Map param) throws Exception;
	List<Map> IfrsWeekReport10(Map param) throws Exception;
	void IfrsWeekReport11(Map param) throws Exception;
	List<Map> IfrsWeekReport12(Map param) throws Exception;
	List<Map> IfrsWeekReport13(Map param) throws Exception;
	List<Map> IfrsWeekReport14(Map param) throws Exception;
	
	void insertSendMail(Map param) throws Exception;
	
	List<Map> mailsendlogAjax(Map param) throws Exception;
	
	public String selectCapitalVrify(Map<String, Object> param) throws Exception;
	
	public void insertCapitalVrify (Map<String, Object> param) throws Exception;

	List<Map> getComment(Map param) throws Exception;
	
	public List<Map<String, Object>> selectCapitalCompanyList() throws Exception;
	
	public void insertCapitalHistory (Map<String, Object> param) throws Exception;
	
	public void deleteCapitalHistory (Map<String, Object> param) throws Exception;
	
	
	public List<Map> selectCompanyGraphSetting() throws Exception;	
	public void saveCompanyGraphSetting(String userId, Map<String, Object> param) throws Exception;
	public void deleteCompanyGraphSetting(Map param) throws Exception;
	/**
	 * erp법인 여부 체크 :E(ERP사용법인), N(ERP미사용법인) 
	 * @param param
	 * @return
	 * @throws Exception
	 */
	public String selectErpYn(Map param) throws Exception;
	/**
	 * ERP 미사용법인일 경우 최근 저장일 리턴
	 * @param param
	 * @return
	 * @throws Exception
	 */
	public String selectLastSaveSdate(Map param) throws Exception;
	
	/**
	 * ERP 법인이 아닌 법인의 자금일보 저장 데이터 호출(마감->기초)
	 * @param param
	 * @return
	 * @throws Exception
	 */
	List<Map> selectLoadNonErpSaveData(Map param) throws Exception;
	
	public void setFcmmnLog (String level, List<Map> list, HttpServletRequest request) throws Exception;
	
	Map<String, Object> holydayChk2(Map<String, Object> param) throws Exception;
	
	List<Map> selectAssetListAjax6(Map<String, Object> param) throws Exception;
	
	List<Map> selectLoadSaveDataForReport(Map param) throws Exception;
	
	List<Map> selectAssetListAjax7(Map<String, Object> param) throws Exception;
}
