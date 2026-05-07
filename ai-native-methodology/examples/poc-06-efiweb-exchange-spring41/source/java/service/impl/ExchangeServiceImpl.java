package smilegate.ifrs.exchange.service.impl;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import javax.annotation.Resource;

import org.springframework.stereotype.Service;

import smilegate.ifrs.exchange.service.ExchangeService;

@Service("exchangeService")
public class ExchangeServiceImpl implements ExchangeService{


	@Resource(name = "exchangeDAO")
	private ExchangeDAO exchangeDAO;
	
	@Override
	public List<Map> selectExchangeList(Map param) throws Exception {

		return exchangeDAO.selectExchangeList( param );
	}
	
	@Override
	public void insertExchangeRateMigration(Map param) throws Exception {
		exchangeDAO.insertExchangeRateMigration( param );
	}
	
	@Override
	public List<Map> selectDayExchangeList(Map param) throws Exception {
		return exchangeDAO.selectDayExchangeList( param );
	}

	
	@Override
	public void updateExchange(Map param) throws Exception {
		
		Map map = new HashMap();
		
		String[] currCdArr 	= (String[])param.get("currCd_arr");
		String[] gubunArr 	= (String[])param.get("gubun_arr");
		String[] mon1Arr 	= (String[])param.get("mon1_arr");
		String[] mon2Arr 	= (String[])param.get("mon2_arr");
		String[] mon3Arr 	= (String[])param.get("mon3_arr");
		String[] mon4Arr 	= (String[])param.get("mon4_arr");
		String[] mon5Arr 	= (String[])param.get("mon5_arr");
		String[] mon6Arr 	= (String[])param.get("mon6_arr");
		String[] mon7Arr 	= (String[])param.get("mon7_arr");
		String[] mon8Arr 	= (String[])param.get("mon8_arr");
		String[] mon9Arr 	= (String[])param.get("mon9_arr");
		String[] mon10Arr 	= (String[])param.get("mon10_arr");
		String[] mon11Arr 	= (String[])param.get("mon11_arr");
		String[] mon12Arr 	= (String[])param.get("mon12_arr");
				
		for( int i=0; i < currCdArr.length; i++ ){
			map.put("year", 		param.get("year"));
			map.put("currCd",		currCdArr[i]);
			map.put("gubun",		gubunArr[i]);
			map.put("mon1",			mon1Arr[i].replaceAll(",", ""));
			map.put("mon2",			mon2Arr[i].replaceAll(",", ""));
			map.put("mon3",			mon3Arr[i].replaceAll(",", ""));
			map.put("mon4",			mon4Arr[i].replaceAll(",", ""));
			map.put("mon5",			mon5Arr[i].replaceAll(",", ""));
			map.put("mon6",			mon6Arr[i].replaceAll(",", ""));
			map.put("mon7",			mon7Arr[i].replaceAll(",", ""));
			map.put("mon8",			mon8Arr[i].replaceAll(",", ""));
			map.put("mon9",			mon9Arr[i].replaceAll(",", ""));
			map.put("mon10",		mon10Arr[i].replaceAll(",", ""));
			map.put("mon11",		mon11Arr[i].replaceAll(",", ""));
			map.put("mon12",		mon12Arr[i].replaceAll(",", ""));
			
			exchangeDAO.updateExchange( map );	
		}
	}


	@Override
	public int selectCheckExcRate(Map param) {
		return exchangeDAO.selectCheckExcRate(param);
	}


	@Override
	public double selectExchangeRate(Map param) {
		
		if( "KRW".equals(param.get("currCd")) ) return 1;
		else return exchangeDAO.selectExchangeRate(param);
	}

}
