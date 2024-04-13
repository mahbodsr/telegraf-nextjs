"use server";

import fs from "fs";
import path from "path";
import CustomSwiper from "./CustomSwiper";

const videosPath = path.join(process.cwd(), "videos.json");

export interface IVideos {
  [key: string]: { nickName: string; caption: string; createdAt: number };
}

export default async function Home() {
  let videos;
  try {
    videos = JSON.parse(
      await fs.promises.readFile(videosPath, "utf-8")
    ) as IVideos;
  } catch {
    videos = {};
  }
  const videosArr = Object.entries(videos);
  if(videosArr.length === 0) return "No videos found."
  return <CustomSwiper videos={videosArr} />;
}
