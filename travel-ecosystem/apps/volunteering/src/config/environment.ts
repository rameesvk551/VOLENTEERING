const DEFAULT_API_URL = 'http://localhost:2222/api/v1';
const DEFAULT_CLOUD_NAME = 'djruimp0d';
const DEFAULT_UPLOAD_PRESET = 'unsigned_upload';

export const environment = {
  apiBaseUrl: import.meta.env.VITE_VOLUNTEERING_API_URL ?? DEFAULT_API_URL,
  cloudinaryCloudName: import.meta.env.VITE_CLOUDINARY_CLOUD ?? DEFAULT_CLOUD_NAME,
  cloudinaryUploadPreset: import.meta.env.VITE_CLOUDINARY_PRESET ?? DEFAULT_UPLOAD_PRESET,
};

export const apiBaseUrl = environment.apiBaseUrl;
export const cloudinaryUploadUrl = `https://api.cloudinary.com/v1_1/${environment.cloudinaryCloudName}/image/upload`;
