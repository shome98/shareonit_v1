/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from 'next/server';
import { v2 as cloudinary } from 'cloudinary';
import { auth } from '@clerk/nextjs/server';
//import prisma from '@/lib/prisma';


cloudinary.config({
    cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

interface CloudinaryUploadResult {
    public_id: string;
    [key: string]: any;
    bytes: number;
    format: string;
}

export async function POST(request: NextRequest) {
    const { userId } = await auth();

    if (!userId) {
        return NextResponse.json({error: "😠Unauthorized"}, {status: 401})
    }

    try {
        const formData = await request.formData();
        const file = formData.get("file") as File | null;
        // const title = formData.get("title") as string;
        // const description = formData.get("description") as string;
        // const originalSize = formData.get("originalSize") as string;

        if(!file){
            return NextResponse.json({error: "🚫File not found"}, {status: 400})
        }

        const bytes = await file.arrayBuffer()
        const buffer = Buffer.from(bytes)

        const result = await new Promise<CloudinaryUploadResult>(
            (resolve, reject) => {
                const uploadStream = cloudinary.uploader.upload_stream(
                    { folder: "next-cloudinary-uploads" },
                    (error, result) => {
                        if (error) reject(error);
                        else resolve(result as CloudinaryUploadResult);
                    }
                )
                uploadStream.end(buffer)
            }
        );

        // const image = await prisma.image.create({
        //     data: {
        //         title,
        //         description,
        //         publicId: result.public_id,
        //         originalSize: originalSize,
        //         compressedSize: String(result.bytes),
        //         format: result.format,
        //         userId: userId, // Associate the image with the user
        //     },
        // });
        // return NextResponse.json(image);
        return NextResponse.json({ publicId: result.public_id }, { status: 200 });

    } catch (error) {
        console.error("😵Failed to upload the image: ", error);
        return NextResponse.json({ error: "😵Failed to upload the image." }, { status: 500 });
    }

}