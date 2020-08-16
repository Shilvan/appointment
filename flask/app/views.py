from app import app
from flask import Flask, render_template, jsonify, session, url_for, request, redirect, g
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy import create_engine
from sqlalchemy_utils import database_exists, create_database, drop_database
import psycopg2
from datetime import date, timedelta
import datetime
import json
from flask_login import LoginManager, UserMixin, login_user
import re
import calendar
from werkzeug.security import generate_password_hash, check_password_hash

app.config['TEMPLATES_AUTO_RELOAD'] = True


app.secret_key = "password"
#app.permanent_session_lifetime = timedelta(minutes=1)


@app.before_request
def before_request():
    g.user = None
    g.employee = None
    if 'user_id' in session:
        # get by the ID check https://www.youtube.com/watch?v=2Zz97NVbH0U
        user = session['user_id']
        g.user = user
    if 'employee_id' in session:
        employee = session['employee_id']
        g.employee = employee


# postgresql://user:password@database_server_IP
engine = create_engine("postgres://localhost/AppointmentDB")


lower = 0
new_datetime = None


@app.route("/")
def index():
    return render_template("public/index.html")


@app.route("/contact")
def contact():
    return render_template("public/contact.html")


@app.route("/work")
def work():
    return render_template("public/work.html")


@app.route("/work/cuttem")
def cuttem():
    return render_template("public/cuttem.html")


@app.route("/appointment/login", methods=["POST", "GET"])
def login_public():
    if request.method == 'POST':
        #session.pop('user_id', None)

        rf = request.form
        for key in rf.keys():
            data = key
        data_dict = json.loads(data)
        username = data_dict['username']
        password = data_dict['password']

        conn = engine.connect()
        password_sql = "SELECT password FROM customers_tbl WHERE username = %s;"
        password_tupple = conn.execute(password_sql, (username))

        hashed_password = None
        for password_result in password_tupple:
            hashed_password = password_result[0]

        login_val = check_password_hash(hashed_password, password)

        resp_dic = {}

        if login_val == True:
            customer_sql = "SELECT id FROM customers_tbl WHERE username = %s;"
            customer_tupple = conn.execute(customer_sql, (username))
            for customer in customer_tupple:
                user_id = customer[0]

            session['user_id'] = user_id
            resp_dic = {'msg': 'Successful'}
        else:
            resp_dic = {'msg': 'Error'}

        resp = jsonify(resp_dic)
        return resp
        # return redirect(url_for('work'))

    if not g.user:
        print("----> USER NOT LOGGED IN")
    else:
        print("----> USER LOGGED IN ALREADY")
        print(g.user)
        return redirect(url_for('appointment'))

    return render_template("public/login-public.html")


@app.route("/appointment/logout", methods=["POST", "GET"])
def logout_public():
    session.pop('user_id', None)
    return redirect(url_for('appointment'))


@app.route("/appointment/register", methods=["POST"])
def register_public():
    rf = request.form
    for key in rf.keys():
        data = key
    data_dict = json.loads(data)

    hashed_password = generate_password_hash(
        data_dict['password'], method='sha256')

    conn = engine.connect()
    register_sql = "INSERT INTO customers_tbl (firstname, lastname, username, password, email, phone) VALUES (%s, %s, %s, %s, %s, %s) RETURNING id;"
    register_tupple = conn.execute(register_sql, (data_dict['firstname'], data_dict['lastname'],
                                                  data_dict['username'], hashed_password, data_dict['email'], data_dict['phone']))

    for register_id in register_tupple:
        user_id = register_id[0]

    resp_dic = {}

    session['user_id'] = user_id
    resp_dic = {'msg': 'Successful'}

    resp = jsonify(resp_dic)
    return resp
    # return redirect(url_for('work'))


