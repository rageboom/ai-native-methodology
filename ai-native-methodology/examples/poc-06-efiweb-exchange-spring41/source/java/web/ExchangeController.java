package smilegate.ifrs.exchange.web;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import javax.annotation.Resource;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.ui.ModelMap;
import org.springframework.web.bind.annotation.RequestMapping;

import smilegate.ifrs.cmm.util.DateUtil;
import smilegate.ifrs.cmm.util.IFRSExcelView;
import smilegate.ifrs.cmm.util.IfrsUtil;
import smilegate.ifrs.cmm.util.StringUtil;
import smilegate.ifrs.exchange.service.ExchangeService;

@Controller
@RequestMapping(value = "/ifrs/exchange") 
public class ExchangeController {
	
	@Resource(name = "exchangeService")
	private ExchangeService exchangeService;
	
	@Autowired
	IFRSExcelView ifrsExcelView;
	
	
	@RequestMapping(value = "/exchangeView")
	public String exchangeView(HttpServletRequest request, HttpServletResponse response, HttpSession session, ModelMap model) throws Exception {
		
		Map param = new HashMap();
		String thisYear = DateUtil.getTodayString("yyyy");
		
		String year = StringUtil.nvl(request.getParameter("year"), thisYear);
		
		model.addAttribute("thisYear",		thisYear);
		model.addAttribute("year",			year);
				
		return "exchange/exchangeView";
	}
	
	
	@RequestMapping(value = "/exchangeViewAjax")
	public String exchangeViewAjax(HttpServletRequest request, HttpServletResponse response, HttpSession session, ModelMap model) throws Exception {
		
		Map param = IfrsUtil.parameterToHm(request);
		
		List<Map> list =  exchangeService.selectExchangeList( param );
		
		model.addAttribute("list",		list);
				
		return "jsonView";
	}
	
	/**
	 * 환율등록
	 * @param request
	 * @param model
	 * @return
	 * @throws Exception
	 */
	@RequestMapping(value = "/exchangeMigration")
	public String exchangeMigration( HttpServletRequest request, ModelMap model) throws Exception {		
		Map param = IfrsUtil.parameterToHm(request);
		
		exchangeService.insertExchangeRateMigration( param );
		
		String result = (String)param.get("result");
		if (null != result){			
			model.addAttribute("result", result);
		}
		
		return "jsonView";
	}
	
	
	@RequestMapping(value = "/getDayExchangeList")
	public String getDayExchangeList(HttpServletRequest request, ModelMap model) throws Exception {		
		Map param = IfrsUtil.parameterToHm(request);
		
		List<Map> list =  exchangeService.selectDayExchangeList( param );
		
		model.addAttribute("list",		list);
				
		return "jsonView";
	}
	
	@RequestMapping(value = "/downloadDayExchangeExcel")
	public void downloadDayExchangeExcel(HttpServletRequest request, HttpServletResponse response, ModelMap model) throws Exception {		
		Map param = IfrsUtil.parameterToHm(request);
			
		List<Map> list =  exchangeService.selectDayExchangeList( param );
		
		
		String currCd = (String) param.get("currCd");
		String yyyyMM = (String) param.get("yyyyMM");
		
		String[] header = {
				"고시일",
				"환율",
		};		
		String[] keyNames = {
				"registDt",
				"exchangeRate"
		};		
		
		ifrsExcelView.setFilename("일일환율_" + StringUtil.formatDateToStr("yyyyMMdd_hhmmss"));
		ifrsExcelView.setSheetName("화폐단위(" + currCd + ") " + yyyyMM.substring(0, 4) + "-" + yyyyMM.substring(4));
		ifrsExcelView.setIsTypeTrue("완료");
		ifrsExcelView.setIsTypeFalse("-");
		ifrsExcelView.setSeparatorPre(" ~ ");
		ifrsExcelView.setSeparatorSuf("");		
		ifrsExcelView.listToEXCEL(list, header, keyNames, response);
	}
	
	
	
	/**
	 * 환율 수정
	 * @param request
	 * @param response
	 * @param session
	 * @param model
	 * @return
	 * @throws Exception
	 */
	@RequestMapping(value = "/updateExchange")
	public String updateExchange( HttpServletRequest request, HttpServletResponse response, HttpSession session, ModelMap model) throws Exception {
		
		Map param = IfrsUtil.parameterToHm(request);
		
		Map userMap = IfrsUtil.getSession(request);
		param.put( "sessionId", userMap.get("USER_ID") );
		
		exchangeService.updateExchange( param );
		
		return "jsonView";
	}
	
	
	
	/**
	 * 환율 정보 등록 여부 체크
	 * @param request
	 * @param response
	 * @param session
	 * @param model
	 * @return
	 * @throws Exception
	 */
	@RequestMapping(value = "/checkExcRateReg")
	public String checkExcRateReg(HttpServletRequest request, HttpServletResponse response, HttpSession session, ModelMap model) throws Exception {
		
		Map param = IfrsUtil.parameterToHm(request);
		
		int cnt = exchangeService.selectCheckExcRate(param);
		
		//월말, 평균 환율 두개 다 등록되어 있을때에만 Y
		model.addAttribute("excRateReg", 	cnt == 2 ? "Y" : "N" );
		
		return "jsonView";
	}
	

}
