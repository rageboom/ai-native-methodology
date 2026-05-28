package smilegate.ifrs.car.service;

import java.util.List;
import java.util.Map;

public interface CarMgtService {

	
	/**
	 * 차량등록
	 * @param param
	 */
	void insertCar(Map param);

	/**
	 * 로그인 한 사람이 비서나 임원일 경우 임원은 사번을 조회
	 * @param param
	 * @return
	 */
	Map getLeaderUserId(Map param);
	
	/**
	 * 차량 목록
	 * @param param
	 * @return
	 */
	List getCarList(Map param);


	/**
	 * @param param
	 * @return
	 */
	Map selectCar(Map param);


	/**
	 * 차량수정
	 * @param param
	 */
	void updateCar(Map param);


	/**
	 * 차량삭제
	 * @param param
	 */
	void deleteCar(Map param);

	
	/**
	 * 차량운행정보 조회
	 * @param param
	 * @return
	 */
	List<Map> selectCarDriveList(Map param);




	/**
	 * 운행일지 정보 저장
	 * @param param
	 */
	void saveCarDriveRow(Map param);


	/**
	 * ERP 부서 정보 조회
	 * @param param
	 * @return
	 */
	List<Map> selectErpDeptList(Map param);

	
	/**
	 * ERP 법인 정보 조회
	 * @return
	 */
	List<Map> selectErpComList();


	
	/**
	 * 차량 사용자 소속 목록 조회
	 * @param param
	 * @return
	 */
	List<Map> selectCarUserTermList(Map param);


	/**
	 * 해당 내역에 대한 비용산출 여부 조회
	 * @param param
	 * @return
	 */
	int selectCarUserTermCost(Map param);

}
