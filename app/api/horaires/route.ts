import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const dayOrder = ["LUNDI", "MARDI", "MERCREDI", "JEUDI", "VENDREDI", "SAMEDI", "DIMANCHE"];

export async function GET() {
  const horaires = await prisma.openingHours.findMany();
  horaires.sort((a, b) => dayOrder.indexOf(a.day) - dayOrder.indexOf(b.day));
  return NextResponse.json(horaires);
}
