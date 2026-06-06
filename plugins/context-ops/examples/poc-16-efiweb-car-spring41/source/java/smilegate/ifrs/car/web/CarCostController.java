package smilegate.ifrs.car.web;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import javax.annotation.Resource;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.springframework.stereotype.Controller;
import org.springframework.ui.ModelMap;
import org.springframework.web.bind.annotation.RequestMapping;

import com.google.gson.*;
import com.google.gson.reflect.TypeToken;

import smilegate.ifrs.car.service.CarCostService;
import smilegate.ifrs.car.service.CarMgtService;
import smilegate.ifrs.cmm.util.DateUtil;
import smilegate.ifrs.cmm.util.IfrsUtil;
import smilegate.ifrs.cmm.util.StringUtil;
import smilegate.ifrs.common.service.CommonService;
import smilegate.ifrs.connect.service.ConnectService;

@Controller
@RequestMapping(value = "/ifrs/car/cost")
public class CarCostController {

	@Resource(name = "commonService")
	private CommonService commonService;
	
	@Resource(name = "carCostService")
	private CarCostService carCostService;
	
	@Resource(name = "carMgtService")
	private CarMgtService carMgtService;
	
	@Resource(name = "connectService")
	private ConnectService connectService;
	
	/**
	 * 비용귀속확인목록
	 * @param request
	 * @param response
	 * @param model
	 * @return
	 * @throws Exception
	 */
	@RequestMapping(value = "/confirmList")
	public String carCostConfirm( HttpServletRequest request, HttpServletResponse response, ModelMap model) throws Exception {
			
		Map param = IfrsUtil.parameterToHm(request);
		
		List<Map> erpComList = carMgtService.selectErpComList();
		
		//비용인정여부 코드 가져오기
		param.put("codeType", "costAccept");
		List<Map> costAcceptList = commonService.getCodeList(param); 

		model.addAttribute("erpComList", 	 IfrsUtil.ListToJsonArray( erpComList ) );
		model.addAttribute("costAcceptList", IfrsUtil.ListToJsonArray( costAcceptList ) );
		
		return "car/carCostConfirm";
	}
	
	
	/**
	 * 비용귀속확인 목록 AJAX
	 * @param request
	 * @param response
	 * @param model
	 * @return
	 * @throws Exception
	 */
	@RequestMapping(value = "/confirmListAjax")
	public String carCostConfirmAjax( HttpServletRequest request, HttpServletResponse response, ModelMap model) throws Exception {
			
		Map param = IfrsUtil.parameterToHm(request);
		
		model.addAttribute("result",   carCostService.selectCarCostConfirmList( param ) );
		
		return "jsonView";
	}
	
	
	
	/**
	 * 
	 * @param request
	 * @param response
	 * @param model
	 * @return
	 * @throws Exception
	 */
	@RequestMapping(value = "/saveConfirmList")
	public String saveConfirmList( HttpServletRequest request, HttpServletResponse response, ModelMap model) throws Exception {
		
		Map carUserMap = IfrsUtil.getCarSession(request); //세션 정보
		
		String jsonString = request.getParameter("jsonString");

		Gson gson = new Gson();
		System.out.println("@@@" +  jsonString  );
		Map<String, List<Map<String, String>>> map = gson.fromJson(jsonString,  new TypeToken<Map<String, List<Map<String, String>>>>(){}.getType() );

		List<Map<String, String>> list = map.get("update"); //수정된 내역 가져오기
		
		//System.out.println( "list의 사이즈===============" + list.size()  + "~~" + list.get(0).toString());
		
		carCostService.saveConfirmList( list, (String)carUserMap.get("LOGON_ID") );
		
		model.addAttribute("result", "success");
		
		return "jsonView";
	}
	
	
	/**
	 * 업무용승용차 명세서 확인 화면
	 * @param request
	 * @param response
	 * @param model
	 * @return
	 * @throws Exception
	 */
	@RequestMapping(value = "/carCostSumSystem")
	public String carCostSumSystem( HttpServletRequest request, HttpServletResponse response, ModelMap model) throws Exception {
		
		Map param = IfrsUtil.parameterToHm(request);
		
		param.put("codeType", "rentType");
		List<Map> rentTypeList = commonService.getCodeList(param); 
		
		model.addAttribute("rentTypeList", IfrsUtil.ListToJsonArray( rentTypeList ) );
		
		List<Map> erpComList = carMgtService.selectErpComList();
		model.addAttribute("companyList", erpComList);
		
		return "car/carCostSumSystem";
	}
	
	
	/**
	 * 업무용승용차 명세서 - 데이터 불러오기 AJAX
	 * @param request
	 * @param response
	 * @param model
	 * @return
	 * @throws Exception
	 */
	@RequestMapping(value = "/carCostSumSystemAjax")
	public String carCostSumSystemAjax( HttpServletRequest request, HttpServletResponse response, ModelMap model) throws Exception {
			
		Map param = IfrsUtil.parameterToHm(request);
		
		model.addAttribute("result",   carCostService.selectCarCostSumSystemList( param ) );
		
		return "jsonView";
	}
	
	
	/**
	 * 업무용승용차 명세서 확인 목록 AJAX
	 * @param request
	 * @param response
	 * @param model
	 * @return
	 * @throws Exception
	 */
	@RequestMapping(value = "/carCostStatementListAjax")
	public String carCostStatementListAjax( HttpServletRequest request, HttpServletResponse response, ModelMap model) throws Exception {
			
		Map param = IfrsUtil.parameterToHm(request);
		
		model.addAttribute("result",   carCostService.selectCarCostStatementList( param ) );
		
		return "jsonView";
	}
	
	
	
