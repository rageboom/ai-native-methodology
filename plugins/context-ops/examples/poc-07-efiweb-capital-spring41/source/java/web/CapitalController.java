package smilegate.ifrs.capital.web;

import java.awt.Graphics;
import java.awt.Image;
import java.awt.image.BufferedImage;
import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.File;
import java.net.URLDecoder;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import javax.activation.FileDataSource;
import javax.annotation.Resource;
import javax.imageio.ImageIO;
import javax.mail.MessagingException;
import javax.mail.internet.AddressException;
import javax.mail.internet.MimeMessage;
import javax.mail.internet.MimeUtility;
import javax.servlet.ServletOutputStream;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;

import org.apache.commons.codec.binary.Base64;
import org.imgscalr.Scalr;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.core.io.FileSystemResource;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Controller;
import org.springframework.ui.ModelMap;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.ResponseBody;

import smilegate.ifrs.capital.service.CapitalService;
import smilegate.ifrs.cmm.util.DateUtil;
import smilegate.ifrs.cmm.util.IfrsUtil;
import smilegate.ifrs.cmm.util.ImageUtil;
import smilegate.ifrs.cmm.util.SmileGateGlobals;
import smilegate.ifrs.cmm.util.StringUtil;
import smilegate.ifrs.common.service.CommonService;
import smilegate.ifrs.data.service.DataService;
import smilegate.ifrs.egov.util.EgovFileMngUtil;
import smilegate.ifrs.egov.util.EgovProperties;
import smilegate.ifrs.user.service.UserService;
import sun.misc.BASE64Decoder;

@Controller
@RequestMapping(value = "/ifrs/capital") 
public class CapitalController {
	
	private final Logger log = LoggerFactory.getLogger(this.getClass().getName());
	
	@Resource(name = "commonService")
	private CommonService commonService;
	
	@Resource(name = "capitalService")
	private CapitalService capitalService;
	
	@Resource(name = "userService")
	private UserService userService;
	
	@Resource(name = "dataService")
	private DataService dataService;

	@Resource(name = "EgovFileMngUtil")
	private EgovFileMngUtil egovFileMngUtil;
	
	@Autowired
	private JavaMailSender mailSender;	
	
	/**
	 * 법인 기초정보 조회
	 * @param request
	 * @param response
	 * @param session
	 * @param model
	 * @return
	 * @throws Exception
	 */	
	@RequestMapping(value = "/comBasicInfo")
	public String comBasicInfo(HttpServletRequest request, HttpServletResponse response, HttpSession session, ModelMap model) throws Exception {
		
		Map param = IfrsUtil.parameterToHm(request);
		
		List<Map> currencyList = new ArrayList();
		Map temp = new HashMap();
		temp.put("currCd", "KRW");
		temp.put("currNm", "원");
		currencyList.add( temp );
		currencyList.addAll(dataService.getCurrencyList());
		
		model.addAttribute("companyList",	 IfrsUtil.ListToJsonArray(userService.getCompanyList(param)));	
		model.addAttribute("currencyList",	 IfrsUtil.ListToJsonArray( currencyList ));
		model.addAttribute("SESSION", ((Map) request.getSession().getAttribute("userMap")).get("COM_NO")); // 소속 법인 번호
		model.addAttribute("userId",   		((Map) request.getSession().getAttribute("userMap")).get("USER_ID") );
		return "capital/comBasicInfo";
	}
	
	/*-----------------------------------------------           자금일보 기준정보            --------------------------------------------------------*/
	
	/**
	 * 자금일보-사업자등록번호 [조회]
	 * @param request
	 * @param response
	 * @param session
	 * @param model
	 * @return
	 * @throws Exception
	 */
	@RequestMapping(value = "/IfrsCapitalBizAjax")
	public String IfrsCapitalBizAjax(HttpServletRequest request, HttpServletResponse response, HttpSession session, ModelMap model) throws Exception {
		Map param = IfrsUtil.parameterToHm(request);
		String erpYn = capitalService.selectErpYn( param );
		String sdate="";
		if(erpYn!=null && erpYn.equals("N")){
			sdate=capitalService.selectLastSaveSdate(param);
		}
		model.addAttribute("result",   capitalService.selectCapitalBizAjax( param ) );
		model.addAttribute("erpYn",   erpYn );
		model.addAttribute("sdate",   sdate );
		return "jsonView";
	}		
	
	/**
	 * 자금일보-기준정보 [조회]
	 * @param request
	 * @param response
	 * @param session
	 * @param model
	 * @return
	 * @throws Exception
	 */
	@RequestMapping(value = "/IfrsCapitalStdAjax")
	public String IfrsCapitalStdAjax(HttpServletRequest request, HttpServletResponse response, HttpSession session, ModelMap model) throws Exception {
		Map param = IfrsUtil.parameterToHm(request);
		model.addAttribute("result",   capitalService.selectCapitalStdAjax( param ) );
		return "jsonView";
	}		
	
	/*-----------------------------------------------           법인 연동 설정            --------------------------------------------------------*/
	
	/**
	 * 자금일보-법인연동설정-법인목록 [조회]
	 * @param request
	 * @param response
	 * @param session
	 * @param model
	 * @return
	 * @throws Exception
	 */
	@RequestMapping(value = "/comBasicInfoListAjax")
	public String comBasicInfoListAjax(HttpServletRequest request, HttpServletResponse response, HttpSession session, ModelMap model) throws Exception {
		Map param = IfrsUtil.parameterToHm(request);
		model.addAttribute("result",   capitalService.selectComBasicInfoListAjax( param ) );
		return "jsonView";
	}		
	
	/**
	 * 자금일보-법인연동설정-법인목록 [저장]
	 * @param request
	 * @param response
	 * @param session
	 * @param model
	 * @return
	 * @throws Exception
	 */
	@RequestMapping(value = "/IfrsComINSetSave")
	public String IfrsComINSetSave(HttpServletRequest request, HttpServletResponse response, HttpSession session, ModelMap model) throws Exception {
		Map param = IfrsUtil.parameterToHm(request);
		
		//System.out.print(param);
		
		List<Map> IfrsComINSetSave = capitalService.insertComINSetList( param ) ;
		model.addAttribute("list",   IfrsComINSetSave);
		return "jsonView";
	}
	
	
	
	/*-----------------------------------------------           입금내역 작성            --------------------------------------------------------*/
	
	/**
	 * 자금일보-입금내역작성 [화면]
	 * @param request
	 * @param response
	 * @param session
	 * @param model
	 * @return
	 * @throws Exception
	 */
	@RequestMapping(value = "/capitalDepositAction")
	public String capitalDepositAction(HttpServletRequest request, HttpServletResponse response, HttpSession session, ModelMap model) throws Exception {
		Map param = IfrsUtil.parameterToHm(request);
		Map userMap = IfrsUtil.getSession(request);
		param.put("codeType", "accountType");
		List<Map> accountTypeList = commonService.getCodeList(param); 
		model.addAttribute("accountTypeList", IfrsUtil.ListToJsonArray( accountTypeList ) );
		param.put("capitalYn",	"Y");
		param.put("authType", userMap.get("AUTH_TYPE"));
		model.addAttribute("companyList", userService.getCompanyList(param));
		model.addAttribute("SESSION", ((Map) request.getSession().getAttribute("userMap")).get("COM_NO")); // 소속 법인 번호
		model.addAttribute("userId",   		((Map) request.getSession().getAttribute("userMap")).get("USER_ID") );
		return "capital/capitalDepositAction";
	}	
	
	/**
	 * 자금일보-입금내역작성-ERP내역 [조회]
	 * @param request
	 * @param response
	 * @param session
	 * @param model
	 * @return
	 * @throws Exception
	 */
	@RequestMapping(value = "/IfrsERPINListAjax")
	public String IfrsERPINListAjax(HttpServletRequest request, HttpServletResponse response, HttpSession session, ModelMap model) throws Exception {
		
		Map param = IfrsUtil.parameterToHm(request);

		List<Map> ERPINList = capitalService.selectIfrsERPINList( param ) ;
				
		model.addAttribute("list",   ERPINList);
		
		return "jsonView";
	}	
	
	/**
	 * 자금일보-입금내역작성-ERP내역 [조회] // 전도금, 여비교통비
	 * @param request
	 * @param response
	 * @param session
	 * @param model
	 * @return
	 * @throws Exception
	 */
	@RequestMapping(value = "/IfrsERPINListAjax2")
	public String IfrsERPINListAjax2(HttpServletRequest request, HttpServletResponse response, HttpSession session, ModelMap model) throws Exception {
		
		Map param = IfrsUtil.parameterToHm(request);

		List<Map> ERPINList = capitalService.selectIfrsERPINList2( param ) ;
				
		model.addAttribute("list",   ERPINList);
		
		return "jsonView";
	}		
	
	/**
	 * 자금일보-입금내역작성-ERP내역-환경설정 [조회]
	 * @param request
	 * @param response
	 * @param session
	 * @param model
	 * @return
	 * @throws Exception
	 */
	@RequestMapping(value = "/IfrsERPINSetAjax")
	public String IfrsERPINSetAjax(HttpServletRequest request, HttpServletResponse response, HttpSession session, ModelMap model) throws Exception {
		Map param = IfrsUtil.parameterToHm(request);
		List<Map> IfrsERPINSetList = capitalService.selectERPINSetList( param ) ;
		model.addAttribute("list",   IfrsERPINSetList);
		return "jsonView";
	}	
	
	/**
	 * 자금일보-입금내역작성-ERP내역-환경설정 [저장]
	 * @param request
	 * @param response
	 * @param session
	 * @param model
	 * @return
	 * @throws Exception
	 */
	@RequestMapping(value = "/IfrsERPINSetSave")
	public String IfrsERPINSetSave(HttpServletRequest request, HttpServletResponse response, HttpSession session, ModelMap model) throws Exception {
		Map param = IfrsUtil.parameterToHm(request);						
		List<Map> IfrsERPINSetSave = capitalService.insertERPINSetList( param ) ;
		model.addAttribute("list",   IfrsERPINSetSave);
		return "jsonView";
	}		
	
	
	/**
	 * 자금일보-입금내역작성-CMS내역 [조회]
	 * @param request
	 * @param response
	 * @param session
	 * @param model
	 * @return
	 * @throws Exception
	 */
	@RequestMapping(value = "/IfrsCMSINListAjax")
	public String IfrsCMSINListAjax(HttpServletRequest request, HttpServletResponse response, HttpSession session, ModelMap model) throws Exception {
		Map param = IfrsUtil.parameterToHm(request);
		List<Map> IfrsCMSINList = capitalService.selectCmsDepositList( param ) ;
		model.addAttribute("list",   IfrsCMSINList);
		return "jsonView";
	}	
	
	/**
	 * 자금일보-입금내역작성-CMS내역-환경설정 [조회]
	 * @param request
	 * @param response
	 * @param session
	 * @param model
	 * @return
	 * @throws Exception
	 */
	@RequestMapping(value = "/IfrsCMSINSetAjax")
	public String IfrsCMSINSetAjax(HttpServletRequest request, HttpServletResponse response, HttpSession session, ModelMap model) throws Exception {
		Map param = IfrsUtil.parameterToHm(request);
		List<Map> IfrsCMSINSetList = capitalService.selectCMSINSetList( param ) ;
		model.addAttribute("list",   IfrsCMSINSetList);
		return "jsonView";
	}
	
	/**
	 * 자금일보-입금내역작성-CMS내역-환경설정 [조회_CMS연동된 계좌정보]
	 * @param request
	 * @param response
	 * @param session
	 * @param model
	 * @return
	 * @throws Exception
	 */
	@RequestMapping(value = "/CmsAccountListAjax")
	public String CmsAccountListAjax(HttpServletRequest request, HttpServletResponse response, HttpSession session, ModelMap model) throws Exception {
		Map param = IfrsUtil.parameterToHm(request);
		List<Map> cmsAccountList = capitalService.selectCmsAccountListAll( param ) ;
		model.addAttribute("list",  cmsAccountList);
		return "jsonView";
	}	
	
