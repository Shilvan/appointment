
DROP TABLE locations_tbl, slots_confs_tbl, branches_tbl, positions_tbl, shifts_tbl, positions_shifts_link_tbl, employees_tbl, blocked_slots_tbl, services_tbl, positions_services_link_tbl CASCADE;
DROP TABLE customers_tbl, bookings_tbl, bookings_services_link_tbl CASCADE;
/*BRANCHES GROUP*/
CREATE TABLE locations_tbl ( 
	id serial NOT NULL PRIMARY KEY,
	country varchar(100) NOT NULL,
	city varchar(100),
	address varchar(200) NOT NULL,
	postcode varchar(50) NOT NULL,
	UNIQUE (country, address, postcode)
);

CREATE TABLE slots_confs_tbl ( 
	id serial NOT NULL PRIMARY KEY,
	name varchar(200),
	available_months smallint NOT NULL,
	slots_interval smallint NOT NULL,
	break_inbetween smallint NOT NULL,
	UNIQUE (name),
	UNIQUE (available_months, slots_interval, break_inbetween)
);
CREATE TABLE branches_tbl ( 
	id serial NOT NULL PRIMARY KEY,
	name varchar(200) NOT NULL,
	location_id integer NOT NULL REFERENCES locations_tbl (id),
	slots_conf_id smallint NOT NULL REFERENCES slots_confs_tbl (id),
	UNIQUE (location_id),
	UNIQUE (name)
);

INSERT INTO locations_tbl (country, city, address, postcode) VALUES ('Spain', 'Santa Cruz', '28 AV Anaga', '38091');
INSERT INTO locations_tbl (country, city, address, postcode) VALUES ('Italy', 'Napoli', 'Chievo, 21', 'IN902');
INSERT INTO locations_tbl (country, city, address, postcode) VALUES ('England', 'Manchester', '98 Naples St flat 12', 'M1 5SW');

INSERT INTO slots_confs_tbl (name, available_months, slots_interval, break_inbetween) VALUES ('Branches in Spain', 2, 15, 5);
INSERT INTO slots_confs_tbl (name, available_months, slots_interval, break_inbetween) VALUES (NULL, 12, 30, 0);
INSERT INTO slots_confs_tbl (name, available_months, slots_interval, break_inbetween) VALUES (NULL, 24, 30, 30);
INSERT INTO slots_confs_tbl (name, available_months, slots_interval, break_inbetween) VALUES ('Configuration for the branches in Manchester', 10, 45, 0);

INSERT INTO branches_tbl (name, location_id, slots_conf_id) VALUES ('Manchester City Centre', 3, 3);
INSERT INTO branches_tbl (name, location_id, slots_conf_id) VALUES ('Tenerife AV Anaga', 1, 1);
INSERT INTO branches_tbl (name, location_id, slots_conf_id) VALUES('Corti a la Italiana', 2, 2);

/*EMPLOYEES GROUP*/
CREATE TABLE positions_tbl ( 
	id serial NOT NULL PRIMARY KEY,
	name varchar(200) NOT NULL,
	UNIQUE (name)
);
CREATE TABLE shifts_tbl ( 
	id serial NOT NULL PRIMARY KEY,
	name varchar(200) NOT NULL,
	date_start date,
	date_end date,
	starting_time time NOT NULL,
	break_start time,
	break_end time,
	ending_time time  NOT NULL,
	dayofweek smallint[],
	position smallint[],
	UNIQUE (name),
	UNIQUE (date_start, date_end, starting_time, break_start, break_end, ending_time, dayofweek, position) /*Check duplicate values with Null columns*/
);
CREATE TABLE positions_shifts_link_tbl ( 
	position_id integer NOT NULL REFERENCES positions_tbl (id),
	shift_id integer NOT NULL REFERENCES shifts_tbl (id),
	UNIQUE (position_id, shift_id)
);
CREATE TABLE employees_tbl ( 
	id bigserial NOT NULL PRIMARY KEY,
	forename varchar(50) NOT NULL,
	lastname varchar(50) NOT NULL,
	position_id integer NOT NULL REFERENCES positions_tbl (id),
	branch_id integer NOT NULL REFERENCES branches_tbl (id)
);
CREATE TABLE blocked_slots_tbl ( 
	id serial NOT NULL PRIMARY KEY,
	datetime_start timestamp NOT NULL,
	datetime_end timestamp NOT NULL,
	employee_id bigint NOT NULL REFERENCES employees_tbl (id),
	UNIQUE (datetime_start, datetime_end, employee_id)
);

INSERT INTO positions_tbl (name) VALUES ('Manager');
INSERT INTO positions_tbl (name) VALUES ('Regular Provider');

INSERT INTO	shifts_tbl (name, date_start, date_end, starting_time, break_start, break_end, ending_time, dayofweek, position) VALUES ('Manager general shift', NULL, NULL, '09:00', NULL, NULL, '17:00', NULL, NULL);
INSERT INTO	shifts_tbl (name, date_start, date_end, starting_time, break_start, break_end, ending_time, dayofweek, position) VALUES ('Manager summer shift', '2020-6-20', '2020-9-21', '11:00', NULL, NULL, '14:00', NULL, NULL);
INSERT INTO	shifts_tbl (name, date_start, date_end, starting_time, break_start, break_end, ending_time, dayofweek, position) VALUES ('Provider general shift', NULL, NULL, '09:00', NULL, NULL, '17:00', NULL, NULL);
INSERT INTO	shifts_tbl (name, date_start, date_end, starting_time, break_start, break_end, ending_time, dayofweek, position) VALUES ('La Laguna, Provider general shift', NULL, NULL, '09:00', '12:00', '16:00', '20:00', NULL, NULL);

