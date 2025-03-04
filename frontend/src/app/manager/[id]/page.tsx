"use client";
import { api } from "@/services/api";
import { socket } from "@/services/socket-io";
import { UploadVideo, VideoProgress } from "@/ts/interfaces";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

export default function Home() {
  const [progress360, setProgress360] = useState(0);
  const [timemark360, setTimemark360] = useState("");
  const [progress480, setProgress480] = useState(0);
  const [timemark480, setTimemark480] = useState("");
  const [progress720, setProgress720] = useState(0);
  const [timemark720, setTimemark720] = useState("");
  const [progress1080, setProgress1080] = useState(0);
  const [timemark1080, setTimemark1080] = useState("");

  const params = useParams();

  useEffect(() => {
    const fetchClasses = async () => {
      console.log({ params });
    };

    fetchClasses();
  }, [params.id]);

  useEffect(() => {
    const conectToSocket = async () => {
      socket.on("up/jw-anime/jeremias", (data: UploadVideo) => {
        console.table(data);
      });
      socket.on("pro/jw-anime/jeremias/360", (data: VideoProgress) => {
        console.log(data);
        setProgress360(Number(data.percent?.toFixed(2) ?? 0));
        setTimemark360(data.timemark);
      });
      socket.on("pro/jw-anime/jeremias/480", (data: VideoProgress) => {
        console.log(data);
        setProgress480(Number(data.percent?.toFixed(2) ?? 0));
        setTimemark480(data.timemark);
      });
      socket.on("pro/jw-anime/jeremias/720", (data: VideoProgress) => {
        console.log(data);
        setProgress720(Number(data.percent?.toFixed(2) ?? 0));
        setTimemark720(data.timemark);
      });
      socket.on("pro/jw-anime/jeremias/1080", (data: VideoProgress) => {
        console.log(data);
        setProgress1080(Number(data.percent?.toFixed(2) ?? 0));
        setTimemark1080(data.timemark);
      });
    };

    conectToSocket();

    return () => {
      socket.off("up/jw-anime/jeremias");
      socket.off("pro/jw-anime/jeremias/360");
      socket.off("pro/jw-anime/jeremias/480");
      socket.off("pro/jw-anime/jeremias/720");
      socket.off("pro/jw-anime/jeremias/1080");
    };
  }, []);

  return (
    <main className="p-4 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Video Segmentation Progress</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-gray-800 rounded-lg p-6 shadow-lg">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">360p</h2>
            <button
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md transition-colors"
              onClick={async () => {
                await api.post("/videos/segment", {
                  slug: "jw-anime",
                  session: "jeremias",
                  title: "Jeremias teve coragem.mp4",
                  resolution: {
                    width: "426",
                    height: "360",
                  },
                  bitrate: "96k",
                  hls_time: "5",
                  hls_list_size: "0",
                });
              }}
            >
              Process 360p
            </button>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-sm text-gray-300">
              <span>Progress</span>
              <span>{progress360}%</span>
            </div>
            <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-blue-500 transition-all duration-300"
                style={{ width: `${progress360}%` }}
              />
            </div>
            <div className="text-sm text-gray-300">
              Time: {timemark360 || "00:00:00.0"}
            </div>
          </div>
        </div>

        <div className="bg-gray-800 rounded-lg p-6 shadow-lg">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">480p</h2>
            <button
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md transition-colors"
              onClick={async () => {
                await api.post("/videos/segment", {
                  slug: "jw-anime",
                  session: "jeremias",
                  title: "Jeremias teve coragem.mp4",
                  resolution: {
                    width: "640",
                    height: "480",
                  },
                  bitrate: "128k",
                  hls_time: "5",
                  hls_list_size: "0",
                });
              }}
            >
              Process 480p
            </button>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-sm text-gray-300">
              <span>Progress</span>
              <span>{progress480}%</span>
            </div>
            <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-blue-500 transition-all duration-300"
                style={{ width: `${progress480}%` }}
              />
            </div>
            <div className="text-sm text-gray-300">
              Time: {timemark480 || "00:00:00.0"}
            </div>
          </div>
        </div>

        <div className="bg-gray-800 rounded-lg p-6 shadow-lg">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">720p</h2>
            <button
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md transition-colors"
              onClick={async () => {
                await api.post("/videos/segment", {
                  slug: "jw-anime",
                  session: "jeremias",
                  title: "Jeremias teve coragem.mp4",
                  resolution: {
                    width: "854",
                    height: "720",
                  },
                  bitrate: "160k",
                  hls_time: "5",
                  hls_list_size: "0",
                });
              }}
            >
              Process 720p
            </button>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-sm text-gray-300">
              <span>Progress</span>
              <span>{progress720}%</span>
            </div>
            <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-blue-500 transition-all duration-300"
                style={{ width: `${progress720}%` }}
              />
            </div>
            <div className="text-sm text-gray-300">
              Time: {timemark720 || "00:00:00.0"}
            </div>
          </div>
        </div>

        <div className="bg-gray-800 rounded-lg p-6 shadow-lg">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">1080p</h2>
            <button
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md transition-colors"
              onClick={async () => {
                await api.post("/videos/segment", {
                  slug: "jw-anime",
                  session: "jeremias",
                  title: "Jeremias teve coragem.mp4",
                  resolution: {
                    width: "1920",
                    height: "1080",
                  },
                  bitrate: "192k",
                  hls_time: "5",
                  hls_list_size: "0",
                });
              }}
            >
              Process 1080p
            </button>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-sm text-gray-300">
              <span>Progress</span>
              <span>{progress1080}%</span>
            </div>
            <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-blue-500 transition-all duration-300"
                style={{ width: `${progress1080}%` }}
              />
            </div>
            <div className="text-sm text-gray-300">
              Time: {timemark1080 || "00:00:00.0"}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