	/**
	 * 자금일보-입금내역작성-CMS내역-환경설정 [저장]
	 * @param request
	 * @param response
	 * @param session
	 * @param model
	 * @return
	 * @throws Exception
	 */
	@RequestMapping(value = "/IfrsCMSINSetSave")
	public String IfrsCMSINSetSave(HttpServletRequest request, HttpServletResponse response, HttpSession session, ModelMap model) throws Exception {
		Map param = IfrsUtil.parameterToHm(request);
		List<Map> IfrsCMSINSetSave = capitalService.insertCMSINSetList( param ) ;
		model.addAttribute("list",   IfrsCMSINSetSave);
		return "jsonView";
	}		
	
	
	/**
	 * 자금일보-입금내역작성-자금일보내역 [조회]
	 * @param request
	 * @param response
	 * @param session
	 * @param model
	 * @return
	 * @throws Exception
	 */
	@RequestMapping(value = "/IfrsERPINReportAjax")
	public String IfrsERPINReportAjax(HttpServletRequest request, HttpServletResponse response, HttpSession session, ModelMap model) throws Exception {
		Map param = IfrsUtil.parameterToHm(request);
		List<Map> ERPINList = capitalService.selectERPINReport( param ) ;
		model.addAttribute("list",   ERPINList);
		return "jsonView";
	}		
	
	
	/**
	 * 자금일보-입금내역작성-자금일보내역 [저장]
	 * @param request
	 * @param response
	 * @param session
	 * @param model
	 * @return
	 * @throws Exception
	 */
	@RequestMapping(value = "/IfrsERPINListSave")
	public String IfrsERPINListSave(HttpServletRequest request, HttpServletResponse response, HttpSession session, ModelMap model) throws Exception {
		Map param = IfrsUtil.parameterToHm(request);
		
		System.out.print(param);
		
		List<Map> IfrsERPINListSave = capitalService.insertERPINList( param ) ;
		model.addAttribute("list",   IfrsERPINListSave);
		return "jsonView";
	}		
	
	
	
	
	/*-----------------------------------------------           출금내역 작성            --------------------------------------------------------*/
		
	
	/**
	 * 자금일보-출금내역작성 [화면]
	 * @param request
	 * @param response
	 * @param session
	 * @param model
	 * @return
	 * @throws Exception
	 */
	@RequestMapping(value = "/capitalWithdrawAction")
	public String capitalWithdrawAction(HttpServletRequest request, HttpServletResponse response, HttpSession session, ModelMap model) throws Exception {
		Map param = IfrsUtil.parameterToHm(request);
		Map userMap = IfrsUtil.getSession(request);
		param.put("codeType", "accountType");
		List<Map> accountTypeList = commonService.getCodeList(param); 
		model.addAttribute("accountTypeList", IfrsUtil.ListToJsonArray( accountTypeList ) );
		param.put("capitalYn",	"Y");
		param.put("authType", userMap.get("AUTH_TYPE"));
		model.addAttribute("companyList", userService.getCompanyList(param));
		model.addAttribute("SESSION", ((Map) request.getSession().getAttribute("userMap")).get("COM_NO")); // 소속 법인 번호
		model.addAttribute("userId",   		((Map) request.getSession().getAttribute("userMap")).get("USER_ID") );
		return "capital/capitalWithdrawAction";
	}
	
	
	/**
	 * 자금일보-출금내역작성-ERP내역 [조회]
	 * @param request
	 * @param response
	 * @param session
	 * @param model
	 * @return
	 * @throws Exception
	 */
	@RequestMapping(value = "/IfrsERPOUTListAjax")
	public String IfrsERPOUTListAjax(HttpServletRequest request, HttpServletResponse response, HttpSession session, ModelMap model) throws Exception {
		
		Map param = IfrsUtil.parameterToHm(request);
		String yyyymmdd = request.getParameter("sdate");
		String smi = request.getParameter("smi");
		
		String xmlDocument = "<ROOT>" +
				"<DataBlock1>" +
				"<WorkingTag>A</WorkingTag>" +
				"<IDX_NO>1</IDX_NO>" +
				"<Status>0</Status>" + 
				"<DataSeq>1</DataSeq>" +
			    "<Selected>1</Selected>" +
			    "<TABLE_NAME>DataBlock1</TABLE_NAME>" + 
			    "<IsChangedMst>0</IsChangedMst>" +
			    "<AccUnit />" +
			    "<CashDateFr>" + yyyymmdd + "</CashDateFr>" +
			    "<CashDateTo>" + yyyymmdd + "</CashDateTo>" +
			    "<SMCashMethod />" +
			    "<AccDateFr />" +
			    "<AccDateTo />" +
			    "<SlipUnit />" +
			    "<RegAccDateFr />" +
			    "<RegAccDateTo />" +
			    "<RemSeq />" +
			    "<RemValSeq />" +
			    "<UpperAccSeq />" +
			    "<RegDeptSeq />" +
			    "<DeptIncludeCheck>0</DeptIncludeCheck>" +
			    "<AccSeqFr />" +
			    "<AccSeqTo />" +
			    "<CCtrSeq />" +
			    "<CardSeq />" +
			    "<EmpSeq />" +
			    "<SlipKind />" +
			    "<SMCustStatus />" +
			    "<Summary />" +
			    "<SMAccCurrStatus />" +
			    "<SMInOrOut />" +
			    "<SMIsEnd>" + smi + "</SMIsEnd>" +
			    "<SMIsSet>1016002</SMIsSet>" +
			    "<IsIni>0</IsIni>" +
			    "<IsCfm>0</IsCfm>" +
			  "</DataBlock1>" +
			"</ROOT>";		

		param.put("xmlDocument", 	xmlDocument);		

		List<Map> ERPINList = capitalService.selectIfrsERPOUTList( param ) ;
		model.addAttribute("list",   ERPINList);
		return "jsonView";
	}		
	
	
	/**
	 * 출금 내역 조회 (CMS)
	 * @param request
	 * @param response
	 * @param session
	 * @param model
	 * @return
	 * @throws Exception
	 */
	@RequestMapping(value = "/IfrsCMSOUTListAjax")
	public String IfrsCMSOUTListAjax(HttpServletRequest request, HttpServletResponse response, HttpSession session, ModelMap model) throws Exception {
		
		Map param = IfrsUtil.parameterToHm(request);

		List<Map> IfrsCMSINList = capitalService.selectCmsWithdrawList( param ) ;
		
		model.addAttribute("list",   IfrsCMSINList);
				
		return "jsonView";
	}		
	
	
	/**
	 * 출금 내역 재분류 - 최대 값의 상대계정 계정명, 적요 (ERP)
	 * @param request
	 * @param response
	 * @param session
	 * @param model
	 * @return
	 * @throws Exception
	 */
	@RequestMapping(value = "/IfrsERPMaxAjax")
	public String IfrsERPMaxAjax(HttpServletRequest request, HttpServletResponse response, HttpSession session, ModelMap model) throws Exception {
		
		Map param = IfrsUtil.parameterToHm(request);

		List<Map> IfrsERPMaxAjax = capitalService.selectIfrsERPMaxAjax( param ) ;
		
		model.addAttribute("list",   IfrsERPMaxAjax);
				
		return "jsonView";
	}		
	
	/*-----------------------------------------------           금융자산내역 작성            --------------------------------------------------------*/
	
	/**
	 * 자금일보-금융자산내역 등록
	 * @param request
	 * @param response
	 * @param session
	 * @param model
	 * @return
	 * @throws Exception
	 */
	@RequestMapping(value = "/capitalAssetsAction")
	public String capitalAssetsAction(HttpServletRequest request, HttpServletResponse response, HttpSession session, ModelMap model) throws Exception {
		Map param = IfrsUtil.parameterToHm(request);
		Map userMap = IfrsUtil.getSession(request);
		param.put("codeType", "accountType");
		List<Map> accountTypeList = commonService.getCodeList(param); 
		model.addAttribute("accountTypeList", IfrsUtil.ListToJsonArray( accountTypeList ) );
		param.put("capitalYn",	"Y");
		param.put("authType", userMap.get("AUTH_TYPE"));
		model.addAttribute("companyList", userService.getCompanyList(param));
		model.addAttribute("SESSION", ((Map) request.getSession().getAttribute("userMap")).get("COM_NO")); // 소속 법인 번호
		model.addAttribute("userId",   		((Map) request.getSession().getAttribute("userMap")).get("USER_ID") );
		return "capital/capitalAssetsAction";
	}
	
	/**
	 * 자금일보-금융자산내역 작성 [화면]
	 * @param request
	 * @param response
	 * @param session
	 * @param model
	 * @return
	 * @throws Exception
	 */
	@RequestMapping(value = "/capitalAssetsRegAction")
	public String capitalAssetsRegAction(HttpServletRequest request, HttpServletResponse response, HttpSession session, ModelMap model) throws Exception {
		Map param = IfrsUtil.parameterToHm(request);
		Map userMap = IfrsUtil.getSession(request);
		param.put("codeType", "accountType");
		List<Map> accountTypeList = commonService.getCodeList(param); 
		model.addAttribute("accountTypeList", IfrsUtil.ListToJsonArray( accountTypeList ) );
		param.put("capitalYn",	"Y");
		param.put("authType", userMap.get("AUTH_TYPE"));
		model.addAttribute("companyList", userService.getCompanyList(param));
		model.addAttribute("SESSION", ((Map) request.getSession().getAttribute("userMap")).get("COM_NO")); // 소속 법인 번호
		model.addAttribute("userId",   		((Map) request.getSession().getAttribute("userMap")).get("USER_ID") );
		return "capital/capitalAssetsAction";
	}
	