@app.route("/appointment", methods=["POST", "GET"])
def appointment():
    if request.method == 'POST':
        rf = request.form
        for key in rf.keys():
            data = key
        data_dict = json.loads(data)
        print(data_dict)

        d = datetime.datetime.strptime(data_dict['date'], '%Y-%m-%d')
        t = datetime.datetime.strptime(data_dict['time'], '%H:%M')
        service_datetime = datetime.datetime(
            d.year, d.month, d.day, t.hour, t.minute)

        conn = engine.connect()
        booking_sql = "INSERT INTO bookings_tbl (service_datetime, employee_id, customer_id) VALUES (%s, %s, %s) RETURNING id;"
        booking_id_tupple = conn.execute(
            booking_sql, (service_datetime, data_dict['provider'], g.user))

        for booking_id in booking_id_tupple:
            booking_id_val = booking_id[0]

        booking_services_sql = "INSERT INTO bookings_services_link_tbl (booking_id, service_id) VALUES (%s, %s);"
        conn.execute(booking_services_sql,
                     (booking_id_val, data_dict['service']))
        resp_dic = {'msg': 'Successful'}
        resp = jsonify(resp_dic)

        return resp

    else:
        if not g.user:
            return redirect(url_for('login_public'))

        return render_template("public/appointment.html")


@app.route("/dashboard")
def dashboard():
    if not g.employee:
        return redirect(url_for('login_dashboard'))
    return render_template("admin/dashboard.html")


@app.route("/dashboard/login", methods=["POST", "GET"])
def login_dashboard():
    if request.method == 'POST':
        #session.pop('user_id', None)

        rf = request.form
        for key in rf.keys():
            data = key
        data_dict = json.loads(data)
        username = data_dict['username']
        password = data_dict['password']

        emp_id = re.findall("^\d+(?=\.)", username)
        emp_lastname = re.findall("\w+$", username)

        id_val = emp_id[0]
        """
        for id in emp_id:
            id_val = id"""

        lastname_val = None
        for lastname in emp_lastname:
            lastname_val = lastname

        print(username, id_val, lastname_val, password)

        conn = engine.connect()
        login_sql = "SELECT exists (SELECT id FROM employees_tbl WHERE id = %s AND lastname = %s AND password = %s);"
        login_tupple = conn.execute(
            login_sql, (id_val, lastname_val, password))

        for login_result in login_tupple:
            login_val = login_result[0]

        resp_dic = {}

        if login_val == True:
            session['employee_id'] = int(id_val)
            resp_dic = {'msg': 'Successful'}
        else:
            resp_dic = {'msg': 'Error'}

        resp = jsonify(resp_dic)
        return resp

    if not g.employee:
        print("----> EMPLOYEE NOT LOGGED IN")
        print(g.employee)
    else:
        print("----> EMPLOYEE LOGGED IN ALREADY")
        print(g.employee)
        return redirect(url_for('dashboard'))

    return render_template("admin/login-dashboard.html")


@app.route("/dashboard/logout")
def logout_dashboard():
    session.pop('employee_id', None)
    return redirect(url_for('dashboard'))


@app.route("/dashboard/manage")
def manage():
    return render_template("admin/manage.html")


@app.route("/dashboard/settings")
def settings():
    return render_template("admin/settings.html")


@app.route("/dashboard/help")
def help():
    return render_template("admin/help.html")


# FETCH FROM JS
@app.route('/get_branches')
def branch():
    conn = engine.connect()
    sql = "SELECT id, name FROM branches_tbl;"
    branches = conn.execute(sql)

    branchesArray = []

    for branch in branches:
        branchObj = {}
        branchObj["id"] = branch.id
        branchObj["name"] = branch.name
        branchesArray.append(branchObj)

    return jsonify({'branches': branchesArray})


@app.route('/get_services/<branch>')
def service(branch):
    conn = engine.connect()

    sql = "SELECT DISTINCT services_tbl.id, services_tbl.name FROM services_tbl INNER JOIN positions_services_link_tbl ON positions_services_link_tbl.service_id = services_tbl.id INNER JOIN employees_tbl ON employees_tbl.position_id = positions_services_link_tbl.position_id AND employees_tbl.branch_id = %s;"
    services = conn.execute(sql, (branch))

    servicesArray = []

    for service in services:
        serviceObj = {}
        serviceObj["id"] = service.id
        serviceObj["name"] = service.name
        servicesArray.append(serviceObj)

    return jsonify({'services': servicesArray})


