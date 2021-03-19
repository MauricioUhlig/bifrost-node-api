-- SQLite


-- drop table connections_log;
-- drop table status;
-- drop table server_ports;
 drop table connections;

create table connections (
    connection_id integer not null PRIMARY KEY AUTOINCREMENT,
    address text not null, 
    port int not null, 
    is_tor int not null,
    type text not null,
    description text null,
    destination int null
);
/*
create table server_ports (
    port integer not null PRIMARY KEY, 
    is_active bit not null
);
*/

create table status (
    status_id integer not null PRIMARY KEY AUTOINCREMENT,
    status_description text not NULL
);

create table connections_log (
    connections_log_id integer not null PRIMARY KEY AUTOINCREMENT, 
    connection_id integer not null, 
    date_log TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    port integer not null, 
    pid int null,
    command text null,
    status_id integer not null DEFAULT 0,
    FOREIGN KEY (connection_id)
        REFERENCES connections (connection_id),
    FOREIGN KEY (port)
        REFERENCES server_port(port)
        FOREIGN KEY (status_id)
        REFERENCES status(status_id)
);


insert into status(status_id, status_description)
values (1,'stopped'),(2,'running');

create table users (
    user_id integer not null primary key AUTOINCREMENT, 
    login text not null, 
    password text not NULL
);

create table session (
    session_id integer not null primary key AUTOINCREMENT, 
    user_id integer not null, 
    login_date timestamp default CURRENT_TIMESTAMP,
    token text not null, 
    logout integer not null default 0
);

insert into users (login, password) values ('mauricio','9753186420');