	/**
	 * 자금일보-금융자산내역 작성-1) 현금 [조회]
	 * @param request
	 * @param response
	 * @param session
	 * @param model
	 * @return
	 * @throws Exception
	 */
	@RequestMapping(value = "/IfrsAssetListAjax1")
	public String IfrsAssetListAjax1(HttpServletRequest request, HttpServletResponse response, HttpSession session, ModelMap model) throws Exception {
		
		Map param = IfrsUtil.parameterToHm(request);
		String yyyymmdd1 = request.getParameter("sdate1");
		String yyyymmdd2 = request.getParameter("sdate2");
		
		String xmlDocument = "<ROOT>" +
				"<DataBlock1>" +
				"<WorkingTag>A</WorkingTag>" +
				"<IDX_NO>1</IDX_NO>" +
				"<Status>0</Status>" + 
				"<DataSeq>1</DataSeq>" +
			    "<Selected>1</Selected>" +
			    "<TABLE_NAME>DataBlock1</TABLE_NAME>" + 
			    "<IsChangedMst>0</IsChangedMst>" +
			    "<FSDomainSeq />" +
			    "<AccUnit />" +
			    "<AccDate>" + yyyymmdd2 + "</AccDate>" +
			    "<AccDateTo>" + yyyymmdd2 + "</AccDateTo>" +
			    "<SlipUnit />" +
			    "<AccSeqFr />" +
			    "<AccSeqTo />" +
			    "<UMCostType />" +
			    "<LinkCreateID />" +
			    "<SMAccStd>2</SMAccStd>" +
			  "</DataBlock1>" +
			"</ROOT>";		

		param.put("xmlDocument", 	xmlDocument);		

		List<Map> AssetList = capitalService.selectAssetListAjax1( param ) ;
		model.addAttribute("list",   AssetList);
		return "jsonView";
	}			
	
	
	/**
	 * 자금일보-금융자산내역 작성-2) 보통예금 CMS [조회]
	 * @param request
	 * @param response
	 * @param session
	 * @param model
	 * @return
	 * @throws Exception
	 */
	@RequestMapping(value = "/IfrsAssetListAjax2")
	public String IfrsAssetListAjax2(HttpServletRequest request, HttpServletResponse response, HttpSession session, ModelMap model) throws Exception {
		Map param = IfrsUtil.parameterToHm(request);
		List<Map> IfrsCMSINList = capitalService.selectAssetListAjax2( param ) ;
		model.addAttribute("list",   IfrsCMSINList);
		return "jsonView";
	}	
	
	
	/**
	 * 자금일보-금융자산내역 작성-2) 보통예금 ERP [조회] // 금융기관별
	 * @param request
	 * @param response
	 * @param session
	 * @param model
	 * @return
	 * @throws Exception
	 */
	@RequestMapping(value = "/IfrsAssetListAjax3")
	public String IfrsAssetListAjax3(HttpServletRequest request, HttpServletResponse response, HttpSession session, ModelMap model) throws Exception {
		
		Map param = IfrsUtil.parameterToHm(request);
		String yyyymmdd1 = request.getParameter("sdate1");
		String yyyymmdd2 = request.getParameter("sdate2");
		String AccSeq = request.getParameter("AccSeq");
		String RemSeq = request.getParameter("RemSeq");
		
		String xmlDocument = "<ROOT>" +
				"<DataBlock1>" +
				"<WorkingTag>A</WorkingTag>" +
				"<IDX_NO>1</IDX_NO>" +
				"<Status>0</Status>" + 
				"<DataSeq>1</DataSeq>" +
			    "<Selected>1</Selected>" +
			    "<TABLE_NAME>DataBlock1</TABLE_NAME>" + 
			    "<IsChangedMst>1</IsChangedMst>" +
			    "<FSDomainSeq />" +
			    "<AccUnit>1</AccUnit>" +
			    "<AccDate>" + yyyymmdd2 + "</AccDate>" +
			    "<AccDateTo>" + yyyymmdd2 + "</AccDateTo>" +
			    "<AccSeq>" + AccSeq + "</AccSeq>" +
			    "<RemSeq>" + RemSeq + "</RemSeq>" +
			    "<UMCostType />" +
			    "<LinkCreateID />" +
			    "<SMAccStd>2</SMAccStd>" +
			    "<SlipUnit />" +			    
			  "</DataBlock1>" +
			"</ROOT>";		

		param.put("xmlDocument", 	xmlDocument);		

		List<Map> AssetList = capitalService.selectAssetListAjax3( param ) ;
		model.addAttribute("list",   AssetList);
		return "jsonView";
	}				
	
	
	/**
	 * 자금일보-금융자산내역 작성-3) 외화예금 ERP [조회]
	 * @param request
	 * @param response
	 * @param session
	 * @param model
	 * @return
	 * @throws Exception
	 */
	@RequestMapping(value = "/IfrsAssetListAjax4")
	public String IfrsAssetListAjax4(HttpServletRequest request, HttpServletResponse response, HttpSession session, ModelMap model) throws Exception {
		
		Map param = IfrsUtil.parameterToHm(request);
		String yyyymmdd1 = request.getParameter("sdate1");
		String yyyymmdd2 = request.getParameter("sdate2");
		
		String xmlDocument = "<ROOT>" +
				"<DataBlock1>" +
				"<WorkingTag>A</WorkingTag>" +
				"<IDX_NO>1</IDX_NO>" +
				"<Status>0</Status>" + 
				"<DataSeq>1</DataSeq>" +
			    "<Selected>1</Selected>" +
			    "<TABLE_NAME>DataBlock1</TABLE_NAME>" + 
			    "<IsChangedMst>1</IsChangedMst>" +
			    "<AccUnit>1</AccUnit>" +
			    "<FrAccDate>20140101</FrAccDate>" +
			    "<ToAccDate>" + yyyymmdd2 + "</ToAccDate>" +
			    "<BankSeq />" +
			    "<AccSeq />" +
			    "<CurrSeq />" +
			  "</DataBlock1>" +
			"</ROOT>";		

		param.put("xmlDocument", 	xmlDocument);		

		List<Map> AssetList = capitalService.selectAssetListAjax4( param ) ;
		model.addAttribute("list",   AssetList);
		return "jsonView";
	}
	
	
	/**
	 * 자금일보-금융자산내역 [저장]
	 * @param request
	 * @param response
	 * @param session
	 * @param model
	 * @return
	 * @throws Exception
	 */
	@RequestMapping(value = "/IfrsAssetINSetSave")
	public String IfrsAssetINSetSave(HttpServletRequest request, HttpServletResponse response, HttpSession session, ModelMap model) throws Exception {
		Map param = IfrsUtil.parameterToHm(request);
		log.info("IfrsAssetINSetSave param>>> " + param);
		log.info(">>>>>>>>>>>IfrsAssetINSetSave call<<<<<<<<<<<<<<");
		List<Map> IfrsERPINSetSave = capitalService.insertAssetINSetList( param ) ;
		log.info(">>>>>>>>>>>IfrsAssetINSetSave end<<<<<<<<<<<<<<");
		model.addAttribute("list",   IfrsERPINSetSave);
		
		//2020.08.14 김승희
		// saveType = R 는 저장, B는 임시저장 ,A는 초기화
		String level = "DEBUG";
		String saveType = (String)param.get("SaveType");
		if("R".equals(saveType)){
			level = "INFO";
		}
		capitalService.setFcmmnLog(level,IfrsERPINSetSave, request);
		
		return "jsonView";
	}
	
	
	/**
	 * 자금일보-자금일보저장 내역 [조회]
	 * @param request
	 * @param response
	 * @param session
	 * @param model
	 * @return
	 * @throws Exception
	 */
	@RequestMapping(value = "/IfrsLoadSaveData")
	public String IfrsLoadSaveData(HttpServletRequest request, HttpServletResponse response, HttpSession session, ModelMap model) throws Exception {
		Map param = IfrsUtil.parameterToHm(request);
		List<Map> IfrsERPINSetSave = capitalService.selectLoadSaveData( param ) ;
		model.addAttribute("list",   IfrsERPINSetSave);
		
		// 2020.08.14 김승희 
		String level = "DEBUG";
		capitalService.setFcmmnLog(level, IfrsERPINSetSave, request);
		
		return "jsonView";
	}
	
	
	/**
	 * 자금일보 - 법인별 자금일보 저장 내역 조회
	 * @param request
	 * @param response
	 * @param session
	 * @param model
	 * @return
	 * @throws Exception
	 */
	@RequestMapping(value = "/IfrsLoadSaveDataForReport")
	public String IfrsLoadSaveDataForReport(HttpServletRequest request, HttpServletResponse response, HttpSession session, ModelMap model) throws Exception {
		
		Map param = IfrsUtil.parameterToHm(request);
		List<Map> IfrsLoadSaveDataForReport = capitalService.selectLoadSaveDataForReport( param ) ;
		model.addAttribute("list", IfrsLoadSaveDataForReport);
		
		// 2020.08.14 김승희 
		String level = "DEBUG";
		capitalService.setFcmmnLog(level, IfrsLoadSaveDataForReport, request);
		
		return "jsonView";
	}
	
	
	/*-----------------------------------------------           법인별 자금일보 조회 / 기간조회           --------------------------------------------------------*/
	
	/**
	 * 자금일보-금융자산내역 작성 [화면]
	 * @param request
	 * @param response
	 * @param session
	 * @param model
	 * @return
	 * @throws Exception
	 */
	@RequestMapping(value = "/capitalReportView")
	public String capitalReport(HttpServletRequest request, HttpServletResponse response, HttpSession session, ModelMap model) throws Exception {
		//System.out.print((Map) request.getSession().getAttribute("userMap")); // 세션 불러오기
		Map param = IfrsUtil.parameterToHm(request);
		Map userMap = IfrsUtil.getSession(request);
		param.put("codeType", "accountType");
		List<Map> accountTypeList = commonService.getCodeList(param); 
		model.addAttribute("accountTypeList", IfrsUtil.ListToJsonArray( accountTypeList ) );
		param.put("capitalYn",	"Y");
		param.put("authType", userMap.get("AUTH_TYPE"));
		model.addAttribute("companyList", userService.getCompanyList(param));		
		model.addAttribute("SESSION", ((Map) request.getSession().getAttribute("userMap")).get("COM_NO")); // 소속 법인 번호
		model.addAttribute("userId",   		((Map) request.getSession().getAttribute("userMap")).get("USER_ID") );
		return "capital/capitalReport";
	}
	
	/**
	 * 자금일보-검증 확인
	 * @param request
	 * @param response
	 * @param session
	 * @param model
	 * @return
	 * @throws Exception
	 */
	@RequestMapping(value = "/selectCapitalVrify")
	public String selectCapitalVrify(HttpServletRequest request, HttpServletResponse response, HttpSession session, ModelMap model) throws Exception {
		//System.out.print((Map) request.getSession().getAttribute("userMap")); // 세션 불러오기
		Map<String, Object> param = IfrsUtil.parameterToHm(request);
		model.addAttribute("vrifyYn", capitalService.selectCapitalVrify(param));
		return "jsonView";
	}
	
	/**
	 * 자금일보-검증 확인
	 * @param request
	 * @param response
	 * @param session
	 * @param model
	 * @return
	 * @throws Exception
	 */
	@RequestMapping(value = "/insertCapitalVrify")
	public String insertCapitalVrify(HttpServletRequest request, HttpServletResponse response, HttpSession session, ModelMap model) throws Exception {
		//System.out.print((Map) request.getSession().getAttribute("userMap")); // 세션 불러오기
		
		try {
			
			Map<String, Object> param = IfrsUtil.parameterToHm(request);
			param.put("insId", IfrsUtil.getSession(request).get("USER_ID").toString());
			capitalService.insertCapitalVrify(param);
			model.addAttribute("success", "Y");
			
		} catch (Exception e) {
			
			model.addAttribute("fail", "N");
		}
		
		return "jsonView";
	}

	/**
	 * 자금일보-금융자산내역 작성 [화면]
	 * @param request
	 * @param response
	 * @param session
	 * @param model
	 * @return
	 * @throws Exception
	 */
	@RequestMapping(value = "/capitalReport_test")
	public String capitalReport_test(HttpServletRequest request, HttpServletResponse response, HttpSession session, ModelMap model) throws Exception {
		//System.out.print((Map) request.getSession().getAttribute("userMap")); // 세션 불러오기
		Map param = IfrsUtil.parameterToHm(request);
		param.put("codeType", "accountType");
		List<Map> accountTypeList = commonService.getCodeList(param); 
		model.addAttribute("accountTypeList", IfrsUtil.ListToJsonArray( accountTypeList ) );
		param.put("capitalYn",	"Y");
		model.addAttribute("companyList", userService.getCompanyList(param));		
		model.addAttribute("SESSION", ((Map) request.getSession().getAttribute("userMap")).get("COM_NO")); // 소속 법인 번호
		model.addAttribute("userId",   		((Map) request.getSession().getAttribute("userMap")).get("USER_ID") );
		return "capital/capitalReport_test";
	}
		
	
	
	
	
	 @RequestMapping("/canvasUpload")
	 public String page_canvasUpload(HttpServletRequest request,  ModelMap model) throws Throwable{
	  return "/canv/canvasUpload";
	 }
	 
	 @RequestMapping("/ajax_Upload_proc") 
	 @ResponseBody
	 public String ajax_Upload_proc(HttpServletRequest request, String strImg, String height) throws Throwable{
	  
	  String uploadpath="uploadfile\\";
	  String folder = EgovProperties.getProperty("Globals.saveDir") + File.separator + SmileGateGlobals.CAPITAL_UPLOAD_FOLDER + File.separator;
	  
	  //String folder= request.getSession().getServletContext().getRealPath("/") + "images/ifrs/" + uploadpath;
	  
	  //System.out.println(folder);
	  
	  String fullpath="";
	  String[] strParts=strImg.split(",");
	  String rstStrImg=strParts[1];  //,로 구분하여 뒷 부분 이미지 데이터를 임시저장
	  SimpleDateFormat sdf=new SimpleDateFormat("yyyyMMdd_hhmmss"); 
	  String filenm=sdf.format(new Date()).toString()+"_capitalimg2.png";
	  String tempFilenm=sdf.format(new Date()).toString()+ "_temp_capitalimg2.png";
	  
	  BufferedImage image=null;
	  byte[] byteImg;
	  
	  BASE64Decoder decoder = new BASE64Decoder();
	  byteImg = decoder.decodeBuffer(rstStrImg);  //base64 디코더를 이용하여 byte 코드로 변환
	  ByteArrayInputStream bis= new ByteArrayInputStream(byteImg);
	  image= ImageIO.read(bis);   //BufferedImage형식으로 변환후 저장
	  bis.close();
	  
	  fullpath=folder+filenm;
	  File folderObj= new File(folder);
	  if( !folderObj.isDirectory() ) folderObj.mkdir();
	  File orgFile= new File(folder + tempFilenm);  //파일객체 생성
	  File outputFile= new File(fullpath);  //파일객체 생성
	  
	  if( outputFile.exists() ) outputFile.delete();
	  
	  if( Integer.parseInt(height) > 4200 ){
		  if( orgFile.exists() ) orgFile.delete();
		  ImageIO.write(image, "png", orgFile); //서버에 파일로 저장
		  ImageUtil.resize(orgFile, outputFile, 0, 4200);
	  }else{
		  ImageIO.write(image, "png", outputFile); //서버에 파일로 저장
	  }
	  
	  return filenm;
	 }

