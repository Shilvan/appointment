CREATE SCHEMA IF NOT EXISTS appointment;

CREATE  TABLE blocked_slots_tbl ( 
	blocked_slot_id      smallserial  NOT NULL ,
	blocked_slot_start   timestamp  NOT NULL ,
	blocked_slot_end     time  NOT NULL ,
	employee_id          bigint  NOT NULL ,
	CONSTRAINT pk_blocked_slots_tbl_block_slot_id PRIMARY KEY ( blocked_slot_id )
 );

COMMENT ON TABLE blocked_slots_tbl IS 'It containes slots for which exceptionally the employee is not available';

COMMENT ON COLUMN blocked_slots_tbl.blocked_slot_start IS 'The time and date at which the absence starts';

COMMENT ON COLUMN blocked_slots_tbl.blocked_slot_end IS 'The time and date at which the absence ends';

COMMENT ON COLUMN blocked_slots_tbl.employee_id IS 'The employee that is going to be absent';

CREATE  TABLE booking_service_link_tbl ( 
	booking_id           bigint  NOT NULL ,
	service_id           smallint  NOT NULL 
 );

COMMENT ON TABLE booking_service_link_tbl IS 'Add multiple services to single booking';

CREATE  TABLE bookings_tbl ( 
	booking_id           bigserial  NOT NULL ,
	booking_date         timestamp  NOT NULL ,
	service_date         timestamp  NOT NULL ,
	employee_id          bigint  NOT NULL ,
	customer_id          bigint  NOT NULL ,
	CONSTRAINT fk_bookings_tbl_booking_service_link_tbl FOREIGN KEY ( booking_id ) REFERENCES booking_service_link_tbl( booking_id )  
 );

COMMENT ON TABLE bookings_tbl IS 'Contains all the data of client''s bookings';

COMMENT ON COLUMN bookings_tbl.booking_date IS 'Date in which the booking was made';

COMMENT ON COLUMN bookings_tbl.service_date IS 'Date in which the service will take place';

COMMENT ON COLUMN bookings_tbl.employee_id IS 'The employe that will be providing the service';

COMMENT ON COLUMN bookings_tbl.customer_id IS 'Information about the customer that made the booking';

CREATE  TABLE customers_tbl ( 
	customer_id          bigint  NOT NULL ,
	customer_fullname    varchar(100)  NOT NULL ,
	customer_phone       varchar(20)  NOT NULL ,
	customer_email       varchar(100)  NOT NULL ,
	CONSTRAINT fk_customer_tbl_booking_tbl FOREIGN KEY ( customer_id ) REFERENCES bookings_tbl( customer_id )  
 );

COMMENT ON TABLE customers_tbl IS 'Information about registered customers';

COMMENT ON COLUMN customers_tbl.customer_fullname IS 'The full name of a customer';

COMMENT ON COLUMN customers_tbl.customer_phone IS '(UNIQUE) Mobile phone number';

COMMENT ON COLUMN customers_tbl.customer_email IS '(UNIQUE) Customer''s email';

CREATE  TABLE employees_tbl ( 
	employee_id          bigserial  NOT NULL ,
	employee_forename    varchar(50)  NOT NULL ,
	employee_surname     varchar(50)  NOT NULL ,
	position_id          smallint  NOT NULL ,
	branch_id            smallint  NOT NULL ,
	CONSTRAINT fk_employee_tbl_booking_tbl FOREIGN KEY ( employee_id ) REFERENCES bookings_tbl( employee_id )  ,
	CONSTRAINT fk_employee_tbl_blocked_slot_tbl FOREIGN KEY ( employee_id ) REFERENCES blocked_slots_tbl( employee_id )  
 );

COMMENT ON TABLE employees_tbl IS 'Information about all the employees of the company';

COMMENT ON COLUMN employees_tbl.employee_forename IS 'Employee''s first name';

COMMENT ON COLUMN employees_tbl.employee_surname IS 'Employee''s last name';

COMMENT ON COLUMN employees_tbl.position_id IS 'The position of the particular employee';

COMMENT ON COLUMN employees_tbl.branch_id IS 'The branch for which the employee works';

