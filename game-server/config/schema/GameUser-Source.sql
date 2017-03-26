

drop table if exists player;

/*==============================================================*/
/* Table: player                                                */
/*==============================================================*/
create table player
(
   id                   int not null auto_increment,
   MAC                  char(100) not null,
   playerName           char(100) not null,
   createTime           bigint,
   diamondCnt           int unsigned default 0,
   goldCnt              int unsigned default 0,
   primary key (id),
   unique key INDEX_PLAYER_USER_ID (MAC),
   unique key INDEX_PLAYER_PLAYERNAME (playername)
)
ENGINE = InnoDB
auto_increment = 10000
default character set = utf8;