	 @RequestMapping(value ="/ajax_canvasUpload_proc", method=RequestMethod.POST) 
	 public String ajax_canvasUpload_proc(HttpSession session, @RequestBody Map<String, Object> map, ModelMap model) throws Throwable{
	  
		 try {
				String uploadpath="uploadfile\\";
				String folder = EgovProperties.getProperty("Globals.saveDir") + File.separator + SmileGateGlobals.CAPITAL_UPLOAD_FOLDER + File.separator;
				String fullpath="";
				String imgeFile= (String) map.get("imageFile");
				String[] strParts= imgeFile.split(",");
				String rstStrImg=strParts[1];  //,로 구분하여 뒷 부분 이미지 데이터를 임시저장
				SimpleDateFormat sdf=new SimpleDateFormat("yyyyMMdd_hhmmss"); 
				String filenm=sdf.format(new Date()).toString()+"_capitalimg2.png";
			  
				//BufferedImage image=null;
				Image image=null;
				Image resizeImage=null;
				
				byte[] byteImg;
			  
				BASE64Decoder decoder = new BASE64Decoder();
				byteImg = decoder.decodeBuffer(rstStrImg);  //base64 디코더를 이용하여 byte 코드로 변환
				ByteArrayInputStream bis= new ByteArrayInputStream(byteImg);
				image= ImageIO.read(bis);   //BufferedImage형식으로 변환후 저장
				bis.close();
				
				//20210603 남현식 ICM-8713 주간자금일보 메일 전송시 이미지 1/2 크기 줄이기 => 800 너비 고정 
				int originWidth = image.getWidth(null);
				int originHeight = image.getHeight(null);
				int newWidth = 600; //originWidth/2; //ICM-8829, 21.06.14 박주연, 800=>600변경 
				int newHeight = (originHeight * newWidth) / originWidth;
				
				log.info("이미지 크기 조절 originWidth ==> " + originWidth);
				log.info("이미지 크기 조절 originHeight ==> " + originHeight);
				log.info("이미지 크기 조절 newWidth ==> " + newWidth);
				log.info("이미지 크기 조절 newHeight ==> " + newHeight);
				
				resizeImage = image.getScaledInstance(newWidth, newHeight, Image.SCALE_SMOOTH);	
			    BufferedImage newImage = new BufferedImage(newWidth, newHeight, BufferedImage.TYPE_INT_RGB); //TYPE_INT_ARGB
			    
			    Graphics graphics = newImage.getGraphics();
			    graphics.drawImage(resizeImage, 0, 0, null);
				graphics.dispose();
			  
				fullpath=folder+filenm;				
				log.info("이미지 크기 조절 fullpath ==> " + fullpath);
				
				File folderObj= new File(folder);
				if( !folderObj.isDirectory() ) folderObj.mkdir();
				File outputFile= new File(fullpath);  //파일객체 생성
				if( outputFile.exists() ) outputFile.delete();
				//ImageIO.write(image, "png", outputFile); //서버에 파일로 저장
				ImageIO.write(newImage, "png", outputFile); //서버에 파일로 저장
				
				model.addAttribute("result", "success");
				model.addAttribute("fileNm", filenm);
			} catch (Exception e) {
				model.addAttribute("result", "fail");
				e.printStackTrace();
			}
			return "jsonView";
	 }

	
	
	/*-----------------------------------------------           계좌현황조회            --------------------------------------------------------*/
	
	/**
	 * 자금일보-계좌현황조회 [화면]
	 * @param request
	 * @param response
	 * @param session
	 * @param model
	 * @return
	 * @throws Exception
	 */
	@RequestMapping(value = "/capitalAccountAction")
	public String capitalAccountAction(HttpServletRequest request, HttpServletResponse response, HttpSession session, ModelMap model) throws Exception {
		Map param = IfrsUtil.parameterToHm(request);
		param.put("codeType", "accountType");
		List<Map> accountTypeList = commonService.getCodeList(param); 
		model.addAttribute("accountTypeList", IfrsUtil.ListToJsonArray( accountTypeList ) );
		param.put("capitalYn",	"Y");		
		model.addAttribute("companyList", userService.getCompanyList(param));
		model.addAttribute("SESSION", ((Map) request.getSession().getAttribute("userMap")).get("COM_NO")); // 소속 법인 번호
		model.addAttribute("userId",   		((Map) request.getSession().getAttribute("userMap")).get("USER_ID") );
		return "capital/capitalAccountAction";
	}	
	
	
	/**
	 * 자금일보-계좌현황조회[조회]
	 * @param request
	 * @param response
	 * @param session
	 * @param model
	 * @return
	 * @throws Exception
	 */
	@RequestMapping(value = "/IfrsAssetListAjax5")
	public String IfrsAssetListAjax5(HttpServletRequest request, HttpServletResponse response, HttpSession session, ModelMap model) throws Exception {
		Map param = IfrsUtil.parameterToHm(request);
		List<Map> IfrsCMSINList = capitalService.selectAssetListAjax5( param ) ;
		model.addAttribute("list",   IfrsCMSINList);
		return "jsonView";
	}		
	
	
	
	/**
	 * 자금일보-계좌현황조회[조회]
	 * @param request
	 * @param response
	 * @param session
	 * @param model
	 * @return
	 * @throws Exception
	 */
	@RequestMapping(value = "/NavigationTiming")
	public String NavigationTiming(HttpServletRequest request, HttpServletResponse response, HttpSession session, ModelMap model) throws Exception {
		Map param = IfrsUtil.parameterToHm(request);
		List<Map> IfrsCMSINList = capitalService.selectAssetListAjax5( param ) ;
		model.addAttribute("list",   IfrsCMSINList);
		return "jsonView";
	}	
	
	
	
	/*-----------------------------------------------           자금일보 등록(업로드)            --------------------------------------------------------*/
	
	/**
	 * 자금일보-자금일보 등록(업로드) [화면]
	 * @param request
	 * @param response
	 * @param session
	 * @param model
	 * @return
	 * @throws Exception
	 */
	@RequestMapping(value = "/capitalReportUpload")
	public String capitalReportUpload(HttpServletRequest request, HttpServletResponse response, HttpSession session, ModelMap model) throws Exception {
		Map param = IfrsUtil.parameterToHm(request);
		Map userMap = IfrsUtil.getSession(request);
		param.put("codeType", "accountType");
		List<Map> accountTypeList = commonService.getCodeList(param); 
		model.addAttribute("accountTypeList", IfrsUtil.ListToJsonArray( accountTypeList ) );
		param.put("capitalYn",	"Y");
		param.put("authType", userMap.get("AUTH_TYPE"));
		model.addAttribute("companyList", userService.getCompanyList(param));
		model.addAttribute("SESSION", ((Map) request.getSession().getAttribute("userMap")).get("COM_NO")); // 소속 법인 번호
		model.addAttribute("userId",   		((Map) request.getSession().getAttribute("userMap")).get("USER_ID") );
		return "capital/capitalReportUpload";
	}		
	
	/**
	 * 자금일보-자금일보 삭제 [삭제]
	 * @param request
	 * @param response
	 * @param session
	 * @throws Exception
	 */
	@RequestMapping(value = "/IfrsCapitalDelete")
	public void IfrsCapitalDelete(HttpServletRequest request, HttpServletResponse response, HttpSession session) throws Exception {
		Map param = IfrsUtil.parameterToHm(request);
		capitalService.IfrsCapitalDeleteAjax( param ) ;
	}	
	
	@RequestMapping(value = "/mailList")
	public String mailList(HttpServletRequest request, HttpServletResponse response, HttpSession session, ModelMap model) throws Exception {
		String companyseq = request.getParameter("companyseq");
		String bccuserFlag = request.getParameter("bccuserFlag");
		//System.out.print(companyseq);
		model.addAttribute("companyseq", companyseq);
		model.addAttribute("bccuserFlag", bccuserFlag);
		model.addAttribute("userId", ((Map) request.getSession().getAttribute("userMap")).get("USER_ID") );
		model.addAttribute("deptCd", ((Map) request.getSession().getAttribute("userMap")).get("DEPT_CD"));
		return "capital/mailList";
	}	
	
	@RequestMapping(value = "/saveMail")
	public String saveMail(HttpServletRequest request, HttpServletResponse response) throws Exception {
		Map param = IfrsUtil.parameterToHm(request);
		capitalService.saveMail(param);		
		return "jsonView";
	}	
	
	@RequestMapping(value = "/selectMail")
	public String selectMail(HttpServletRequest request, HttpServletResponse response, ModelMap model) throws Exception {
		Map param = IfrsUtil.parameterToHm(request);
		capitalService.selectMail(param);			
		List<Map> selectMailList = capitalService.selectMail(param);
		model.addAttribute("list",   selectMailList);
		
		return "jsonView";
	}		
	
	@RequestMapping(value = "/selectDeptMail")
	public String selectDeptMail(HttpServletRequest request, HttpServletResponse response, ModelMap model) throws Exception {
		Map param = IfrsUtil.parameterToHm(request);
		capitalService.selectMail(param);			
		List<Map> selectMailList = capitalService.selectDeptMail(param);
		model.addAttribute("list",   selectMailList);
		model.addAttribute("deptmail", param.get("deptmail"));
		return "jsonView";
	}		
	
	@RequestMapping(value = "/selectDeptCd")
	public String selectDeptCd(HttpServletRequest request, HttpServletResponse response, ModelMap model) throws Exception {
		Map param = IfrsUtil.parameterToHm(request);
		capitalService.selectMail(param);			
		List<Map> selectDeptCd = capitalService.selectDeptCd(param);
		model.addAttribute("list",   selectDeptCd);				
		return "jsonView";
	}		
	
	
	@RequestMapping(value = "/holyday")
	public String holyday(HttpServletRequest request, HttpServletResponse response, ModelMap model) throws Exception {
		Map param = IfrsUtil.parameterToHm(request);
		
		System.out.print(param);
		
		List<Map> holyday = capitalService.holyday(param);
		model.addAttribute("list",   holyday);				
		return "jsonView";
	}
	
	@RequestMapping(value = "/holydayCheck")
	public String holydayCheck(HttpServletRequest request, HttpServletResponse response, ModelMap model) throws Exception {
		Map param = IfrsUtil.parameterToHm(request);
		
		System.out.print(param);
		  
		model.addAttribute("list",   capitalService.holydayChk2(param));				
		return "jsonView";
	}
	
	
	@RequestMapping(value = "/week")
	public String week(HttpServletRequest request, HttpServletResponse response, ModelMap model) throws Exception {
		Map param = IfrsUtil.parameterToHm(request);
		List<Map> week = capitalService.week(param);
		model.addAttribute("list",   week);				
		return "jsonView";
	}		
	
	
	
	
	@RequestMapping(value = "/insertSendMail")
	public String insertSendMail(HttpServletRequest request, HttpServletResponse response, ModelMap model) throws Exception {	
		Map param = IfrsUtil.parameterToHm(request);
		//System.out.print(param);		
		capitalService.insertSendMail(param);		
		return "jsonView";
	}	
	
	
	@RequestMapping(value = "/insertSendMail_test")
	public String insertSendMail_test(HttpServletRequest request, HttpServletResponse response, ModelMap model) throws Exception {
		Map param = IfrsUtil.parameterToHm(request);
		
		//System.out.print(param);
		
		String fromName = request.getParameter("fromName");
		String fromMail = request.getParameter("fromMail");
		String toMail = request.getParameter("toMail");
		//String toMail = "gjchoi@smilegate.com";
		String alertSubject = request.getParameter("alertSubject");
		String alertMessage = request.getParameter("alertMessage");
		String filelist1 = request.getParameter("filelist1");
		String filelist2 = request.getParameter("filelist2");
		String filelist3 = request.getParameter("filelist3");
		
		String imgageData1 = request.getParameter("imgageData1");
		String imgageData2 = request.getParameter("imgageData2");
		
		capitalService.insertSendMail(param);

	    try {
	      MimeMessage message = mailSender.createMimeMessage();
	      MimeMessageHelper messageHelper 
	                        = new MimeMessageHelper(message, true, "UTF-8");
	      
	      String folder = EgovProperties.getProperty("Globals.saveDir") + File.separator + SmileGateGlobals.CAPITAL_UPLOAD_FOLDER + File.separator;
	      
	      FileSystemResource file1 = new FileSystemResource(folder+filelist1);
    	  FileSystemResource file2 = new FileSystemResource(folder+filelist2);
	      FileSystemResource file3 = new FileSystemResource(folder+filelist3);
	      
	      messageHelper.setFrom(fromMail,fromName);  // 보내는사람 생략하거나 하면 정상작동을 안함
	      messageHelper.setTo(toMail);     // 받는사람 이메일
	      messageHelper.setSubject(alertSubject); // 메일제목은 생략이 가능하다
	      messageHelper.setText("<html><body>" + imgageData1 + "<img src='cid:image1'> " + imgageData2 + " </body></html>",true);  // 메일 내용
	      messageHelper.addInline("image1", new FileDataSource(folder+filelist1));
	      messageHelper.addAttachment("Report.png", file1);
	      if ( !filelist2.equals("noimg.png") ) {
	    	  messageHelper.addAttachment("SavingsAndInstallment.png", file2);
	      }
	      if ( !filelist3.equals("noimg.png") ) {
	    	  messageHelper.addAttachment("CashierCashbook.png", file3);
	      }
	      	      	      
	      mailSender.send(message);
	      
	    } catch(Exception e){
	      System.out.println(e);
	    }		
				
		return "jsonView";
	}	
	
