"use server";

import fs from "fs";
import path from "path";
import CustomSwiper from "./CustomSwiper";

const videosPath = path.join(process.cwd(), "videos.json");

export interface IVideos {
  [key: string]: { nickName: string; caption: string; createdAt: number };
}

export default async function Home() {
  const videos = JSON.parse(
    await fs.promises.readFile(videosPath, "utf-8")
  ) as IVideos;
  const videosArr = Object.entries(videos);
  return <CustomSwiper videos={videosArr} />;
}
