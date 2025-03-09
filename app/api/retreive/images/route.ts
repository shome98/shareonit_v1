import { NextResponse } from "next/server"
import  prisma  from "@/lib/prisma";

export async function GET() {
    try {
        const videos = await prisma.image.findMany({
            orderBy: { createdAt: "desc" }
        })
        return NextResponse.json(videos)
    } catch (error) {
        console.error("😵Error fetching imagess: ", error);
        return NextResponse.json({ error: "😵Error fetching images." }, { status: 500 })
    }
}