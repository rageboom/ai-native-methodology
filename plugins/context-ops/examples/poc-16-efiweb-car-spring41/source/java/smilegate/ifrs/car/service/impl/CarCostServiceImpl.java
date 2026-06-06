package smilegate.ifrs.car.service.impl;

import java.util.List;
import java.util.Map;

import javax.annotation.Resource;

import org.springframework.stereotype.Service;

import egovframework.rte.psl.dataaccess.util.EgovMap;

import smilegate.ifrs.car.service.CarCostService;
import smilegate.ifrs.cmm.util.StringUtil;

@Service("carCostService")
public class CarCostServiceImpl implements CarCostService{


	@Resource(name = "carCostDAO")
	private CarCostDAO carCostDAO;

	@Override
	public List<Map> selectCarCostConfirmList(Map param) {
		return carCostDAO.selectCarCostConfirmList( param );
	}

	@Override
	public void saveConfirmList(List<Map<String, String>> list, String sessionId ) throws Exception {
		
		if( list != null && list.size() > 0 ){
			for( Map map : list ){
				map.put("sessionId", sessionId);
				carCostDAO.saveCarCostAccept( map );	
			}
		}
	}

	@Override
	public void saveCostingList(List<Map<String, String>> list, String sessionId ) throws Exception {
		
		if( list != null && list.size() > 0 ){
			for( Map map : list ){
				map.put("sessionId", sessionId);
				carCostDAO.saveCarCost( map );
				
				//비용구분 - 업무일지 작성차량
				map.put("costGubun", 1);
				
				//기존 전표번호 삭제
				carCostDAO.deleteCarCostSlip( map );
				
				//전표번호 정보 등록 시작
				map.put("carCostType", 		"G"); //유류비
				map.put("carCostSlipseqs", 	map.get("gasSlipseq"));
				carCostDAO.insertCarCostSlip( map );
				
				map.put("carCostType", 		"I"); //보험료
				map.put("carCostSlipseqs", 	map.get("insuranceSlipseq"));
				carCostDAO.insertCarCostSlip( map );
				
				map.put("carCostType", 		"R"); //수선비
				map.put("carCostSlipseqs", 	map.get("repairSlipseq"));
				carCostDAO.insertCarCostSlip( map );
				
				map.put("carCostType", 		"T"); //자동차세
				map.put("carCostSlipseqs", 	map.get("taxSlipseq"));
				carCostDAO.insertCarCostSlip( map );
				
				map.put("carCostType", 		"E"); //기타
				map.put("carCostSlipseqs", 	map.get("etcSlipseq"));
				carCostDAO.insertCarCostSlip( map );
				//전표번호 정보 등록 끝
			}
		}
		
	}

	@Override
	public List<Map> selectCarCostingList(Map param) throws Exception {
		return carCostDAO.selectCarCostingList( param );
	}

	@Override
	public List<Map> selectCarCostingCalculateList(Map param) throws Exception {
		
		List<Map> list = selectCarCostingList( param );
		
		Map result = null;
		if( list != null ){
			for( Map map : list ){
				map.put("comCd",	param.get("comCd"));
				map.put("userNm",	((String)map.get("userNm")).replace("장인*", "장인아").replace("양동*", "양동기").replace("권혁*", "권혁빈").replace("서상*", "서상봉").replace("조기*", "조기형")); //테스트용
				//map.put("userNm",	((String)map.get("userNm"))); //라이브용
				map.put("strDate",  map.get("useStrDate").toString().replace("-", ""));
				map.put("endDate", 	map.get("useEndDate").toString().replace("-", ""));
				result = carCostDAO.selectCarCostCalculate( map );
				map.put("gasCost",			result.get("gasCost"));
				map.put("insuranceCost",	result.get("insuranceCost"));
				map.put("repairCost",		result.get("repairCost"));
				map.put("taxCost",			result.get("taxCost"));
				map.put("etcCost",			result.get("etcCost"));
				map.put("gasSlipseq",		result.get("gasSlipseq"));
				map.put("insuranceSlipseq",	result.get("insuranceSlipseq"));
				map.put("repairSlipseq",	result.get("repairSlipseq"));
				map.put("taxSlipseq",		result.get("taxSlipseq"));
				map.put("etcSlipseq",		result.get("etcSlipseq"));
			}
		}
		
		return list;
	}

