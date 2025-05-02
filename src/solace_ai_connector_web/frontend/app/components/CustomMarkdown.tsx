import { marked } from 'marked';
import parse from 'html-react-parser';

interface CustomMarkdownProps {
  children: string;
  className?: string;
}

export const CustomMarkdown = ({ children, className = '' }: CustomMarkdownProps) => {
  // Check if content appears to be HTML
  const containsHtml = (content: string) => {
    // Look for HTML document patterns or HTML tags
    const htmlPatterns = [
      /<!DOCTYPE\s+html>/i,
      /<html[\s>]/i,
      /<head[\s>]/i,
      /<body[\s>]/i,
      /<\/[a-z]+>/i,
    ];
    
    return htmlPatterns.some(pattern => pattern.test(content));
  };

  let processedContent = children;
  
  // If content seems to be HTML and not already in a code block
  if (containsHtml(processedContent) && !processedContent.includes('```')) {
    // Escape < and > characters to prevent HTML rendering
    processedContent = processedContent
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
      
  }

  const htmlContent = marked(processedContent) as string;
  
  return (
    <div 
      className={`
        prose prose-slate dark:prose-invert
        dark:prose-p:text-gray-300
        dark:prose-strong:text-gray-100
        dark:prose-headings:text-gray-100
        prose-a:text-blue-600 dark:prose-a:text-blue-400 hover:prose-a:text-blue-500 dark:hover:prose-a:text-blue-300
        [&_ul>li]:marker:text-black dark:[&_ul>li]:marker:text-gray-400
        prose-p:mt-0
        [&_ul]:mt-[-1.875rem] [&_ul]:mb-[-2.75rem]
        [&_li>ul]:mt-[0.125rem]
        [&_ol]:mt-[-1.875rem] [&_ol]:mb-[-1.875rem]
        [&_ul+ol]:mt-[1.125rem]
        [&_ul_li+ol]:mt-[1.125rem]
        [&_li]:mt-[-28px]
        [&_li]:mb-0
        [&_ul_li_ol]:mt-[1rem]
        [&_ul>li>ol]:mt-[0.5rem]
        [&_li>p]:my-[-1rem]
        prose-headings:my-1
        prose-pre:my-1
        prose-blockquote:my-1 dark:prose-blockquote:text-gray-300 dark:prose-blockquote:border-gray-700
        prose-hr:my-1
        [&_table]:block [&_table]:overflow-x-auto
        [&>*:first-child]:!mt-0
        [&>*:last-child]:!mb-[-30px]
        ${className}
      `}
    >
      {parse(htmlContent)}
    </div>
  );
};