# `xstro wa bot`

> [!Important]  
> Open-source WhatsApp bot made to handle various tasks, and perform automated services for basic and business users. I disclaim any and all liability for any misuse of this software. It is for educational purposes only—please use it responsibly.

[![FORK](https://img.shields.io/badge/Fork_Repo-black?style=for-the-badge&logo=github)](https://github.com/AstroX11/Xstro/fork)
[![BOT SESSION](https://img.shields.io/badge/Get_Session-black?style=for-the-badge&logo=github)](https://bit.ly/41mQBbY)
[![GET STARTED](https://img.shields.io/badge/Get_started-black?style=for-the-badge&logo=)](https://astrox11.github.io/xstroweb/)

### Features and Development

> [!Note]
> Below is a comprehensive and easy to understand details on how to create your custom functionalites and specifications, some of you would wonder why didn't I add some fun features like games etc...  It's a WhatsApp bot, and those features do not concern my and this project, Implement those at your end.

### Custom Session Generator

1. [Session Generator](https://github.com/AstroX11/XstroSession)
2. [Session Encryptor](https://github.com/AstroX11/session-maker-crypto)

 - A well detailed usage is provided from the repositories on how to to use them propely, also use postgre to save session, and again, if you try to steal your users session, using such I condem you and your tatic, as I strongly oppose this method of social enginnering.

### How can I create a command ?

It's easy but frist I want to you know and undertsand the `Types` of our command structure and seralized Messages.

```ts
/** Values of our Command Definitions **/

interface Command {
  name: RegExp | string;
  function?: Function;
  fromMe?: boolean;
  isGroup?: boolean;
  desc: string | undefined;
  type: string | undefined;
  dontAddCommandList?: boolean;
}
```

```ts
/** Values of our Message Definitions **/
import { WAProto, WASocket } from 'baileys';

export interface Message {
    key: {
        remoteJid: string;
        fromMe: boolean;
        id: string;
        participant?: string | undefined;
    };
    jid: string;
    pushName: string | null | undefined;
    messageTimestamp: number | Long.Long;
    owner: string;
    message: WAProto.IMessage | undefined;
    type: string;
    device: string;
    sender: string | null | undefined;
    prefix: string[];
    mod: boolean;
    ban: boolean;
    sudo: boolean;
    text: string | null | undefined;
    quoted?: {
        key: {
            remoteJid: string;
            fromMe: boolean;
            id: string;
            participant?: string | undefined;
        };
        message: WAProto.IMessage | undefined,
        type: string | undefined;
        sender: string | undefined;
        device: string;
        ban: boolean;
        sudo: boolean;
        text: string | null | undefined;
        image: boolean;
        video: boolean;
        audio: boolean;
        document: boolean;
        viewonce: boolean;
    };
    send: (content: Buffer | string, options?: any) => Promise<Message | any>;
    edit: (content: string) => Promise<Message>;
    forward: (jid: string, message: any, opts?: any) => Promise<any>;
    reply: (text: string) => Promise<Message>;
    downloadM: (message: any, file?: boolean) => Promise<ArrayBuffer | any>;
    delete: () => Promise<Message>;
    react: (emoji: string) => Promise<Message>;
    user: (match: string) => Promise<string | false>;
    error: (error: Error, cmd: string | RegExp) => Promise<void | any>,
    client: WASocket
}
```
### How do I use them now?

```ts
/** import the Module function and Message Types **/
import { Module, Message } from '../src/index.mjs'

/** Define a Module, a command register **/
Module(
  {
    name: 'hello', // name of the command
    fromMe: false, // is the command for sudo users? make it true, for it respond to only sudo users
    isGroup: false, // use this only if you want the command to work in a Group!
    desc: 'Greetings', // provide the description of the command if you want it to appear on the list
    type: 'system', // specify the type or category which the command falls under
  },
  async (message: Message) => {
    await message.send('hi, i just replied you') // send a message, this send function supports only text, image, video and audio
  }
);

```


## Contributing

Want to help? Fork the repository, create a pull request, and make sure everything works.

[Contribute Here](https://github.com/AstroX11/Xstro/blob/master/.github/contributing.md)