@app.route('/get_providers/<branch>/<service>')
def provider(branch, service):
    conn = engine.connect()
    sql = "SELECT employees_tbl.id, employees_tbl.firstname, employees_tbl.lastname FROM employees_tbl INNER JOIN positions_services_link_tbl ON positions_services_link_tbl.position_id = employees_tbl.position_id INNER JOIN services_tbl ON services_tbl.id = positions_services_link_tbl.service_id WHERE positions_services_link_tbl.service_id = %s AND employees_tbl.branch_id = %s; "
    employees = conn.execute(sql, (service, branch))

    employeesArray = []

    for employee in employees:
        employeeObj = {}
        employeeObj["id"] = employee.id
        employeeObj["name"] = employee.firstname + " " + employee.lastname
        employeesArray.append(employeeObj)

    return jsonify({'providers': employeesArray})


@app.route('/available_slots/<branch>/<service>/<provider>/<date>/<time_lower>/<time_upper>')
def slots(branch, service, provider, date, time_lower, time_upper):
    conn = engine.connect()

    # get the position of the provider
    employee_position_sql = "SELECT position_id FROM employees_tbl WHERE id = %s;"
    position_tupple = conn.execute(employee_position_sql, (provider))
    for position_id in position_tupple:
        position_id_val = position_id[0]

    # get the times of the provider
    starting_time_sql = "SELECT starting_time, ending_time FROM shifts_tbl INNER JOIN positions_shifts_link_tbl ON positions_shifts_link_tbl.shift_id = shifts_tbl.id WHERE positions_shifts_link_tbl.position_id = %s;"
    starting_time_tupple = conn.execute(starting_time_sql, (position_id_val))
    for time in starting_time_tupple:
        starting_time_val = time[0]
        ending_time_val = time[1]
        # check when there are multiple starting time, choose the one with higher hierarchy

    # service duration
    service_duration_sql = "SELECT duration FROM services_tbl WHERE id = %s;"
    service_duration_tupple = conn.execute(service_duration_sql, (service))
    for service_duration in service_duration_tupple:
        service_duration_val = service_duration[0]

    d = datetime.datetime.strptime(date, '%Y-%m-%d')
    t_lower = datetime.datetime.strptime(time_lower, "%H:%M").time()
    t_upper = datetime.datetime.strptime(time_upper, "%H:%M").time()

    if t_lower > starting_time_val:
        new_starting_datetime = datetime.datetime(
            d.year, d.month, d.day, t_lower.hour, t_lower.minute)
    else:
        new_starting_datetime = datetime.datetime(
            d.year, d.month, d.day, starting_time_val.hour, starting_time_val.minute)

    if t_upper < ending_time_val:
        ending_datetime = datetime.datetime(
            d.year, d.month, d.day, t_upper.hour, t_upper.minute)
    else:
        ending_datetime = datetime.datetime(
            d.year, d.month, d.day, ending_time_val.hour, ending_time_val.minute)

    new_ending_datetime = ending_datetime - \
        timedelta(minutes=service_duration_val)

    interval_sql = "SELECT slots_interval FROM slots_confs_tbl INNER JOIN branches_tbl ON branches_tbl.slots_conf_id = slots_confs_tbl.id WHERE branches_tbl.id = %s;"
    interval_tupple = conn.execute(interval_sql, (branch))
    for interval in interval_tupple:
        interval_val = interval[0]

    # put the employee ID in there
    bookings_sql = "SELECT service_datetime, services_tbl.duration FROM bookings_tbl INNER JOIN bookings_services_link_tbl ON bookings_services_link_tbl.booking_id = bookings_tbl.id INNER JOIN services_tbl ON services_tbl.id = bookings_services_link_tbl.service_id WHERE EXTRACT(YEAR FROM service_datetime) = %s AND EXTRACT(MONTH FROM service_datetime) = %s AND EXTRACT(DAY FROM service_datetime) = %s AND employee_id = %s ORDER BY service_datetime ASC;"
    bookings_tupple = conn.execute(
        bookings_sql, (d.year, d.month, d.day, provider))
    booked_slotsArray = []
    for booking in bookings_tupple:
        slot = []
        slot.append(booking.service_datetime)
        slot.append(booking.service_datetime +
                    timedelta(minutes=booking.duration))
        booked_slotsArray.append(slot)

    print("[BOOKED SLOTS]: ", booked_slotsArray)
    slotsArray = []
    globals()['lower'] = 0
    globals()['new_datetime'] = new_starting_datetime

    while new_starting_datetime <= new_ending_datetime:
        if search(lower, booked_slotsArray, new_starting_datetime, service_duration_val) and new_datetime <= new_ending_datetime:

            new_starting_datetime = new_datetime
            print("     Available slot at:  ",
                  new_starting_datetime.strftime("%H:%M"))
            slotsArray.append(new_starting_datetime.strftime("%H:%M"))

            if interval_val <= service_duration_val:
                new_starting_datetime += timedelta(minutes=interval_val)
            else:
                new_starting_datetime += timedelta(
                    minutes=service_duration_val)
        else:
            print("There are no appointments available")
            break

    print(slotsArray)

    return jsonify({'slots': slotsArray})


