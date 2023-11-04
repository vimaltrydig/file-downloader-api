"use client";

import { useState } from "react";

export default function List({
  files,
  hostName,
  id,
}: {
  files: string[];
  hostName: string;
  id: string;
}) {
  // State variable to store selected files
  const [selectedFiles, setSelectedFiles] = useState<string[]>([]);

  // Function to handle checkbox change
  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedFiles((prevState) => [...prevState, e.target.value]);
    } else {
      setSelectedFiles((prevState) =>
        prevState.filter((fileName) => fileName !== e.target.value)
      );
    }
  };

  // Function to handle download button click
  const handleDownload = () => {
    if (selectedFiles.length > 0) {
      setSelectedFiles([]);

      const downloadUrl = new URL(`${hostName}/api/downloadFiles`);
      downloadUrl.searchParams.set("id", id);
      downloadUrl.searchParams.set("files", JSON.stringify(selectedFiles));
      window.location.href = downloadUrl.toString();
    }
  };

  return (
    <div className="flex  w-full flex-col items-center gap-5 justify-center">
      <table className="table-auto min-w-[600px] text-sm text-left text-gray-500 dark:text-gray-400 rounded-lg">
        <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
          <tr>
            <th className="px-6 py-3">Select</th>
            <th className="px-6 py-3">File Name</th>
          </tr>
        </thead>
        <tbody>
          {files.length > 0 &&
            files.map((file) => (
              <tr
                key={file}
                className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600"
              >
                <td className="w-4 p-4">
                  <input
                    className="form-checkbox"
                    type="checkbox"
                    value={file}
                    onChange={handleCheckboxChange}
                  />
                </td>
                <td className="px-6 py-4">{file}</td>
              </tr>
            ))}
          {files.length === 0 && (
            <>
              <td className="w-4 p-4"></td>
              <td className="px-6 py-4">No files</td>
            </>
          )}
        </tbody>
      </table>
      <button
        className="bg-gray-300 cursor-pointer disabled:cursor-not-allowed !disabled:hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded inline-flex items-center"
        onClick={() => handleDownload()}
        disabled={selectedFiles.length === 0}
      >
        <svg
          className="fill-current w-4 h-4 mr-2"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
        >
          <path d="M13 8V2H7v6H2l8 8 8-8h-5zM0 18h20v2H0v-2z" />
        </svg>
        <span>Download</span>
      </button>
    </div>
  );
}
