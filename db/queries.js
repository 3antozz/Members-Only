const pool = require('./pool');




exports.getUser = async (username) => {
    const { rows } = await pool.query("SELECT * FROM users WHERE username=$1", [username]);
    return rows[0];
}