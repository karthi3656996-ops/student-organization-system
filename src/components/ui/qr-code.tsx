"use client";

import React, { useEffect, useState } from "react";
import QRCode from "qrcode";

interface QRCodeDisplayProps {
  value: string;
  size?: number;
  className?: string;
  title?: string;
}

export const QRCodeDisplay: React.FC<QRCodeDisplayProps> = ({
  value,
  size = 140,
  className = "",
  title,
}) => {
  const [dataUrl, setDataUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!value) return;
    let isMounted = true;
    QRCode.toDataURL(value, {
      width: size,
      margin: 1,
      color: {
        dark: "#1E3A8A",
        light: "#FFFFFF",
      },
    })
      .then((url) => {
        if (isMounted) setDataUrl(url);
      })
      .catch((err) => {
        console.error("QR Code generation error:", err);
      });

    return () => {
      isMounted = false;
    };
  }, [value, size]);

  if (!dataUrl) {
    return (
      <div
        style={{ width: size, height: size }}
        className={`bg-slate-100 rounded-xl animate-pulse flex items-center justify-center text-[10px] text-slate-400 ${className}`}
      >
        Generating QR...
      </div>
    );
  }

  return (
    <div className={`inline-flex flex-col items-center bg-white p-2.5 rounded-xl border border-slate-200 shadow-sm ${className}`}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={dataUrl}
        alt={title || `QR Code for ${value}`}
        width={size}
        height={size}
        className="rounded-lg block"
      />
      {title && <span className="text-[10px] font-mono text-slate-500 mt-1 truncate max-w-[150px]">{title}</span>}
    </div>
  );
};
