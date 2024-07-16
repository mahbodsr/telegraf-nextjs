import next from "next";
import { parse } from "url";
import { TelegramClient, Api } from "telegram";
import ip from "ip";
import { MemorySession, StoreSession } from "telegram/sessions";
import { NewMessage, NewMessageEvent } from "telegram/events";
import path from "path";
import express from "express";
import dotenv from "dotenv";
import fs from "fs";
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

const event = new EventEmitter();

dotenv.config();

const allowedUserIds = process.env.ALLOWED_USER_IDS!.split(",");
const PORT = process.env.PORT!;
const HOST = process.env.DOMAIN ?? ip.address();
const srcPath = path.join(process.cwd(), "src");
const videosJsonPath = path.join(process.cwd(), "videos.json");
const dev = process.env.NODE_ENV !== "production";

const videosUrl = `https://${HOST}`;

const nextApp = next({ dev });
const handle = nextApp.getRequestHandler();
const app = express();

app.use(bodyParser.json());
app.use(cors({ origin: true }));
app.post("/add-link", async (req: Request, res: Response) => {
  const linksFile = await fs.promises.readFile(
    path.join(srcPath, "links.json"),
    {
      encoding: "utf-8",
    }
  );
  const linksJson = JSON.parse(linksFile) as [{ link: string; text: string }];
  linksJson.push(req.body);
  await fs.promises.writeFile(
    path.join(srcPath, "links.json"),
    JSON.stringify(linksJson)
  );
  res.status(200).end();
});
app.delete("/reset-items", async (req: Request, res: Response) => {
  await fs.promises.writeFile(
    path.join(srcPath, "links.json"),
    JSON.stringify([])
  );
  res.status(200).end();
});
app.get("/phonecode/:phonecode", async (req: Request, res: Response) => {
  event.emit("phonecode", req.params.phonecode);
});

console.log(+process.env.API_ID!, process.env.API_HASH!);

(async () => {
  const videos = new VideosMap(videosJsonPath);
  const client = new TelegramClient(
    new MemorySession(),
    +process.env.API_ID!,
    process.env.API_HASH!,
    {}
  );
  app.use("/stream/:chatId/:messageId", async (req, res) => {
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
  app.use((req: Request, res: Response) => {
    const parsedUrl = parse(req.url!, true);
    handle(req, res, parsedUrl);
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
