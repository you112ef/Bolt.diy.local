import React from 'react';

interface FilePreviewProps {
  files: File[];
  imageDataList: string[];
  onRemove: (index: number) => void;
}

const FilePreview: React.FC<FilePreviewProps> = ({ files, imageDataList, onRemove }) => {
  if (!files || files.length === 0) {
    return null;
  }

  return (
    <div className="flex flex-row overflow-x-auto -mt-2">
      {files.map((file, index) => (
        <div key={file.name + file.size} className="mr-2 relative">
          {imageDataList[index] && (
            <div className="relative pt-4 pr-4">
              <img loading="lazy" src={imageDataList[index]} alt={file.name} className="max-h-20" />
              <button
                onClick={() => onRemove(index)}
                className="absolute top-0 right-0 z-10 bg-black bg-opacity-50 hover:bg-opacity-75 rounded-full w-6 h-6 shadow-md transition-colors flex items-center justify-center" // Increased size, adjusted positioning slightly for larger target
              >
                <div className="i-ph:x w-3.5 h-3.5 text-white" /> {/* Slightly larger icon, white for better contrast on dark overlay */}
              </button>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default FilePreview;
