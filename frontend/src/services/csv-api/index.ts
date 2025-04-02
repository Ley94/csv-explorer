export const API_BASE_URL =
  process.env.REACT_APP_API_BASE_URL || "http://localhost:3001";

export async function uploadCsv(
  file: File,
  onProgress?: (progress: number) => void
): Promise<{ message: string; rowCount: number; headers: string[] }> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    const formData = new FormData();
    formData.append("file", file);

    if (onProgress) {
      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          const progress = Math.round((event.loaded / event.total) * 100);
          onProgress(progress);
        }
      };
    }

    xhr.onload = () => {
      if (xhr.status === 201) {
        setTimeout(() => {
          resolve(JSON.parse(xhr.response));
        }, 1000); // Delay for 1 second to ensure the progress bar reaches 100% before res
      } else {
        reject(new Error(xhr.response || "Upload failed"));
      }
    };

    xhr.onerror = () => reject(new Error("Upload failed"));

    xhr.open("POST", `${API_BASE_URL}/data/upload`);
    xhr.send(formData);
  });
}

export async function searchData(params: {
  term?: string;
  column?: string;
  exact?: boolean;
  page?: number;
  limit?: number;
}): Promise<{
  headers: string[];
  totalCount: number;
  dataEntries: any[];
  page: number;
  limit: number;
}> {
  const searchParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined) {
      searchParams.append(key, String(value));
    }
  });

  const res = await fetch(`${API_BASE_URL}/data/search?${searchParams}`);

  if (!res.ok) {
    throw new Error("Search failed");
  }

  return res.json();
}
