drop table if exists serverinfo;

/*==============================================================*/
/* Table: serverinfo                                            */
/*==============================================================*/
create table serverinfo
(
   ID                   int not null auto_increment,
   name                 char(20),
   alias                char(20) not null,
   IP                   char(20),
   port                 smallint,
   onlineCnt            smallint,
   maxOnlineCnt         smallint,
   starttime            bigint,
   uptime               bigint,
   clientVersion        char(20),
   resVersion           char(20),
   packages             text,
   pkgUrl               varchar(256),
   clientMinVer         char(20),
   flag                 int(10),
   tips                 text,
   doMainName           varchar(254),
   primary key (alias),
   key AK_INDEX_SERVERINFO_ID (ID),
   unique key AK_Key_alias (alias)
)
ENGINE = InnoDB
auto_increment = 10000
default character set = utf8;

drop table if exists playerinfo;

/*==============================================================*/
/* Table: playerinfo                                            */
/*==============================================================*/
create table playerinfo
(
   MAC                  char(64) not null,
   latestLoginTime      bigint,
   playerLevel          tinyint,
   servername           char(20) not null,
   primary key (MAC, servername),
   key AK_Key_MAC (MAC)
)
ENGINE = InnoDB
auto_increment = 10000
default character set = utf8;

drop table if exists TransformDetail;

/*==============================================================*/
/* Table: TransformDetail                                       */
/*==============================================================*/
create table TransformDetail
(
   username             char(64) not null,
   createTick           bigint(20),
   getServerList        int(10) default 0,
   selectServer         int(10) default 0,
   loadSuccess          int(10) default 0,
   logonSuccess         int(10) default 0,
   primary key (username)
)
ENGINE= InnoDB
DEFAULT CHARACTER SET= utf8;

drop table if exists TransformDaily;

/*==============================================================*/
/* Table: TransformDaily                                        */
/*==============================================================*/
create table TransformDaily
(
   id                   bigint(20) not null auto_increment,
   createTick           bigint(20),
   todayCreatedTotal    int(10),
   selectServer         double,
   loadSuccess          double,
   logonSuccess         double,
   primary key (id)
)
auto_increment = 10000
ENGINE= InnoDB;

/*==============================================================*/
/* PROCEDURE & FUNCTION                                           */
/*==============================================================*/

delimiter $$
DROP PROCEDURE if exists `dailySample`$$
CREATE PROCEDURE `dailySample` ()
BEGIN
	DECLARE DONE, selectServer, loadSuccess, logonSuccess, todayCreatedTotal, selectTotal, loadTotal, logonTotal INT(10);
	DECLARE selectPercent, loadPercent, logonPercent double;
	DECLARE cur CURSOR FOR SELECT T.selectServer, T.loadSuccess, T.logonSuccess FROM TransformDetail T WHERE T.createTick > UNIX_TIMESTAMP(CURDATE()) * 1000;
	DECLARE CONTINUE HANDLER FOR NOT FOUND SET DONE = 1;

    SET DONE = 0;
    SET todayCreatedTotal = 0;
    SET selectTotal = 0;
    SET loadTotal = 0;
    SET logonTotal = 0;

	OPEN cur;
	FETCH cur INTO selectServer, loadSuccess, logonSuccess;
	WHILE DONE != 1 DO
        SET todayCreatedTotal = todayCreatedTotal + 1;

        IF selectServer > 0 THEN
            SET selectTotal = selectTotal + 1;
        END IF;

        IF loadSuccess > 0 THEN
            SET loadTotal = loadTotal + 1;
        END IF;

        IF logonSuccess > 0 THEN
            SET logonTotal = logonTotal + 1;
        END IF;

		FETCH cur INTO selectServer, loadSuccess, logonSuccess;
	END WHILE;
	CLOSE cur;

	IF todayCreatedTotal = 0 THEN
	    SET selectPercent = 0;
	    SET loadPercent = 0;
	    SET logonPercent = 0;
	ELSE
	    SET selectPercent = selectTotal / todayCreatedTotal;
	    SET loadPercent = loadTotal / todayCreatedTotal;
	    SET logonPercent = logonTotal / todayCreatedTotal;
	END IF;

	INSERT INTO TransformDaily(createTick, todayCreatedTotal, selectServer, loadSuccess, logonSuccess) VALUES(UNIX_TIMESTAMP(NOW()) * 1000, todayCreatedTotal, selectPercent, loadPercent, logonPercent);
END$$
