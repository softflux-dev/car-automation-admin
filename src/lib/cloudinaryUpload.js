export const uploadToCloudinary = async (file) => {
  const url = `https://api.cloudinary.com/v1_1/${import.meta.env.VITE_CLOUDINARY_CLOUD_NAME}/image/upload`;
  const formData = new FormData();
  formData.append("file", file);
  formData.append(
    "upload_preset",
    import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET,
  );

  const response = await fetch(url, {
    method: "POST",
    body: formData,
  });
  const data = await response.json();

  const obj = {
    url: data.secure_url,
    public_id: data.public_id,
    name: data.original_filename,
    size: data.bytes,
    format: data.format,
  };

  return obj; // This is the image URL
};
