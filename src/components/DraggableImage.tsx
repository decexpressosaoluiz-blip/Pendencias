import React, { useRef, useState, useEffect } from 'react';

interface DraggableImageProps {
  src: string;
  initialX?: number;
  initialY?: number;
  containerRef: React.RefObject<HTMLDivElement>;
}

export const DraggableImage: React.FC<DraggableImageProps> = ({ src, initialX = 0, initialY = 0, containerRef }) => {
  const [position, setPosition] = useState({ x: initialX, y: initialY });
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const imgRef = useRef<HTMLImageElement>(null);

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
    setDragOffset({
      x: e.clientX - position.x,
      y: e.clientY - position.y
    });
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging && containerRef.current && imgRef.current) {
        // Simple bounding logic could be added here
        const newX = e.clientX - dragOffset.x;
        const newY = e.clientY - dragOffset.y;
        setPosition({ x: newX, y: newY });
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, dragOffset, containerRef]);

  return (
    <div 
      style={{ 
        position: 'absolute', 
        left: position.x, 
        top: position.y, 
        cursor: isDragging ? 'grabbing' : 'grab',
        zIndex: 10
      }}
      onMouseDown={handleMouseDown}
    >
      <img 
        ref={imgRef}
        src={src} 
        alt="Draggable" 
        className="max-w-[200px] shadow-2xl rounded-lg hover:ring-2 ring-blue-500 transition-all pointer-events-none"
      />
    </div>
  );
};