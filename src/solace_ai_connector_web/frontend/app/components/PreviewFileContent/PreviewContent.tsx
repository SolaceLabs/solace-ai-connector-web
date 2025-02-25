import { useState, useMemo } from 'react';
import { FileAttachment } from '../FileDisplay';
import {CsvPreview} from "./CsvPreview"

interface PreviewContentProps {
    file: FileAttachment;
    className?: string;
    onDownload: () => void;
}

export const PreviewContent: React.FC<PreviewContentProps> = ({ file, className, onDownload }) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const [isCopied, setIsCopied] = useState(false);
    
    const decodedContent = useMemo(() => {
        try {
            return atob(file.content);
        } catch (e) {
            return 'Unable to decode file content';
        }
    }, [file.content]);

    const isCsv = file.name.toLowerCase().endsWith('.csv');

    const handleCopy = () => {
        navigator.clipboard.writeText(decodedContent);
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 1000);
    };
    const handleDownload = () => {
        onDownload();
    };

    return (
        <div className={`mt-2 w-full max-w-sm md:max-w-md ${className}`}>
            <div className="relative">
                <div className="bg-gray-50 dark:bg-gray-800 rounded-lg">
                    {/* Header section with filename and buttons */}
                    <div className="flex items-center justify-between p-3 border-b border-gray-200 dark:border-gray-700">
                        <div className="flex items-center">
                            <svg 
                                className="w-4 h-4 mr-2 text-gray-500 dark:text-gray-400" 
                                fill="none" 
                                stroke="currentColor" 
                                viewBox="0 0 24 24"
                            >
                                <path 
                                    strokeLinecap="round" 
                                    strokeLinejoin="round" 
                                    strokeWidth={2} 
                                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" 
                                />
                            </svg>
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300 max-w-[250px] truncate">
                                {file.name}
                            </span>
                        </div>
                        
                        {/* Action buttons */}
                        <div className="flex items-center gap-2">
                            {/* Download button */}
                            <button
                                onClick={handleDownload}
                                className="p-1.5 rounded bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                                title="Download file"
                            >
                                <svg 
                                    className="w-4 h-4 text-gray-600 dark:text-gray-300" 
                                    fill="none" 
                                    stroke="currentColor" 
                                    viewBox="0 0 24 24"
                                >
                                    <path 
                                        strokeLinecap="round" 
                                        strokeLinejoin="round" 
                                        strokeWidth={2} 
                                        d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                                    />
                                </svg>
                            </button>

                            {/* Copy button */}
                            <button
                                onClick={handleCopy}
                                className={`p-1.5 rounded bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 transition-all duration-300 ${
                                    isCopied ? 'scale-110' : 'scale-100'
                                }`}
                                title={isCopied ? "Copied!" : "Copy content"}
                            >
                                {isCopied ? (
                                    <svg 
                                        className="w-4 h-4 text-green-600 dark:text-green-400 transition-all duration-300" 
                                        fill="none" 
                                        stroke="currentColor" 
                                        viewBox="0 0 24 24"
                                    >
                                        <path 
                                            strokeLinecap="round" 
                                            strokeLinejoin="round" 
                                            strokeWidth={2} 
                                            d="M5 13l4 4L19 7"
                                        />
                                    </svg>
                                ) : (
                                    <svg 
                                        className="w-4 h-4 text-gray-600 dark:text-gray-300 transition-all duration-300" 
                                        fill="none" 
                                        stroke="currentColor" 
                                        viewBox="0 0 24 24"
                                    >
                                        <path 
                                            strokeLinecap="round" 
                                            strokeLinejoin="round" 
                                            strokeWidth={2} 
                                            d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" 
                                        />
                                    </svg>
                                )}
                            </button>
                        </div>
                    </div>

                    {/* Content container */}
                    <div className={`p-3 ${
                        isExpanded ? 'overflow-auto max-h-[500px]' : 'overflow-hidden'
                    }`}>
                        {isCsv ? (
                            <CsvPreview content={decodedContent} isExpanded={isExpanded} />
                        ) : (
                            <pre className="font-mono text-xs md:text-sm text-gray-800 dark:text-gray-200">
                                <code>
                                    {isExpanded 
                                        ? decodedContent 
                                        : decodedContent.split('\n').slice(0, 5).join('\n')
                                    }
                                </code>
                            </pre>
                        )}
                    </div>
                </div>
    
                {/* Show more/less button */}
                {((!isCsv && decodedContent.split('\n').length > 5) || 
                  (isCsv && decodedContent.split('\n').length > 4)) && (
                    <button
                        onClick={() => setIsExpanded(!isExpanded)}
                        className="mt-2 text-xs md:text-sm text-solace-blue dark:text-solace-green hover:opacity-80 transition-opacity"
                    >
                        {isExpanded ? 'Show less' : 'Show more'}
                    </button>
                )}
            </div>
        </div>
    );
};