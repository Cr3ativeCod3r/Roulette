const db = require("../server");

const updateCoins = async (socket, steamId) => {
  try {
    const sql = "SELECT steamId, coins FROM users WHERE steamId = ?";
    db.query(sql, [steamId], (err, results) => {
      if (err) {
        console.error("error:", err);
      } else {
        const user = results[0];
        if (user) {
          const updatedCoins = user.coins;
          socket.emit("coins-updated", {
            steamId: user.steamId,
            coins: updatedCoins,
          });
        }
      }
    });
  } catch (error) {
    console.error("error:", error);
  }
};

module.exports = updateCoins;
