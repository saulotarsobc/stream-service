"use client";
import { api } from "@/services/api";
import { socket } from "@/services/socket-io";
import { VideoProgress } from "@/ts/interfaces";
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
  const [isProcessing, setIsProcessing] = useState(false);

  const params = useParams();

  useEffect(() => {
    socket.on(`segment/class/${params.id}`, (data: VideoProgress) => {
      console.table(data);
      if (data.resolution.width === "360") {
        setProgress360(Number(data.percent));
        setTimemark360(data.timemark);
      } else if (data.resolution.width === "480") {
        setProgress480(Number(data.percent));
        setTimemark480(data.timemark);
      } else if (data.resolution.width === "720") {
        setProgress720(Number(data.percent));
        setTimemark720(data.timemark);
      } else if (data.resolution.width === "1080") {
        setProgress1080(Number(data.percent));
        setTimemark1080(data.timemark);
      }
    });

    return () => {
      socket.off(`segment/class/${params.id}`);
    };
  }, [params.id]);

  const handleStartSegmentation = async () => {
    try {
      setIsProcessing(true);
      await api.post(`/courses/segment/class/${params.id}/`);
    } catch (error) {
      console.error("Error starting segmentation:", error);
    }
  };

  return (
    <main className="p-4 max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Video Segmentation Progress</h1>
        <button
          onClick={handleStartSegmentation}
          disabled={isProcessing}
          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
        >
          {isProcessing ? "Processing..." : "Start Segmentation"}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-gray-800 rounded-lg p-6 shadow-lg">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">360p</h2>
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