CREATE  TABLE position_service_link_tbl ( 
	position_id          smallint  NOT NULL ,
	service_id           smallint  NOT NULL 
 );

COMMENT ON TABLE position_service_link_tbl IS 'It specifies in multiple instances all the services that an employee in a certain position would provide';

CREATE  TABLE position_shift_link_tbl ( 
	position_id          smallint  NOT NULL ,
	shift_id             integer  NOT NULL 
 );

COMMENT ON TABLE position_shift_link_tbl IS 'The different shifts that positions can have, e.g.: general, summer, weekends, bank holidays...';

CREATE  TABLE positions_tbl ( 
	position_id          smallint  NOT NULL ,
	position_name        varchar(100)  NOT NULL ,
	CONSTRAINT fk_position_tbl_provider_service_link_tbl FOREIGN KEY ( position_id ) REFERENCES position_service_link_tbl( position_id )  ,
	CONSTRAINT fk_position_tbl_employee_tbl FOREIGN KEY ( position_id ) REFERENCES employees_tbl( position_id )  ,
	CONSTRAINT fk_position_tbl_shift_staff_link_tbl FOREIGN KEY ( position_id ) REFERENCES position_shift_link_tbl( position_id )  
 );

COMMENT ON TABLE positions_tbl IS 'The different positions that employees could assume';

COMMENT ON COLUMN positions_tbl.position_name IS '(UNIQUE) The name of the position of the employee';

CREATE  TABLE services_tbl ( 
	service_id           smallserial  NOT NULL ,
	service_name         varchar(100)  NOT NULL ,
	service_prep_duration smallint   ,
	service_duration     smallint  NOT NULL ,
	service_cleanup_duration smallint   ,
	service_price        money  NOT NULL ,
	CONSTRAINT fk_service_tbl_provider_service_tbl FOREIGN KEY ( service_id ) REFERENCES position_service_link_tbl( service_id )  ,
	CONSTRAINT fk_services_tbl_booking_service_link_tbl FOREIGN KEY ( service_id ) REFERENCES booking_service_link_tbl( service_id )  
 );

COMMENT ON TABLE services_tbl IS 'All the services that the company can provide';

COMMENT ON COLUMN services_tbl.service_name IS '(UNIQUE) The way the company calls the service';

COMMENT ON COLUMN services_tbl.service_prep_duration IS 'The minutes that the employee needs before the service can be provided (setting the equipment needed...)';

COMMENT ON COLUMN services_tbl.service_duration IS 'The duration of the service in minutes';

COMMENT ON COLUMN services_tbl.service_cleanup_duration IS 'The minutes that the employee needs before another service can be provided (cleaning...)';

COMMENT ON COLUMN services_tbl.service_price IS 'The full price of the service';

CREATE  TABLE shifts_tbl ( 
	shift_id             serial  NOT NULL ,
	shift_name           varchar(100)  NOT NULL ,
	shift_date_start     date   ,
	shift_date_end       date   ,
	shift_starting_time  time  NOT NULL ,
	shift_break_start    time   ,
	shift_break_end      time   ,
	shift_ending_time    time  NOT NULL ,
	shift_dayofweek      smallint[]   ,
	shift_position       smallint[]   ,
	CONSTRAINT fk_shift_tbl_shift_staff_link_tbl FOREIGN KEY ( shift_id ) REFERENCES position_shift_link_tbl( shift_id )  
 );

COMMENT ON TABLE shifts_tbl IS 'The shift for a specified range of dates (The shifts with the shortest range will precede others)';

COMMENT ON COLUMN shifts_tbl.shift_name IS 'E.g.: manager''s summer shift';

COMMENT ON COLUMN shifts_tbl.shift_date_start IS 'The date at which the shift will be effective (if null, it will be applied to every day and shifts with specified dates will take precedence)';

COMMENT ON COLUMN shifts_tbl.shift_date_end IS 'The end date of the specified shift';

COMMENT ON COLUMN shifts_tbl.shift_starting_time IS 'The time at which the shift will start';

COMMENT ON COLUMN shifts_tbl.shift_break_start IS 'The time at which the employees will have a break if there is one';

