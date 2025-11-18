import React, { useState } from 'react';
import { uploadSitterPhoto, deleteSitterPhoto } from '../data/sitterService';
import './PhotoUpload.css';

interface PhotoUploadProps {
  sitterId: number;
  currentPhotos: string[];
  onPhotosUpdated?: (photos: string[]) => void;
}

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_FORMATS = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];

/**
 * PhotoUpload Component
 * Allows sitters to upload and manage profile photos
 */
export default function PhotoUpload({ sitterId, currentPhotos, onPhotosUpdated }: PhotoUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [deleting, setDeleting] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [previewFile, setPreviewFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setError(null);

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      setError('File size must be less than 5MB');
      return;
    }

    // Validate file format
    if (!ALLOWED_FORMATS.includes(file.type)) {
      setError('Only JPG, PNG, and GIF images are allowed');
      return;
    }

    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreviewUrl(e.target?.result as string);
      setPreviewFile(file);
    };
    reader.readAsDataURL(file);
  };

  const handleUpload = async () => {
    if (!previewFile) return;

    setUploading(true);
    setError(null);

    try {
      const updatedSitter = await uploadSitterPhoto(sitterId, previewFile);
      
      if (onPhotosUpdated) {
        onPhotosUpdated(updatedSitter.photos);
      }

      // Clear preview
      setPreviewFile(null);
      setPreviewUrl(null);
      
      // Reset file input
      const fileInput = document.getElementById('photo-upload-input') as HTMLInputElement;
      if (fileInput) {
        fileInput.value = '';
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to upload photo');
    } finally {
      setUploading(false);
    }
  };

  const handleCancelPreview = () => {
    setPreviewFile(null);
    setPreviewUrl(null);
    setError(null);
    
    // Reset file input
    const fileInput = document.getElementById('photo-upload-input') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }
  };

  const handleDelete = async (photoIndex: number) => {
    if (!window.confirm('Are you sure you want to delete this photo?')) {
      return;
    }

    setDeleting(photoIndex);
    setError(null);

    try {
      const updatedSitter = await deleteSitterPhoto(sitterId, photoIndex);
      
      if (onPhotosUpdated) {
        onPhotosUpdated(updatedSitter.photos);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete photo');
    } finally {
      setDeleting(null);
    }
  };

  return (
    <div className="photo-upload">
      <div className="photo-upload-header">
        <h3>Profile Photos</h3>
        <p className="photo-upload-hint">
          Add photos to showcase yourself and your experience with pets (max 5MB, JPG/PNG/GIF)
        </p>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      {/* File Input */}
      <div className="file-input-container">
        <label htmlFor="photo-upload-input" className="file-input-label">
          <span className="file-input-icon">📁</span>
          Choose Photo
        </label>
        <input
          id="photo-upload-input"
          type="file"
          accept="image/jpeg,image/jpg,image/png,image/gif"
          onChange={handleFileSelect}
          className="file-input-hidden"
        />
      </div>

      {/* Preview */}
      {previewUrl && (
        <div className="photo-preview">
          <h4>Preview</h4>
          <div className="preview-container">
            <img src={previewUrl} alt="Preview" className="preview-image" />
          </div>
          <div className="preview-info">
            <p>
              <strong>File:</strong> {previewFile?.name}<br />
              <strong>Size:</strong> {((previewFile?.size || 0) / 1024 / 1024).toFixed(2)} MB
            </p>
          </div>
          <div className="preview-actions">
            <button
              onClick={handleUpload}
              className="btn btn-primary"
              disabled={uploading}
            >
              {uploading ? 'Uploading...' : 'Upload Photo'}
            </button>
            <button
              onClick={handleCancelPreview}
              className="btn btn-secondary"
              disabled={uploading}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Current Photos */}
      {currentPhotos.length > 0 && (
        <div className="current-photos">
          <h4>Current Photos ({currentPhotos.length})</h4>
          <div className="photos-grid">
            {currentPhotos.map((photo, index) => (
              <div key={index} className="photo-item">
                <img src={photo} alt={`Photo ${index + 1}`} className="photo-thumbnail" />
                <button
                  onClick={() => handleDelete(index)}
                  className="photo-delete-btn"
                  disabled={deleting === index}
                  title="Delete photo"
                >
                  {deleting === index ? '...' : '×'}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {currentPhotos.length === 0 && !previewUrl && (
        <div className="no-photos">
          <p>No photos uploaded yet. Add some photos to make your profile stand out!</p>
        </div>
      )}
    </div>
  );
}
