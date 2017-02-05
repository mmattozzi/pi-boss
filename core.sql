# Run as root mysql user

create database pi_boss;
create user 'pi_boss'@'localhost';
grant all privileges on pi_boss.* TO 'pi_boss'@'localhost';

create table numeric_log ( 
    host varchar(20),
    value float,
    function varchar(64),
    date timestamp default CURRENT_TIMESTAMP
);

create index func_timestamp_idx on numeric_log (function, date);
