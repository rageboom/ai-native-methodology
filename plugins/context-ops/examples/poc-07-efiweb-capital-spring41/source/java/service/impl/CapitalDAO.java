package smilegate.ifrs.capital.service.impl;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.stereotype.Repository;

import smilegate.ifrs.egov.service.impl.EgovComAbstractDAO;

@Repository("capitalDAO")
public class CapitalDAO  extends EgovComAbstractDAO {

	public List<Map> selectCapitalBizAjax(Map param) throws Exception{
		return (List<Map>) list("CapitalDAO.selectCapitalBizAjax", param );
	}	
	
	public List<Map> selectComBasicInfoList(Map param) throws Exception{
		return (List<Map>) list("CapitalDAO.selectComBasicInfoList", param );
	}

	public void updateComCapitalInfo(Map<String, String> param) throws Exception{
		update("CapitalDAO.updateComCapitalInfo", param);
	}

	public List<Map> selectErpAccountList(Map param) throws Exception{
		return (List<Map>) list("CapitalDAO.selectErpAccountList", param );
	}	
	
	public List<Map> selectCapitalStdAjax(Map param) throws Exception{
		return (List<Map>) list("CapitalDAO.selectCapitalStdAjax", param );
	}	
	
	public List<Map> insertComINSetList(Map param) throws Exception{
		return (List<Map>) list("CapitalDAO.insertComINSetList", param );
	}
	
	public List<Map> selectIfrsERPINList(Map param) throws Exception{
		return (List<Map>) list("CapitalDAO.selectIfrsERPINList", param );
	}
	
	public List<Map> selectIfrsERPINList2(Map param) throws Exception{
		return (List<Map>) list("CapitalDAO.selectIfrsERPINList2", param );
	}	
	

	
	public List<Map> selectERPINSetList(Map param) throws Exception{
		return (List<Map>) list("CapitalDAO.selectERPINSetList", param );
	}	
	
	public List<Map> insertERPINSetList(Map param) throws Exception{
		return (List<Map>) list("CapitalDAO.insertERPINSetList", param );
	}	
	
	public List<Map> selectCMSINSetList(Map param) throws Exception{
		return (List<Map>) list("CapitalDAO.selectCMSINSetList", param );
	}	
	
	public List<Map> selectERPINReport(Map param) throws Exception{
		return (List<Map>) list("CapitalDAO.selectERPINReport", param );
	}	
	
	public List<Map> insertERPINList(Map param) throws Exception{
		return (List<Map>) list("CapitalDAO.insertERPINList", param );
	}
	
	public List<Map> IfrsWEEKINListSave(Map param) throws Exception{
		return (List<Map>) list("CapitalDAO.IfrsWEEKINListSave", param );
	}	
	
	public List<Map> selectIfrsERPOUTList(Map param) throws Exception{
		return (List<Map>) list("CapitalDAO.selectIfrsERPOUTList", param );
	}
	
	public List<Map> selectIfrsERPMaxAjax(Map param) throws Exception{
		return (List<Map>) list("CapitalDAO.selectIfrsERPMaxAjax", param );
	}	
	
	public List<Map> selectAssetListAjax1(Map param) throws Exception{
		return (List<Map>) list("CapitalDAO.selectAssetListAjax1", param );
	}	
	
	public List<Map> selectAssetListAjax3(Map param) throws Exception{
		return (List<Map>) list("CapitalDAO.selectAssetListAjax3", param );
	}		
	
	public List<Map> selectAssetListAjax4(Map param) throws Exception{
		return (List<Map>) list("CapitalDAO.selectAssetListAjax4", param );
	}		
	
	public List<Map> insertAssetINSetList(Map param) throws Exception{
		return (List<Map>) list("CapitalDAO.insertAssetINSetList", param );
	}	
	
	public List<Map> selectLoadSaveData(Map param) throws Exception{
		return (List<Map>) list("CapitalDAO.selectLoadSaveData", param );
	}
	