	@RequestMapping(value = "/insertSendMail_tests")
	public String insertSendMail_tests(HttpServletRequest request, HttpServletResponse response, ModelMap model) throws Exception {
		Map param = IfrsUtil.parameterToHm(request);
		
		//System.out.print(param);	
		
		//슈퍼크리에이티브 메일수신 유저 임시처리
		List<String> superUsers = new ArrayList<String>(Arrays.asList("goeun", "jc98", "yes990104", "parkyo", "kyna", "soya", "hjcho"));
		
		
		String fromId = request.getParameter("fromId");
		String fromName = request.getParameter("fromName");
		String fromMail = request.getParameter("fromMail");
		
		log.info("fromId==>" + fromId);
		
		//슈퍼크리에이티브 메일수신 유저 임시처리
		if(superUsers.contains(fromId)) {			
			fromMail = fromMail.replace("@smilegate.com", "@supercreative.kr");		
			log.info("fromMail==>" + fromMail);
		}
		
		String toMail = request.getParameter("toMail");
		String mailList = request.getParameter("mailList");
		String [] list = (String[]) (null != mailList && !"".equals(mailList) ? mailList.split(",") : "");
		//String toMail = "gjchoi@smilegate.com";
		String alertSubject = request.getParameter("alertSubject");
		String alertMessage = request.getParameter("alertMessage");
		String filelist1 = request.getParameter("filelist1");
		
		
		String filelist2 = request.getParameter("filelist2");
		String filelist3 = request.getParameter("filelist3");
		
		String imageData1 = request.getParameter("imageData1");
		String imageData2 = request.getParameter("imageData2");
		
		String noimg = "noimg.png";
		

		
	    try {
	    	
	    	if (0 < list.length) {
				for (int i=0; i<list.length; i++) {
					if (!"".equals(list[i])) {					
						//슈퍼크리에이티브 메일수신 유저 임시처리
						if("@smilegate.com".equals(toMail) && superUsers.contains(list[i])) {							
							param.put("toMail", list[i] + "@supercreative.kr");												
						}else {
							param.put("toMail", list[i] + "" + toMail);
						}						
						log.info("toMail==>" + list[i] + "" + toMail);
						param.put("toId", list[i]);
						log.info("toName==>" + list[i]);
						capitalService.insertSendMail(param);
					}
				}
			}
	    	
	    	//20200629 로그찍기
	    	if(null != fromName){
	    		log.info("fromName==>" + fromName);
	    	}
	    	
	    	if(null != fromMail){
	    		log.info("fromMail==>" + fromMail);
	    	}
	    	
	    	if(null != toMail){
	    		log.info("toMail==>" + toMail);
	    	}
	    	
	    	if(null != mailList){
	    		log.info("mailList==>" + mailList);
	    	}
	    	
	    	if(null != alertSubject){
	    		log.info("alertSubject==>" + alertSubject);
	    	}
	    	
	    	if(null != alertMessage){
	    		log.info("alertMessage==>" + alertMessage);
	    	}
	    	
	    	if(null != filelist1){
	    		log.info("filelist1==>" + filelist1);
	    	}
	    	
	    	if(null != filelist2){
	    		log.info("filelist2==>" + filelist2);
	    	}
	    	
	    	if(null != filelist3){
	    		log.info("filelist3==>" + filelist3);
	    	}
	    	
	    	if(null != list){
	    		log.info("list==>" + list);
	    	}

	      MimeMessage message = mailSender.createMimeMessage();
	      log.info("message===============>" + message);
	      MimeMessageHelper messageHelper 
	                        = new MimeMessageHelper(message, true, "UTF-8");
	      log.info("messageHelper===============>" + messageHelper);
	      String folder = EgovProperties.getProperty("Globals.saveDir") + File.separator + SmileGateGlobals.CAPITAL_UPLOAD_FOLDER + File.separator;
	      log.info("folder===============>" + folder);
	      String host = EgovProperties.getProperty("Globals.fileHost");
	      log.info("host===============>" + host);
	      
	      /*FileSystemResource file1 = new FileSystemResource(folder+filelist1);
    	  FileSystemResource file2 = new FileSystemResource(folder+filelist2);
	      FileSystemResource file3 = new FileSystemResource(folder+filelist3);*/
	      
	      FileSystemResource file1;
	      FileSystemResource file2;
	      FileSystemResource file3;
	      
	      
	      messageHelper.setFrom(fromMail,fromName);  // 보내는사람 생략하거나 하면 정상작동을 안함
	      log.info("messageHelper.setFrom1===============>" + fromMail);
	      log.info("messageHelper.setFrom2===============>" + fromName);
	      messageHelper.setSubject(alertSubject); // 메일제목은 생략이 가능하다
	      log.info("messageHelper.setSubject===============>" + alertSubject);
	      
	      List cropList = imageCrop(filelist1);
	      
	      if(null != cropList){
	    	  log.info("cropList===============>" + cropList);
	    	  log.info("cropList.size===============>" + cropList.size());
	      }else {
	    	  log.info("cropList===============>null");
	      }
	      
	      
			
	      String image = "";
	      if (0 == cropList.size()) {
	    	  image = "<br><img src='"+host+"/upload/capital/"+filelist1+"'> ";
	    	  log.info("image1===============>" + image);
	      } else {
	    	  for (int i=0; i<cropList.size(); i++) {
	    		  image += "<br><img src='"+host+"/upload/capital/"+cropList.get(i)+"'> ";
	    		  log.info("image2===============>" + image);
	    	  }
	      }
			
	      messageHelper.setText("<html><body>" + imageData1 + image + imageData2 + " </body></html>",true);  // 메일 내용
	      log.info("messageHelper.setText===============>" + "<html><body>" + imageData1 + image + imageData2 + " </body></html>");
	      
	      //messageHelper.addInline("image1", new FileDataSource(folder+filelist1));
	      file1 = new FileSystemResource(folder+filelist1);
	      messageHelper.addAttachment("Report.png", file1);
	      log.info("file1-1==>" + file1);
	      //if ( !filelist2.equals("noimg.png") ) {
	      if ( !filelist2.equals(noimg) ) {
	    	  file2 = new FileSystemResource(folder+filelist2);
	    	  messageHelper.addAttachment("SavingsAndInstallment.png", file2);
	    	  log.info("file2-2==>" + file2);
	      }
	      //if ( !filelist3.equals("noimg.png") ) {
	      if ( !filelist3.equals(noimg) ) {
	    	  file3 = new FileSystemResource(folder+filelist3);
	    	  messageHelper.addAttachment("CashierCashbook.png", file3);
	    	  log.info("file3-3==>" + file3);
	      }
	      int result = 0;
	      String resultYn = "N";
	      
	      if (0 < list.length) {
	    	  for (int i=0; i<list.length; i++) {
	    		  if (!"".equals(list[i])) {
	    			//슈퍼크리에이티브 메일수신 유저 임시처리
						if("@smilegate.com".equals(toMail) && superUsers.contains(list[i])) {
								messageHelper.setTo(list[i] + "@supercreative.kr");     													
						}else {							
							messageHelper.setTo(list[i] + "" + toMail);     // 받는사람 이메일
						}	
	    			  
		    	      mailSender.send(message);
		    	      log.info("toMail===>>>>>" + i + ">>>" + list[i] + toMail);
		    	      log.info("message===>>>>>" + i + ">>>" + message);
		    	      result++;
	    		  }
	    	  }
	      }
	      
	      log.info("result===>>>>>" + result);
    	  log.info("list.length===>>>>>" + list.length);
	     /* if(result == list.length){
	    	  resultYn = "Y";
	      }*/
	      
	      model.addAttribute("result", (0 == result ? "N" : "Y"));
	      //model.addAttribute("result", resultYn);
	      
	    }catch (AddressException e) { // TODO Auto-generated catch block e.printStackTrace(); }
			model.addAttribute("result", "false");
			System.out.println(e);
			e.printStackTrace();
			log.info("AddressException===>>>>>");
			
		}catch (MessagingException e) {
			model.addAttribute("result", "false");
			System.out.println(e);
			e.printStackTrace();
			log.info("MessagingException===>>>>>");
			 
		}catch(Exception e){
			model.addAttribute("result", "false");
			System.out.println(e);
			e.printStackTrace();
			log.info("Exception===>>>>>");
		}		
				
		return "jsonView";
	}	
	
	
	/*-----------------------------------------------           주간(기간별) 자금일보            --------------------------------------------------------*/
	
	
	/**
	 * 자금일보-금융자산내역 작성 [화면]
	 * @param request
	 * @param response
	 * @param session
	 * @param model
	 * @return
	 * @throws Exception
	 */
	@RequestMapping(value = "/capitalReport1")
	public String capitalReport1(HttpServletRequest request, HttpServletResponse response, HttpSession session, ModelMap model) throws Exception {

		Map param = IfrsUtil.parameterToHm(request);
		param.put("capitalYn",	"Y");
		
		String toDay = DateUtil.getTodayString("yyyyMMdd");
		param.put("serdate",	toDay);
		
		List<Map> weekMap = new ArrayList<Map>();
		weekMap = capitalService.week(param);
		
		model.addAttribute("sDate", weekMap.get(0).get("sDate"));
		model.addAttribute("eDate", weekMap.get(0).get("eDate"));
		model.addAttribute("sYear", weekMap.get(0).get("eYear"));
		model.addAttribute("sMonth", weekMap.get(0).get("eMonth"));
		model.addAttribute("sWeek", weekMap.get(0).get("eWeek"));
		
		model.addAttribute("companyList", capitalService.selectCapitalCompanyList());		
		model.addAttribute("SESSION", ((Map) request.getSession().getAttribute("userMap")).get("COM_NO")); // 소속 법인 번호
		model.addAttribute("userid", ((Map) request.getSession().getAttribute("userMap")).get("USER_ID")); // 사용자ID
		model.addAttribute("userId",   		((Map) request.getSession().getAttribute("userMap")).get("USER_ID") );
				
		List<Map> graphSettingList = capitalService.selectCompanyGraphSetting(); 
		model.addAttribute("graphSettingList", IfrsUtil.ListToJsonArray(graphSettingList));
		
		return "capital/capitalReport1";
	}	
	
	/**
	 * 자금일보-금융자산내역 작성 [화면]
	 * @param request
	 * @param response
	 * @param session
	 * @param model
	 * @return
	 * @throws Exception
	 */
	@RequestMapping(value = "/capitalReport2")
	public String capitalReport2(HttpServletRequest request, HttpServletResponse response, HttpSession session, ModelMap model) throws Exception {

		Map param = IfrsUtil.parameterToHm(request);
		param.put("capitalYn",	"Y");
		
		String toDay = DateUtil.getTodayString("yyyyMMdd");
		param.put("serdate",	toDay);
		
		List<Map> weekMap = new ArrayList<Map>();
		weekMap = capitalService.week(param);
		
		model.addAttribute("sDate", weekMap.get(0).get("sDate"));
		model.addAttribute("eDate", weekMap.get(0).get("eDate"));
		model.addAttribute("sYear", weekMap.get(0).get("eYear"));
		model.addAttribute("sMonth", weekMap.get(0).get("eMonth"));
		model.addAttribute("sWeek", weekMap.get(0).get("eWeek"));
		
		model.addAttribute("companyList", capitalService.selectCapitalCompanyList());		
		model.addAttribute("SESSION", ((Map) request.getSession().getAttribute("userMap")).get("COM_NO")); // 소속 법인 번호
		model.addAttribute("userid", ((Map) request.getSession().getAttribute("userMap")).get("USER_ID")); // 사용자ID
		model.addAttribute("userId",   		((Map) request.getSession().getAttribute("userMap")).get("USER_ID") );
		
		List<Map> graphSettingList = capitalService.selectCompanyGraphSetting(); 
		model.addAttribute("graphSettingList", IfrsUtil.ListToJsonArray(graphSettingList));
		
		return "capital/capitalReport2";
	}		
	
	
	/**
	 * 자금일보-예적금 현황 작성 [화면]
	 * @param request
	 * @param response
	 * @param session
	 * @param model
	 * @return
	 * @throws Exception
	 */
	@RequestMapping(value = "/capitalReport3")
	public String capitalReport3(HttpServletRequest request, HttpServletResponse response, HttpSession session, ModelMap model) throws Exception {
		//System.out.print((Map) request.getSession().getAttribute("userMap")); // 세션 불러오기
		Map param = IfrsUtil.parameterToHm(request);
		Map userMap = IfrsUtil.getSession(request);
		param.put("codeType", "accountType");
		List<Map> accountTypeList = commonService.getCodeList(param); 
		model.addAttribute("accountTypeList", IfrsUtil.ListToJsonArray( accountTypeList ) );
		param.put("capitalYn",	"Y");
		param.put("authType", userMap.get("AUTH_TYPE"));
		model.addAttribute("companyList", userService.getCompanyList(param));		
		model.addAttribute("SESSION", ((Map) request.getSession().getAttribute("userMap")).get("COM_NO")); // 소속 법인 번호
		model.addAttribute("userid", ((Map) request.getSession().getAttribute("userMap")).get("USER_ID")); // 사용자ID
		model.addAttribute("userId",   		((Map) request.getSession().getAttribute("userMap")).get("USER_ID") );
		return "capital/capitalReport3";
	}				
	
	
	/**
	 * 자금일보-현금출납장 작성 [화면]
	 * @param request
	 * @param response
	 * @param session
	 * @param model
	 * @return
	 * @throws Exception
	 */
	@RequestMapping(value = "/capitalReport4")
	public String capitalReport4(HttpServletRequest request, HttpServletResponse response, HttpSession session, ModelMap model) throws Exception {
		//System.out.print((Map) request.getSession().getAttribute("userMap")); // 세션 불러오기
		Map param = IfrsUtil.parameterToHm(request);
		Map userMap = IfrsUtil.getSession(request);
		param.put("codeType", "accountType");
		List<Map> accountTypeList = commonService.getCodeList(param); 
		model.addAttribute("accountTypeList", IfrsUtil.ListToJsonArray( accountTypeList ) );
		param.put("capitalYn",	"Y");
		param.put("authType", userMap.get("AUTH_TYPE"));
		model.addAttribute("companyList", userService.getCompanyList(param));		
		model.addAttribute("SESSION", ((Map) request.getSession().getAttribute("userMap")).get("COM_NO")); // 소속 법인 번호
		model.addAttribute("userid", ((Map) request.getSession().getAttribute("userMap")).get("USER_ID")); // 사용자ID
		model.addAttribute("userId",   		((Map) request.getSession().getAttribute("userMap")).get("USER_ID") );
		return "capital/capitalReport4";
	}			
	
