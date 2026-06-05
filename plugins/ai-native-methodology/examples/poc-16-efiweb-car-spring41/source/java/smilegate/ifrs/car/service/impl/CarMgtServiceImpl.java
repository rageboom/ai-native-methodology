package smilegate.ifrs.car.service.impl;

import java.text.DateFormat;
import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import javax.annotation.Resource;

import org.springframework.stereotype.Service;

import smilegate.ifrs.car.service.CarMgtService;
import smilegate.ifrs.cmm.util.StringUtil;

@Service("carMgtService")
public class CarMgtServiceImpl implements CarMgtService{

	@Resource(name = "carMgtDAO")
	private CarMgtDAO carMgtDAO;
	
	
	/* (non-Javadoc)
	 * @see smilegate.ifrs.car.service.CarMgtService#insertCar(java.util.Map)
	 */
	@Override
	public void insertCar(Map param) {
		carMgtDAO.insertCar( param );
		
		//사용자소속 정보 등록
		saveCarUserTerm( param );
	}


	/**
	 * 차량 사용자 소속 및 재직기간 정보 등록 
	 * @param param
	 */
	private void saveCarUserTerm(Map param) {
		String[] termIdxArr = (String[])param.get("termIdx_arr");
		String[] userComCdArr = (String[])param.get("usercomCd_arr");
		String[] userDeptCdArr = (String[])param.get("userdeptCd_arr");
		String[] strDateArr = (String[])param.get("strDate_arr");
		String[] endDateArr = (String[])param.get("endDate_arr");
		
		if( userComCdArr !=  null ){
			for( int i = 0; i < userComCdArr.length; i++ ){
				param.put("termIdx", 	termIdxArr[i]);
				param.put("userComCd", 	userComCdArr[i]);
				param.put("userDeptCd", userDeptCdArr[i]);
				param.put("strDate", 	strDateArr[i]);
				param.put("endDate", 	endDateArr[i]);
				
				if( "0".equals( termIdxArr[i]) ){
					carMgtDAO.insertCarUserTerm( param );
				}else{
					carMgtDAO.updateCarUserTerm( param );
				}
			}
		}
	}

	@Override
	public Map getLeaderUserId(Map param) {
		Map result = null;
		
		result = carMgtDAO.getLeaderUserIdBySec( param ); //비서인 경우 담당 임원 사번 리턴
		
		if(result.get("userId") == null) {
			result = carMgtDAO.getLeaderUserId( param ); //임원인 경우 사번 리턴
		}
		
		return result;
	}

	@Override
	public List getCarList(Map param) {
		return carMgtDAO.getCarList( param );
	}


	@Override
	public Map selectCar(Map param) {
		return carMgtDAO.getCarInfo( param );
	}


	@Override
	public void updateCar(Map param) {
		carMgtDAO.updateCar( param );
		
		String[] termIdxArr = null;
		String[] originTermIdxArr = (String[])param.get("termIdx_arr");
		
		if( originTermIdxArr == null ) termIdxArr = new String[]{"99999999"}; //임의의 값 생성 
		else termIdxArr = originTermIdxArr;
			
		//삭제할 사용자 소속 정보에 연동된 비용산출 데이터 삭제
		param.put("termIdx_arr", termIdxArr);
		carMgtDAO.deleteCarCost( param );
		
		//사용자 소속 정보 삭제
		carMgtDAO.deleteCarUserTerm( param );
		 
		
		//사용자소속 정보 등록
		param.put("termIdx_arr", originTermIdxArr);
		saveCarUserTerm( param );	
	}


	@Override
	public void deleteCar(Map param) {
		carMgtDAO.deleteCar( param );
	}


	@Override
	public List<Map> selectCarDriveList(Map param) {
		return carMgtDAO.selectCarDriveList( param );
	}