@app.route('/booked_slots/<date>')
def bookings(date):
    conn = engine.connect()

    position_sql = "SELECT position_id FROM employees_tbl WHERE id = %s;"
    position_tupple = conn.execute(position_sql, (g.employee))

    for position in position_tupple:
        position_val = position[0]

    print(position_val)

    d = datetime.datetime.strptime(date, '%Y-%m-%d')

    if position_val == 1:
        print("ADMIN PERMISSION")
        bookings_sql = "SELECT service_datetime, services_tbl.duration, services_tbl.name, customers_tbl.lastname, customers_tbl.firstname FROM bookings_tbl INNER JOIN customers_tbl ON customers_tbl.id = bookings_tbl.customer_id INNER JOIN bookings_services_link_tbl ON bookings_services_link_tbl.booking_id = bookings_tbl.id INNER JOIN services_tbl ON services_tbl.id = bookings_services_link_tbl.service_id WHERE EXTRACT(YEAR FROM service_datetime) = %s AND EXTRACT(MONTH FROM service_datetime) = %s AND EXTRACT(DAY FROM service_datetime) = %s ORDER BY service_datetime ASC;"
        bookings_tupple = conn.execute(bookings_sql, (d.year, d.month, d.day))
    elif position_val == 2:
        print("MANAGER PERMISSION")
        branch_sql = "SELECT branch_id FROM employees_tbl WHERE id = %s"
        branch_tupple = conn.execute(branch_sql, (g.employee))

        for branch in branch_tupple:
            branch_val = branch[0]

        bookings_sql = "SELECT service_datetime, services_tbl.duration, services_tbl.name, customers_tbl.lastname, customers_tbl.firstname FROM bookings_tbl INNER JOIN customers_tbl ON customers_tbl.id = bookings_tbl.customer_id INNER JOIN bookings_services_link_tbl ON bookings_services_link_tbl.booking_id = bookings_tbl.id INNER JOIN services_tbl ON services_tbl.id = bookings_services_link_tbl.service_id INNER JOIN employees_tbl ON employees_tbl.id = bookings_tbl.employee_id WHERE employees_tbl.branch_id = %s AND EXTRACT(YEAR FROM service_datetime) = %s AND EXTRACT(MONTH FROM service_datetime) = %s AND EXTRACT(DAY FROM service_datetime) = %s ORDER BY service_datetime ASC;"
        bookings_tupple = conn.execute(
            bookings_sql, (branch_val, d.year, d.month, d.day))

    elif position_val == 3:
        print("EMPLOYEE PERMISSION")
        bookings_sql = "SELECT service_datetime, services_tbl.duration, services_tbl.name, customers_tbl.lastname, customers_tbl.firstname FROM bookings_tbl INNER JOIN customers_tbl ON customers_tbl.id = bookings_tbl.customer_id INNER JOIN bookings_services_link_tbl ON bookings_services_link_tbl.booking_id = bookings_tbl.id INNER JOIN services_tbl ON services_tbl.id = bookings_services_link_tbl.service_id WHERE EXTRACT(YEAR FROM service_datetime) = %s AND EXTRACT(MONTH FROM service_datetime) = %s AND EXTRACT(DAY FROM service_datetime) = %s AND employee_id = %s ORDER BY service_datetime ASC;"
        bookings_tupple = conn.execute(
            bookings_sql, (d.year, d.month, d.day, g.employee))

        # put the employee ID in there
    """bookings_sql = "SELECT service_datetime, services_tbl.duration, services_tbl.name, customers_tbl.lastname, customers_tbl.firstname FROM bookings_tbl INNER JOIN customers_tbl ON customers_tbl.id = bookings_tbl.customer_id INNER JOIN bookings_services_link_tbl ON bookings_services_link_tbl.booking_id = bookings_tbl.id INNER JOIN services_tbl ON services_tbl.id = bookings_services_link_tbl.service_id WHERE EXTRACT(YEAR FROM service_datetime) = %s AND EXTRACT(MONTH FROM service_datetime) = %s AND EXTRACT(DAY FROM service_datetime) = %s ORDER BY service_datetime ASC;"
    bookings_tupple = conn.execute(
        bookings_sql, (d.year, d.month, d.day))"""
    booked_slotsArray = []
    for booking in bookings_tupple:
        bookingObj = {}
        bookingObj['time_start'] = booking.service_datetime.strftime("%H:%M")
        bookingObj['time_end'] = (
            booking.service_datetime + timedelta(minutes=booking.duration)).strftime("%H:%M")
        bookingObj['service'] = booking.name
        bookingObj['client'] = booking.firstname + \
            " " + booking.lastname
        booked_slotsArray.append(bookingObj)
    return jsonify({'bookings': booked_slotsArray})


