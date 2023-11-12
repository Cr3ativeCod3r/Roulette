const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const http = require("http");
const { readdirSync } = require("fs");
const dotenv = require("dotenv");
const path = require("path");
const bodyParser = require("body-parser");
const app = express();
const server = http.createServer(app);
const mysql = require("mysql"); // 



dotenv.config({ path: "../.env" });
require('stream-http');

app.use(express.json());
app.use(cookieParser());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')))

// Połączenie z bazą danych MySQL
const db = mysql.createConnection({
  host: process.env.MYSQL_HOST,
  user: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASSWORD,
  database: process.env.MYSQL_DATABASE,
});

module.exports = db;

db.connect((err) => {
  if (err) {
    console.error("Error connecting to MySQL:", err);
  } else {
    console.log("Connected to MySQL database");
  }
});

// Obsługa żądań HTTP
readdirSync("./routes").map((r) => app.use("/", require("./routes/" + r)));

app.use("/api", (req, res) => {
  res.send("To jest treść pod adresem /api");
});

const PORT = process.env.PORT || 8000;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "/views"));
app.use("/auth", require("./routes/auth.routes"));


require("./controllers/steam")(app);


const initSocketIO = require("./sockets/main");
const io = initSocketIO(server);


io.on("connect", () => {
  console.log("Socket.io connected");
});



