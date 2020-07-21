from app import app
from flask import render_template, jsonify, session, url_for, request, redirect
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy import create_engine
from sqlalchemy_utils import database_exists, create_database, drop_database
import psycopg2
from datetime import date, timedelta
import datetime
import json

app.config['TEMPLATES_AUTO_RELOAD'] = True


app.secret_key = "password"
app.permanent_session_lifetime = timedelta(minutes=5)

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


@app.route("/login")
def login():
    return render_template("login.html")


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
            booking_sql, (service_datetime, data_dict['provider'], 1))

        for booking_id in booking_id_tupple:
            booking_id_val = booking_id[0]

        booking_services_sql = "INSERT INTO bookings_services_link_tbl (booking_id, service_id) VALUES (%s, %s);"
        conn.execute(booking_services_sql,
                     (booking_id_val, data_dict['service']))
        resp_dic = {'msg': 'Successful'}
        resp = jsonify(resp_dic)

        return resp

    else:
        return render_template("public/appointment.html")


@app.route("/dashboard")
def dashboard():
    return render_template("admin/dashboard.html")


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
    sql = "SELECT employees_tbl.id, employees_tbl.forename, employees_tbl.lastname FROM employees_tbl INNER JOIN positions_services_link_tbl ON positions_services_link_tbl.position_id = employees_tbl.position_id INNER JOIN services_tbl ON services_tbl.id = positions_services_link_tbl.service_id WHERE positions_services_link_tbl.service_id = %s AND employees_tbl.branch_id = %s; "
    employees = conn.execute(sql, (service, branch))

    employeesArray = []

    for employee in employees:
        employeeObj = {}
        employeeObj["id"] = employee.id
        employeeObj["name"] = employee.forename + " " + employee.lastname
        employeesArray.append(employeeObj)

    return jsonify({'providers': employeesArray})


@app.route('/available_slots/<branch>/<service>/<provider>/<date>')
def slots(branch, service, provider, date):
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
    ending_datetime = datetime.datetime(
        d.year, d.month, d.day, ending_time_val.hour, ending_time_val.minute)
    new_ending_datetime = ending_datetime - \
        timedelta(minutes=service_duration_val)
    new_starting_datetime = datetime.datetime(
        d.year, d.month, d.day, starting_time_val.hour, starting_time_val.minute)

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

    d = datetime.datetime.strptime(date, '%Y-%m-%d')
    # put the employee ID in there
    bookings_sql = "SELECT service_datetime, services_tbl.duration, services_tbl.name, customers_tbl.fullname FROM bookings_tbl INNER JOIN customers_tbl ON customers_tbl.id = bookings_tbl.customer_id INNER JOIN bookings_services_link_tbl ON bookings_services_link_tbl.booking_id = bookings_tbl.id INNER JOIN services_tbl ON services_tbl.id = bookings_services_link_tbl.service_id WHERE EXTRACT(YEAR FROM service_datetime) = %s AND EXTRACT(MONTH FROM service_datetime) = %s AND EXTRACT(DAY FROM service_datetime) = %s ORDER BY service_datetime ASC;"
    bookings_tupple = conn.execute(
        bookings_sql, (d.year, d.month, d.day))
    booked_slotsArray = []
    for booking in bookings_tupple:
        bookingObj = {}
        bookingObj['time_start'] = booking.service_datetime.strftime("%H:%M")
        bookingObj['time_end'] = (
            booking.service_datetime + timedelta(minutes=booking.duration)).strftime("%H:%M")
        bookingObj['service'] = booking.name
        bookingObj['client'] = booking.fullname
        booked_slotsArray.append(bookingObj)
    return jsonify({'bookings': booked_slotsArray})


def search(lower, list, time_lower, duration):
    time_upper = time_lower + timedelta(minutes=duration)
    print(time_lower)
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


# check this
@app.route('/available_days_in/<year>/<month>')
def day(year, month):
    conn = engine.connect()
    sql = "SELECT EXTRACT(DAY FROM day) FROM dates WHERE EXTRACT(YEAR FROM day) = %s AND EXTRACT(MONTH FROM day) = %s;"
    days = conn.execute(sql, (year, month))

    daysArray = []

    for day in days:
        daysArray.append(day.date_part)

    return jsonify({'available_days': daysArray})


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
