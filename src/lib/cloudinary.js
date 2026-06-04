const CLOUDINARY_CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
const CLOUDINARY_UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

export const uploadToCloudinary = async (file) => {
  if (!CLOUDINARY_CLOUD_NAME || !CLOUDINARY_UPLOAD_PRESET) {
    throw new Error("Cloudinary configuration missing");
  }

  if (!file) {
    throw new Error("No file provided");
  }

  const MAX_FILE_SIZE = 200 * 1024 * 1024; // 200MB

  if (file.size > MAX_FILE_SIZE) {
    throw new Error("File exceeds maximum upload size (200MB)");
  }

  // Industry standard supported formats
  const supportedFormats = [
    // images
    "jpg",
    "jpeg",
    "png",
    "webp",
    "gif",
    "bmp",
    "tiff",
    "svg",
    "heic",
    "avif",

    // videos
    "mp4",
    "mov",
    "avi",
    "webm",
    "mkv",
    "flv",
    "wmv",
    "m4v",

    // cad 2D
    "dwg",
    "dxf",

    // cad / 3d
    "step",
    "stp",
    "iges",
    "igs",
    "obj",
    "fbx",
    "stl",
    "glb",
    "gltf",
    "3ds",
    "blend",

    // documents often used in cad workflows
    "pdf",
  ];

  const extension = file.name.split(".").pop()?.toLowerCase();

  if (!supportedFormats.includes(extension)) {
    throw new Error(`Unsupported file format: .${extension}`);
  }

  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);

  // optional metadata
  formData.append("context", `original_filename=${file.name}`);

  try {
    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/auto/upload`,
      {
        method: "POST",
        body: formData,
      },
    );

    const data = await response.json();

    if (!response.ok) {
      const message = data?.error?.message || "Cloudinary upload failed";
      throw new Error(message);
    }

    return {
      url: data.secure_url,
      publicId: data.public_id,
      format: data.format,
      resourceType: data.resource_type,
      bytes: data.bytes,
      width: data.width || null,
      height: data.height || null,
      duration: data.duration || null,
      originalName: file.name,
    };
  } catch (error) {
    if (error.name === "TypeError") {
      throw new Error("Network error while uploading file");
    }

    throw new Error(error.message || "Unknown upload error");
  }
};
