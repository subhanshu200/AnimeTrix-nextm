import { connect } from "@/database/db";
import { getDataFromJwt } from "@/helper/jwtData";
import User from "@/model/user.model";
import { Error } from "@/types/ErrorTypes";
import { NextRequest, NextResponse } from "next/server";

connect();

type Bookmark = {
    bookmark: string;
    animeId: number;
};
export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const Page = parseInt(searchParams.get("page") ?? "1", 10);
    const limit = 12;
    try {
        const userId = getDataFromJwt(request);
        const user = await User.findOne({ _id: userId }).select("-password");
        if (!user) {
            return NextResponse.json(
                {
                    error: "User not found",
                },
                {
                    status: 401,
                },
            );
        }

        const startIndex = (Page - 1) * limit;
        const endIndex = Page * limit;

        const bookmarks = user.bookmarks.slice(startIndex, endIndex);

        const paginatedResult = {
            nextPage: user.bookmarks.length > endIndex ? true : false,
            bookmarks,
        };
        return NextResponse.json({
            userBookmarks: paginatedResult,
            page: Page,
        });
    } catch (error: unknown) {
        const Error = error as Error;
        return NextResponse.json({
            error: Error.message || "Error fetching bookmark",
        });
    }
}
export async function POST(request: NextRequest) {
    try {
        const reqBody = await request.json();
        const userId = getDataFromJwt(request);
        const { animeId, image, title } = reqBody;
        const user = await User.findOne({ _id: userId }).select("-password");
        if (!user) {
            return NextResponse.json(
                {
                    error: "User not found",
                },
                {
                    status: 401,
                },
            );
        }
        const existingBookmark = user.bookmarks.find((bookmark: Bookmark) => bookmark.animeId == animeId);
        if (existingBookmark) {
            return NextResponse.json(
                {
                    error: "Anime already bookmarked",
                },
                {
                    status: 400,
                },
            );
        }
        user.bookmarks.push({
            animeId,
            image,
            title,
        });
        await user.save();
        return NextResponse.json(
            {
                message: "Added to bookmark",
            },
            {
                status: 200,
            },
        );
    } catch (error: unknown) {
        const Error = error as Error;
        return NextResponse.json(
            {
                error: Error.message || "Error saving bookmark",
            },
            {
                status: 401,
            },
        );
    }
}

export async function DELETE(request: NextRequest) {
    try {
        const userId = getDataFromJwt(request);
        const user = await User.findOne({ _id: userId }).select("-password");
        if (!user) {
            return NextResponse.json(
                {
                    error: "User not found",
                },
                {
                    status: 401,
                },
            );
        }
        const reqBody = await request.json();
        const { animeId } = reqBody;
        const existingBookmarkIndex = user.bookmarks.findIndex((bookmark: Bookmark) => bookmark.animeId === animeId);
        if (existingBookmarkIndex === -1) {
            return NextResponse.json(
                {
                    error: "Anime not found in bookmark list",
                },
                {
                    status: 400,
                },
            );
        }
        user.bookmarks.splice(existingBookmarkIndex, 1);
        await user.save();
        return NextResponse.json(
            {
                message: "Bookmark removed",
            },
            {
                status: 200,
            },
        );
    } catch (error: unknown) {
        const Error = error as Error;
        return NextResponse.json(
            {
                error: Error.message || "Error deleting bookmark",
            },
            {
                status: 400,
            },
        );
    }
}
