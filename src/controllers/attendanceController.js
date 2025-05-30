const Attendance = require('../models/Attendance');
const { sendError, sendSuccess, sendErrorMessage } = require('../utils/response');

exports.markAttendanceIfWithinTime = async (req, res) => {
    try {
        const { userId } = req.params;

        const now = new Date();
        const currentHour = now.getHours();

        if (currentHour >= 10 && currentHour < 12) {
            const today = new Date();
            today.setHours(0, 0, 0, 0);

            const alreadyMarked = await Attendance.findOne({ userId, date: today });

            if (alreadyMarked) {
                return sendErrorMessage(res, 'Attendance already marked for today.');
            }

            const newAttendance = new Attendance({ userId });
            await newAttendance.save();

            sendSuccess(res, 'Attendance marked successfully.');
        } else {
            sendErrorMessage(res, 'You can mark attendance only between 10:00 AM to 12:00 PM.');
        }
    } catch (error) {
        console.error('Error marking attendance:', error);
        sendError(res, 'Internal server error.');
    }
};

exports.getAllAttendance = async (req, res) => {
  try {
    
    const { userId, month, year, fromDate, toDate } = req.query;
    const query = {};

    if (userId && userId !== 'all') {
      query.userId = userId;
    }

    if (fromDate && toDate) {
      query.markedAt = {
        $gte: new Date(fromDate),
        $lte: new Date(toDate)
      };
    } else if (month && year) {
      const startDate = new Date(year, month - 1, 1);
      const endDate = new Date(year, month, 0, 23, 59, 59, 999);
      query.markedAt = {
        $gte: startDate,
        $lte: endDate
      };
    }

    const records = await Attendance.find(query).populate('userId', 'name email');
    sendSuccess(res, 'Attendance records fetched successfully.', records);
  } catch (error) {
    console.error('Error fetching attendance:', error);
    sendError(res, 'Error fetching attendance records.');
  }
};

exports.getAttendanceById = async (req, res) => {
    try {
        const id = req.params.id;
        const record = await Attendance.findById(id).populate('userId', 'name email');

        if (!record) {
            sendErrorMessage(res, 'Attendance record not found.');
        }

        sendSuccess(res, 'Attendance records fetched successfully.', record);
    } catch (error) {
        sendError(res, 'Error fetching attendance by ID.');
    }
};

exports.getFilteredAttendance = async (req, res) => {
    try {
        const { userId, month, date } = req.query;
        const filter = {};
        if (userId) filter.userId = userId;

        if (month) {
            const [year, m] = month.split('-');
            const start = new Date(year, m - 1, 1);
            const end = new Date(year, m, 0, 23, 59, 59);
            filter.markedAt = { $gte: start, $lte: end };
        }

        if (date) {
            const d = new Date(date); d.setHours(0, 0, 0, 0);
            const end = new Date(d); end.setHours(23, 59, 59, 999);
            filter.markedAt = { $gte: d, $lte: end };
        }

        const records = await Attendance.find(filter).populate('userId', 'name email');
        sendSuccess(res, 'Filtered attendance records fetched successfully.', records);
    } catch {
        sendError(res, 'Error fetching attendance by filter.');
    }
};