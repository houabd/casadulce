import QRCodeClient from "@/components/admin/QRCodeClient";

export default function QRCodePage() {
  const menuUrl =
    process.env.NEXT_PUBLIC_APP_URL
      ? `${process.env.NEXT_PUBLIC_APP_URL}/menu`
      : "http://localhost:3000/menu";

  return (
    <div className="max-w-lg mx-auto">
      <h1 className="font-cormorant text-2xl font-semibold text-sage-800 mb-2">QR Code Menu</h1>
      <p className="text-sm text-gray-500 mb-8">
        Scanne ce QR code pour accéder directement au menu.
      </p>
      <QRCodeClient menuUrl={menuUrl} />
    </div>
  );
}