	@Override
	public void saveCarDriveRow(Map param) {
		
		DateFormat formatter;
		Date date;
		formatter = new SimpleDateFormat("yyyy-MM-dd");
		
		//삭제할 거 삭제
		String deleteIdx =  StringUtil.nvl(((String)param.get("deleteIdx")));
		if( !"".equals(deleteIdx)  ){
			String[] delArr = deleteIdx.split("[|]");
			for( String str : delArr ){
				if( !"".equals( str ) ){
					param.put("deleteIdx", str);
					carMgtDAO.deleteCarDrive( param );
				}
			}
		}
		
		String[] modeArr = 			(String[])param.get("mode_arr");
		String[] driveIdxArr = 		(String[])param.get("driveIdx_arr");
//		String[] purposeCdArr = 	(String[])param.get("purposeCd_arr");
		String[] driveDateArr = 	(String[])param.get("driveDate_arr");
		String[] userIdArr = 	(String[])param.get("userId_arr");
		String[] comCdArr = 	(String[])param.get("comCd_arr");
		String[] deptCdArr = 	(String[])param.get("deptCd_arr");
//		String[] depPointArr = 		(String[])param.get("depPoint_arr");
		String[] depAccDistArr = 	(String[])param.get("depAccDist_arr");
//		String[] arrPointArr = 		(String[])param.get("arrPoint_arr");
		String[] arrAccDistArr = 	(String[])param.get("arrAccDist_arr");
		String[] driveDistArr = 	(String[])param.get("driveDist_arr");
		String[] driveWorkDistArr = (String[])param.get("driveWorkDist_arr");
		String[] distanceArr = 		(String[])param.get("distance_arr");
		String[] remarkArr = 		(String[])param.get("remark_arr");
		
		Map map = new HashMap();
		map.put("carIdx", 	param.get("carIdx"));
		map.put("year", 	param.get("year"));
		map.put("sessionId", param.get("USER_ID") );
		map.put("totDist", param.get("totDist") );
		
		if( modeArr != null ){
//			Map map = new HashMap();
//			map.put("carIdx", 	param.get("carIdx"));
//			map.put("year", 	param.get("year"));
//			map.put("sessionId", param.get("USER_ID") );
//			map.put("totDist", param.get("totDist") );
			
			int n = 0;
			for( String str : modeArr ){
				
				try {
					
					date = (Date)formatter.parse(driveDateArr[n]);
					
					map.put("sessionId", 		param.get("sessionId"));
					map.put("driveIdx", 		driveIdxArr[n]);
//					map.put("purposeCd", 		purposeCdArr[n]);
//					map.put("driveDate", 		driveDateArr[n]);
					map.put("driveDate", 		date);
					map.put("userId", 			userIdArr[n]);
					map.put("comCd", 			comCdArr[n]);
					map.put("deptCd",			deptCdArr[n]);
//					map.put("depPoint", 		depPointArr[n]);
					map.put("depAccDist", 		depAccDistArr[n]);
//					map.put("arrPoint", 		arrPointArr[n]);
					map.put("arrAccDist", 		arrAccDistArr[n]);
					map.put("driveDist", 		driveDistArr[n]);
					map.put("driveWorkDist", 	driveWorkDistArr[n]);
					map.put("distance", 		distanceArr[n]);
					map.put("remark", 			remarkArr[n]);
					
					if( str.equals("I") ){
						carMgtDAO.insertCarDrive( map );
					}else{
						carMgtDAO.updateCarDrive( map );
					}
					
					carMgtDAO.updateCarNo( map ); //운행일지 일련번호 갱신
					//carMgtDAO.updateCarTotDist( map ); //총 주행거리 변경
					
				
				} catch (ParseException e) {
					// TODO Auto-generated catch block
					e.printStackTrace();
				}
				
				n++;
			}
		}
		
		carMgtDAO.updateCarTotDist( map ); //총 주행거리 변경

	}


	@Override
	public List<Map> selectErpDeptList(Map param) {
		return carMgtDAO.selectErpDeptList( param );
	}


	@Override
	public List<Map> selectErpComList() {
		return carMgtDAO.selectErpComList();
	}


	@Override
	public List<Map> selectCarUserTermList(Map param) {
		return carMgtDAO.selectCarUserTermList( param );
	}


	@Override
	public int selectCarUserTermCost(Map param) {
		return carMgtDAO.selectCarUserTermCost( param );
	}
	
	
}
