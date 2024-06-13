"use client";

import React, { useState } from "react";

const FileForm = () => {
  const [file, setFile] = useState(null);
  const [fileInfo, setFileInfo] = useState(null);

  const handleFileChange = (event) => {
    const selectedFile = event.target.files[0];
    setFile(selectedFile);

    // Process file info server-side and update the fileInfo state
    // You can make an API call or use any server-side processing logic here
    // For simplicity, let's assume fileInfo is an object with properties: name, size, type
    const fileInfo = {
      name: selectedFile.name,
      size: selectedFile.size,
      type: selectedFile.type,
    };
    setFileInfo(fileInfo);
  };

  return (
    <div>
      <h1>File Form</h1>
      <form>
        <div>
          <label htmlFor="fileInput">Select a file:</label>
          <input type="file" id="fileInput" onChange={handleFileChange} />
        </div>
        <div>
          <label>File Name:</label>
          <input type="text" value={fileInfo?.name || ""} disabled />
        </div>
        <div>
          <label>File Size:</label>
          <input type="text" value={fileInfo?.size || ""} disabled />
        </div>
        <div>
          <label>File Type:</label>
          <input type="text" value={fileInfo?.type || ""} disabled />
        </div>
      </form>
    </div>
  );
};

export default FileForm;
