import { useState, useMemo } from 'react';
import { FileAttachment } from '../FileDisplay';
import { CsvPreviewMessage } from "./CsvPreviewMessage";
import { isCsvFile, isHtmlFile, isMermaidFile } from './PreviewHelpers';

interface PreviewContentProps {
    file: FileAttachment;
    className?: string;
    onDownload: () => void;
    onPreview?: () => void;
    onRun?: () => void;
}

export const PreviewContent: React.FC<PreviewContentProps> = ({ 
    file, 
    className, 
    onDownload, 
    onPreview,
    onRun
}) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const [isCopied, setIsCopied] = useState(false);
    
    const decodedContent = useMemo(() => {
        try {
            return atob(file.content);
        } catch (e) {
            return 'Unable to decode file content';
        }
    }, [file.content]);
    
    const isCsv = isCsvFile(file.name);
    // Check if this file type is renderable (HTML or Mermaid)
    const isRenderable = isHtmlFile(file.name) || isMermaidFile(file.name);
    
    const handleCopy = () => {
        navigator.clipboard.writeText(decodedContent);
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 1000);
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
                            {/* Run button (if renderable) */}
                            {isRenderable && onRun && (
                                <button
                                    onClick={onRun}
                                    className="p-1.5 rounded bg-green-200 dark:bg-green-700 hover:bg-green-300 dark:hover:bg-green-600 transition-colors"
                                    title="Run code"
                                >
                                    <svg 
                                        className="w-4 h-4 text-green-800 dark:text-green-300" 
                                        fill="none" 
                                        stroke="currentColor" 
                                        strokeWidth={2}
                                        viewBox="0 0 24 24"
                                        xmlns="http://www.w3.org/2000/svg"
                                    >
                                        <path 
                                            strokeLinecap="round" 
                                            strokeLinejoin="round" 
                                            d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"
                                        />
                                        <path 
                                            strokeLinecap="round" 
                                            strokeLinejoin="round" 
                                            d="M10 8l6 4-6 4V8z"
                                        />
                                    </svg>
                                </button>
                            )}    
                            {/* Preview button (if applicable) */}
                            {onPreview && (
                                <button
                                    onClick={onPreview}
                                    className="p-1.5 rounded bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                                    title="Preview file"
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
                                            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                                        />
                                        <path 
                                            strokeLinecap="round" 
                                            strokeLinejoin="round" 
                                            strokeWidth={2} 
                                            d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                                        />
                                    </svg>
                                </button>
                            )}
                            
                            {/* Download button */}
                            <button
                                onClick={onDownload}
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
                    <div className={`p-3 scrollbar-themed ${
                        isExpanded ? 'overflow-auto max-h-[500px]' : 'overflow-hidden'
                    }`}>
                        {isCsv ? (
                            <CsvPreviewMessage content={decodedContent} isExpanded={isExpanded} />
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