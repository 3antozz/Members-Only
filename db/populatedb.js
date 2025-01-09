const { Client } = require("pg");
require("dotenv").config();


const SQL = `

  CREATE EXTENSION IF NOT EXISTS citext;

  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    first_name VARCHAR (255),
    last_name VARCHAR (255),
    username CITEXT NOT NULL UNIQUE CHECK (char_length(username) > 0 AND char_length(username) <= 255),
    password VARCHAR (255),
    isMember BOOLEAN,
    isAdmin BOOLEAN);

  CREATE TABLE IF NOT EXISTS messages (
    id INTEGER PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    title VARCHAR (255),
    text TEXT,
    time TIMESTAMP);


  CREATE TABLE IF NOT EXISTS user_message (
    user_id INTEGER REFERENCES users (id) ON DELETE CASCADE,
    message_id INTEGER REFERENCES messages (id) ON DELETE CASCADE,
    PRIMARY KEY (user_id, message_id));
    `;


async function main() {
    console.log("seeding...");
    const client = new Client({
      connectionString: process.env.DATABASE_URL,
    });
    await client.connect();
    await client.query(SQL);
    await client.end();
    console.log("done");
  }
  
  main();