const pool = require('./pool');




exports.getUserByUsername = async (username) => {
    const { rows } = await pool.query("SELECT * FROM users WHERE username=$1;", [username]);
    return rows[0];
}

exports.getUserByID = async (id) => {
    const { rows } = await pool.query("SELECT * FROM users WHERE id=$1;", [id]);
    return rows[0];
}

exports.AddUser = async (fname, lname, username, password, membership='signup') => {
    await pool.query("INSERT INTO users (first_name, last_name, username, password, membership) VALUES ($1, $2, $3, $4, $5);", [fname, lname, username, password, membership])
}

exports.updateMembership = async (id, membership) => {
    await pool.query("UPDATE users SET membership=$1 WHERE id=$2;", [membership, id]);
}

exports.addMessage = async (userid, title, message) => {
    const {rows} = await pool.query("INSERT INTO messages (title, text, time) VALUES ($1, $2, $3) RETURNING id;", [title, message, new Date()]);
    await pool.query("INSERT INTO user_message (user_id, message_id) VALUES ($1, $2);", [userid, rows[0].id]);
}

exports.getMessages = async () => {
    const { rows } = await pool.query("SELECT users.id AS user_id, messages.id, first_name, last_name, title, text, TO_CHAR(time, 'HH:MI DD-MM-YYYY') AS time FROM messages JOIN user_message ON messages.id=message_id JOIN users ON users.id=user_id ORDER BY time DESC;")
    return rows;
}

exports.deleteMessage = async (id) => {
    await pool.query("DELETE FROM messages WHERE id=$1;", [id]);
}