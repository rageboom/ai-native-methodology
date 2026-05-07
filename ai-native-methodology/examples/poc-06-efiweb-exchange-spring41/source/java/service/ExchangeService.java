package smilegate.ifrs.exchange.service;

import java.util.List;
import java.util.Map;

public interface ExchangeService {

	public List<Map> selectExchangeList(Map param) throws Exception;
	
	public void insertExchangeRateMigration(Map param) throws Exception;
	
	public List<Map> selectDayExchangeList(Map param) throws Exception;
	

	public void updateExchange(Map param) throws Exception;

	public int selectCheckExcRate(Map param);

	/**
	 * 환율조회
	 * @param param
	 * @return
	 */
	public double selectExchangeRate(Map param);

}
