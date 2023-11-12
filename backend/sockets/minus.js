const db = require("../server");

const minusCoins = async (socket, steamId, coinsToMinus, block) => {
  try {
    if (block) {
      const sql = "SELECT steamId, coins FROM users WHERE steamId = ?";
      db.query(sql, [steamId], async (err, results) => {
        if (err) {
          console.error("Error:", err);
        } else {
          const user = results[0];
          if (user) {
            const wallet = parseInt(user.coins);
            const put = parseInt(coinsToMinus);

            if (wallet >= put) {
              const updatedCoins = wallet - put;
              const updateSql = "UPDATE users SET coins = ? WHERE steamId = ?";
              
              db.query(
                updateSql,
                [updatedCoins, steamId],
                (updateErr, updateResults) => {
                  if (updateErr) {
                    console.error("Error:", updateErr);
                  } else {
                    socket.emit("minus-coins", {
                      steamId,
                      newCoins: updatedCoins,
                    });
                  }
                }
              );
            } else {
              console.error("Not enough money");
            }
          } else {
            console.error(`No user ${steamId}.`);
          }
        }
      });
    }
  } catch (error) {
    console.error("Error adding coins:", error);
  }
};

module.exports = minusCoins;
