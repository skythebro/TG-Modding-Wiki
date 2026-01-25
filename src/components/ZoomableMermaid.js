import React, { useRef, useState, useCallback } from 'react';
import Mermaid from '@theme/Mermaid';

export default function ZoomableMermaid({ value }) {
    const containerRef = useRef(null);
    const [scale, setScale] = useState(1);
    const [position, setPosition] = useState({ x: 0, y: 0 });
    const [isDragging, setIsDragging] = useState(false);
    const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

    const handleWheel = useCallback((e) => {
        e.preventDefault();
        const delta = e.deltaY > 0 ? 0.9 : 1.1;
        setScale(prev => Math.min(Math.max(0.5, prev * delta), 3));
    }, []);

    const handleMouseDown = useCallback((e) => {
        setIsDragging(true);
        setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
    }, [position]);

    const handleMouseMove = useCallback((e) => {
        if (!isDragging) return;
        setPosition({
            x: e.clientX - dragStart.x,
            y: e.clientY - dragStart.y
        });
    }, [isDragging, dragStart]);

    const handleMouseUp = useCallback(() => {
        setIsDragging(false);
    }, []);

    const resetView = useCallback(() => {
        setScale(1);
        setPosition({ x: 0, y: 0 });
    }, []);

    return (
        <div style={{ marginBottom: '1rem' }}>
            <div style={{ 
                display: 'flex', 
                gap: '0.5rem', 
                marginBottom: '0.5rem',
                alignItems: 'center'
            }}>
                <button
                    onClick={() => setScale(s => Math.min(s * 1.2, 3))}
                    style={{
                        padding: '4px 12px',
                        background: 'var(--tg-charcoal, #1a1a1a)',
                        border: '1px solid var(--tg-gold-dim, #8a6d1c)',
                        borderRadius: '4px',
                        color: 'var(--tg-parchment, #e8e6e3)',
                        cursor: 'pointer'
                    }}
                >
                    +
                </button>
                <button
                    onClick={() => setScale(s => Math.max(s * 0.8, 0.5))}
                    style={{
                        padding: '4px 12px',
                        background: 'var(--tg-charcoal, #1a1a1a)',
                        border: '1px solid var(--tg-gold-dim, #8a6d1c)',
                        borderRadius: '4px',
                        color: 'var(--tg-parchment, #e8e6e3)',
                        cursor: 'pointer'
                    }}
                >
                    -
                </button>
                <button
                    onClick={resetView}
                    style={{
                        padding: '4px 12px',
                        background: 'var(--tg-charcoal, #1a1a1a)',
                        border: '1px solid var(--tg-gold-dim, #8a6d1c)',
                        borderRadius: '4px',
                        color: 'var(--tg-parchment, #e8e6e3)',
                        cursor: 'pointer'
                    }}
                >
                    Reset
                </button>
                <span style={{ 
                    fontSize: '12px', 
                    color: 'var(--tg-parchment-dim, #b0aba5)' 
                }}>
                    {Math.round(scale * 100)}% | Drag to pan, scroll to zoom
                </span>
            </div>
            <div
                ref={containerRef}
                onWheel={handleWheel}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
                style={{
                    overflow: 'hidden',
                    border: '1px solid var(--tg-border, #3a3a3a)',
                    borderRadius: '8px',
                    background: 'var(--tg-black, #0d0d0d)',
                    cursor: isDragging ? 'grabbing' : 'grab',
                    minHeight: '300px',
                    maxHeight: '600px'
                }}
            >
                <div
                    style={{
                        transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
                        transformOrigin: 'center center',
                        transition: isDragging ? 'none' : 'transform 0.1s ease-out',
                        padding: '1rem'
                    }}
                >
                    <Mermaid value={value} />
                </div>
            </div>
        </div>
    );
}
