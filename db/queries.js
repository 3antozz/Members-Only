const pool = require('./pool');




exports.getUserByUsername = async (username) => {
    const { rows } = await pool.query("SELECT * FROM users WHERE username=$1;", [username]);
    return rows[0];
}

exports.getUserByID = async (id) => {
    const { rows } = await pool.query("SELECT * FROM users WHERE id=$1;", [id]);
    return rows[0];
}

exports.AddUser = async (fname, lname, username, password, role='signup') => {
    await pool.query("INSERT INTO users (first_name, last_name, username, password, role) VALUES ($1, $2, $3, $4, $5);", [fname, lname, username, password, role])
}

exports.updateMembership = async (id, membership) => {
    await pool.query("UPDATE users SET membership=$1 WHERE id=$2;", [membership, id]);
}