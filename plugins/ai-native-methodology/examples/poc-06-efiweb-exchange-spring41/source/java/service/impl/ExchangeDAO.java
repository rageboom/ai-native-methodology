package smilegate.ifrs.exchange.service.impl;

import java.util.List;
import java.util.Map;

import org.springframework.stereotype.Repository;

import smilegate.ifrs.egov.service.impl.EgovComAbstractDAO;

@Repository("exchangeDAO")
public class ExchangeDAO extends EgovComAbstractDAO {

	public List<Map> selectExchangeList(Map param) throws Exception{
		return (List<Map>)list( "ExchangeDAO.selectExchangeList",  param);
	}
	
	public void insertExchangeRateMigration(Map map) throws Exception{
		update("ExchangeDAO.insertExchangeRateMigration", map );		
	}
	
	public List<Map> selectDayExchangeList(Map param) throws Exception{
		return (List<Map>)list( "ExchangeDAO.selectDayExchangeList",  param);
	}
	
	
	

	public void updateExchange(Map map) throws Exception{
		update("ExchangeDAO.updateExchange", map );		
	}



	/**
	 * 해당 통화, 해당월에 대한 기말, 평균 환율 등록되어 있는지 체크 
	 * @param param
	 * @return
	 */
	public int selectCheckExcRate(Map param) {
		return (Integer)select("ExchangeDAO.selectCheckExcRate", param);
	}


	/**
	 * 환율 조회
	 * @param param
	 * @return
	 */
	public double selectExchangeRate(Map param) {
		Object rate = select("ExchangeDAO.selectExchangeRate", param);
		if (null == rate) {
			return 0;
		} 
		return (Double) rate;
	}

}