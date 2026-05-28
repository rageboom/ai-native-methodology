package smilegate.ifrs.car.service.impl;

import java.util.List;
import java.util.Map;

import org.springframework.stereotype.Repository;

import smilegate.ifrs.egov.service.impl.EgovComAbstractDAO;

@Repository("carMgtDAO")
public class CarMgtDAO extends EgovComAbstractDAO {

	
	/**
	 * 차량등록
	 * @param param
	 */
	public void insertCar(Map param) {
		insert("CarMgtDAO.insertCar", param );
	}

	/**
	 * 비서인지 조회 - 비서라면 담당 임원 정보 조회
	 * @param param
	 * @return
	 */
	public Map getLeaderUserIdBySec(Map param) {
		return (Map)select("CarMgtDAO.selectLeaderUserIdBySec", param );
	}
	
	/**
	 * 임원인지 조회
	 * @param param
	 * @return
	 */
	public Map getLeaderUserId(Map param) {
		return (Map)select("CarMgtDAO.selectLeaderUserId", param );
	}
	
	/**
	 * 차량목록
	 * @param param
	 * @return
	 */
	public List getCarList(Map param) {
		return list("CarMgtDAO.selectCarList", param );
	}


	/**
	 * 차량 정보 조회
	 * @param param
	 * @return
	 */
	public Map getCarInfo(Map param) {
		return (Map)select("CarMgtDAO.selectCarInfo", param );
	}


	/**
	 * 차량정보 수정
	 * @param param
	 */
	public void updateCar(Map param) {
		update("CarMgtDAO.updateCar", param);
	}


	/**
	 * 차량정보 삭제
	 * @param param
	 */
	public void deleteCar(Map param) {
		delete("CarMgtDAO.deleteCar", param);
	}


	/**
	 * 차량운행정보 조회
	 * @param param
	 * @return
	 */
	public List<Map> selectCarDriveList(Map param) {
		return (List<Map>) list("CarMgtDAO.selectCarDriveList", param );
	}


	/**
	 * 차량운행정보 등록
	 * @param map
	 */
	public void insertCarDrive(Map map) {
		insert("CarMgtDAO.insertCarDrive", map);
	}
	
	
	/**
	 * 차량운행정보 수정
	 * @param map
	 */
	public void updateCarDrive(Map map) {
		insert("CarMgtDAO.updateCarDrive", map);
	}


	/**
	 * 운행일지 일련번호 갱신
	 * @param map
	 */
	public void updateCarNo(Map map) {
		update("CarMgtDAO.updateCarNo", map);	
	}
	
	/**
	 * 총 주행거리 변경
	 * @param map
	 */
	public void updateCarTotDist(Map map) {
		update("CarMgtDAO.updateCarTotDist", map);	
	}


	/**
	 * 운행일지 삭제
	 * @param param
	 */
	public void deleteCarDrive(Map param) {
		delete("CarMgtDAO.deleteCarDrive", param);
	}


	/**
	 * ERP 부서 정보 조회
	 * @param param
	 * @return
	 */
	public List<Map> selectErpDeptList(Map param) {
		// TODO Auto-generated method stub
		return (List<Map>) list("CarMgtDAO.selectErpDeptList", param);
	}


	public List<Map> selectErpComList() {
		return (List<Map>) list("CarMgtDAO.selectErpComList", null);
	}


	/**
	 * 차량 사용자 소속 정보 등록
	 * @param param
	 */
	public void insertCarUserTerm(Map param) {
		insert( "CarMgtDAO.insertCarUserTerm", param );
	}


	/**
	 * 차량 사용자 소속 목록 조회
	 * @param param
	 * @return
	 */
	public List<Map> selectCarUserTermList(Map param) {
		return (List<Map>) list("CarMgtDAO.selectCarUserTermList", param);
	}


	/**
	 * 차량 사용자 소속정보 삭제
	 * @param param
	 */
	public void deleteCarUserTerm(Map param) {
		delete("CarMgtDAO.deleteCarUserTerm", param  );
	}


	/**
	 * 차량 사용자소속법인 수정
	 * @param param
	 */
	public void updateCarUserTerm(Map param) {
		update("CarMgtDAO.updateCarUserTerm", param  );
	}


	/**
	 * 삭제할 사용자 소속 정보에 연동된 비용산출 데이터 삭제
	 * @param param
	 */
	public void deleteCarCost(Map param) {
		delete("CarMgtDAO.deleteCarCost", param  );
	}


	/**
	 * @param param
	 * @return
	 */
	public int selectCarUserTermCost(Map param) {
		return (Integer)select("CarMgtDAO.selectCarUserTermCost", param );
	}
	
}
