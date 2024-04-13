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
import { scheduleJob } from "node-schedule";
import cors from "cors";
import bodyParser from "body-parser";
import { Request, Response } from "express";
import e from "events";
import VideosMap from "./utilities/videos-map";
import bigInt from "big-integer";
import "./utilities/job";

const event = new e.EventEmitter();

dotenv.config();

const allowedUserIds = process.env.ALLOWED_USER_IDS!.split(",");
const PORT = process.env.PORT!;
const HOST = process.env.DOMAIN ?? ip.address();
const srcPath = path.join(process.cwd(), "src");
const videosJsonPath = path.join(process.cwd(), "videos.json");
const dev = process.env.NODE_ENV !== "production";

const videosUrl = `https://${HOST}`;

const ONE_HOUR = 60 * 60 * 1000;
const DYNAMIC_HOURS_MS = 24 * ONE_HOUR;

const nextApp = next({ dev });
const handle = nextApp.getRequestHandler();
const app = express();

app.use(bodyParser.json());
app.use(cors({ origin: true }));
app.get("/files", async (req: Request, res: Response) => {
  let videos: any;
  try {
    videos = JSON.parse(await fs.promises.readFile(videosJsonPath, "utf-8"));
  } catch {
    videos = {};
  }
  res.json(videos);
});
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

const apiId = 21039908;
const apiHash = "b7bbb66a8b2229ec4e235170077f79ad";
const storeSession = new MemorySession(); // fill this later with the value from session.save()

const getPhoneCode = () => {
  console.log("you should now enter phonecode.");
  return new Promise<string>((resolve) =>
    event.on("phonecode", (code: string) => resolve(code))
  );
};

(async () => {
  const videos = new VideosMap(videosJsonPath);
  const client = new TelegramClient(storeSession, apiId, apiHash, {});
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

  await nextApp.prepare();
  app.listen(PORT, () => {
    console.log(
      `HTTP Server is running.\nYou can now watch videos on ${videosUrl}`
    );
  });
  await client.start({
    phoneNumber: "+989336146174",
    phoneCode: getPhoneCode,
    onError: (err) => console.log(err),
  });
  console.log("You should now be connected.");
  client.session.save();

  client.addEventHandler(async (event: NewMessageEvent) => {
    if (event.chatId === undefined) return;
    if (event.message.video?.mimeType === "video/mp4" && !event.message.gif) {
      const id = `${event.chatId}/${event.message.id}`;
      const [{ fileName }] = event.message.video.attributes.filter(
        (v) => v.className === "DocumentAttributeFilename"
      ) as [Api.DocumentAttributeFilename];

      await event.message.markAsRead();
      const video = {
        nickName: fileName.replace(/\.[^/.]+$/, ""),
        chatId: event.chatId,
        messageId: event.message.id,
        caption: event.message.text,
        createdAt: Date.now(),
      };
      await videos.set(id, video);

      await event.message.reply({
        message: `✅ Your video has been added.\nTo rename video, reply video and send new name.\n<a href="${videosUrl}/${id}">Watch ${video.nickName}</a>`,
        replyTo: event.message.id,
        parseMode: "html",
      });
      scheduleJob(new Date(video.createdAt + DYNAMIC_HOURS_MS), async () => {
        await videos.delete(id);
      });
    } else if (event.message.replyTo) {
      const id = `${event.message.chatId}/${event.message.replyTo.replyToMsgId}`;
      const video = videos.get(id);
      if (video === undefined) return;
      const newnickName = event.message.message;
      await videos.set(id, {
        ...video,
        nickName: newnickName,
      });
      await event.message.reply({
        message: `🔄 Your video name has been changed.\n<a href="${videosUrl}/${id}">Watch ${newnickName}</a>`,
        parseMode: "html",
      });
      await event.message.markAsRead();
    }
  }, new NewMessage({ chats: allowedUserIds }));
})();
