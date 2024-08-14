import next from "next";
import { parse } from "url";
import { TelegramClient, Api } from "telegram";
import ip from "ip";
import { MemorySession } from "telegram/sessions";
import { NewMessage, NewMessageEvent } from "telegram/events";
import path from "path";
import express, { NextFunction } from "express";
import dotenv from "dotenv";
import cors from "cors";
import bodyParser from "body-parser";
import { Request, Response } from "express";
import { EventEmitter } from "events";
import VideosMap from "./utilities/videos-map";
import bigInt from "big-integer";
import "./utilities/job";
import saveVideo from "./services/save-video";
import changeNickName from "./services/change-nickname";
import getPhoneCode from "./utilities/get-phonecode";
import addLink from "./services/add-link";
import jwt, { JwtPayload } from "jsonwebtoken";
import cookieParser from "cookie-parser";

interface IUsers {
  [key: string]: { password: string } | undefined;
}

const event = new EventEmitter();

dotenv.config();

const allowedUserIds = process.env.ALLOWED_USER_IDS!.split(",");
const PORT = process.env.PORT!;
const HOST = process.env.DOMAIN ?? ip.address();
const videosJsonPath = path.join(process.cwd(), "videos.json");
const dev = process.env.NODE_ENV !== "production";

const videosUrl = `https://${HOST}`;

const nextApp = next({ dev });
const handle = nextApp.getRequestHandler();
const app = express();

const users: IUsers = {
  srfamily: {
    password: "marzdaran44215732",
  },
  norouzi: { password: "mobina1647" },
  shadkaam: { password: "ariya4479" },
};

const SECRET_KEY = process.env.SECRET_KEY!;

declare global {
  namespace Express {
    interface Request {
      user?: string | JwtPayload;
    }
  }
}

const Regex = /^\/(_next\/static|_next\/image|favicon\.ico|login)/;

const authenticateJWT = (req: Request, res: Response, next: NextFunction) => {
  const token = req.cookies.token as string;

  if (token) {
    jwt.verify(token, SECRET_KEY, (err, decoded) => {
      if (err) {
        return res.redirect("/login");
      }

      // Check if the token has expired
      const currentTime = Math.floor(Date.now() / 1000);
      if (
        (decoded as JwtPayload).exp &&
        (decoded as JwtPayload).exp! < currentTime
      ) {
        return res.redirect("/login"); // Token has expired
      }

      req.user = decoded;
      next();
    });
  } else {
    res.redirect("/login");
  }
};

app.use(bodyParser.json());
app.use(cookieParser());
app.use(cors({ origin: true }));
app.post("/api/login", (req: Request, res: Response) => {
  const { username, password } = req.body as Record<string, string>;

  const user = users[username];
  // Check if the username and password match the simulated user
  if (user?.password === password) {
    // Generate a JWT token with a 7-day expiration
    const token = jwt.sign({ username }, SECRET_KEY, {
      expiresIn: "7d",
    });
    res.status(200).cookie("token", token).end();
  } else {
    res.sendStatus(401);
  }
});
app.get("/api/phonecode/:phonecode", async (req: Request, res: Response) => {
  event.emit("phonecode", req.params.phonecode);
});
app.use((req: Request, res: Response, next: NextFunction) => {
  const parsedUrl = parse(req.url!, true);
  const { pathname } = parsedUrl;

  if (Regex.test(pathname ?? "")) return handle(req, res, parsedUrl);

  authenticateJWT(req, res, next);
});

app.use((req: Request, res: Response) => {
  const parsedUrl = parse(req.url!, true);
  handle(req, res, parsedUrl);
});

console.log(+process.env.API_ID!, process.env.API_HASH!);

(async () => {
  const videos = new VideosMap(videosJsonPath);
  const client = new TelegramClient(
    new MemorySession(),
    +process.env.API_ID!,
    process.env.API_HASH!,
    { }
  );

  app.use("/api/stream/:chatId/:messageId", async (req, res) => {
    const range = req.headers.range;
    if (!range) {
      return res.status(400).send("Requires Range header");
    }
    const movieName = req.params.chatId + "/" + req.params.messageId;
    const video = videos.get(movieName);
    if (video === undefined) return res.status(404).send("File not found");

    const [message] = await client.getMessages(video.chatId, {
      ids: [video.messageId],
    });

    const media = message.media as Api.MessageMediaDocument; // Extracting the media from the message
    const document = media.document as Api.Document;

    const videoSize = document.size.toJSNumber();
    const FOUR_KB = 1024 * 4;
    const CHUNK_SIZE = FOUR_KB * 400;
    const requestedStart = Number(range.replace(/\D/g, ""));
    const start = requestedStart - (requestedStart % FOUR_KB);
    const end = Math.min(start + CHUNK_SIZE, videoSize);
    const contentLength = end - start;
    let chunks = Buffer.from([]);
    for await (const chunk of client.iterDownload({
      file: media,
      requestSize: CHUNK_SIZE,
      offset: bigInt(start),
      fileSize: bigInt(contentLength),
    })) {
      if (chunks.length === 0) chunks = chunk;
      console.log(chunks.length);
    }
    const headers = {
      "Content-Range": `bytes ${start}-${end - 1}/${videoSize}`,
      "Accept-Ranges": "bytes",
      "Content-Length": chunks.length,
      "Content-Type": "video/mp4",
    };
    res.writeHead(206, headers);
    res.end(chunks);
  });

  console.log("NOT STARTED");
  await nextApp.prepare();
  app.listen(PORT, () => {
    console.log(
      `HTTP Server is running.\nYou can now watch videos on ${videosUrl}`
    );
  });
  console.log("STARTED");
  await client.start({
    phoneNumber: process.env.PHONE_NUMBER!,
    phoneCode: getPhoneCode(event),
    onError: (err) => console.log(err),
  });
  console.log("You should now be connected.");
  client.session.save();

  client.addEventHandler(async (event: NewMessageEvent) => {
    if (event.chatId === undefined) return;
    const mimeType = event.message.video?.mimeType;
    if (
      (mimeType === "video/mp4" || mimeType === "video/x-matroska") &&
      !event.message.gif
    ) {
      saveVideo(event, videos, videosUrl);
    } else if (event.message.replyTo) {
      changeNickName(event, videos, videosUrl);
    } else if (event.message.text.startsWith("/link"))
      addLink(event, videos, videosUrl);
  }, new NewMessage({ chats: allowedUserIds }));
})();
