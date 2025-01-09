const pool = require('./pool');




exports.getUserByUsername = async (username) => {
    const { rows } = await pool.query("SELECT * FROM users WHERE username=$1;", [username]);
    return rows[0];
}

exports.getUserByID = async (id) => {
    const { rows } = await pool.query("SELECT * FROM users WHERE id=$1;", [id]);
    return rows[0];
}

exports.AddUser = async (fname, lname, username, password, isMember = false, isAdmin = false) => {
    await pool.query("INSERT INTO users (first_name, last_name, username, password, isMember, isAdmin) VALUES ($1, $2, $3, $4, $5, $6);", [fname, lname, username, password, isMember, isAdmin])
}