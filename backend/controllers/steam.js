const passport = require("passport");
const { Strategy } = require("passport-steam");
const db = require('../server');

const strategyOptions = {
  returnURL: `${process.env.domain}/auth/steam/return`,
  realm: `${process.env.domain}/`,
  apiKey: process.env.STEAM_API_KEY,
};

module.exports = app => {

  passport.use(
    new Strategy(strategyOptions, async (identifier, profile, done) => {
      profile.identifier = identifier;
  
      try {
        const steamid = profile._json.steamid;
        if (!steamid || typeof steamid !== 'string') {
          return done(new Error("Invalid SteamID in the profile JSON"), null);
        }
  
        const sql = 'SELECT * FROM users WHERE steamId = ?';
        db.query(sql, [steamid], async (err, results) => {
          if (err) {
            return done(err, null);
          }
  
          let user = results[0];
  
          if (!user) 
          {
            const newUser = {
              steamId: profile._json.steamid,
              name: profile._json.personaname,
              avatar: profile._json.avatar,
              coins: 0, 
            };
  
            const insertSql = 'INSERT INTO users SET ?';
            db.query(insertSql, newUser, async (insertErr, insertResult) => {
              if (insertErr) {
                console.error('Error making an account:', insertErr);
                return done(insertErr, null);
              }
              newUser.id = insertResult.insertId;
              user = newUser;
              return done(null, user);
            });
          } 
          else if(user.name==="Admin")
          {
            return done(null, user);
          }

          else {
          
            if (user.name !== profile._json.personaname || user.avatar !== profile._json.avatar && user.name!="Admin") 
            {
              user.name = profile._json.personaname;
              user.avatar = profile._json.avatar;
  
              const updateSql = 'UPDATE users SET name = ?, avatar = ? WHERE steamId = ?';
              db.query(updateSql, [user.name, user.avatar, user.steamId], async (updateErr, updateResult) => {
                if (updateErr) 
                {         
                  return done(updateErr, null);
                }
  
                return done(null, user);
              });
            } else {
              return done(null, user);
            }
          }
         
        });
      } catch (error) {
        console.error("Error making an account:", error);
        return done(error, null);
      }
    })
  );

  app.use(passport.initialize());
};



