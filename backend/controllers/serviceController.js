const db = require("../config/db");

const getAllServices = (req, res) => {
  const sql = "SELECT * FROM services ORDER BY id DESC";

  db.query(sql, (err, results) => {
    if (err) {
      return res.status(500).json({
        message: "Failed to fetch services",
        error: err.message
      });
    }

    res.status(200).json(results);
  });
};

module.exports = { getAllServices };