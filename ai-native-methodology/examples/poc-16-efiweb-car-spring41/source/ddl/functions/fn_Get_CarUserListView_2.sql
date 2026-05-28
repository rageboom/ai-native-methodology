/****** Object:  UserDefinedFunction [dbo].[fn_Get_CarUserListView]    Script Date: 2021-03-22 오후 4:46:28 ******/

--select * from IFRS.dbo.fn_Get_CarUserListView('130377')

CREATE FUNCTION [dbo].[fn_Get_CarUserListView]
(	@user_id varchar(20)
	)
	RETURNS @Temp_CarUserList TABLE
	(
	CAR_USERID VARCHAR(20)
	)
AS
BEGIN

--=========================================================================
-- 수정자 : 김연준
-- 수정일 : 2022-07-27
-- 설  명 : 퇴사 임원 조회 제외 처리
--=========================================================================
--=========================================================================
-- 수정자 : 남현식
-- 수정일 : 2021-03-17
-- 설  명 : EKPORG, EKPETC 사용자, 부서, 겸직, 비서 테이블 FIM으로 이관 작업
--          해당 참조 소스 수정
--=========================================================================
--=========================================================================
-- 수정자 : 고두현
-- 수정일 : 2020-08-13
-- 설  명 : 임원/비서인 경우 차량 사용자 ID 리턴
--          차량관리자를 MDI 기준정보 테이블에서 관리
--          임원/비서/차량관리자가 아닌 경우 조회되지 않도록 처리
--=========================================================================
--=========================================================================
-- 작성자 : 조동한
-- 작성일 : 2018-07-26
-- 설  명 : 사용자 ID 기준으로 조회 가능한 차량 사용자ID 리스트 리턴
--          임원/비서 인 경우 차량 사용자 ID 리턴
--          차량 관리자 인 경우 차량 사용자 전체 ID 린턴, 임원/비서가 아닌 경우 모두 차량관리자로 처리
--          예외 추가, 20.02.12, 정현초 이사님 비서 인사발령 전 김주아 대리 지원을 위한 예외(임시적용)
--=========================================================================

DECLARE		@CAR_ADMIN_KEY		NVARCHAR(30)
-- SET @CAR_ADMIN_KEY = 'IF000000103' -- 통테
			, @deptCd			NVARCHAR(20) 
			, @dutyCd			NVARCHAR(20)
			, @dutySort			int
			, @userFgHr			VARCHAR(3)

SET @CAR_ADMIN_KEY = 'IF000000096' -- 운영

SELECT @deptCd = DEPT_CD, @dutyCd = DUTY_CD, @dutySort = DUTY_SORT, @userFgHr = USER_FG_HR FROM FIM.dbo.TB_USER WHERE USER_ID = @user_id 

DECLARE @tempT TABLE (
    OBJECT VARCHAR(20),
    OBJECT_GB VARCHAR(1)
)

INSERT INTO @tempT ( OBJECT, OBJECT_GB ) SELECT OBJECT, OBJECT_GB FROM MDI.dbo.FN_RBAC_DEPTS ( @user_id, @deptCd );

--MDI 내 관리자 권한 확인
IF EXISTS
(
	SELECT
		DISTINCT (AUTH_OBJECT)
	FROM MDI.dbo.TB_MDI_AUTH AS TMA WITH (NOLOCK) 	
	WHERE MDI_KEY = @CAR_ADMIN_KEY
	AND ADMIN_GB = 'U'
	AND AUTH_OBJECT_GB = 'D'		
	AND AUTH_OBJECT IN (SELECT OBJECT FROM @tempT)

	UNION ALL

	SELECT
		DISTINCT (AUTH_OBJECT)
	FROM MDI.dbo.TB_MDI_AUTH WITH (NOLOCK)
	WHERE MDI_KEY = @CAR_ADMIN_KEY
	AND ADMIN_GB = 'U'
	AND AUTH_OBJECT_GB = 'U'
	AND AUTH_OBJECT IN (@user_id)
)
INSERT INTO @Temp_CarUserList
SELECT DISTINCT CR.USER_ID
FROM IFRS.dbo.TB_CAR CR WITH(NOLOCK)

--비서 확인
ELSE IF EXISTS
(
	SELECT  A.EXECUTIVE_ID
	  FROM FIM..TB_SECRETARY AS A WITH(NOLOCK)
	 INNER JOIN FIM.dbo.TB_USER AS B WITH(NOLOCK)
			 ON A.EXECUTIVE_ID = B.USER_ID
			AND B.USE_FG = (case when A.EXECUTIVE_ID IN ('110003', '190240', '110236') then B.USE_FG else  '1' end)
	 WHERE A.SECRETARY_ID IN (@user_id)
)
INSERT INTO @Temp_CarUserList
SELECT  A.EXECUTIVE_ID
  FROM FIM..TB_SECRETARY AS A WITH(NOLOCK)
 INNER JOIN FIM.dbo.TB_USER AS B WITH(NOLOCK)
		 ON A.EXECUTIVE_ID = B.USER_ID
		AND B.USE_FG = (case when A.EXECUTIVE_ID IN ('110003', '190240', '110236') then B.USE_FG else  '1' end)
 WHERE A.SECRETARY_ID IN (@user_id)
 
--권한 여부에 따른 확인
ELSE
	INSERT INTO @Temp_CarUserList
	SELECT DISTINCT(CR.USER_ID) FROM IFRS.dbo.TB_CAR AS CR WITH(NOLOCK)
	WHERE CR.USER_ID = @user_id OR CR.DRIVER_USER_ID = @user_id


	RETURN
END





GO
