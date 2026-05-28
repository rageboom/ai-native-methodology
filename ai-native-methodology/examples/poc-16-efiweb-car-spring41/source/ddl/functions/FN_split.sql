/****** Object:  UserDefinedFunction [dbo].[FN_split]    Script Date: 2026-05-20 오후 4:40:07 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
-- ====================================================
-- Author :	     김부원
-- ALTER date :	 2011-12-28
-- Description : split 함수
-- ====================================================
create FUNCTION [dbo].[FN_split]
( 
	@TEXT			VARCHAR(max), --대상문자열
	@SPLIT_CHAR		VARCHAR(10) --구분자
)
RETURNS @RETURN_TABLE TABLE
(
	VALUE VARCHAR(100)
)
AS
BEGIN
 
	DECLARE @INDEX INT;
	DECLARE @SPLIT_LEN INT;
	DECLARE @VAL VARCHAR(1000);

	SET @SPLIT_LEN = LEN(@SPLIT_CHAR);

	WHILE(LEN(@TEXT)>0)
		BEGIN
		SET @INDEX = CHARINDEX(@SPLIT_CHAR,@TEXT);
		IF (@INDEX = 0)
			BEGIN
				SET @VAL = SUBSTRING(@TEXT, 1, LEN(@TEXT));
				SET @TEXT = '';
			END
		ELSE
			BEGIN
				SET @VAL = SUBSTRING(@TEXT, 1, @INDEX - 1);
				SET @TEXT = SUBSTRING(@TEXT, @INDEX + @SPLIT_LEN, LEN(@TEXT) - @INDEX);
			END
		INSERT INTO @RETURN_TABLE (VALUE) VALUES (@VAL);
	END

	RETURN
END
GO
