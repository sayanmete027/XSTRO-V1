# `xstro wa bot`

> [!Important]  
> Open-source WhatsApp bot made to handle various tasks, and perform automated services for basic and business users. I disclaim any and all liability for any misuse of this software. It is for educational purposes only—please use it responsibly.

[![FORK](https://img.shields.io/badge/Fork_Repo-black?style=for-the-badge&logo=github)](https://github.com/AstroX11/Xstro/fork)  
[![BOT SESSION](https://img.shields.io/badge/Get_Session-black?style=for-the-badge&logo=github)](https://bit.ly/41mQBbY)

## Build Your Own Session

1. [Install Node.js](https://nodejs.org/)
2. [Install Git](https://git-scm.com/)
3. Verify your Node.js installation:

   ```bash
   node -v
   ```

4. Create a new directory, navigate to it in your terminal, and follow these steps:
   - [Generator](https://github.com/AstroX11/XstroSession)
   - [Encryptor](https://github.com/AstroX11/session-maker-crypto)

## Deployments

### Heroku Deploy

1. Click [Deploy Now](https://www.heroku.com/deploy?template=https://github.com/AstroX11/Xstro).
2. Enter the required variables: `SESSION_ID`, `BOT_INFO`, `SUDO`, `STICKER_PACK`, `WARN_COUNT`, and `TIME_ZONE`.
3. Click **Deploy** to begin deploying the bot.
4. [Watch Video Tutorial](https://tinyurl.com/2yrycr7h)

### Koyeb Deploy

1. Click [Deploy Now](https://app.koyeb.com/services/deploy?type=git&builder=dockerfile&repository=https://github.com/AstroX11/Xstro&branch=master&name=xstro&env%5BSESSION_ID%5D=null&env%5BSUDO%5D=null&env%5BBOT_INFO%5D=αѕтяσχ11;χѕтяσ%20м∂&env%5BSTICKER_PACK%5D=мα∂є%20бу;χѕтяσ%20мυℓтι%20∂єνι¢є%20вσт&env%5BWARN_COUNT%5D=3&env%5BTIME_ZONE%5D=Africa/Lagos).
2. Provide the necessary variables.
3. Click **Deploy** (leave default settings in place).
4. [Watch Video Tutorial](https://tinyurl.com/2yrycr7h)

### Render Deploy

1. Click [Deploy Now](https://render.com/deploy?repo=https://github.com/AstroX11/Xstro).
2. Enter the required variables: `SESSION_ID`, `BOT_INFO`, `SUDO`, `STICKER_PACK`, `WARN_COUNT`, and `TIME_ZONE`.
3. Click **Deploy Blueprint** and wait for the bot to start.
4. Copy the deployed URL.
5. To ensure uptime, set up a monitor using Better Stack:
   - [Sign Up](https://betterstack.com/users/sign-up)
   - [Log In](https://betterstack.com/users/sign-in#magic)
6. In Better Stack, create a monitor with your deployed URL (pings every 5 minutes).
7. [Watch Video Tutorial](https://tinyurl.com/2yrycr7h)

### Panel Deploy

Refer to the [Panel Deployment documentation](https://github.com/AstroX11/Xstro/wiki/Panel-Support).

### Windows/Linux/macOS

#### Install Node.js

- **Windows:**  
  [Download Node.js](https://nodejs.org/) and install it. Verify installation:

  ```bash
  node -v
  npm -v
  ```

- **Linux:**

  ```bash
  curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
  sudo apt install -y nodejs
  node -v
  npm -v
  ```

- **macOS:**

  ```bash
  brew install node
  node -v
  npm -v
  ```

#### Install FFmpeg

- **Windows:**  
  [Download FFmpeg](https://ffmpeg.org/download.html), extract it, and add the `bin` folder to your PATH. Verify installation:

  ```bash
  ffmpeg -version
  ```

- **Linux:**

  ```bash
  sudo apt update && sudo apt install ffmpeg
  ffmpeg -version
  ```

- **macOS:**

  ```bash
  brew install ffmpeg
  ffmpeg -version
  ```

#### Install Yarn

Install globally:

```bash
npm install -g yarn
yarn -v
```

#### Install Git

- **Windows:**  
  [Download Git](https://git-scm.com/) and install it. Verify installation:

  ```bash
  git --version
  ```

- **Linux:**

  ```bash
  sudo apt update && sudo apt install git
  git --version
  ```

- **macOS:**

  ```bash
  brew install git
  git --version
  ```

#### Setup and Run

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

## Disclaimer

This is my first JavaScript project—so expect some bugs. This project is not affiliated with WhatsApp. For official WhatsApp information, visit [whatsapp.com](https://whatsapp.com).
