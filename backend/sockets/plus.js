const db = require("../server");

const addCoins = async (socket, steamId, coinsToAdd) => {
  try {
    const sql = "SELECT steamId, coins FROM users WHERE steamId = ?";
    db.query(sql, [steamId], async (err, results) => {
      if (err) {
        console.error("Error adding coins:", err);
      } else {
        const user = results[0];
        if (user) {
          const wallet = parseInt(user.coins);
          const updatedCoins = wallet + coinsToAdd;
          const updateSql = "UPDATE users SET coins = ? WHERE steamId = ?";
          
          db.query(
            updateSql,
            [updatedCoins, steamId],
            (updateErr, updateResults) => {
              if (updateErr) {
                console.error("Error", updateErr);
              } else {
                socket.emit("coins-added", { steamId, newCoins: updatedCoins });
              }
            }
          );
        } else {
          console.error(`No user ${steamId}.`);
        }
      }
    });
  } catch (error) {
    console.error("Error adding coins:", error);
  }
};

module.exports = addCoins;
