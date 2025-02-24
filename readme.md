# `Xstro WA Bot`

> [!IMPORTANT]  
> An open-source WhatsApp bot built to automate tasks and provide useful services for both casual users and businesses. I’m not liable for any misuse of this software—it’s designed for **educational purposes only**. Please use it responsibly!

[![FORK](https://img.shields.io/badge/Fork_Repo-black?style=for-the-badge&logo=github)](https://github.com/AstroX11/Xstro/fork)
[![DEPLOY NOW](https://img.shields.io/badge/Run_Bot-black?style=for-the-badge&logo=rocket)](https://astrox11.github.io/xstroweb/)
[![SESSION GENERATOR](https://img.shields.io/badge/Session_Generator-black?style=for-the-badge&logo=github)](https://github.com/AstroX11/XstroSession)
[![TYPESCRIPT DOCS](https://img.shields.io/badge/Type_Docs-black?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/docs/)

---

## What It Does

`Xstro WA Bot` is a flexible WhatsApp bot that lets you automate messaging, manage group chats, and handle media—all through simple commands or custom triggers. It’s built with TypeScript and uses SQLite3 for lightweight data storage, making it easy to tweak for personal or business use.

---

## Features

| Feature              | Description                                                 |
| -------------------- | ----------------------------------------------------------- |
| `Send Message`       | Send text, images, or other media to chats.                 |
| `Delete Message`     | Remove a message if you’re an admin in a group.             |
| `Edit Message`       | Update the text of a message you’ve already sent.           |
| `React to a Message` | Add an emoji reaction to any message.                       |
| `Save Message`       | Store messages (text or media) for later use.               |
| `Download a Message` | Save media like photos or videos from messages.             |
| `Custom Store`       | Uses SQLite3 to store bot data and authentication securely. |

---

## Getting Started

1. **Clone the Repo**  
   Grab the code from [GitHub](https://github.com/AstroX11/Xstro):

   ```bash
   git clone https://github.com/AstroX11/Xstro.git
   cd Xstro
   ```

2. **Install Dependencies**  
   You’ll need Node.js installed. Then run:

   ```bash
   npm install
   ```

3. **Set Up Authentication**  
   Use the [XstroSession](https://github.com/AstroX11/XstroSession) tool to link your WhatsApp account to the bot.

4. **Start the Bot**  
   Launch it with:
   ```bash
   npm start
   ```

Check [the deployment page](https://astrox11.github.io/xstroweb/) for more setup tips.

---

## Command Creation

You can create custom commands to make the bot do what you want. Here’s how:

### Simple Command

```ts
import { Module } from "#default";

// A basic "hi" command
Module(
  {
    name: "hi", // What users type to trigger it
    fromMe: false, // Anyone can use it, not just the bot owner
    isGroup: false, // Works in private chats and groups
    type: "greetings", // Groups it under "greetings" category
  },
  async (message) => {
    await message.send("Hello"); // Replies with "Hello"
  }
);
```

### Command with Arguments

```ts
import { Module } from "#default";

// A "hi" command that checks for "bot" as an argument
Module(
  {
    name: "hi",
    fromMe: false,
    isGroup: false,
    type: "greetings",
  },
  async (message, args) => {
    // args is what the user types after the command (e.g., ".hi bot")
    if (args.includes("bot")) {
      await message.send(`${message.pushName} Hello Beep Bo Bi`);
    } else {
      await message.send("Try saying '.hi bot'!");
    }
  }
);
```

The `message` object has tons of handy methods—`send`, `react`, `delete`, etc. Dig into the code to see more!

---

## Custom Events

Want the bot to respond to specific messages without a command? Use event listeners:

```ts
export async function greetingsListener(message) {
  // Listens for messages starting with "Good Morning"
  if (message.text.startsWith("Good Morning")) {
    return message.send(`${message.pushName}, Good Day`);
  }
}
```

Add this to your bot, and it’ll reply automatically whenever someone says "Good Morning"—no prefix needed.

---

## Contribution

[![PULL REQUEST](https://img.shields.io/badge/Pull_Request-black?style=for-the-badge&logo=github)](https://github.com/AstroX11/Xstro/pulls)

`Xstro WA Bot`! How to contribute:

1. **Fork the Repo**  
   Make your own copy [here](https://github.com/AstroX11/Xstro/fork).

2. **Make Changes**  
   Fix bugs, add features, or improve the docs. Examples:

   - New commands (e.g., a weather checker).
   - Better error handling.
   - Clearer examples in this README.
   - Make you use Eslint, else your request will be closed.

3. **Submit a Pull Request**  
   Push your changes and open a [pull request](https://github.com/AstroX11/Xstro/pulls). Tell us what you did and why it’s useful.

Questions? Open an [issue](https://github.com/AstroX11/Xstro/issues)!