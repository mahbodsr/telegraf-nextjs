"use client";

import { Swiper, SwiperClass, SwiperSlide } from "swiper/react";
import { Pagination } from "swiper/modules";
import React, { useEffect, useRef, useState } from "react";
import Card from "./Card";
import "swiper/css";
import "swiper/css/pagination";
import { useRouter } from "next/navigation";
import { IVideos } from "./page";

type TVideos = [string, IVideos[string]][];

const CustomSwiper = ({ videos }: { videos: TVideos }) => {
  const swiper = useRef<SwiperClass>();
  const [activeIndex, setActiveIndex] = useState<number>(0);
  const router = useRouter();
  useEffect(() => {
    const ArrowKeyHandler = (event: KeyboardEvent) => {
      if (event.key === "ArrowLeft") swiper.current?.slidePrev(150);
      else if (event.key === "ArrowRight") swiper.current?.slideNext(150);
    };
    window.addEventListener("keydown", ArrowKeyHandler);
    return () => {
      window.removeEventListener("keydown", ArrowKeyHandler);
    };
  }, [swiper]);
  useEffect(() => {
    const EnterHandler = (event: KeyboardEvent) => {
      console.log("Hanled");
      if (event.key === "Enter") router.push(videos[activeIndex][0]);
    };
    window.addEventListener("keypress", EnterHandler);
    return () => {
      window.removeEventListener("keypress", EnterHandler);
    };
  }, [activeIndex, router, videos]);
  return (
    <Swiper
      onSwiper={(s) => (swiper.current = s)}
      pagination={{}}
      centeredSlides={true}
      modules={[Pagination]}
      slidesPerView={1}
      onSlideChange={(s) => setActiveIndex(s.activeIndex)}
      className="lg:w-3/5 overflow-visible h-5/6"
    >
      {videos.map(([link, video]) => (
        <SwiperSlide key={link} className="p-2 pb-8">
          <Card
            caption={video.caption}
            filename={video.nickName}
            createdAt={video.createdAt}
            link={video.redirect ?? link}
            buttonText={video.redirect ? "Go to link" : "Watch"}
          />
        </SwiperSlide>
      ))}
    </Swiper>
  );
};

export default CustomSwiper;
