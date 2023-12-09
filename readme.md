


![image](https://github.com/Cr3ativeCod3r/Roulette/assets/117399144/a6e211c1-1939-4c05-a95d-82bba638a4ca)



### Technology stack
Backend: 

 <p> <img src="https://raw.githubusercontent.com/devicons/devicon/master/icons/express/express-original-wordmark.svg" alt="express" width="40" height="40"/>  
 <img src="https://raw.githubusercontent.com/devicons/devicon/master/icons/javascript/javascript-original.svg" alt="javascript" width="40" height="40"/> 
 <img src="https://raw.githubusercontent.com/devicons/devicon/master/icons/mysql/mysql-original-wordmark.svg" alt="mysql" width="40" height="40"/> 
 <img src="https://raw.githubusercontent.com/devicons/devicon/master/icons/nodejs/nodejs-original-wordmark.svg" alt="nodejs" width="40" height="40"/> </p>

Frontend:

 <img src="https://raw.githubusercontent.com/devicons/devicon/master/icons/css3/css3-original-wordmark.svg" alt="css3" width="40" height="40"/> 
 <img src="https://raw.githubusercontent.com/devicons/devicon/master/icons/html5/html5-original-wordmark.svg" alt="html5" width="40" height="40"/> 
 <img src="https://raw.githubusercontent.com/devicons/devicon/master/icons/photoshop/photoshop-line.svg" alt="photoshop" width="40" height="40"/>
 <img src="https://raw.githubusercontent.com/devicons/devicon/master/icons/react/react-original-wordmark.svg" alt="react" width="40" height="40"/> 
 <img src="https://raw.githubusercontent.com/devicons/devicon/master/icons/redux/redux-original.svg" alt="redux" width="40" height="40"/>
 <img src="https://raw.githubusercontent.com/devicons/devicon/master/icons/typescript/typescript-original.svg" alt="typescript" width="40" height="40"/>

Deploy:

<img src="https://www.vectorlogo.zone/logos/git-scm/git-scm-icon.svg" alt="git" width="40" height="40"/> 
<img src="https://raw.githubusercontent.com/devicons/devicon/master/icons/linux/linux-original.svg" alt="linux" width="40" height="40"/> 
<img src="https://raw.githubusercontent.com/devicons/devicon/master/icons/nginx/nginx-original.svg" alt="nginx" width="40" height="40"/> 

  The website is deployed on a AWS instance (ubuntu) on a proxy server (Nginx) at https://kamil-banaszek.pl (demo verison but functional)


### Features

- Betting a maximum of 2 bets in one round by each player.
- Logging in through Steam using passport 
- Players chat (error messages, chatban)
- Drawing history.
- Updating users balances and database updates
- The use of socket.io technology enabling real-time communication.
- Players profile ( betting history)
- ranks (admin,mod,user)
- chat command for admin (/mute /unmute /coins) + nick
- user sessions in JWT token
- admin panel
- notifications
- responsive (basic)

### Instalation

Install script:
```bash
npm install
npm run build
```

Start script:
```bash
npm start
```
### Photos


![image](https://github.com/Cr3ativeCod3r/Roulette/assets/117399144/8d6866bc-4038-4d19-9ff3-64e2d30ca3dc)

![image](https://github.com/Cr3ativeCod3r/Roulette/assets/117399144/e4bb23cf-1b94-4c2c-bb9f-54421340ad01)

![image](https://github.com/Cr3ativeCod3r/Roulette/assets/117399144/4b0c3cbc-4ae9-4c75-b323-226b318fc879)

![image](https://github.com/Cr3ativeCod3r/Roulette/assets/117399144/881bef0e-775d-4556-83c8-a11285fcb01c)

![image](https://github.com/Cr3ativeCod3r/Roulette/assets/117399144/04e01412-4d7e-4b95-a64e-427c832704a8)

### Fairness fun fuct
U can check every round id result,
use e.g. https://www.programiz.com/javascript/online-compiler/ 
to run below code 

```bash
const crypto = require('crypto');
const serverSeed = "PageShouldGenerateNewEverySomeTimeLikePulicSeed";
const publicSeed = "123";
const round = "0";

const hashInput = serverSeed + "-" + publicSeed + "-" + round;
const hash = crypto.createHash('sha256').update(hashInput).digest('hex');
const roll = parseInt(hash.substr(0, 8), 16) % 15;

let rollColour;
if (roll === 0) {
  rollColour = 'bonus';
} else if (roll >= 1 && roll <= 7) {
  rollColour = 'orange';
} else if (roll >= 8 && roll <= 14) {
  rollColour = 'black';
}

console.log(roll);

```
Seeds are made available by public websites every 24 hours (then they are replaced with new ones),
then by providing the data you can check the result of each draw, all using sha256 hashing, which is used in 
by banks and cryptocurrency exchanges

### Page profit fun fuct
Page earnings looks like:
```bash
red 7/15 - chances 46,66%  paycheck 2x so page profit is 100% - (46,66%*2) = 6,68 % of all bets

black 7/15 - chances 46,66% paycheck 2x so page profit is 100% - (46,66%*2) = 6,68 % of all bets

green 1/15 - chances 6,66% paycheck 14x  so page profit is 100% - (6,66%*14) = 6,76 % of all bets

You have to subtract rewards or affiliates from your earnings, but it's still
a huge profit bringing in tens of thousands of dollars a day
```

### Features to add

I want to focus on other projects now, so I'm leaving this one, but it can be expanded, e.g. by:

- deposit/withdraw 
- support
- affiliates 
- small code changes to make it more efficient (removing redundancy)
- better css ( i dont have time to make it perfect )

Maybe I'll add it in some time

