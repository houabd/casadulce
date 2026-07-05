import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import crypto from "crypto";

export async function POST(request: Request) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;

  if (!cloudName || !apiKey || !apiSecret) {
    return NextResponse.json({ error: "Cloudinary non configuré" }, { status: 503 });
  }

  const formData = await request.formData();
  const file = formData.get("file") as File | null;
  if (!file) return NextResponse.json({ error: "Fichier manquant" }, { status: 400 });

  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);
  const dataUrl = `data:${file.type};base64,${buffer.toString("base64")}`;

  // Génération manuelle de la signature Cloudinary
  const timestamp = Math.round(Date.now() / 1000);
  const folder = "casa-dulce/products";
  const signString = `folder=${folder}&timestamp=${timestamp}${apiSecret}`;
  const signature = crypto.createHash("sha1").update(signString).digest("hex");

  const fd = new FormData();
  fd.append("file", dataUrl);
  fd.append("api_key", apiKey);
  fd.append("timestamp", String(timestamp));
  fd.append("signature", signature);
  fd.append("folder", folder);

  const res = await fetch(
    `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
    { method: "POST", body: fd }
  );

  const body = await res.json();
  console.log("[UPLOAD] Cloudinary status:", res.status);
  console.log("[UPLOAD] Cloudinary body:", JSON.stringify(body));

  if (!res.ok) {
    return NextResponse.json({ error: body?.error?.message ?? "Erreur Cloudinary" }, { status: 500 });
  }

  return NextResponse.json({ url: body.secure_url });
}