	public void IfrsCapitalDeleteAjax(Map param) {
		delete("CapitalDAO.IfrsCapitalDeleteAjax", param);
	}	
	
	public void saveMail(Map param) {
		insert("CapitalDAO.saveMail", param);
	}	
	
	public List<Map> selectMail(Map param) throws Exception{
		return (List<Map>) list("CapitalDAO.selectMail", param );
	}	
	
	public List<Map> selectDeptMail(Map param) throws Exception{
		return (List<Map>) list("CapitalDAO.selectDeptMail", param );
	}
	
	public List<Map> selectDeptCd(Map param) throws Exception{
		return (List<Map>) list("CapitalDAO.selectDeptCd", param );
	}	
	
	public List<Map> week(Map param) throws Exception{
		return (List<Map>) list("CapitalDAO.week", param );
	}	
	
	public String IfrsPreviousWeekEndDate(Map param) throws Exception{
		return (String) select("CapitalDAO.IfrsPreviousWeekEndDate", param );
	}
	
	public List<Map> IfrsWeekReport1(Map param) throws Exception{
		return (List<Map>) list("CapitalDAO.IfrsWeekReport1", param );
	}
	
	public void insertCapitalComment(Map param) {
		insert("CapitalDAO.insertCapitalComment", param);
	}	
	
	public List<Map> IfrsWeekRate(Map param) throws Exception{		
		return (List<Map>) list("CapitalDAO.IfrsWeekRate", param );
	}
	
	public List<Map> IfrsWeekRateList(Map param) throws Exception{
		return (List<Map>) list("CapitalDAO.IfrsWeekRateList", param );
	}		
	
	public Map<String, Object> IfrsWeekReport2(Map param) throws Exception{
		return (Map<String, Object>) select("CapitalDAO.IfrsWeekReport2", param );
	}		


	public List<String> weekList(Map param) throws Exception{
		return (List<String>) list("CapitalDAO.weekList", param );
	}		
	
	public List<Map> IfrsWeekReport3(Map param) throws Exception{
		return (List<Map>) list("CapitalDAO.IfrsWeekReport3", param );
	}		
	
	public List<Map> IfrsWeekReport4(Map param) throws Exception{
		return (List<Map>) list("CapitalDAO.IfrsWeekReport4", param );
	}
	
	public Map<String, Object> IfrsWeekReportCms(Map param) throws Exception{
		return (Map<String, Object>) select("CapitalDAO.IfrsWeekReportCms", param );
	}
	
	public List<Map> IfrsWeekReport5(Map param) throws Exception{
		return (List<Map>) list("CapitalDAO.IfrsWeekReport5", param );
	}		
	
	public List<Map> IfrsWeekReport6(Map param) throws Exception{
		return (List<Map>) list("CapitalDAO.IfrsWeekReport6", param );
	}	
	
	public List<Map> IfrsWeekReport7(Map param) throws Exception{
		return (List<Map>) list("CapitalDAO.IfrsWeekReport7", param );
	}		
	
	public void IfrsWeekReport8(Map param) {
		insert("CapitalDAO.IfrsWeekReport8", param);
	}		
	
	public List<Map> IfrsWeekReport9(Map param) throws Exception{
		return (List<Map>) list("CapitalDAO.IfrsWeekReport9", param );
	}		
	
	public List<Map> IfrsWeekReport10(Map param) throws Exception{
		return (List<Map>) list("CapitalDAO.IfrsWeekReport10", param );
	}	
	
	public void IfrsWeekReport11(Map param) {
		insert("CapitalDAO.IfrsWeekReport11", param);
	}		
	
	public List<Map> IfrsWeekReport12(Map param) throws Exception{
		return (List<Map>) list("CapitalDAO.IfrsWeekReport12", param );
	}	
	
	public List<Map> IfrsWeekReport13(Map param) throws Exception{
		return (List<Map>) list("CapitalDAO.IfrsWeekReport13", param );
	}	
	
