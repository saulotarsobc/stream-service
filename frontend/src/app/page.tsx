"use client";
import { api } from "@/services/api";
import { socket } from "@/services/socket-io";
import { UploadVideo, VideoProgress } from "@/ts/interfaces";
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
    <main className="p-4">
      <h1>Home</h1>
      <p>Open the console to see the data</p>

      <div className="p-3">
        <button
          className="bg-blue-400 rounded-sm w-full"
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
          360p
        </button>
        <h2>
          360p: {progress360} % | {timemark360}
        </h2>

        <input
          className="w-full"
          type="range"
          name="progress360"
          id="progress360"
          value={progress360}
          onChange={(e) => setProgress360(Number(e.target.value))}
        />
      </div>

      <div className="p-3">
        <button
          className="bg-blue-400 rounded-sm w-full"
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
          480p
        </button>
        <h2>
          480p: {progress480} % | {timemark360}
        </h2>
        <input
          className="w-full"
          type="range"
          name="progress480"
          id="progress480"
          value={progress480}
          onChange={(e) => setProgress480(Number(e.target.value))}
        />
      </div>

      <div className="p-3">
        <button
          className="bg-blue-400 rounded-sm w-full"
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
          720p
        </button>
        <h2>
          720p: {progress720} % | {timemark360}
        </h2>
        <input
          className="w-full"
          type="range"
          name="progress720"
          id="progress720"
          value={progress720}
          onChange={(e) => setProgress720(Number(e.target.value))}
        />
      </div>

      <div className="p-3">
        <button
          className="bg-blue-400 rounded-sm w-full"
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
          1080p
        </button>
        <h2>
          1080p: {progress1080} % | {timemark360}
        </h2>
        <input
          className="w-full"
          type="range"
          name="progress1080"
          id="progress1080"
          value={progress1080}
          onChange={(e) => setProgress1080(Number(e.target.value))}
        />
      </div>
    </main>
  );
}