	/**
	 * 자금일보-계좌현황조회 [화면]
	 * @param request
	 * @param response
	 * @param session
	 * @param model
	 * @return
	 * @throws Exception
	 */
	@RequestMapping(value = "/weeklist")
	public String weeklist(HttpServletRequest request, HttpServletResponse response, HttpSession session, ModelMap model) throws Exception {
		Map param = IfrsUtil.parameterToHm(request);
		param.put("codeType", "accountType");
		List<Map> accountTypeList = commonService.getCodeList(param); 
		model.addAttribute("accountTypeList", IfrsUtil.ListToJsonArray( accountTypeList ) );
		param.put("capitalYn",	"Y");		
		model.addAttribute("companyList", userService.getCompanyList(param));
		model.addAttribute("SESSION", ((Map) request.getSession().getAttribute("userMap")).get("COM_NO")); // 소속 법인 번호
		model.addAttribute("userId",   		((Map) request.getSession().getAttribute("userMap")).get("USER_ID") );
		return "capital/weeklist";
	}		
	
	
	@RequestMapping(value = "/IfrsWeekReport1")
	public String IfrsWeekReport1(HttpServletRequest request, HttpServletResponse response, ModelMap model) throws Exception {
		Map param = IfrsUtil.parameterToHm(request);
		
		Map<String, Object> IfrsWeekReport1 = capitalService.IfrsWeekReport1(param);
		model.addAttribute("list",   IfrsWeekReport1);
		
		// 전주 마지막 날짜 가져오기
		String previousWeekEndDate = capitalService.IfrsPreviousWeekEndDate(param);
		if (null == previousWeekEndDate){
			previousWeekEndDate = (String) param.get("sdate");
		}
		param.put("sdate", previousWeekEndDate);
		param.put("edate", previousWeekEndDate);		
		param.put("sType", "3");
		// 전주 마지막 날짜의 잔액 가져오기
		Map<String, Object> IfrsWeekReportTemp = capitalService.IfrsWeekReport1(param);
		List<Map> list = (List<Map>) IfrsWeekReportTemp.get("weekReport");
		
		//2020.10.30. 김승희 
		//Double basicBalance = (list.isEmpty() ? 0 : (Double) list.get(0).get("cramt"));
		Double basicBalance = 0.0;
		
		if(!list.isEmpty()){
			if(null != list.get(0).get("cramt")){
				//basicBalance = (Double) list.get(0).get("cramt");
				basicBalance = Double.parseDouble(String.valueOf(list.get(0).get("cramt")));
			}
		}
		//end
		
		model.addAttribute("basicBalance", basicBalance);
		
		return "jsonView";
	}	
	
	@RequestMapping(value = "/IfrsWeekReport3")
	public String IfrsWeekReport3(HttpServletRequest request, HttpServletResponse response, ModelMap model) throws Exception {
		Map param = IfrsUtil.parameterToHm(request);
		Map<String, Object> IfrsWeekReport3 = capitalService.IfrsWeekReport3(param);
		model.addAttribute("list",   IfrsWeekReport3);				
		return "jsonView";
	}			
	
	@RequestMapping(value = "/IfrsWeekReport4")
	public String IfrsWeekReport4(HttpServletRequest request, HttpServletResponse response, ModelMap model) throws Exception {
		Map param = IfrsUtil.parameterToHm(request);
		List<Map> IfrsWeekReport4 = capitalService.IfrsWeekReport4(param);
		model.addAttribute("list",   IfrsWeekReport4);				
		return "jsonView";
	}		
	
	@RequestMapping(value = "/IfrsWeekReport5")
	public String IfrsWeekReport5(HttpServletRequest request, HttpServletResponse response, ModelMap model) throws Exception {
		Map param = IfrsUtil.parameterToHm(request);
		List<Map> IfrsWeekReport5 = capitalService.IfrsWeekReport5(param);
		model.addAttribute("list",   IfrsWeekReport5);				
		return "jsonView";
	}			
	
	@RequestMapping(value = "/IfrsWeekReport6")
	public String IfrsWeekReport6(HttpServletRequest request, HttpServletResponse response, ModelMap model) throws Exception {
		Map param = IfrsUtil.parameterToHm(request);
		List<Map> IfrsWeekReport6 = capitalService.IfrsWeekReport6(param);
		model.addAttribute("list",   IfrsWeekReport6);				
		return "jsonView";
	}			
	
	@RequestMapping(value = "/IfrsWeekReport7")
	public String IfrsWeekReport7(HttpServletRequest request, HttpServletResponse response, ModelMap model) throws Exception {
		Map param = IfrsUtil.parameterToHm(request);
		List<Map> IfrsWeekReport7 = capitalService.IfrsWeekReport7(param);
		model.addAttribute("list",   IfrsWeekReport7);				
		return "jsonView";
	}		
	
	@RequestMapping(value = "/IfrsWeekReport8")
	public String IfrsWeekReport8(HttpServletRequest request, HttpServletResponse response, ModelMap model) throws Exception {
		Map param = IfrsUtil.parameterToHm(request);
		capitalService.IfrsWeekReport8(param);
		return "jsonView";
	}		
	
	@RequestMapping(value = "/IfrsWeekReport9")
	public String IfrsWeekReport9(HttpServletRequest request, HttpServletResponse response, ModelMap model) throws Exception {
		Map param = IfrsUtil.parameterToHm(request);
		List<Map> IfrsWeekReport9 = capitalService.IfrsWeekReport9(param);
		model.addAttribute("list",   IfrsWeekReport9);				
		return "jsonView";
	}		
	
	
	
	/**
	 * 자금일보-금융자산내역 작성-2) 보통예금 ERP [조회] // 금융기관별
	 * @param request
	 * @param response
	 * @param session
	 * @param model
	 * @return
	 * @throws Exception
	 */
	@RequestMapping(value = "/IfrsWeekReport10")
	public String IfrsWeekReport10(HttpServletRequest request, HttpServletResponse response, HttpSession session, ModelMap model) throws Exception {
		
		Map param = IfrsUtil.parameterToHm(request);
		String sdate1 = request.getParameter("sdate1");
		String sdate2 = request.getParameter("sdate2");
		String comNo = request.getParameter("comNo");
		
		String xmlDocument = "<ROOT>" +
				"<DataBlock1>" +
				"<WorkingTag>A</WorkingTag>" +
				"<IDX_NO>1</IDX_NO>" +
				"<Status>0</Status>" + 
				"<DataSeq>1</DataSeq>" +
			    "<Selected>1</Selected>" +
			    "<TABLE_NAME>DataBlock1</TABLE_NAME>" + 
			    "<IsChangedMst>1</IsChangedMst>" +
			    "<AccUnit>1</AccUnit>" +
			    "<FrAccDate>" + sdate1 + "</FrAccDate>" +
			    "<ToAccDate>" + sdate2 + "</ToAccDate>" +
			    "<BankSeq />" +
			    "<AccSeq />" +
			    "<SMAccStd>2</SMAccStd>" +  
			  "</DataBlock1>" +
			"</ROOT>";		

		param.put("xmlDocument", 	xmlDocument);		

		List<Map> AssetList = capitalService.IfrsWeekReport10( param ) ;
		model.addAttribute("list",   AssetList);
		return "jsonView";
	}		
	
	
	@RequestMapping(value = "/IfrsWeekReport11")
	public String IfrsWeekReport11(HttpServletRequest request, HttpServletResponse response) throws Exception {
		Map param = IfrsUtil.parameterToHm(request);
		param.put("registId", IfrsUtil.getSession(request).get("USER_ID").toString());	// ICM-11763 : 예적금 현황작성 / 현금출납장 작성 저장시 등록/수정자 ID 추가 ( 2022-03-15 : 김연준 )
		capitalService.IfrsWeekReport11(param);		
		return "jsonView";
	}
	
	@RequestMapping(value = "/IfrsWeekReport12")
	public String IfrsWeekReport12(HttpServletRequest request, HttpServletResponse response, ModelMap model) throws Exception {
		Map param = IfrsUtil.parameterToHm(request);
		List<Map> IfrsWeekReport12 = capitalService.IfrsWeekReport12(param);
		model.addAttribute("list",   IfrsWeekReport12);				
		return "jsonView";
	}		
	
	
	/**
	 * 자금일보-금융자산내역 작성-2) 보통예금 ERP [조회] // 금융기관별
	 * @param request
	 * @param response
	 * @param session
	 * @param model
	 * @return
	 * @throws Exception
	 */
	@RequestMapping(value = "/IfrsWeekReport13")
	public String IfrsWeekReport13(HttpServletRequest request, HttpServletResponse response, HttpSession session, ModelMap model) throws Exception {
		
		Map param = IfrsUtil.parameterToHm(request);
		String sdate1 = request.getParameter("sdate1");
		String sdate2 = request.getParameter("sdate2");
		String comNo = request.getParameter("comNo");
		
		String xmlDocument = "<ROOT>" +
				"<DataBlock1>" +
				"<WorkingTag>A</WorkingTag>" +
				"<IDX_NO>1</IDX_NO>" +
				"<Status>0</Status>" + 
				"<DataSeq>1</DataSeq>" +
			    "<Selected>1</Selected>" +
			    "<TABLE_NAME>DataBlock1</TABLE_NAME>" + 
			    "<IsChangedMst>1</IsChangedMst>" +
			    "<AccUnit>1</AccUnit>" +
			    "<AccDate>" + sdate1 + "</AccDate>" +
			    "<AccDateTo>" + sdate2 + "</AccDateTo>" +
			    "<CashKind>4042001</CashKind>" +
			    "<SlipUnit />" +
			    "<LinkCreateID />" +
			    "<SMAccStd>2</SMAccStd>" +
			  "</DataBlock1>" +
			"</ROOT>";		

		param.put("xmlDocument", 	xmlDocument);		

		List<Map> AssetList = capitalService.IfrsWeekReport13( param ) ;
		
		System.out.print(AssetList);
		
		model.addAttribute("list",   AssetList);
		return "jsonView";
	}			
	
	
	/**
	 * 자금일보-금융자산내역 작성-2) 보통예금 ERP [조회] // 금융기관별
	 * @param request
	 * @param response
	 * @param session
	 * @param model
	 * @return
	 * @throws Exception
	 */
	@RequestMapping(value = "/IfrsWeekReport14")
	public String IfrsWeekReport14(HttpServletRequest request, HttpServletResponse response, HttpSession session, ModelMap model) throws Exception {
		
		Map param = IfrsUtil.parameterToHm(request);
		String sdate1 = request.getParameter("sdate1");
		String sdate2 = request.getParameter("sdate2");
		String comNo = request.getParameter("comNo");
		
		String xmlDocument = "<ROOT>" +
				"<DataBlock1>" +
				"<WorkingTag>A</WorkingTag>" +
				"<IDX_NO>1</IDX_NO>" +
				"<Status>0</Status>" + 
				"<DataSeq>1</DataSeq>" +
			    "<Selected>1</Selected>" +
			    "<TABLE_NAME>DataBlock1</TABLE_NAME>" + 
			    "<IsChangedMst>0</IsChangedMst>" +
			    "<AccUnit>1</AccUnit>" +
			    "<AccDate>" + sdate1 + "</AccDate>" +
			    "<AccDateTo>" + sdate2 + "</AccDateTo>" +
			    "<CashKind>4042001</CashKind>" +
			    "<SlipUnit />" +
			    "<LinkCreateID />" +
			    "<SMAccStd>2</SMAccStd>" +
			  "</DataBlock1>" +
			"</ROOT>";		

		param.put("xmlDocument", 	xmlDocument);		

		List<Map> AssetList = capitalService.IfrsWeekReport14( param ) ;
		
		System.out.print(AssetList);
		
		model.addAttribute("list",   AssetList);
		return "jsonView";
	}		
	
	
	/**
	 * 자금일보-주간(기간별) 자금일보 [저장][-환율 및 메모]
	 * @param request
	 * @param response
	 * @param session
	 * @param model
	 * @return
	 * @throws Exception
	 */
	@RequestMapping(value = "/insertCapitalHistory")
	public String insertCapitalHistory(@RequestBody Map<String, Object> insertMap, HttpServletRequest request, HttpServletResponse response, HttpSession session, ModelMap model) throws Exception {
		
		try {
			insertMap.put("registId", IfrsUtil.getSession(request).get("USER_ID").toString());
			capitalService.insertCapitalHistory(insertMap);
			model.addAttribute("success", "Y");
		} catch (Exception e) {
			model.addAttribute("success", "N");
		}
		
		return "jsonView";
	}
	
