
type UploadOptions = {
  fileName?: string; 
  mimeType?: string; 
  resourceType?: "image" | "raw"; 
};

export async function uploadToCloudinary(
  fileUri: string,
  options: UploadOptions = {}
): Promise<string> {
  const cloudName = process.env.EXPO_PUBLIC_CLOUDINARY_CLOUD_NAME;
  const uploadPreset = process.env.EXPO_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

  if (!cloudName || !uploadPreset) {
    throw new Error(
      "Cloudinary env missing. Please set EXPO_PUBLIC_CLOUDINARY_CLOUD_NAME and EXPO_PUBLIC_CLOUDINARY_UPLOAD_PRESET in .env"
    );
  }

  const fileName = options.fileName ?? `upload-${Date.now()}`;
  const mimeType = options.mimeType ?? "image/jpeg";
  const resourceType: "image" | "raw" = options.resourceType ?? "image";

  const formData = new FormData();

  formData.append("file", {
    uri: fileUri,
    name: fileName,
    type: mimeType,
  } as any);

  formData.append("upload_preset", uploadPreset);

  const endpoint =
    resourceType === "raw"
      ? `https://api.cloudinary.com/v1_1/${cloudName}/raw/upload`
      : `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`;

  const res = await fetch(endpoint, {
    method: "POST",
    body: formData,
  });

  const data = await res.json();

  // Helpful debug log (you can remove later)
  if (!res.ok) {
    console.log("Cloudinary upload failed payload:", data);
    throw new Error(data?.error?.message || "Upload failed");
  }

  if (!data?.secure_url) {
    console.log("Cloudinary response missing secure_url:", data);
    throw new Error("Upload failed: secure_url not found");
  }

  return data.secure_url as string;
}
