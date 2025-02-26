"use client";
import { api } from "@/services/api";
import { classes } from "@prisma/client";
import Image from "next/image";
import { useParams } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";

// Add the type for videos
type ClassVideo = {
  id: number;
  class_id: number;
  video_id: string;
  url: string;
};

// Extend the classes type to include videos
interface ClassWithVideos extends classes {
  videos: ClassVideo[];
}

export default function CourseOnePage() {
  // Add new states for edit modal
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingClass, setEditingClass] = useState<ClassWithVideos | null>(
    null
  );
  const [editFormData, setEditFormData] = useState({
    title: "",
    description: "",
    thumbnail_url: "",
  });

  const [classes, setClasses] = useState<ClassWithVideos[]>([]);
  const [error, setError] = useState<string | null>(null);

  const [selectedVideo, setSelectedVideo] = useState<string | null>(null);
  const [isVideoLoading, setIsVideoLoading] = useState(false);

  const params = useParams();

  useEffect(() => {
    const fetchClasses = async () => {
      try {
        const { data } = await api.get<ClassWithVideos[]>(
          `/courses/${params.id}/classes`
        );
        setClasses(data);
        setError(null);
      } catch (err: any) {
        const errorMessage =
          err.response?.data?.message ||
          err.message ||
          "Failed to load classes";
        console.error("Error fetching classes:", err);
        setError(`${errorMessage}. Please try again.`);
      }
    };

    fetchClasses();
  }, [params.id]);

  const handlePlayVideo = async (videoUrl: string) => {
    setIsVideoLoading(true);
    setSelectedVideo(videoUrl);
  };

  const handleUploadVideo = async (classId: string) => {
    try {
      const formData = new FormData();
      const input = document.createElement("input");
      input.type = "file";
      input.accept = "video/*";

      input.onchange = async (e) => {
        const file = (e.target as HTMLInputElement).files?.[0];
        if (!file) return;

        formData.append("video", file);

        try {
          await api.post(
            `/courses/${params.id}/classes/${classId}/upload`,
            formData,
            {
              headers: {
                "Content-Type": "multipart/form-data",
              },
            }
          );

          // Refresh the classes list after upload
          const { data } = await api.get<ClassWithVideos[]>(
            `/courses/${params.id}/classes`
          );
          setClasses(data);
        } catch (err) {
          console.error("Error uploading video:", err);
        }
      };

      input.click();
    } catch (err) {
      console.error("Error upload video:", err);
    }
  };

  // Add handler for edit submission
  const handleEditSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!editingClass) return;

    try {
      await api.patch(
        `/courses/${params.id}/classes/${editingClass.id}`,
        editFormData
      );

      // Refresh classes list
      const { data } = await api.get<ClassWithVideos[]>(
        `/courses/${params.id}/classes`
      );
      setClasses(data);

      // Reset form and close modal
      setIsEditModalOpen(false);
      setEditingClass(null);
      setEditFormData({ title: "", description: "", thumbnail_url: "" });
    } catch (err) {
      console.error("Error updating class:", err);
    }
  };

  // Add handler to open edit modal
  const handleEditClick = (classItem: ClassWithVideos) => {
    setEditingClass(classItem);
    setEditFormData({
      title: classItem.title,
      description: classItem.description,
      thumbnail_url: classItem.thumbnail_url || "",
    });
    setIsEditModalOpen(true);
  };

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [addFormData, setAddFormData] = useState({
    title: "",
    description: "",
    thumbnail_url: "",
  });

  const handleAddSubmit = async (e: FormEvent) => {
    e.preventDefault();
    try {
      await api.post(`/courses/${params.id}/classes`, {
        ...addFormData,
        course_id: Number(params.id),
      });

      // Refresh classes list
      const { data } = await api.get<ClassWithVideos[]>(
        `/courses/${params.id}/classes`
      );
      setClasses(data);

      // Reset form and close modal
      setIsAddModalOpen(false);
      setAddFormData({ title: "", description: "", thumbnail_url: "" });
    } catch (err) {
      console.error("Error creating class:", err);
    }
  };

  {
    error && (
      <div className="bg-red-500 text-white p-4 rounded-md mb-4">{error}</div>
    );
  }

  return (
    <main className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Course Classes</h1>
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md transition-colors flex items-center"
        >
          <svg
            className="w-5 h-5 mr-2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 6v6m0 0v6m0-6h6m-6 0H6"
            />
          </svg>
          Add Class
        </button>
      </div>

      {isAddModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-gray-800 p-8 rounded-lg shadow-lg max-w-md w-full">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">Add New Class</h2>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">
                  Title
                </label>
                <input
                  type="text"
                  required
                  value={addFormData.title}
                  onChange={(e) =>
                    setAddFormData({ ...addFormData, title: e.target.value })
                  }
                  className="w-full bg-gray-700 rounded-md px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">
                  Description
                </label>
                <textarea
                  required
                  value={addFormData.description}
                  onChange={(e) =>
                    setAddFormData({
                      ...addFormData,
                      description: e.target.value,
                    })
                  }
                  className="w-full bg-gray-700 rounded-md px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[100px]"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">
                  Thumbnail URL
                </label>
                <input
                  type="url"
                  value={addFormData.thumbnail_url}
                  onChange={(e) =>
                    setAddFormData({
                      ...addFormData,
                      thumbnail_url: e.target.value,
                    })
                  }
                  className="w-full bg-gray-700 rounded-md px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex justify-end space-x-4 pt-4">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-md transition-colors"
                >
                  Create Class
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {selectedVideo && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-gray-800 p-4 rounded-lg w-full max-w-4xl">
            <div className="relative pt-[56.25%]">
              {isVideoLoading && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                </div>
              )}
              <video
                src={selectedVideo}
                className="absolute top-0 left-0 w-full h-full"
                controls
                autoPlay
                onLoadStart={() => setIsVideoLoading(true)}
                onLoadedData={() => setIsVideoLoading(false)}
              />
            </div>
            <button
              onClick={() => {
                setSelectedVideo(null);
                setIsVideoLoading(false);
              }}
              className="mt-4 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
            >
              Close
            </button>
          </div>
        </div>
      )}

      <div className="space-y-4">
        {classes.map((classItem) => (
          <div
            key={`class-${classItem.id}`}
            className="bg-gray-800 rounded-lg p-6 shadow-lg transition-transform hover:scale-[1.02] flex gap-4"
          >
            <div className="flex-shrink-0">
              {classItem.thumbnail_url ? (
                <Image
                  src={classItem.thumbnail_url}
                  alt={classItem.title}
                  width={180}
                  height={180}
                  className="rounded-md object-cover"
                  unoptimized
                />
              ) : (
                <div className="w-[180px] h-[180px] bg-gray-700 rounded-md flex items-center justify-center">
                  <svg
                    className="w-12 h-12 text-gray-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                    />
                  </svg>
                </div>
              )}
            </div>
            <div className="flex-grow">
              <div className="flex justify-between items-start mb-2">
                <h2 className="text-xl font-semibold">{classItem.title}</h2>
                <button
                  onClick={() => handleEditClick(classItem)}
                  className="p-2 text-gray-400 hover:text-white"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                    />
                  </svg>
                </button>
              </div>
              <div className="flex gap-2">
                {classItem.videos && classItem.videos.length > 0 && (
                  <button
                    onClick={() =>
                      handlePlayVideo(classItem.videos[0].url as string)
                    }
                    className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 flex items-center gap-2"
                  >
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    Play Video
                  </button>
                )}
                <button
                  onClick={() => handleUploadVideo(classItem.id.toString())}
                  className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 flex items-center gap-2"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
                    />
                  </svg>
                  Upload Video
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {classes.length === 0 && (
        <div className="text-center text-gray-500 mt-8">
          <p className="text-xl">No classes available for this course.</p>
        </div>
      )}

      {isEditModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-gray-800 p-8 rounded-lg shadow-lg max-w-md w-full">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">Edit Class</h2>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">
                  Title
                </label>
                <input
                  type="text"
                  required
                  value={editFormData.title}
                  onChange={(e) =>
                    setEditFormData({ ...editFormData, title: e.target.value })
                  }
                  className="w-full bg-gray-700 rounded-md px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">
                  Description
                </label>
                <textarea
                  required
                  value={editFormData.description}
                  onChange={(e) =>
                    setEditFormData({
                      ...editFormData,
                      description: e.target.value,
                    })
                  }
                  className="w-full bg-gray-700 rounded-md px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[100px]"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">
                  Thumbnail URL
                </label>
                <input
                  type="url"
                  value={editFormData.thumbnail_url}
                  onChange={(e) =>
                    setEditFormData({
                      ...editFormData,
                      thumbnail_url: e.target.value,
                    })
                  }
                  className="w-full bg-gray-700 rounded-md px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex justify-end space-x-4 pt-4">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-md transition-colors"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}
