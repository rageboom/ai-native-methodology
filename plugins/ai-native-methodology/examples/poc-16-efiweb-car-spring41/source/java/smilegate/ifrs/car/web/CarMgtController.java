package smilegate.ifrs.car.web;

import java.util.List;
import java.util.Map;

import javax.annotation.Resource;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;

import org.springframework.stereotype.Controller;
import org.springframework.ui.ModelMap;
import org.springframework.web.bind.annotation.RequestMapping;

import smilegate.ifrs.car.service.CarMgtService;
import smilegate.ifrs.cmm.util.IfrsUtil;
import smilegate.ifrs.common.service.CommonService;
import egovframework.rte.fdl.property.EgovPropertyService;
import egovframework.rte.ptl.mvc.tags.ui.pagination.PaginationInfo;

@Controller
@RequestMapping(value = "/ifrs/car")
public class CarMgtController
{
	
	@Resource(name = "propertiesService")
	private EgovPropertyService propertyService;
	
	@Resource(name = "carMgtService")
	private CarMgtService carMgtService;
	
	@Resource(name = "commonService")
	private CommonService commonService;
	
	
	/**
	 * 사용자 목록 페이지
	 * @param request
	 * @param response
	 * @param model
	 * @return
	 * @throws Exception
	 */
	@RequestMapping(value = "/carList")
	public String carList( HttpServletRequest request, HttpServletResponse response, ModelMap model) throws Exception {
		    
		return "car/carList";
	}
	
	
	/**
	 * 차량 조회
	 * @param request
	 * @param response
	 * @param model
	 * @return
	 * @throws Exception
	 */
	@RequestMapping(value = "/carListAjax")
	public String carListAjax( HttpServletRequest request, HttpServletResponse response, ModelMap model) throws Exception {

		Map param = IfrsUtil.parameterToHm(request);
		
		Map carUserMap = IfrsUtil.getCarSession(request);
		param.put("sessionId", carUserMap.get("USER_ID") ); //사번
		Map resultMap = carMgtService.getLeaderUserId( param );
		
		if(resultMap != null) {
			param.put("userId", resultMap.get("userId"));
		}
		
		PaginationInfo paginationInfo = new PaginationInfo();
		paginationInfo.setCurrentPageNo( Integer.parseInt( (String)param.get("pageIndex")));
		paginationInfo.setRecordCountPerPage( 1000 );
		paginationInfo.setPageSize( 5 );
		param.put("firstIndex", 	paginationInfo.getFirstRecordIndex() + 1);
		param.put("lastIndex",  	paginationInfo.getLastRecordIndex());
		
		List resultList = carMgtService.getCarList( param );
		
		paginationInfo.setTotalRecordCount(	(resultList ==null || resultList.size() == 0) ? 0 : (Integer)((Map)resultList.get(0)).get("cnt") );
		model.addAttribute("paginationInfo", paginationInfo);
		
		model.addAttribute("resultList", resultList);
		
		return "car/"+param.get("flag");
	}
	
	
	/**
	 * 차량 등록 폼
	 * @param request
	 * @param response
	 * @param model
	 * @return
	 * @throws Exception
	 */
	@RequestMapping(value = "/carInsertForm")
	public String carInsertFom( HttpServletRequest request, HttpServletResponse response, ModelMap model) throws Exception {
		
		//Map param = IfrsUtil.parameterToHm(request);
		model.addAttribute("comList", carMgtService.selectErpComList());
		model.addAttribute("deptCd", ((Map) request.getSession().getAttribute("carUserMap")).get("DEPT_CD"));
		
		return "car/carInsertForm";
	}
	
	
	/**
	 * 차량 등록 폼
	 * @param request
	 * @param response
	 * @param model
	 * @return
	 * @throws Exception
	 */
	@RequestMapping(value = "/carUpdateForm")
	public String carUpdateFom( HttpServletRequest request, HttpServletResponse response, ModelMap model) throws Exception {
		
		Map param = IfrsUtil.parameterToHm(request);
		
		Map resultMap = carMgtService.selectCar( param );

		model.addAttribute("comList", 			carMgtService.selectErpComList());
		model.addAttribute("carUserTermList", 	carMgtService.selectCarUserTermList( param ));
		model.addAttribute("mode", 				"update");
		model.addAttribute("carMap", 			resultMap);
		model.addAttribute("deptCd",            ((Map) request.getSession().getAttribute("carUserMap")).get("DEPT_CD"));
		
		return "car/carInsertForm";
	}
	
	
	/**
	 * 차량등록
	 * @param request
	 * @param response
	 * @param session
	 * @param model
	 * @return
	 * @throws Exception
	 */
	@RequestMapping(value = "/insertCar")
	public String insertCar( HttpServletRequest request, HttpServletResponse response, HttpSession session, ModelMap model) throws Exception {
		
		Map param = IfrsUtil.parameterToHm(request);
		
		Map carUserMap = IfrsUtil.getCarSession(request);
		param.put("sessionId", carUserMap.get("LOGON_ID") );
		
		carMgtService.insertCar( param );
		
		return "redirect:/ifrs/car/carList?result=ins";
	}

	/**
	 * 차량수정
	 * @param request
	 * @param response
	 * @param session
	 * @param model
	 * @return
	 * @throws Exception
	 */
	@RequestMapping(value = "/updateCar")
	public String updateCar( HttpServletRequest request, HttpServletResponse response, HttpSession session, ModelMap model) throws Exception {
		
		Map param = IfrsUtil.parameterToHm(request);
		
		Map carUserMap = IfrsUtil.getCarSession(request);
		param.put("sessionId", carUserMap.get("LOGON_ID") );
		
		carMgtService.updateCar( param );
		
		return "redirect:/ifrs/car/carList?result=upt";
	}


