package smilegate.ifrs.capital.service.impl;

import java.util.List;
import java.util.Map;

import org.springframework.stereotype.Repository;

import smilegate.ifrs.egov.service.impl.EgovCmsAbstractDAO;

@Repository("cmsDAO")
public class CmsDAO  extends EgovCmsAbstractDAO {

	public List<Map> selectCmsDepositList(Map param) {
		return (List<Map>) list("CmsDAO.selectCmsDepositList", param );
	}
	
	public List<Map> selectCmsAccountListAll(Map param) {
		return (List<Map>) list("CmsDAO.selectCmsAccountListAll", param );
	}	

	public List<Map> insertCMSINSetList(Map param) {
		return (List<Map>) list("CmsDAO.insertCMSINSetList", param );
	}
	
	public List<Map> selectCmsWithdrawList(Map param) {
		return (List<Map>) list("CmsDAO.selectCmsWithdrawList", param );
	}
	
	public List<Map> selectAssetListAjax2(Map param) {
		return (List<Map>) list("CmsDAO.selectAssetListAjax2", param );
	}	
	
	public List<Map> selectAssetListAjax5(Map param) {
		return (List<Map>) list("CmsDAO.selectAssetListAjax5", param );
	}	
	
}
