CREATE TABLE IF NOT EXISTS users (
  steamId VARCHAR(255) UNIQUE,
  name VARCHAR(255),
  avatar VARCHAR(255),
  coins INT,
  canbet TINYINT(1) DEFAULT 1,
  canchat TINYINT(1) DEFAULT 1,
  usertyp ENUM("user", "mod", "admin") DEFAULT "user",
  maxbets TINYINT(1) DEFAULT 1
);

CREATE TABLE IF NOT EXISTS bethistory (
  id INT AUTO_INCREMENT PRIMARY KEY,
  gameid INT,
  stake INT,
  bet VARCHAR(10),
  result VARCHAR(10),
  profit INT,
  userid VARCHAR(255),
  ml VARCHAR(10),
  date VARCHAR(255),
  num INT,
  FOREIGN KEY (userid) REFERENCES users(steamId)
);

-- CREATE TABLE IF NOT EXISTS rolls (
--   id int(11) NOT NULL,
--   roll int(11) NOT NULL,
--   colour VARCHAR(10) NOT NULL,
--   time bigint(20) NOT NULL
-- );


-- FEATURE TO ADD (MLM)

-- CREATE TABLE IF NOT EXISTS raffales (
--   id INT AUTO_INCREMENT PRIMARY KEY,
--   raf VARCHAR(255),
--   code VARCHAR(255),
--   free TINYINT(1) DEFAULT 1,
--   FOREIGN KEY (userid) REFERENCES users(steamId)
-- );