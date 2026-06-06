package smilegate.ifrs.car.service;

import java.util.List;
import java.util.Map;

public interface CarCostService {

	List<Map> selectCarCostConfirmList(Map param);

	void saveConfirmList(List<Map<String, String>> list, String sessionId) throws Exception;

	/**
	 * 비용산출 화면 저장
	 * @param list
	 * @throws Exception
	 */
	void saveCostingList(List<Map<String, String>> list, String sessionId) throws Exception;

	/**
	 *  비용산출 화면 목록 조회
	 * @param param
	 * @return
	 * @throws Exception
	 */
	List<Map> selectCarCostingList(Map param) throws Exception;

	
	/**
	 * ERP 데이터를 연동해 비용산출
	 * @param param
	 * @return
	 * @throws Exception
	 */
	List<Map> selectCarCostingCalculateList(Map param) throws Exception;

	
	/**
	 * 업무용승용차 명세서 확인화면
	 * @param param
	 * @return
	 */
	List<Map> selectCarCostSumSystemList(Map param) throws Exception;

	/**
	 * 명세서 확인 목록 저장
	 * @param list
	 * @param string
	 * @throws Exception
	 */
	void saveCostSumSystemList(List<Map<String, String>> list, String string) throws Exception;

	List<Map> selectSlipList(Map param) throws Exception;

	Map selectCarCostingNoLogCalculate(Map param);

	
	/**
	 * 업무일지 미작성 차량비용 산출 화면 저장
	 * @param list
	 * @param string
	 * @throws Exception
	 */
	void saveCostingNoLog(List<Map<String, String>> list, List<Map<String, String>> rList, String string) throws Exception;

	
	/**
	 * @param param
	 * @return
	 * @throws Exception
	 */
	List<Map> costingNoDriveLogAjax(Map param) throws Exception;

	List<Map> selectCarCostStatementList(Map param) throws Exception;
	

}