	public List<Map> IfrsWeekReport14(Map param) throws Exception{
		return (List<Map>) list("CapitalDAO.IfrsWeekReport14", param );
	}		
		
	public List<Map> holyday(Map param) throws Exception{
		return (List<Map>) list("CapitalDAO.holyday", param );
	}		
	
	public void insertSendMail(Map param) {
		insert("CapitalDAO.insertSendMail", param);
	}		
	
	public List<Map> mailsendlogAjax(Map param) throws Exception{
		return (List<Map>) list("CapitalDAO.mailsendlogAjax", param );
	}		

	public String selectCapitalVrify(Map<String, Object> param) throws Exception{
		return (String)select("CapitalDAO.selectCapitalVrify", param);
	}		

	public void insertCapitalVrify(Map<String, Object> param) {
		insert("CapitalDAO.insertCapitalVrify", param);
	}

	public List<Map> getComment(Map param) throws Exception {
		return (List<Map>) list("CapitalDAO.getComment", param );
	}
	
	public List<Map<String, Object>> selectCapitalCompanyList() throws Exception{
		return (List<Map<String, Object>>) list("CapitalDAO.selectCapitalCompanyList", null);
	}

	public List<Map<String, Object>> selectDayExchangeList(Map param) throws Exception{
		return (List<Map<String, Object>>) list("CapitalDAO.selectDayExchangeList", param);
	}

	public List<Map<String, Object>> selectCapitalHistory(Map param) throws Exception{
		return (List<Map<String, Object>>) list("CapitalDAO.selectCapitalHistory", param);
	}
	
	public void insertCapitalHistory(Map<String, Object> param) throws Exception{
		insert("CapitalDAO.insertCapitalHistory", param);
	}
	
	public void updateCapitalHistory(Map<String, Object> param) throws Exception{
		update("CapitalDAO.updateCapitalHistory", param);
	}
	
	public void deleteCapitalHistory(Map<String, Object> param) throws Exception{
		update("CapitalDAO.deleteCapitalHistory", param);
	}
	
	public void deleteUserSet(Map<String, Object> param) throws Exception{
		delete("CapitalDAO.deleteUserSet", param);
	}
	
	
	
	public List<Map> selectCompanyGraphSetting(Map<String, Object> param) throws Exception{
		return (List<Map>) list("CapitalDAO.selectCompanyGraphSetting", param);
	}
	
	public void insertCompanyGraphSetting(Map<String, Object> param) throws Exception{
		insert("CapitalDAO.insertCompanyGraphSetting", param);
	}
	
	public void updateCompanyGraphSetting(Map<String, Object> param) throws Exception{
		update("CapitalDAO.updateCompanyGraphSetting", param);
	}
	
	public void deleteCompanyGraphSetting(Map<String, Object> param) throws Exception{
		update("CapitalDAO.deleteCompanyGraphSetting", param);
	}
	public String selectErpYn(Map param) throws Exception{
		return (String)select("CapitalDAO.selectErpYn", param );
	}	
	public String selectLastSaveSdate(Map param) throws Exception{
		return (String)select("CapitalDAO.selectLastSaveSdate", param );
	}	
	public List<Map> selectLoadNonErpSaveData(Map param) throws Exception{
		return (List<Map>) list("CapitalDAO.selectLoadNonErpSaveData", param );
	}
	public void setFcmmnLog(Map<String, String> param) throws Exception{
		insert("CapitalDAO.setFcmmnLog", param);
	}
	
	public List<Map> selectAssetListAjax6(Map param) throws Exception {
		
		return (List<Map>) list("CapitalDAO.selectAssetListAjax6", param );
	}
	
	public List<Map> selectLoadSaveDataForReport(Map param) throws Exception {
		
		return (List<Map>) list("CapitalDAO.selectLoadSaveDataForReport", param );
	}
	
	public List<Map> selectAssetListAjax7(Map param) throws Exception {
		
		return (List<Map>) list("CapitalDAO.selectAssetListAjax7", param );
	}
}