	@Override
	public List<Map> selectCarCostSumSystemList(Map param) throws Exception {
		return carCostDAO.selectCarCostSumSystemList( param );
	}

	@Override
	public void saveCostSumSystemList(List<Map<String, String>> list, String sessionId) throws Exception {
		if( list != null && list.size() > 0 ){
			for( Map map : list ){
				map.put("sessionId", sessionId);
				carCostDAO.updateCostSumSystem( map );	
			}
		}	
	}

	@Override
	public List<Map> selectSlipList(Map param) throws Exception {
		String[] slipSeqArr = ((String)param.get("slipSeq")).split("[,]");
		param.put("slipSeqArr",	slipSeqArr);
		return carCostDAO.selectSlipList( param );
	}

	@Override
	public Map selectCarCostingNoLogCalculate(Map param) {
		EgovMap eMap = new EgovMap();
		eMap.put("useStrDate",  	param.get("useStrDate"));
		eMap.put("useEndDate",  	param.get("useEndDate"));
		eMap.put("comCd",  			param.get("comCd"));
		eMap.put("comNm",  			param.get("comNm"));
		eMap.put("userNm",  		param.get("userNm"));
		Map result = carCostDAO.selectCarCostCalculate( eMap );
		result.put("useStrDate",  	param.get("useStrDate"));
		result.put("useEndDate",  	param.get("useEndDate"));
		result.put("comCd",  		param.get("comCd"));
		result.put("comNm",  		param.get("comNm"));
		return result;
	}

	
	@Override
	public void saveCostingNoLog(List<Map<String, String>> list, List<Map<String, String>> rList, String sessionId) throws Exception {
		
		if( list != null && list.size() > 0 ){
			
			for( Map map : list ){
				map.put("sessionId", sessionId);
				
				//현재 편집이 불가능하며 계산하기를 통해 불러온 경우에만 저장하면 되므로 등록만 진행. 업데이트는 처리X
				if( "".equals( StringUtil.nullToStr((String)map.get("idx") )) ){ 
					carCostDAO.insertCarCostNoLog( map );
					
					map.put( "costIdx",  map.get("idx") );
					
					//비용구분 - 업무일지 작성차량
					map.put("costGubun", 2);
					
					//기존 전표번호 삭제
					carCostDAO.deleteCarCostSlip( map );
					
					//전표번호 정보 등록 시작
					map.put("carCostType", 		"G"); //유류비
					map.put("carCostSlipseqs", 	map.get("gasSlipseq"));
					carCostDAO.insertCarCostSlip( map );
					
					map.put("carCostType", 		"I"); //보험료
					map.put("carCostSlipseqs", 	map.get("insuranceSlipseq"));
					carCostDAO.insertCarCostSlip( map );
					
					map.put("carCostType", 		"R"); //수선비
					map.put("carCostSlipseqs", 	map.get("repairSlipseq"));
					carCostDAO.insertCarCostSlip( map );
					
					map.put("carCostType", 		"T"); //자동차세
					map.put("carCostSlipseqs", 	map.get("taxSlipseq"));
					carCostDAO.insertCarCostSlip( map );
					
					map.put("carCostType", 		"E"); //기타
					map.put("carCostSlipseqs", 	map.get("etcSlipseq"));
					carCostDAO.insertCarCostSlip( map );
					//전표번호 정보 등록 끝
				}
			}
		}
		
		
		if( rList != null && rList.size() > 0 ){
			for( Map map : rList ){
				carCostDAO.deleteCarCostNoLog( map );
				
				map.put( "costIdx",  map.get("idx") );
				
				//비용구분 - 업무일지 작성차량
				map.put("costGubun", 2);
				
				//기존 전표번호 삭제
				carCostDAO.deleteCarCostSlip( map );
			}
		}
		
	}

	
	@Override
	public List<Map> costingNoDriveLogAjax(Map param) throws Exception {
		return carCostDAO.selectCarCostNoLog( param );
	}

	@Override
	public List<Map> selectCarCostStatementList(Map param) throws Exception {
		return carCostDAO.selectCarCostStatementList(param);
	}
}
