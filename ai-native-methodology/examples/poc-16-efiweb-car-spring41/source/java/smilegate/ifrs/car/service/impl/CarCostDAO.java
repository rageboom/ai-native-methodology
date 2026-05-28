package smilegate.ifrs.car.service.impl;

import java.util.List;
import java.util.Map;

import org.springframework.stereotype.Repository;

import smilegate.ifrs.egov.service.impl.EgovComAbstractDAO;

@Repository("carCostDAO")
public class CarCostDAO extends EgovComAbstractDAO {

	public List<Map> selectCarCostConfirmList(Map param) {
		return (List<Map>) list("CarCostDAO.selectCarCostConfirmList", param );
	}

	/**
	 * 비용귀속 내역 저장
	 * @param map
	 */
	public void saveCarCostAccept(Map map) {
		update("CarCostDAO.saveCarCostAccept", map);
	}

	/**
	 * 비용산출 내역 저장
	 * @param map
	 */
	public void saveCarCost(Map map) throws Exception{
		update("CarCostDAO.saveCarCost", map);
	}
	

	/**
	 * 비용산출 내역 조회
	 * @param param
	 * @return
	 */
	public List<Map> selectCarCostingList(Map param) {
		return (List<Map>) list("CarCostDAO.selectCarCostingList", param );
	}

	
	public List<Map> selectCarCostingCalculateList(Map param) {
		return (List<Map>) list("CarCostDAO.selectCarCostingCalculateList", param );
	}

	/**
	 * 명세서 확인 목록 조회
	 * @param param
	 * @return
	 */
	public List<Map> selectCarCostSumSystemList(Map param) {
		return (List<Map>) list("CarCostDAO.selectCarCostSumSystemList", param );
	}

	
	/**
	 * 업무용 명세서 확인 화면 저장(감가사
	 * @param map
	 */
	public void updateCostSumSystem(Map map) {
		update("CarCostDAO.updateCostSumSystem", map);
	}

	public List<Map> selectSlipList(Map param) {
		return (List<Map>) list("CarCostDAO.selectCarCostSlipList", param );
	}

	
	public Map selectCarCostCalculate(Map map) {
		return (Map)select("CarCostDAO.selectCarCostCalculate", map);
	}

	
	/**
	 * 전표번호 정보 삭제
	 * @param map
	 */
	public void deleteCarCostSlip(Map map) {
		delete("CarCostDAO.deleteCarCostSlip", map);
	}

	
	/**
	 * 전표번호 정보 등록
	 * @param map
	 */
	public void insertCarCostSlip(Map map) {
		insert("CarCostDAO.insertCarCostSlip", map);
	}

	public void insertCarCostNoLog(Map map) {
		insert("CarCostDAO.insertCarCostNoLog", map);
	}

	public List<Map> selectCarCostNoLog(Map param) {
		return (List<Map>) list("CarCostDAO.selectCarCostNoLog", param );
	}

	
	public void deleteCarCostNoLog(Map map) {
		delete("CarCostDAO.deleteCarCostNoLog", map);
	}

	public List<Map> selectCarCostStatementList(Map param) {
		return (List<Map>) list("CarCostDAO.selectCarCostStatementList", param );
	}
}

