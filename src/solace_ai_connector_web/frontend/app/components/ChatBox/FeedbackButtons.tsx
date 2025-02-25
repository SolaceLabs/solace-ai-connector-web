import { useState } from 'react';
import { FaThumbsUp, FaThumbsDown, FaCopy } from 'react-icons/fa';
import { getCookie, getCsrfToken } from '../ConfigProvider';

interface FeedbackButtonsProps {
  messageId: number;
  messageText: string;
  metadata?: {
    messageId?: string;
    sessionId: string;
  };
}

export const FeedbackButtons = ({ messageId, messageText, metadata }: FeedbackButtonsProps) => {
  const [showCommentInput, setShowCommentInput] = useState(false);
  const [comment, setComment] = useState('');
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);

  const submitFeedback = async (isPositive: boolean, comment?: string) => {
    try {
      let csrfToken = getCookie('csrf_token');
      if (!csrfToken) {
        csrfToken = await getCsrfToken()
      }
      const response = await fetch('/api/v1/feedback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-TOKEN': csrfToken ?? '',
        },
        body: JSON.stringify({
          messageId: metadata?.messageId,
          sessionId: metadata?.sessionId,
          isPositive,
          comment,
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to submit feedback');
      }
    } catch (error) {
      console.error('Error submitting feedback:', error);
    }
  };

  const handleFeedback = async (isPositive: boolean) => {
    if (isPositive) {
      await submitFeedback(true);
      setFeedbackSubmitted(true);
    } else {
      setShowCommentInput(true);
    }
  };

  const handleSubmitNegativeFeedback = async () => {
    if (comment.trim()) {
      await submitFeedback(false, comment);
      setShowCommentInput(false);
      setFeedbackSubmitted(true);
    }
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(messageText);
  };

  if (feedbackSubmitted) {
    return (
      <div className="text-sm text-gray-500 mt-1 italic">
        Thanks for your feedback
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center gap-1 mt-1">
        <button
          onClick={() => handleFeedback(true)}
          className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition-colors duration-200"
          disabled={feedbackSubmitted}
          title="Helpful"
        >
          <FaThumbsUp className="text-gray-400 hover:text-green-500 w-3.5 h-3.5" />
        </button>
        <button
          onClick={() => handleFeedback(false)}
          className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition-colors duration-200"
          disabled={feedbackSubmitted}
          title="Not helpful"
        >
          <FaThumbsDown className="text-gray-400 hover:text-red-500 w-3.5 h-3.5" />
        </button>
        <button
          onClick={handleCopy}
          className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition-colors duration-200"
          title="Copy message"
        >
          <FaCopy className="text-gray-400 hover:text-blue-500 w-3.5 h-3.5" />
        </button>
      </div>
      {showCommentInput && (
        <div className="flex flex-col gap-2 mt-1 animate-slideDown">
          <div className="flex gap-2">
            <input
              type="text"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="flex-1 px-3 py-1.5 text-sm border rounded-md min-w-[230px]
                dark:bg-gray-700 dark:border-gray-600 
                focus:outline-none focus:ring-1 focus:ring-solace-blue 
                dark:focus:ring-solace-green dark:text-white
                transition-all duration-200"
              placeholder="What went wrong? (optional)"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSubmitNegativeFeedback();
                }
                if (e.key === 'Escape') {
                  setShowCommentInput(false);
                }
              }}
              autoFocus
            />
            <button
              onClick={handleSubmitNegativeFeedback}
              className="px-3 py-1.5 bg-solace-blue text-white text-sm font-medium rounded-md 
                hover:bg-blue-600 transition-colors duration-200 dark:bg-solace-green"
            >
              Send
            </button>
            <button
              onClick={() => setShowCommentInput(false)}
              className="px-3 py-1.5 bg-gray-200 text-gray-700 text-sm font-medium rounded-md 
                hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600 
                transition-colors duration-200"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
};