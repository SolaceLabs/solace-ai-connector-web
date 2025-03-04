import { useMemo } from "react";

interface CsvPreviewMessageProps {
    content: string;
    isExpanded: boolean;
}

export const CsvPreviewMessage: React.FC<CsvPreviewMessageProps> = ({ content, isExpanded }) => {
    const rows = useMemo(() => {
        try {
            const lines = content.trim().split('\n');
            const parsed = lines
                .filter(line => line.trim())
                .map(line => line.split(',').map(cell => cell.trim()));
            
            return isExpanded ? parsed : parsed.slice(0, 4);
        } catch (e) {
            return [];
        }
    }, [content, isExpanded]);

    if (!rows.length) {
        return <div className="text-gray-500 dark:text-gray-400">No valid CSV content found</div>;
    }

    return (
        <div className="overflow-x-auto scrollbar-themed">
            <table className="min-w-full text-xs md:text-sm dark:text-gray-200">
                <tbody>
                    {rows.map((row, i) => (
                        <tr 
                            key={i} 
                            className={`
                                ${i === 0 ? 'bg-gray-100 dark:bg-gray-700 font-medium' : ''}
                                ${i % 2 === 1 ? 'bg-gray-50 dark:bg-gray-800' : ''}
                            `}
                        >
                            {row.map((cell, j) => (
                                <td 
                                    key={j} 
                                    className="border border-gray-200 dark:border-gray-600 p-2 truncate max-w-[200px] dark:text-white"
                                    title={cell}
                                >
                                    {cell}
                                </td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};