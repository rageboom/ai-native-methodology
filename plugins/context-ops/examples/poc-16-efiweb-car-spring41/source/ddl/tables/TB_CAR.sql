/****** Object:  Table [dbo].[TB_CAR]    Script Date: 2026-05-20 오후 4:40:07 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[TB_CAR](
	[idx] [int] IDENTITY(1,1) NOT NULL,
	[CAR_NO] [nvarchar](20) NULL,
	[CAR_TYPE] [varchar](50) NULL,
	[COM_CD] [int] NULL,
	[BIZ_NO] [varchar](50) NULL,
	[BIZ_YEAR] [varchar](4) NULL,
	[USER_HOME_ADDR] [nvarchar](100) NULL,
	[USER_WORK_ADDR] [nvarchar](100) NULL,
	[DISTANCE] [numeric](18, 2) NULL,
	[DEPT_CD] [int] NULL,
	[DUTY] [nvarchar](20) NULL,
	[USER_ID] [nvarchar](20) NULL,
	[USER_NM] [nvarchar](50) NULL,
	[USE_YN] [char](1) NULL,
	[INS_ID] [nvarchar](20) NULL,
	[INS_DT] [datetime] NULL,
	[UPT_ID] [nvarchar](20) NULL,
	[UPT_DT] [datetime] NULL,
	[TOT_DIST] [decimal](18, 2) NULL,
	[STATE] [char](1) NULL,
	[CAR_GET_DATE] [datetime] NULL,
	[CAR_DISPOSE_DATE] [datetime] NULL,
	[DRIVER_USER_ID] [nvarchar](20) NULL,
 CONSTRAINT [PK__TB_CAR__DC501A780D44F85C] PRIMARY KEY CLUSTERED 
(
	[idx] ASC
)WITH (PAD_INDEX = ON, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, FILLFACTOR = 90, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
