import { useEffect, useState } from 'react';
import { CustomMarkdown } from './CustomMarkdown';

interface TypewriterEffectProps {
  text: string;
  speed?: number;
  onTextChange?: () => void;
}

const TypewriterEffect = ({ text, speed = 50, onTextChange }: TypewriterEffectProps) => {
  const [displayedText, setDisplayedText] = useState('');

  useEffect(() => {
    let currentText = '';
    let currentIndex = 0;
    const intervalId = setInterval(() => {
      if (currentIndex < text.length) {
        currentText += text[currentIndex];
        setDisplayedText(currentText);
        currentIndex++;
        onTextChange?.();
      } else {
        clearInterval(intervalId);
      }
    }, speed);

    return () => clearInterval(intervalId);
  }, [text, onTextChange]);

  return (
    <div className="typewriter-container relative">
      <CustomMarkdown>
        {displayedText}
      </CustomMarkdown>
      <span className="typing-cursor absolute bottom-0" />
    </div>
  );
};

export default TypewriterEffect;