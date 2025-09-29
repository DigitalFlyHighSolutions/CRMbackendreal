const Attendance = require("../models/Attendance");
const Employee = require("../models/Employee");
const moment = require("moment-timezone");

const ZONE = "Asia/Kolkata";

// POST /api/attendance/mark-in
exports.markIn = async (req, res) => {
  const employeeId = req.user.id;
  const now = moment.tz(ZONE);
  const date = now.format("YYYY-MM-DD");
  const loginTime = now.format("HH:mm:ss"); // only saving time

  try {
    const existing = await Attendance.findOne({ employee: employeeId, date });
    if (existing) {
      return res.status(200).json({ msg: "Already marked in." });
    }

    const employee = await Employee.findById(employeeId);
    if (!employee) {
      return res.status(404).json({ msg: "Employee not found" });
    }

    const attendance = new Attendance({
      employee: employeeId,
      name: employee.name,
      email: employee.email,
      date,
      loginTime,
    });

    await attendance.save();
    res.status(201).json({ msg: "Login time recorded (IST)", attendance });
  } catch (err) {
    console.error("Error saving attendance:", err);
    res.status(500).json({ error: err.message });
  }
};

// POST /api/attendance/mark-out
exports.markOut = async (req, res) => {
  const employeeId = req.user.id;
  const now = moment.tz(ZONE);
  const date = now.format("YYYY-MM-DD");
  const logoutTime = now.format("HH:mm:ss");

  try {
    const attendance = await Attendance.findOne({ employee: employeeId, date });
    if (!attendance) {
      return res.status(404).json({ msg: "No attendance record found for today" });
    }

    if (attendance.logoutTime) {
      return res.status(200).json({ msg: "Already marked out" });
    }

    // Build login + logout moment from stored strings
    const loginMoment = moment.tz(
      `${attendance.date} ${attendance.loginTime}`,
      "YYYY-MM-DD HH:mm:ss",
      ZONE
    );
    const logoutMoment = moment.tz(
      `${date} ${logoutTime}`,
      "YYYY-MM-DD HH:mm:ss",
      ZONE
    );

    if (!loginMoment.isValid() || !logoutMoment.isValid()) {
      return res.status(400).json({ msg: "Invalid stored times" });
    }

    const minutesWorked = logoutMoment.diff(loginMoment, "minutes");
    const hoursWorked = (minutesWorked / 60).toFixed(2);

    // Assign status
    let status = "Absent";
    if (hoursWorked >= 7.5) status = "Present";
    else if (hoursWorked >= 4) status = "Half Day";

    attendance.logoutTime = logoutTime;
    attendance.hoursWorked = hoursWorked;
    attendance.status = status;

    await attendance.save();

    res.status(200).json({
      msg: "Logout time recorded (IST)",
      attendance,
    });
  } catch (err) {
    console.error("Error marking out:", err);
    res.status(500).json({ error: err.message });
  }
};

// GET /api/attendance/all (Admin only)
exports.getAll = async (req, res) => {
  try {
    const attendanceRecords = await Attendance.find().sort({ date: -1 });
    res.status(200).json(attendanceRecords);
  } catch (err) {
    console.error("Error fetching attendance:", err);
    res.status(500).json({ error: err.message });
  }
};

// GET /api/attendance/my
exports.getMyAttendance = async (req, res) => {
  try {
    const records = await Attendance.find({ employee: req.user.id }).sort({ date: 1 });
    res.json(records);
  } catch (error) {
    res.status(500).json({ message: "Error fetching your attendance", error });
  }
};
