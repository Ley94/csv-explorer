import React, { useState } from "react";
import { uploadCsv } from "../../services/csv-api";
import "./FileUpload.css";

interface SuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
}

function SuccessModal({ isOpen, onClose }: SuccessModalProps) {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h3>Upload Successful!</h3>
        <button onClick={onClose}>Close</button>
      </div>
    </div>
  );
}

interface FileUploadProps {
  onUploadSuccess: (uploadedHeaders: string[]) => void;
}

export default function FileUpload({ onUploadSuccess }: FileUploadProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [showSuccessModal, setShowSuccessModal] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setError(null);
    } else {
      setSelectedFile(null);
    }
  };

  const handleSubmit = async () => {
    if (!selectedFile) {
      setError("Please select a file to upload.");
      return;
    }

    setIsUploading(true);
    setError(null);
    setUploadProgress(0);

    try {
      const data = await uploadCsv(selectedFile, (progress: number) => {
        setUploadProgress(progress);
      });
      setShowSuccessModal(true);
      onUploadSuccess(data.headers);
    } catch (err) {
      setError("Upload failed. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="file-upload">
      <h2>Upload CSV File</h2>
      <p>Select a CSV file to begin searching its contents</p>
      <input
        type="file"
        data-testid="file-input"
        accept=".csv"
        onChange={handleFileSelect}
        disabled={isUploading}
        defaultValue={selectedFile?.name}
      />
      <button onClick={handleSubmit} disabled={!selectedFile || isUploading}>
        Upload File
      </button>

      {isUploading && (
        <div className="upload-progress">
          <p>Uploading...</p>
          <progress value={uploadProgress} max="100" />
          <p>{uploadProgress}% complete</p>
        </div>
      )}

      {error && <p className="error">{error}</p>}
      {showSuccessModal && (
        <SuccessModal
          isOpen={showSuccessModal}
          onClose={() => setShowSuccessModal(false)}
        />
      )}
    </div>
  );
}