	/**
	 * 자금일보-주간(기간별) 자금일보 [삭제][-환율 및 메모]
	 * @param deleteMap
	 * @param response
	 * @param session
	 * @param model
	 * @return
	 * @throws Exception
	 */
	@RequestMapping(value = "/deleteCapitalHistory")
	public String deleteCapitalHistory(@RequestBody Map<String, Object> deleteMap, HttpServletResponse response, HttpSession session, ModelMap model) throws Exception {
		
		try {
			capitalService.deleteCapitalHistory(deleteMap);
			model.addAttribute("success", "Y");
		} catch (Exception e) {
			model.addAttribute("success", "N");
		}
		
		return "jsonView";
	}
	
	
	/**
	 * 자금일보-주간(기간별) 자금일보 [환율조회]
	 * @param request
	 * @param response
	 * @param model
	 * @return
	 * @throws Exception
	 */
	@RequestMapping(value = "/IfrsWeekRate")
	public String IfrsWeekRate(HttpServletRequest request, HttpServletResponse response, ModelMap model) throws Exception {
		Map param = IfrsUtil.parameterToHm(request);					
		List<Map> IfrsWeekRateList = capitalService.IfrsWeekRate(param);
		model.addAttribute("list",   IfrsWeekRateList);
		return "jsonView";
	}	
	
	
	@RequestMapping(value = "/IfrsWeekRateList")
	public String IfrsWeekRateList(HttpServletRequest request, HttpServletResponse response, ModelMap model) throws Exception {
		Map param = IfrsUtil.parameterToHm(request);
		List<Map> IfrsWeekRateList = capitalService.IfrsWeekRateList(param);
		model.addAttribute("list",   IfrsWeekRateList);				
		return "jsonView";
	}		
	
	
	
	/**
	 * 자금일보-메일발송 로그 조회 [화면]
	 * @param request
	 * @param response
	 * @param session
	 * @param model
	 * @return
	 * @throws Exception
	 */
	@RequestMapping(value = "/mailsendlog")
	public String mailsendlog(HttpServletRequest request, HttpServletResponse response, HttpSession session, ModelMap model) throws Exception {
		//System.out.print((Map) request.getSession().getAttribute("userMap")); // 세션 불러오기
		Map param = IfrsUtil.parameterToHm(request);
		param.put("codeType", "accountType");
		List<Map> accountTypeList = commonService.getCodeList(param); 
		model.addAttribute("accountTypeList", IfrsUtil.ListToJsonArray( accountTypeList ) );
		param.put("capitalYn",	"Y");
		model.addAttribute("companyList", userService.getCompanyList(param));		
		model.addAttribute("SESSION", ((Map) request.getSession().getAttribute("userMap")).get("COM_NO")); // 소속 법인 번호
		model.addAttribute("userid", ((Map) request.getSession().getAttribute("userMap")).get("USER_ID")); // 사용자ID
		model.addAttribute("userId",   		((Map) request.getSession().getAttribute("userMap")).get("USER_ID") );
		return "capital/mailsendlog";
	}			
	
	
	@RequestMapping(value = "/mailsendlogAjax")
	public String mailsendlogAjax(HttpServletRequest request, HttpServletResponse response, ModelMap model) throws Exception {
		Map param = IfrsUtil.parameterToHm(request);
		List<Map> mailsendlogAjax = capitalService.mailsendlogAjax(param);
		model.addAttribute("list",   mailsendlogAjax);				
		return "jsonView";
	}			
	
	
	/*-----------------------------------------------           주간(기간별) 자금일보            --------------------------------------------------------*/

	
	/*-----------------------------------------------           엑셀 다운로드            --------------------------------------------------------*/
	
	
	
	
	
	
	/**
	  *  엑셀출력
	  */
	 @RequestMapping(value = "/excelReportMonth.do")
	 public String excelReportMonth(
	   HttpServletRequest request,
	   HttpServletResponse response,
	   ModelMap model
	  ) throws Exception {
	   
	  response.setContentType("Application/Msexcel");
	  response.setHeader("Content-Disposition", "ATTachment; Filename=test.xls");
	  
	  return "capital/excelReportMonth";

	 }	
	
	
	/**
	 * AUI 엑셀 다운로드
	 * @param request
	 * @param response
	 * @param session
	 * @param model
	 * @return
	 * @throws Exception
	 */
	@RequestMapping(value = "/export.do")
	public void carExportAUI(HttpServletRequest request, HttpServletResponse response, HttpSession session, ModelMap model) throws Exception {
		
		//AUIGrid Export 시 로컬에 다운로드 가능하도록 작성된 서버사이드 예제입니다.
		//AUIGrid 가 xlsx, csv, xml 등의 형식을 작성하여 base64 로 인코딩하여 data 파라메터로 post 요청을 합니다.
		//해당 서버 예제(본 JSP) 에서는 base64 로 인코딩 된 데이터를 디코드하여 다운로드 가능하도록 붙임으로 마무리합니다.
		//참고로 org.apache.commons.codec.binary.Base64 클래스 사용을 위해는 commons-codec-1.4.jar 파일이 필요합니다.
		
		
		ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
		
		String data = request.getParameter("data"); // 파라메터 data
		String extension = request.getParameter("extension"); // 파라메터 확장자
		
		// AUIGrid.exportToXlsx() 사용시 exportProps 로 파일명을 지정해 줬다면 다음과 같이 지정된 파일명을 얻을 수 있습니다.
		String req_fileName = URLDecoder.decode(request.getParameter("filename"), "UTF-8"); // 파라메터 파일명
		req_fileName= java.net.URLEncoder.encode(req_fileName, "UTF-8"); 
		
		byte[] dataByte = Base64.decodeBase64(data.getBytes()); // 데이터 base64 디코딩
		
		// csv 를 엑셀에서 열기 위해서는 euc-kr 로 작성해야 함.
		if(extension.equals("csv")) {
			String sting = new String(dataByte, "utf-8");
			outputStream.write(sting.getBytes("euc-kr"));
		} else {
			outputStream.write(dataByte);
		}
		
		String filename = req_fileName + "." + extension; // 다운로드 될 파일명
			
		response.reset();
		response.setContentType("application/octet-stream");
		response.setHeader("Content-Disposition","attachment; filename=" + filename );
		response.setHeader("Content-Length",String.valueOf(outputStream.size()));
		
		//out.clear();
		//pageContext.pushBody();
		ServletOutputStream sos = response.getOutputStream();
		sos.write(outputStream.toByteArray());
		sos.flush();
		sos.close();
	}

