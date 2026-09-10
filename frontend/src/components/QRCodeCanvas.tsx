import React, { useRef } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import type { QRStyleConfig } from '../types';
import { Download, Sparkles } from 'lucide-react';

interface QRCodeCanvasProps {
  value: string;
  styleConfig: QRStyleConfig;
  size?: number;
  showDownload?: boolean;
}

export const QRCodeCanvas: React.FC<QRCodeCanvasProps> = ({
  value,
  styleConfig,
  size = 240,
  showDownload = true
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  const {
    fgColor = '#0f172a',
    bgColor = '#ffffff',
    frameStyle = 'bottom-bar',
    frameText = 'SCAN ME',
    frameColor = '#6366f1',
    logoUrl,
    logoSize = 40
  } = styleConfig;

  const downloadPNG = () => {
    if (!containerRef.current) return;
    const svgElement = containerRef.current.querySelector('svg');
    if (!svgElement) return;

    // Fixed high-resolution export dimensions independent of thumbnail size prop
    const exportQRSize = 800;
    const innerPadding = 60;
    const whiteBoxSize = exportQRSize + innerPadding * 2; // 920px

    const framePadding = frameStyle !== 'none' ? 60 : 0;
    const badgeBarHeight = frameStyle !== 'none' ? 100 : 0;

    const exportWidth = frameStyle !== 'none' ? whiteBoxSize + framePadding * 2 : whiteBoxSize; // 1040px
    const exportHeight = frameStyle !== 'none' ? whiteBoxSize + framePadding * 2 + badgeBarHeight : whiteBoxSize; // 1140px

    // Extract SVG string and force width/height to exportQRSize
    let svgString = new XMLSerializer().serializeToString(svgElement);
    svgString = svgString
      .replace(/width="[^"]*"/, `width="${exportQRSize}"`)
      .replace(/height="[^"]*"/, `height="${exportQRSize}"`);

    const canvas = document.createElement('canvas');
    canvas.width = exportWidth;
    canvas.height = exportHeight;
    const ctx = canvas.getContext('2d');
    const img = new Image();

    img.onload = () => {
      if (!ctx) return;

      // 1. Draw outer frame card background if frame is enabled
      if (frameStyle !== 'none') {
        ctx.fillStyle = frameColor || '#6366f1';
        ctx.beginPath();
        if (typeof ctx.roundRect === 'function') {
          ctx.roundRect(0, 0, exportWidth, exportHeight, 36);
        } else {
          ctx.rect(0, 0, exportWidth, exportHeight);
        }
        ctx.fill();
      }

      // 2. Draw inner white box
      const boxX = frameStyle !== 'none' ? framePadding : 0;
      const boxY = frameStyle === 'top-bar' ? framePadding + badgeBarHeight : (frameStyle !== 'none' ? framePadding : 0);

      ctx.fillStyle = bgColor || '#ffffff';
      ctx.beginPath();
      if (typeof ctx.roundRect === 'function') {
        ctx.roundRect(boxX, boxY, whiteBoxSize, whiteBoxSize, 24);
      } else {
        ctx.rect(boxX, boxY, whiteBoxSize, whiteBoxSize);
      }
      ctx.fill();

      // 3. Draw QR SVG image scaled to exportQRSize inside white box
      const qrX = boxX + innerPadding;
      const qrY = boxY + innerPadding;
      ctx.drawImage(img, qrX, qrY, exportQRSize, exportQRSize);

      // 4. Draw frame text badge ("SCAN ME") if frame is enabled
      if (frameStyle !== 'none') {
        ctx.fillStyle = '#ffffff';
        ctx.font = "800 40px 'Plus Jakarta Sans', sans-serif";
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        const textY = frameStyle === 'top-bar'
          ? framePadding + badgeBarHeight / 2
          : exportHeight - framePadding / 2 - badgeBarHeight / 4;

        ctx.fillText((frameText || 'SCAN ME').toUpperCase(), exportWidth / 2, textY);
      }

      const pngUrl = canvas.toDataURL('image/png');
      const downloadLink = document.createElement('a');
      downloadLink.href = pngUrl;
      downloadLink.download = `qrfy_${Date.now()}.png`;
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
    };

    img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgString)));
  };

  const downloadSVG = () => {
    if (!containerRef.current) return;
    const svgElement = containerRef.current.querySelector('svg');
    if (!svgElement) return;

    let svgData = new XMLSerializer().serializeToString(svgElement);
    const blob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const downloadLink = document.createElement('a');
    downloadLink.href = url;
    downloadLink.download = `qrfy_${Date.now()}.svg`;
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex flex-col items-center gap-4">
      {/* Outer Styled Container / Frame */}
      <div
        ref={containerRef}
        style={{
          backgroundColor: frameStyle !== 'none' ? frameColor : 'transparent',
          padding: frameStyle !== 'none' ? '20px 20px 24px 20px' : '0px',
          borderRadius: '24px',
          boxShadow: frameStyle !== 'none' ? '0 15px 35px rgba(0,0,0,0.3)' : 'none',
          display: 'inline-flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '12px',
          transition: 'all 0.3s ease'
        }}
      >
        {/* Top Bar Frame text */}
        {frameStyle === 'top-bar' && (
          <div
            style={{
              color: '#ffffff',
              fontWeight: 800,
              fontSize: '1rem',
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <Sparkles size={16} /> {frameText || 'SCAN ME'}
          </div>
        )}

        {/* QR Code Canvas Base */}
        <div
          style={{
            backgroundColor: bgColor,
            padding: '16px',
            borderRadius: '16px',
            boxShadow: '0 4px 15px rgba(0,0,0,0.1)'
          }}
        >
          <QRCodeSVG
            value={value || 'https://qrfy.com'}
            size={size}
            bgColor={bgColor}
            fgColor={fgColor}
            level="H"
            marginSize={1}
            imageSettings={
              logoUrl
                ? {
                    src: logoUrl,
                    x: undefined,
                    y: undefined,
                    height: logoSize,
                    width: logoSize,
                    excavate: true
                  }
                : undefined
            }
          />
        </div>

        {/* Bottom Bar Frame text */}
        {(frameStyle === 'bottom-bar' || frameStyle === 'box') && (
          <div
            style={{
              color: '#ffffff',
              fontWeight: 800,
              fontSize: '1rem',
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <Sparkles size={16} /> {frameText || 'SCAN ME'}
          </div>
        )}
      </div>

      {/* Quick Download Buttons */}
      {showDownload && (
        <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
          <button className="btn btn-primary btn-sm" onClick={downloadPNG}>
            <Download size={14} /> PNG Export
          </button>
          <button className="btn btn-secondary btn-sm" onClick={downloadSVG}>
            <Download size={14} /> SVG Vector
          </button>
        </div>
      )}
    </div>
  );
};
