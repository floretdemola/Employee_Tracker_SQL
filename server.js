const express = require('express');
// Import and require mysql2
const mysql = require('mysql2');

const PORT = process.env.PORT || 3001;
const app = express();

app.use(express.urlencoded({ extended: false }));
app.use(express.json());

const connection = mysql.createConnection(
  {
    host: 'localhost',
    user: 'root',
    password: 'Ginger0319!!',
    database: 'employees_db'
  },
  console.log(`Connected to the employees database.`)
);


// Default response for any other request (Not Found)
app.use((req, res) => {
    res.status(404).end();
  });
  
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });

module.exports = connection;