	@RequestMapping(value = "/insertSendMailAttr", produces="text/json; charset=utf-8", method=RequestMethod.POST)
	public String insertSendMailAttr(HttpServletRequest request, HttpServletResponse response, ModelMap model) throws Exception {
		
		Map param = IfrsUtil.parameterToHm(request);
		
		String fromName = request.getParameter("fromName");
		String fromMail = request.getParameter("fromMail");
		String alertSubject = request.getParameter("alertSubject");
		String alertMessage = request.getParameter("alertMessage");
		String filelist1 = request.getParameter("filelist1");
		String filelist2 = request.getParameter("filelist2");
		String filelist3 = request.getParameter("filelist3");
		
		String domain = EgovProperties.getProperty("Globals.domain").replace("smilegate.net", "smilegate.com");
		//test서버용
		//domain = domain.replace("smiledev.net", "smiledev.com");


		String toMail = request.getParameter("toMail");
		String attuserMail = request.getParameter("attuserMail");
		String bccuserMail = request.getParameter("bccuserMail");
		
		String imgageData1 = request.getParameter("imgageData1");
		String imgageData2 = request.getParameter("imgageData2");
		
		String noimg = "noimg.png";

		// to mail
		List<String> toMailList = new ArrayList<String>();
		
		String toMailSp[] = toMail.split(",");
		
		for(int i = 0; i < toMailSp.length; i++){
			if(!"".equals(StringUtil.nvl(toMailSp[i]))){
				toMailList.add(toMailSp[i] + "@" + domain);
				
				param.put("toMail", toMailSp[i] + "@" + domain);
				//test
				//param.put("toMail", toMailSp[i] + "@smiledev.com");
				param.put("toId", toMailSp[i]);
				capitalService.insertSendMail(param);
				
			}
		};
		
		String toMailArr[] = ( String[]) toMailList.toArray( new String[ toMailList.size()]);
		
		// 참조 mail
		List<String> attuserMailList = new ArrayList<String>();
		
		String attuserMailSp[] = attuserMail.split(",");
		
		for(int i = 0; i < attuserMailSp.length; i++){
			if(!"".equals(StringUtil.nvl(attuserMailSp[i]))){
				attuserMailList.add(attuserMailSp[i] + "@" + domain);
				
				param.put("toMail", attuserMailSp[i] + "@" + domain);
				param.put("toId", attuserMailSp[i]);
				capitalService.insertSendMail(param);
			}
		};
		
		String attuserMailArr[] = ( String[]) attuserMailList.toArray( new String[ attuserMailList.size()]);
		
		// 숨은참조 mail
		List<String> bccuserMailList = new ArrayList<String>();
		
		String bccuserMailSp[] = bccuserMail.split(",");
		
		for(int i = 0; i < bccuserMailSp.length; i++){
			if(!"".equals(StringUtil.nvl(bccuserMailSp[i]))){
				bccuserMailList.add(bccuserMailSp[i] + "@" + domain);
				
				param.put("toMail", bccuserMailSp[i] + "@" + domain);
				param.put("toId", bccuserMailSp[i]);
				capitalService.insertSendMail(param); 

			}
		};
		
		String bccuserMailArr[] = ( String[]) bccuserMailList.toArray( new String[ bccuserMailList.size()]);
		
		try {
			
			//20200629 로그찍기
	    	if(null != fromName){
	    		log.info("fromName==>" + fromName);
	    	}
	    	
	    	if(null != fromMail){
	    		log.info("fromMail==>" + fromMail);
	    	}
	    	
	    	if(null != toMail){
	    		log.info("toMail==>" + toMail);
	    	}
	    	
	    	if(null != alertSubject){
	    		log.info("alertSubject==>" + alertSubject);
	    	}
	    	
	    	if(null != alertMessage){
	    		log.info("alertMessage==>" + alertMessage);
	    	}
	    	
	    	if(null != filelist1){
	    		log.info("filelist1==>" + filelist1);
	    	}
	    	
	    	if(null != filelist2){
	    		log.info("filelist2==>" + filelist2);
	    	}
	    	
	    	if(null != filelist3){
	    		log.info("filelist3==>" + filelist3);
	    	}
	    	
	    	if(null != attuserMail){
	    		log.info("attuserMail==>" + attuserMail);
	    	}
	    	
	    	if(null != bccuserMail){
	    		log.info("bccuserMail==>" + bccuserMail);
	    	}
	    	
	    	if(null != imgageData1){
	    		log.info("imgageData1==>" + imgageData1);
	    	}
	    	
	    	if(null != imgageData2){
	    		log.info("imgageData2==>" + imgageData2);
	    	}
	    	
	    	
			
			MimeMessage message = mailSender.createMimeMessage();
			MimeMessageHelper messageHelper = new MimeMessageHelper(message, true, "UTF-8");
			
			String folder = EgovProperties.getProperty("Globals.saveDir") + File.separator + SmileGateGlobals.CAPITAL_UPLOAD_FOLDER + File.separator;
			String host = EgovProperties.getProperty("Globals.fileHost");
			/*FileSystemResource file1 = new FileSystemResource(folder+filelist1);
			FileSystemResource file2 = new FileSystemResource(folder+filelist2);
			FileSystemResource file3 = new FileSystemResource(folder+filelist3);*/
			
			FileSystemResource file1;
			FileSystemResource file2;
			FileSystemResource file3;
			
			
			messageHelper.setFrom(fromMail, fromName);  // 보내는사람 생략하거나 하면 정상작동을 안함
			messageHelper.setTo(toMailArr);     // 받는사람 이메일
			messageHelper.setCc(attuserMailArr);     // 참조 이메일
			messageHelper.setBcc(bccuserMailArr);     // 숨은참조 이메일
			messageHelper.setSubject(alertSubject); // 메일제목은 생략이 가능하다
			
			log.info("toMailArr==>" + toMailArr);
			log.info("attuserMailArr==>" + attuserMailArr);
			log.info("bccuserMailArr==>" + bccuserMailArr);
			log.info("alertSubject==>" + alertSubject);
			
			List list = imageCrop(filelist1);
			
			String image = "";
			if (0 == list.size()) {
				image = "<br><img src='"+host+"/upload/capital/"+filelist1+"'> ";
			} else {
				for (int i=0; i<list.size(); i++) {
					image += "<br><img src='"+host+"/upload/capital/"+list.get(i)+"'> ";
				}
			}
			
			messageHelper.setText("<html><body>" + imgageData1 + image + imgageData2 + "</body></html>",true);  // 메일 내용
			//messageHelper.addInline("image1", new FileDataSource(folder+filelist1));
			file1 = new FileSystemResource(folder+filelist1);
			messageHelper.addAttachment("Report.png", file1);
			
			if ( !filelist2.equals(noimg) ) {
				file2 = new FileSystemResource(folder+filelist2);
				messageHelper.addAttachment("SavingsAndInstallment.png", file2);
				log.info("file2-2==>" + file2);
			}
			if ( !filelist3.equals("noimg.png") ) {
				file3 = new FileSystemResource(folder+filelist3);
				messageHelper.addAttachment("CashierCashbook.png", file3);
				log.info("file3-3==>" + file3);
			}
			
			// 첨부파일 이미지, 파일명(nickname)
			String[] canvImgStrArr= request.getParameterValues("canvImgStrArr[]");
			String[] comNmArr= request.getParameterValues("comNmArr[]");
			
			String[] strSplit;
			
			String canvImgStr ="";
			String rstStrImg = "";
			String fileNm = "";
			
			if(canvImgStrArr != null){
				for(int i = 0; i < canvImgStrArr.length; i++){
					canvImgStr = canvImgStrArr[i];
					strSplit = canvImgStr.split(",");
					rstStrImg = strSplit[1];  //,로 구분하여 뒷 부분 이미지 데이터를 임시저장
					
					byte[] byteImg;
					
					BASE64Decoder decoder = new BASE64Decoder();
					byteImg = decoder.decodeBuffer(rstStrImg);  //base64 디코더를 이용하여 byte 코드로 변환
					
					fileNm = comNmArr[i] + ".png";
					fileNm = new String(fileNm.getBytes(), "UTF-8");
					messageHelper.addAttachment(fileNm, new ByteArrayResource(byteImg));
					
					log.info("canvImgStrArr_fileNm==>" + fileNm);
					
				}
			}
			log.info("message==>" + message.toString());
			mailSender.send(message);
			log.info("mailSender==>" + mailSender);
			
			
			model.addAttribute("result", "success");
		}catch (AddressException e) { // TODO Auto-generated catch block e.printStackTrace(); }
			model.addAttribute("result", "false");
			System.out.println(e);
			e.printStackTrace();
			
		}catch (MessagingException e) {
			model.addAttribute("result", "false");
			System.out.println(e);
			e.printStackTrace();
			 
		}catch(Exception e){
			model.addAttribute("result", "false");
			System.out.println(e);
			e.printStackTrace();
		}		
		
		return "jsonView";
	}
	
	public List imageCrop(String fileName) throws Exception{
		log.info("imageCrop==>START");
		String folder = EgovProperties.getProperty("Globals.saveDir") + File.separator + SmileGateGlobals.CAPITAL_UPLOAD_FOLDER + File.separator;
		BufferedImage originalImage = ImageIO.read(new File(folder + fileName));
		int pHeight = 0;
		int pWidth = 0;
		
		log.info("originalImage====>" + originalImage);
		
		try { 
			pHeight = originalImage.getHeight(); 
		} catch (Exception z) {
			log.info("originalImage.getHeight() exception ====> " + z);
			z.printStackTrace();
			pHeight = 450;
		}
		
		log.info("pHeight====>" + pHeight);
		
		try{
			pWidth = originalImage.getWidth();
		}catch(Exception zz){
			log.info("originalImage.getWidth() exception ====> " + zz);
			zz.printStackTrace();
			pWidth = 500;
		}
		
		log.info("pWidth====>" + pWidth);
		
		//2020.07.10 김승희
		int div = (pHeight % 1000);
		//int count = (pHeight / 1000)+1;
		int count = (pHeight / 1000);
		
		if(div != 0){
			count += 1;
		}
		
		log.info("count====>" + count);
		log.info("div====>" + div);
		
		List list = new ArrayList();
		if (1 < count) {
			for (int i=0; i<count; i++) {
				BufferedImage scaledImage = null;
				//마지막
				if ((i == (count-1)) && div != 0) {
					log.info("i1 (마지막 페이지)====>" + i);
					scaledImage = Scalr.crop(originalImage, 0, (1000 * i), pWidth, div, null);
					log.info("if_scaledImage====>[" + i +"]====>" + scaledImage);
				} else {
					log.info("i2 (마지막 페이지가 아닌 경우, 마지막 페이지지만 높이가 배수인 경우 포함====>" + i);
					scaledImage = Scalr.crop(originalImage, 0, (1000 * i), pWidth, 1000, null);
					log.info("else_scaledImage====>[" + i +"]====>" + scaledImage);
				}
				
				String [] names = fileName.split("\\.");
				log.info("names====>" + Arrays.toString(names));
				File orgFile= new File(folder + names[0] + "_" + (i+1) + "." + names[1]);  //파일객체 생성
				log.info("orgFile====>" + orgFile);
				ImageIO.write(scaledImage, "png", orgFile);
				list.add(names[0] + "_" + (i+1) + "." + names[1]);
				
			}
		}
		log.info("imageCrop====>END");
		return list;
	}
	
	@RequestMapping(value = "/getText")
	public String getText(HttpServletRequest request, HttpServletResponse response, ModelMap model) throws Exception {
		Map param = IfrsUtil.parameterToHm(request);
		model.addAttribute("list",   capitalService.getComment(param));
		return "jsonView";
	}
	
	//--------------------------------------------------------------------
	@RequestMapping(value = "/viewCapitalReportGraphSetting")
	public String viewCapitalReportGraphSetting(HttpServletRequest request, ModelMap model) throws Exception {
		
		List<Map<String, Object>> companyList = capitalService.selectCapitalCompanyList();
		model.addAttribute("companyList", IfrsUtil.ListToJsonArray(companyList));
		
		List<Map> graphSettingList = capitalService.selectCompanyGraphSetting(); 
		model.addAttribute("graphSettingList", IfrsUtil.ListToJsonArray(graphSettingList));
		
		return "capital/capitalReportGraphSetting";
	}
	
	@RequestMapping(value = "/saveCompanyGraphSetting")
	public String saveCompanyReportGraphSetting(@RequestBody Map<String, Object> map, ModelMap model, HttpSession session) throws Exception {
		
		String userId = (String) ((Map) session.getAttribute("userMap")).get("USER_ID"); // 사용자ID
		
		capitalService.saveCompanyGraphSetting(userId, map);
		
		List<Map> graphSettingList = capitalService.selectCompanyGraphSetting(); 
		model.addAttribute("graphSettingList", IfrsUtil.ListToJsonArray(graphSettingList));
		
		model.addAttribute("success", "Y");		
		
		return "jsonView";
	}
	
	@RequestMapping(value = "/deleteCompanyGraphSetting")
	public String deleteCompanyGraphSetting(@RequestBody Map<String, Object> map, ModelMap model) throws Exception {
		
		capitalService.deleteCompanyGraphSetting(map);
		
		List<Map> graphSettingList = capitalService.selectCompanyGraphSetting(); 
		model.addAttribute("graphSettingList", IfrsUtil.ListToJsonArray(graphSettingList));
		
		model.addAttribute("success", "Y");	
		
		return "jsonView";
	}
	
	/**
	 * ERP 법인이 아닌 법인의 자금일보 저장 데이터 호출(마감->기초)
	 * @param request
	 * @param response
	 * @param session
	 * @param model
	 * @return
	 * @throws Exception
	 */
	@RequestMapping(value = "/IfrsLoadNonErpSaveData")
	public String IfrsLoadNonErpSaveData(HttpServletRequest request, HttpServletResponse response, HttpSession session, ModelMap model) throws Exception {
		Map param = IfrsUtil.parameterToHm(request);
		List<Map> IfrsERPINSetSave = capitalService.selectLoadNonErpSaveData( param ) ;
		model.addAttribute("list",   IfrsERPINSetSave);
		
		// 2020.08.14 김승희 
		String level = "DEBUG";
		capitalService.setFcmmnLog(level,IfrsERPINSetSave, request);
		
		return "jsonView";
	}
	
	/**
	 * 자금일보-금융자산내역 작성-7) 매도가능증권 ERP [조회]
	 * @param request
	 * @param response
	 * @param session
	 * @param model
	 * @return
	 * @throws Exception
	 */
	@RequestMapping(value = "/IfrsAssetListAjax6")
	public String IfrsAssetListAjax6(HttpServletRequest request, HttpServletResponse response, HttpSession session, ModelMap model) throws Exception {
		
		Map<String, Object> param = IfrsUtil.parameterToHm(request);
		String yyyymmdd = request.getParameter("sdate2");
		String RemSeq = request.getParameter("RemSeq");
		
		String xmlDocument = "<ROOT>" +
					"<DataBlock1>" +
					"<WorkingTag>A</WorkingTag>" +
					"<IDX_NO>1</IDX_NO>" +
					"<Status>0</Status>" + 
					"<DataSeq>1</DataSeq>" +
					"<Selected>1</Selected>" +
					"<TABLE_NAME>DataBlock1</TABLE_NAME>" + 
					"<IsChangedMst>1</IsChangedMst>" +
					"<FSDomainSeq />" +
					"<AccUnit>1</AccUnit>" +
					"<AccDate>" + yyyymmdd + "</AccDate>" +
					"<AccDateTo>" + yyyymmdd + "</AccDateTo>" +
					"<AccSeq />" +
					"<RemSeq>" + RemSeq + "</RemSeq>" +
					"<UMCostType />" +
					"<LinkCreateID />" +
					"<SMAccStd>2</SMAccStd>" +
					"<SlipUnit />" +			    
					"</DataBlock1>" +
				"</ROOT>";		

		param.put("xmlDocument", 	xmlDocument);

		List<Map> AssetList = capitalService.selectAssetListAjax6( param ) ;
		model.addAttribute("list", AssetList);
		return "jsonView";
	}
	
	/**
	 * 자금일보-금융자산내역 작성-11) 금융상품 변동내역 상세 > ①-2 금융상품 변동내역(출금-감소) [조회]
	 * @param request
	 * @param response
	 * @param session
	 * @param model
	 * @return
	 * @throws Exception
	 */
	@RequestMapping(value = "/IfrsAssetListAjax7")
	public String IfrsAssetListAjax7(HttpServletRequest request, HttpServletResponse response, HttpSession session, ModelMap model) throws Exception {
		
		Map<String, Object> param = IfrsUtil.parameterToHm(request);
		List<Map> AssetList = capitalService.selectAssetListAjax7( param ) ;
		
		model.addAttribute("list", AssetList);
		return "jsonView";
	}
}