COMMENT ON COLUMN shifts_tbl.shift_break_end IS 'The time at which the break will end if there is one';

COMMENT ON COLUMN shifts_tbl.shift_ending_time IS 'The time at which the shift will end';

COMMENT ON COLUMN shifts_tbl.shift_dayofweek IS 'It restricts the shift to certain days or day of the week (1=Monday, 2=Tuesday, 3=Wednesday, 4=Thursday... 7=Sunday)';

COMMENT ON COLUMN shifts_tbl.shift_position IS 'Position in month, e.g.: 1 = the first of the month\n(If a day of the week is specified, let''s say Monday, it will take place the first Monday of the month)\nCONSTRAINT:\nThe position number cannot exceed the month days or weeks in case of having specified the day of the week prior.';

CREATE  TABLE branches_tbl ( 
	branch_id            smallserial  NOT NULL ,
	branch_name          varchar(100)  NOT NULL ,
	location_id          smallint  NOT NULL ,
	slots_conf__id       smallint  NOT NULL ,
	CONSTRAINT fk_branch_tbl_employee_tbl FOREIGN KEY ( branch_id ) REFERENCES employees_tbl( branch_id )  
 );

COMMENT ON TABLE branches_tbl IS 'Information about the branches owned by the company';

COMMENT ON COLUMN branches_tbl.branch_name IS 'The full name assigned to to the specific branch';

COMMENT ON COLUMN branches_tbl.location_id IS 'The location of the branch';

COMMENT ON COLUMN branches_tbl.slots_conf__id IS 'Slots settings';

CREATE  TABLE locations_tbl ( 
	location_id          smallserial  NOT NULL ,
	location_country     varchar(100)  NOT NULL ,
	location_city        varchar(100)   ,
	location_address     varchar(200)  NOT NULL ,
	location_postcode    varchar(50)  NOT NULL ,
	location_timezone    varchar(20)   ,
	CONSTRAINT pk_location_tbl_location_id PRIMARY KEY ( location_id ),
	CONSTRAINT fk_locations_tbl_branches_tbl FOREIGN KEY ( location_id ) REFERENCES branches_tbl( location_id )  
 );

COMMENT ON TABLE locations_tbl IS 'Full address of a unique branch';

COMMENT ON COLUMN locations_tbl.location_country IS 'Full name of the country';

COMMENT ON COLUMN locations_tbl.location_city IS 'Full name of the city';

COMMENT ON COLUMN locations_tbl.location_address IS 'Street and building number';

COMMENT ON COLUMN locations_tbl.location_postcode IS 'Postcode of the branch';

COMMENT ON COLUMN locations_tbl.location_timezone IS 'The timezone code of the location, e.g: GMT, EDT, IOT, EAT... (names are validated  through pg_timezone_names)';

CREATE  TABLE slots_confs_tbl ( 
	slots_conf_id        smallserial  NOT NULL ,
	slots_conf_available smallint   ,
	slots_conf_interval  smallint  NOT NULL ,
	slots_conf_break     smallint  NOT NULL ,
	CONSTRAINT fk_slots_tbl_branches_tbl FOREIGN KEY ( slots_conf_id ) REFERENCES branches_tbl( slots_conf__id )  
 );

COMMENT ON TABLE slots_confs_tbl IS 'Slots configurations';

COMMENT ON COLUMN slots_confs_tbl.slots_conf_available IS 'The months from now that have slots opened to book, e.g.: 2 months = the calendar will always have 2 months worth of opened slots';

COMMENT ON COLUMN slots_confs_tbl.slots_conf_interval IS 'The times at which services can be booked, e.g.: each 30 minutes = 12:00, 12:30, 13:00...';

COMMENT ON COLUMN slots_confs_tbl.slots_conf_break IS 'If the minimum break is 5 minutes, and a booking finishes at 12:10, instead of waiting until 12:30 (30 minutes interval), the next slot will be at 12:15.\n\nOr in case of having a booking at 12:30 and the appointment lasts 30 minutes, instead of opening a slot at 12:30, it will open it at 12:35.\n\nThe next slot will always be rounded up to a number finishing in 0 or 5.';