	/**
	 * 업무일지 미작성 차량비용화면
	 * @param request
	 * @param response
	 * @param model
	 * @return
	 * @throws Exception
	 */
	@RequestMapping(value = "/costingNoDriveLog")
	public String costingNoDriveLog( HttpServletRequest request, HttpServletResponse response, ModelMap model) throws Exception {
		
		Map param = IfrsUtil.parameterToHm(request);
		
		List<Map> erpComList = carMgtService.selectErpComList();
		model.addAttribute("companyList", erpComList);
		
		model.addAttribute("today", DateUtil.getTodayString("yyyy-MM-dd"));
		
		return "car/carCostingNoDriveLog";
	}
	
	
	/**
	 * 업무일지 미작성 차량비용화면 AJAX
	 * @param request
	 * @param response
	 * @param model
	 * @return
	 * @throws Exception
	 */
	@RequestMapping(value = "/costingNoDriveLogAjax")
	public String costingNoDriveLogAjax( HttpServletRequest request, HttpServletResponse response, ModelMap model) throws Exception {
			
		Map param = IfrsUtil.parameterToHm(request);
		
		model.addAttribute("result",   carCostService.costingNoDriveLogAjax( param ) );
		
		return "jsonView";
	}
	
	
	/**
	 * 비용산출 화면
	 * @param request
	 * @param response
	 * @param model
	 * @return
	 * @throws Exception
	 */
	@RequestMapping(value = "/costing")
	public String costing( HttpServletRequest request, HttpServletResponse response, ModelMap model) throws Exception {
		
		Map param = IfrsUtil.parameterToHm(request);
		
		List<Map> erpComList = carMgtService.selectErpComList();
		model.addAttribute("companyList", 	IfrsUtil.ListToJsonArray(erpComList));
		model.addAttribute("costAcceptCd",	StringUtil.nvl(request.getParameter("costAcceptCd"), "1"));
		
		return "car/carCosting";
	}
	
	
	/**
	 * 비용산출 목록 AJAX
	 * @param request
	 * @param response
	 * @param model
	 * @return
	 * @throws Exception
	 */
	@RequestMapping(value = "/costingListAjax")
	public String costingListAjax( HttpServletRequest request, HttpServletResponse response, ModelMap model) throws Exception {
			
		Map param = IfrsUtil.parameterToHm(request);
		
		model.addAttribute("result",   carCostService.selectCarCostingList( param ) );
		
		return "jsonView";
	}
	

	/**
	 * ERP 데이터를 연동해 비용산출. 
	 * @param request
	 * @param response
	 * @param model
	 * @return
	 * @throws Exception
	 */
	@RequestMapping(value = "/costingCalculateAjax")
	public String costingCalculateAjax( HttpServletRequest request, HttpServletResponse response, ModelMap model) throws Exception {
			
		Map param = IfrsUtil.parameterToHm(request);
		
		model.addAttribute("result",   carCostService.selectCarCostingCalculateList( param ) );
		
		return "jsonView";
	}
	

