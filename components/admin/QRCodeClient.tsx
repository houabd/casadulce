"use client";

import { useRef } from "react";
import { QRCodeCanvas } from "qrcode.react";

export default function QRCodeClient({ menuUrl }: { menuUrl: string }) {
  const canvasRef = useRef<HTMLDivElement>(null);

  function download() {
    const canvas = canvasRef.current?.querySelector("canvas");
    if (!canvas) return;
    const link = document.createElement("a");
    link.download = "qrcode-casadulce.png";
    link.href = canvas.toDataURL("image/png");
    link.click();
  }

  function print() {
    const canvas = canvasRef.current?.querySelector("canvas");
    if (!canvas) return;
    const dataUrl = canvas.toDataURL("image/png");
    const win = window.open("", "_blank");
    if (!win) return;
    win.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>QR Code — Casa Dulce</title>
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body {
              font-family: Georgia, serif;
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: center;
              min-height: 100vh;
              background: #fff;
              padding: 40px;
            }
            h1 { font-size: 2rem; color: #3d5a4d; margin-bottom: 4px; letter-spacing: 0.05em; }
            p  { font-size: 0.85rem; color: #888; margin-bottom: 28px; letter-spacing: 0.15em; text-transform: uppercase; }
            img { width: 260px; height: 260px; display: block; }
            .url { margin-top: 20px; font-size: 0.8rem; color: #aaa; }
            @media print {
              body { margin: 0; }
              button { display: none; }
            }
          </style>
        </head>
        <body>
          <h1>Casa Dulce</h1>
          <p>Crêpes · Desserts · Jus frais</p>
          <img src="${dataUrl}" alt="QR Code Menu" />
          <p class="url">${menuUrl}</p>
        </body>
      </html>
    `);
    win.document.close();
    win.focus();
    setTimeout(() => { win.print(); }, 500);
  }

  return (
    <div className="space-y-8">
      {/* QR Code */}
      <div className="bg-white rounded-2xl border border-sage-100 p-10 flex flex-col items-center gap-6 shadow-sm">
        <div ref={canvasRef}>
          <QRCodeCanvas
            value={menuUrl}
            size={220}
            bgColor="#ffffff"
            fgColor="#3d5a4d"
            level="H"
            imageSettings={{
              src: "/logocasadulce.png",
              height: 44,
              width: 44,
              excavate: true,
            }}
          />
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <button
          onClick={download}
          className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-sage-600 text-white text-sm rounded-xl hover:bg-sage-700 transition-colors font-medium"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
          Télécharger PNG
        </button>
        <button
          onClick={print}
          className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-white border border-sage-200 text-sage-700 text-sm rounded-xl hover:bg-sage-50 transition-colors font-medium"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
          </svg>
          Imprimer
        </button>
      </div>
    </div>
  );
}
