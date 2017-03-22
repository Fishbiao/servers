drop table if exists AllUser;

/*==============================================================*/
/* Table: AllUser                                               */
/*==============================================================*/
create table AllUser
(
   id                   bigint(20) not null auto_increment,
   name                 char(60),
   pwd                  char(60),
   primary key (id),
   unique key AK_Key_name (name)
)
auto_increment = 10000
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8
COLLATE = utf8_unicode_ci;