	/**
	 * ERP 데이터를 연동해 업무일지 미작성 차량비용산출. 
	 * @param request
	 * @param response
	 * @param model
	 * @return
	 * @throws Exception
	 */
	@RequestMapping(value = "/costingNoLogCalculateAjax")
	public String costingNoLogCalculateAjax( HttpServletRequest request, HttpServletResponse response, ModelMap model) throws Exception {
			
		Map param = IfrsUtil.parameterToHm(request);
		
		model.addAttribute("result",   carCostService.selectCarCostingNoLogCalculate( param ) );
		
		return "jsonView";
	}
	
	
	/**
	 * 비용산출 화면 저장
	 * @param request
	 * @param response
	 * @param model
	 * @return
	 * @throws Exception
	 */
	@RequestMapping(value = "/saveCostingList")
	public String saveCostingList( HttpServletRequest request, HttpServletResponse response, ModelMap model) throws Exception {
		
		String jsonString = request.getParameter("jsonString");

		Gson gson = new Gson();
				
		Map<String, List<Map<String, String>>> map = gson.fromJson(jsonString,  new TypeToken<Map<String, List<Map<String, String>>>>(){}.getType() );

		List<Map<String, String>> list = map.get("update"); //수정된 내역 가져오기

		Map carUserMap = IfrsUtil.getCarSession(request);
		
		carCostService.saveCostingList( list, (String)carUserMap.get("LOGON_ID") );
		
		model.addAttribute("result", "success");
		
		return "jsonView";
	}
	
	
	
	/**
	 * 비용산출 화면 저장 - 업무일지 미작성
	 * @param request
	 * @param response
	 * @param model
	 * @return
	 * @throws Exception
	 */
	@RequestMapping(value = "/saveCostingNoLog")
	public String saveCostingNoLog( HttpServletRequest request, HttpServletResponse response, ModelMap model) throws Exception {
		
		String jsonString = request.getParameter("jsonString");

		Gson gson = new Gson();
				
		Map<String, List<Map<String, String>>> map = gson.fromJson(jsonString,  new TypeToken<Map<String, List<Map<String, String>>>>(){}.getType() );

		List<Map<String, String>> list = map.get("data"); //수정된 내역 가져오기
		List<Map<String, String>> rList = map.get("remove"); //수정된 내역 가져오기

		Map carUserMap = IfrsUtil.getCarSession(request);
		
		carCostService.saveCostingNoLog( list, rList, (String)carUserMap.get("LOGON_ID") );
		
		model.addAttribute("result", "success");
		
		return "jsonView";
	}
	
	
	/**
	 * 명세서 확인 목록 저장
	 * @param request
	 * @param response
	 * @param model
	 * @return
	 * @throws Exception
	 */
	@RequestMapping(value = "/saveCostSumSystemList")
	public String saveCostSumSystemList( HttpServletRequest request, HttpServletResponse response, ModelMap model) throws Exception {
		
		String jsonString = request.getParameter("jsonString");

		Gson gson = new Gson();
				
		Map<String, List<Map<String, String>>> map = gson.fromJson(jsonString,  new TypeToken<Map<String, List<Map<String, String>>>>(){}.getType() );

		List<Map<String, String>> list = map.get("update"); //수정된 내역 가져오기

		Map carUserMap = IfrsUtil.getCarSession(request);
		
		carCostService.saveCostSumSystemList( list, (String)carUserMap.get("LOGON_ID") );
		
		model.addAttribute("result", "success");
		
		return "jsonView";
	}
	
	
	@RequestMapping(value = "/bts")
	public String bts( HttpServletRequest request, HttpServletResponse response, ModelMap model) throws Exception {
		
		Map param = IfrsUtil.parameterToHm(request);
		
		return "car/BTS";
	}
	
	
	/**
	 * 전표 정보 조회
	 * @param request
	 * @param response
	 * @param model
	 * @return
	 * @throws Exception
	 */
	@RequestMapping(value = "/selectSlipInfo")
	public String selectSlipInfo(HttpServletRequest request, HttpServletResponse response, ModelMap model) throws Exception {
		
		Map param = IfrsUtil.parameterToHm(request);
		
		model.addAttribute("slipList",	IfrsUtil.ListToJsonArray(carCostService.selectSlipList( param )) );
		
		return "car/popCarCostSlip";
	}
}
