import axios from 'axios';

export const uploadFile = async ({ file, onProgress }) => {
  if (!file) return null;

  const token = localStorage.getItem('strapiToken');
  if (!token) throw new Error('Authentication token is required');

  const formData = new FormData();
  formData.append('files', file);

  try {
    // Verify file size
    if (file.size > 10 * 1024 * 1024) { // 10MB limit
      throw new Error('File size exceeds 10MB limit');
    }

    console.log('Starting upload:', {
      fileName: file.name,
      fileType: file.type,
      fileSize: file.size
    });

    const response = await axios.post(
      `${process.env.NEXT_PUBLIC_STRAPI_BASE_URL}/api/upload`,
      formData,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          onProgress?.(percentCompleted);
        },
      }
    );

    console.log('Upload response:', response.data);

    if (!response.data?.[0]?.id) {
      throw new Error('Invalid response format from upload endpoint');
    }

    return response.data[0];
  } catch (error) {
    console.error('Upload failed:', {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status,
      statusText: error.response?.statusText
    });

    // Throw specific error messages
    if (error.response?.status === 413) {
      throw new Error('File size too large for server');
    } else if (error.response?.status === 415) {
      throw new Error('Unsupported file type');
    } else if (error.response?.status === 401) {
      throw new Error('Authentication failed. Please log in again.');
    } else if (error.response?.status === 500) {
      throw new Error('Server error during upload. Please try again later.');
    }

    throw error;
  }
};