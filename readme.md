# `xstro wa bot`

> [!Important]  
> Open-source WhatsApp bot made to handle various tasks, and perform automated services for basic and business users. I disclaim any and all liability for any misuse of this software. It is for educational purposes only—please use it responsibly.

[![FORK](https://img.shields.io/badge/Fork_Repo-black?style=for-the-badge&logo=github)](https://github.com/AstroX11/Xstro/fork)
[![BOT SESSION](https://img.shields.io/badge/Get_Session-black?style=for-the-badge&logo=github)](https://bit.ly/41mQBbY)

### Develop Your Custom Session

1. Install [Node.js](https://nodejs.org/) and [Git](https://git-scm.com/)
2. Open terminal and verify Node.js: `node -v`
3. Use our tools to create your session:
  - [Session Generator](https://github.com/AstroX11/XstroSession)
  - [Session Encryptor](https://github.com/AstroX11/session-maker-crypto)

## For Deployers

**Required variables**: `SESSION_ID`, `BOT_INFO`, `SUDO`, `STICKER_PACK`, `WARN_COUNT`, and `TIME_ZONE`.

1. [Heroku Deploy](https://www.heroku.com/deploy?template=https://github.com/AstroX11/Xstro).

2. [Koyeb Deploy](https://app.koyeb.com/services/deploy?type=git&builder=dockerfile&repository=https://github.com/AstroX11/Xstro&branch=master&name=xstro&env%5BSESSION_ID%5D=null&env%5BSUDO%5D=null&env%5BBOT_INFO%5D=αѕтяσχ11;χѕтяσ%20м∂&env%5BSTICKER_PACK%5D=мα∂є%20бу;χѕтяσ%20мυℓтι%20∂єνι¢є%20вσт&env%5BWARN_COUNT%5D=3&env%5BTIME_ZONE%5D=Africa/Lagos).

3. [Render Deploy](https://render.com/deploy?repo=https://github.com/AstroX11/Xstro).
   - To ensure uptime, set up a monitor using Better Stack:
   - [Sign Up](https://betterstack.com/users/sign-up)
   - [Log In](https://betterstack.com/users/sign-in#magic)
   - In Better Stack, create a monitor with your deployed URL (pings every 5 minutes).

4. [Panel Deploy](https://github.com/AstroX11/Xstro/wiki/Panel-Support).

### Setup Guide (Create Your Own)

#### Install Node.js  
- **Windows:** [Download & Install](https://nodejs.org/)  
- **Linux:**  
  ```bash
  curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
  sudo apt install -y nodejs
  ```  
- **macOS:**  
  ```bash
  brew install node
  ```  
Verify: `node -v && npm -v`  

#### Install FFmpeg  
- **Windows:** [Download & Setup PATH](https://ffmpeg.org/download.html)  
- **Linux/macOS:**  
  ```bash
  sudo apt install ffmpeg  # Linux  
  brew install ffmpeg  # macOS  
  ```  
Verify: `ffmpeg -version`  

#### Install Yarn  
```bash
npm install -g yarn && yarn -v
```  

#### Install Git  
- **Windows:** [Download & Install](https://git-scm.com/)  
- **Linux/macOS:**  
  ```bash
  sudo apt install git  # Linux  
  brew install git  # macOS  
  ```  
Verify: `git --version`  

#### Clone & Run  
```bash
git clone https://github.com/AstroX11/Xstro.git
cd Xstro
yarn install
npm start
```

1. Open a terminal.
2. Clone the repository and start the bot:

   ```bash
   git clone https://github.com/AstroX11/Xstro.git
   cd Xstro
   yarn install
   npm start
   ```

## Contributing

Want to help? Fork the repository, create a pull request, and make sure everything works.

[Contribute Here](https://github.com/AstroX11/Xstro/blob/master/.github/contributing.md)