@app.route('/available_days_in/<branch>/<service>/<provider>/<year>/<month>/<days>/<time_lower>/<time_upper>')
def day(branch, service, provider, year, month, days, time_lower, time_upper):
    days = days.split(',')
    # print(days)
    conn = engine.connect()

    # get the position of the provider
    employee_position_sql = "SELECT position_id FROM employees_tbl WHERE id = %s;"
    position_tupple = conn.execute(employee_position_sql, (provider))
    for position_id in position_tupple:
        position_id_val = position_id[0]

    # get the times of the provider
    starting_time_sql = "SELECT starting_time, ending_time FROM shifts_tbl INNER JOIN positions_shifts_link_tbl ON positions_shifts_link_tbl.shift_id = shifts_tbl.id WHERE positions_shifts_link_tbl.position_id = %s;"
    starting_time_tupple = conn.execute(starting_time_sql, (position_id_val))
    for time in starting_time_tupple:
        starting_time_val = time[0]
        ending_time_val = time[1]
        # check when there are multiple starting time, choose the one with higher hierarchy

    # service duration
    service_duration_sql = "SELECT duration FROM services_tbl WHERE id = %s;"
    service_duration_tupple = conn.execute(service_duration_sql, (service))
    for service_duration in service_duration_tupple:
        service_duration_val = service_duration[0]

    filter_lower = datetime.datetime.strptime(time_lower, "%H:%M").time()
    filter_upper = datetime.datetime.strptime(time_upper, "%H:%M").time()

    t_lower = filter_lower if filter_lower > starting_time_val else starting_time_val
    t_upper = filter_upper if filter_upper < ending_time_val else ending_time_val

    daysArray = []

    """for day in days:
        daysArray.append(day.date_part)"""
    today = datetime.datetime.today()
    first_day = 1 if int(month) != today.month else today.day
    last_day = calendar.monthrange(int(year), int(month))[1] + 1

    for day in range(first_day, last_day):
        dayoftheweek = str(datetime.datetime(
            int(year), int(month), day).weekday())

        if dayoftheweek in days:
            new_starting_datetime = datetime.datetime(
                int(year), int(month), day, t_lower.hour, t_lower.minute)
            ending_datetime = datetime.datetime(
                int(year), int(month), day, t_upper.hour, t_upper.minute)
            new_ending_datetime = ending_datetime - \
                timedelta(minutes=service_duration_val)

            # GET BOOKED SLOTS
            bookings_sql = "SELECT service_datetime, services_tbl.duration FROM bookings_tbl INNER JOIN bookings_services_link_tbl ON bookings_services_link_tbl.booking_id = bookings_tbl.id INNER JOIN services_tbl ON services_tbl.id = bookings_services_link_tbl.service_id WHERE EXTRACT(YEAR FROM service_datetime) = %s AND EXTRACT(MONTH FROM service_datetime) = %s AND EXTRACT(DAY FROM service_datetime) = %s AND employee_id = %s ORDER BY service_datetime ASC;"
            bookings_tupple = conn.execute(
                bookings_sql, (year, month, day, provider))
            booked_slotsArray = []
            for booking in bookings_tupple:
                slot = []
                slot.append(booking.service_datetime)
                slot.append(booking.service_datetime +
                            timedelta(minutes=booking.duration))
                booked_slotsArray.append(slot)

            globals()['lower'] = 0
            globals()['new_datetime'] = new_starting_datetime

            if new_starting_datetime <= new_ending_datetime:
                if search(lower, booked_slotsArray, new_starting_datetime, service_duration_val) and new_datetime <= new_ending_datetime:
                    #print("There's at least one available slot")
                    new_starting_datetime = new_datetime
                    print("- ", day, ", Available slot at:  ",
                          new_starting_datetime.strftime("%H:%M"))

                    """if interval_val <= service_duration_val:
                        new_starting_datetime += timedelta(minutes=interval_val)
                    else:
                        new_starting_datetime += timedelta(
                            minutes=service_duration_val)"""

                    daysArray.append(day)

    print(daysArray)

    return jsonify({'available_days': daysArray})