	/**
	 * 차량삭제
	 * @param request
	 * @param response
	 * @param session
	 * @param model
	 * @return
	 * @throws Exception
	 */
	@RequestMapping(value = "/deleteCar")
	public String deleteCar( HttpServletRequest request, HttpServletResponse response, HttpSession session, ModelMap model) throws Exception {
		
		Map param = IfrsUtil.parameterToHm(request);
		
		Map carUserMap = IfrsUtil.getCarSession(request);
		param.put("sessionId", carUserMap.get("LOGON_ID") );
		
		carMgtService.deleteCar( param );
		
		return "redirect:/ifrs/car/carList?result=del";
	}
	
	
	
	/**
	 * 차량운행일지
	 * @param request
	 * @param response
	 * @param session
	 * @param model
	 * @return
	 * @throws Exception
	 */
	@RequestMapping(value = "/carDriveInsertForm")
	public String carDriveInsertForm( HttpServletRequest request, HttpServletResponse response, HttpSession session, ModelMap model) throws Exception {
		
		Map param = IfrsUtil.parameterToHm(request);
		Map carUserMap = IfrsUtil.getCarSession(request);
		
		param.put("sessionId", carUserMap.get("USER_ID") ); //사번
		param.put("firstIndex", 1);
		param.put("lastIndex", 	1000);
		List carList = carMgtService.getCarList( param );
		
		param.put("codeType", "drivePurpose");
		List<Map> purposeList = commonService.getCodeList(param);
		
		model.addAttribute( "purposeList", 	purposeList );
		model.addAttribute( "carList", carList );		
		
		return "car/carDriveInsertForm";
	}
	
	
	
	/**
	 * 차량 정보 조회
	 * @param request
	 * @param response
	 * @param session
	 * @param model
	 * @return
	 * @throws Exception
	 */
	@RequestMapping(value = "/carInfoAjax")
	public String carInfoAjax( HttpServletRequest request, HttpServletResponse response, HttpSession session, ModelMap model) throws Exception {
		
		Map param = IfrsUtil.parameterToHm(request);
		
		Map resultMap = carMgtService.selectCar( param );
		
		model.addAttribute( "carInfo", 		resultMap );		
		
		return "jsonView";
	}
	
	
	
	/**
	 * 차량 운행 정보 조회
	 * @param request
	 * @param response
	 * @param session
	 * @param model
	 * @return
	 * @throws Exception
	 */
	@RequestMapping(value = "/carDriveListAjax")
	public String carDriveListAjax( HttpServletRequest request, HttpServletResponse response, HttpSession session, ModelMap model) throws Exception {
		
		Map param = IfrsUtil.parameterToHm(request);
		
		List<Map> driveList = carMgtService.selectCarDriveList( param );
		
		model.addAttribute( "driveList", 		driveList );		
		
		return "car/carDriveListAjax";
	}
	
	
	/**
	 * 차량운행일지
	 * @param request
	 * @param response
	 * @param session
	 * @param model
	 * @return
	 * @throws Exception
	 */
	@RequestMapping(value = "/carDriveRowSave")
	public String carDriveRowSave( HttpServletRequest request, HttpServletResponse response, HttpSession session, ModelMap model) throws Exception {
		
		Map param = IfrsUtil.parameterToHm(request);
		
		Map carUserMap = IfrsUtil.getCarSession(request);
		param.put("sessionId", carUserMap.get("LOGON_ID") );
		
		carMgtService.saveCarDriveRow( param );	
		
		model.addAttribute( "result", "success" );		
		
		return "jsonView";
	}

	
	@RequestMapping(value = "/excelDown")
	public String excelDown(HttpServletRequest request, HttpServletResponse response,
			HttpSession session, ModelMap model) throws Exception {
		
		return "common/excelDown";
	}
	
	
	
	/**
	 * ERP 부서 정보 조회
	 * @param request
	 * @param response
	 * @param session
	 * @param model
	 * @return
	 * @throws Exception
	 */
	@RequestMapping(value = "/erpDeptListAjax")
	public String erpDeptListAjax( HttpServletRequest request, HttpServletResponse response, HttpSession session, ModelMap model) throws Exception {
		
		Map param = IfrsUtil.parameterToHm(request);
		
		List<Map> deptList = carMgtService.selectErpDeptList( param );
		
		model.addAttribute( "deptList", 		deptList );		
		
		return "jsonView";
	}
	
	
	/**
	 * 차량 사용자 비용산출 되었는지 조회
	 * @param request
	 * @param response
	 * @param session
	 * @param model
	 * @return
	 * @throws Exception
	 */
	@RequestMapping(value = "/selectCarUserTermCost")
	public String selectCarUserTermCost( HttpServletRequest request, HttpServletResponse response, HttpSession session, ModelMap model) throws Exception {
		
		Map param = IfrsUtil.parameterToHm(request);
		
		int cnt = carMgtService.selectCarUserTermCost( param );
		
		model.addAttribute( "cnt", 		cnt );		
		
		return "jsonView";
	}
	
	/**
	 * 차량선택 팝업
	 * @param request
	 * @param response
	 * @param session
	 * @param model
	 * @return
	 * @throws Exception
	 */
	@RequestMapping(value = "/carSelectPopup")
	public String carSelectPopup( HttpServletRequest request, HttpServletResponse response, HttpSession session, ModelMap model) throws Exception {
			
		model.addAttribute("comList", carMgtService.selectErpComList());
		
		return "car/carSelectPopup";
	}
	
	
}