INSERT INTO positions_shifts_link_tbl (position_id, shift_id) VALUES (1, 1);
INSERT INTO positions_shifts_link_tbl (position_id, shift_id) VALUES (1, 2);
INSERT INTO positions_shifts_link_tbl (position_id, shift_id) VALUES (2, 3);
INSERT INTO positions_shifts_link_tbl (position_id, shift_id) VALUES (2, 4);

INSERT INTO employees_tbl (forename, lastname, position_id, branch_id) VALUES ('Shilvan', 'Tavares', 1, 1);
INSERT INTO employees_tbl (forename, lastname, position_id, branch_id) VALUES ('Odell', 'Beckham', 1, 3);
INSERT INTO employees_tbl (forename, lastname, position_id, branch_id) VALUES ('Mario', 'Ancelloti', 1, 2);
INSERT INTO employees_tbl (forename, lastname, position_id, branch_id) VALUES ('worker', '1', 1, 1);
INSERT INTO employees_tbl (forename, lastname, position_id, branch_id) VALUES ('worker', '2', 1, 3);
INSERT INTO employees_tbl (forename, lastname, position_id, branch_id) VALUES ('worker', '3', 1, 2);
INSERT INTO employees_tbl (forename, lastname, position_id, branch_id) VALUES ('worker', '4', 2, 2);

INSERT INTO blocked_slots_tbl (datetime_start, datetime_end, employee_id) VALUES ('2021-2-20 14:00', '2022-2-20 14:00', 1);
INSERT INTO blocked_slots_tbl (datetime_start, datetime_end, employee_id) VALUES ('2020-10-20 14:00', '2020-10-20 15:00', 3);
 
/*SERVICES GROUP*/
CREATE TABLE services_tbl ( 
	id serial NOT NULL PRIMARY KEY,
	name varchar(200) NOT NULL,
	duration smallint NOT NULL,
	price NUMERIC(19,2) NOT NULL,
	UNIQUE (name)
);
CREATE  TABLE positions_services_link_tbl ( /*CHANGE TO PLURAL*/
	position_id integer NOT NULL REFERENCES positions_tbl (id),
	service_id integer NOT NULL REFERENCES services_tbl (id),
	UNIQUE (service_id, position_id)
); 

INSERT INTO services_tbl (name, duration, price) VALUES ('Haircut', 30, 10.23);
INSERT INTO services_tbl (name, duration, price) VALUES ('Haircut and Beard', 90, 20);
INSERT INTO services_tbl (name, duration, price) VALUES ('Shave', 15, 5.4);

INSERT INTO positions_services_link_tbl (position_id, service_id) VALUES (2, 1);
INSERT INTO positions_services_link_tbl (position_id, service_id) VALUES (2, 2);
INSERT INTO positions_services_link_tbl (position_id, service_id) VALUES (2, 3);
INSERT INTO positions_services_link_tbl (position_id, service_id) VALUES (1, 1);
INSERT INTO positions_services_link_tbl (position_id, service_id) VALUES (1, 2);
/*CUSTOMERS GROUP*/
CREATE TABLE customers_tbl ( 
	id bigserial NOT NULL PRIMARY KEY,
	fullname varchar(100) NOT NULL,
	phone varchar(20) NOT NULL,
	email varchar(100) NOT NULL,
	UNIQUE (phone),
	UNIQUE (email)
);

INSERT INTO customers_tbl (fullname, phone, email) VALUES ('Walter Morreira', '643443424', 'vjfmorreira@gmail.com');
INSERT INTO customers_tbl (fullname, phone, email) VALUES ('Ade da Costa', '743433454', 'decosta4@gmail.com');
INSERT INTO customers_tbl (fullname, phone, email) VALUES ('Fabio Cesc', '6989420455', 'cvimpfabio@gmail.com');
INSERT INTO customers_tbl (fullname, phone, email) VALUES ('Yuri', '690320455', 'yuricole@gmail.com');
INSERT INTO customers_tbl (fullname, phone, email) VALUES ('Edinho', '922439439', 'zeedder@gmail.com');

/*BOOKINGS GROUP*/
CREATE TABLE bookings_tbl ( 
	id bigserial NOT NULL PRIMARY KEY,
	booking_datetime timestamp NOT NULL DEFAULT NOW(), /*don't allow users to change this value*/
	service_datetime timestamp NOT NULL, /*CHECK IF THE PROVIDER IS AVAILABLE AT THAT TIME*/
	employee_id bigint NOT NULL REFERENCES employees_tbl (id),
	customer_id bigint NOT NULL REFERENCES customers_tbl (id),
	UNIQUE(service_datetime, customer_id),
	UNIQUE(service_datetime, employee_id)
);

/*INSERT INTO bookings_tbl (service_datetime, employee_id, customer_id) VALUES ('2020-07-20 15:15', 4, 2);
INSERT INTO bookings_tbl (service_datetime, employee_id, customer_id) VALUES ('2020-09-02 09:00', 1, 5);*/

CREATE TABLE bookings_services_link_tbl ( 
	booking_id bigint NOT NULL REFERENCES bookings_tbl (id),
	service_id integer NOT NULL REFERENCES services_tbl (id),
	UNIQUE(booking_id, service_id)
);

/*INSERT INTO bookings_services_link_tbl (booking_id, service_id) VALUES (1, 1);
INSERT INTO bookings_services_link_tbl (booking_id, service_id) VALUES (1, 2);
INSERT INTO bookings_services_link_tbl (booking_id, service_id) VALUES (1, 3);
INSERT INTO bookings_services_link_tbl (booking_id, service_id) VALUES (2, 1);
INSERT INTO bookings_services_link_tbl (booking_id, service_id) VALUES (2, 2);
INSERT INTO bookings_services_link_tbl (booking_id, service_id) VALUES (2, 3);*/