def search(lower, list, time_lower, duration):
    time_upper = time_lower + timedelta(minutes=duration)
    globals()['new_datetime'] = time_lower
    upper = len(list) - 1

    while lower <= upper:
        mid = (lower + upper) // 2
        booked_slot_duration = (
            list[mid][1] - list[mid][0]).total_seconds() / 60
        if duration <= booked_slot_duration:
            if (time_lower >= list[mid][0] and time_lower < list[mid][1]) or (time_upper > list[mid][0] and time_upper <= list[mid][1]):
                print("------> This slot is already booked", list[mid])
                lower = mid + 1
                globals()['lower'] = lower
                search(lower, list, list[mid][1], duration)
        else:
            if (list[mid][0] >= time_lower and list[mid][0] < time_upper) or (list[mid][1] > time_lower and list[mid][1] <= time_upper):
                print("------> This slot is already booked", list[mid])
                lower = mid + 1
                globals()['lower'] = lower
                search(lower, list, list[mid][1], duration)

        if time_lower > list[mid][1]:
            lower = mid + 1
        else:
            upper = mid - 1

    return True  # the slot is available


"""
    datetime = 'add the time at which the shift starts as a timestamp'

    shift_ending_time = 'ending time query - the duration of the service query'

    slotsArray = []

    while datetime <= shift_ending_time:

        time = datetime.strftime("%H:%M")
        slotsArray.append(time)

        # datetime + 30mins"""


# AVAILABLE SLOTS

"""
Function (date):
    *First check if the date is available

    check the time at which the employee starts working and start the loop

        *if the time is outside the current day shift_ending_time
            -break

        else
            if that time is a blocked slot
                -Continue (to when the blocked slot ends)

            if that time has a shift break 
                -Continue (to when the break ends)

            if there's a booking at that time
                -Continue (to when the booking ends + 5 mins approximating its ending to 5 or 0)

            else
                -make the slot available
                -Continue (next available slot 15 or 30 min)
"""
"""
@app.route('/available_times_in/<year>/<month>/<day>')
def time(year, month, day):
    conn = engine.connect()
    sql = "SELECT UNNEST(available_times) FROM dates WHERE EXTRACT(YEAR from day) = %s AND EXTRACT(MONTH from day) = %s AND EXTRACT(DAY from day) = %s;"
    # add "as" after unnest to set the new name of the column instead of unnest.
    times = conn.execute(sql, (year, month, day))

    timesArray = []

    for time in times:
        timesArray.append(time.unnest)

    return jsonify({'available_times': timesArray})
"""


# AVAILABLE DAYS
"""
function (date):
    if the date between that the employees shift start and end
        -The day is available

    else if the day is blocked
        -The day is not available

    else if the day is full with bookings and breaks
        -The day is not available


    else
        -The day is not available
"""
