// pages/admin/posts/bulkUpload.js
import { useState } from 'react';

export default function BulkUploadPage() {
  const [excelFile, setExcelFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setExcelFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!excelFile) {
      alert('Please select an Excel file first.');
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', excelFile);

      const res = await fetch('/api/bulkUpload', {
        method: 'POST',
        body: formData
      });

      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(`Upload failed: ${errorText}`);
      }

      alert('Excel file uploaded and scheduled posts created successfully!');
    } catch (err) {
      console.error('Error uploading file:', err);
      alert('Error uploading file: ' + err.message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div style={{ padding: '20px' }}>
      <h1>Bulk Upload Posts</h1>
      <input type="file" accept=".xlsx,.xls" onChange={handleFileChange} />
      <button onClick={handleUpload} disabled={uploading}>
        {uploading ? 'Uploading...' : 'Upload & Schedule'}
      </button>
    </div>
  );
}
