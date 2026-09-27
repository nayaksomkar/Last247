// app/api/news/route.ts

import { NextResponse } from "next/server";

export async function GET() {
  try {
    const apiKey = process.env.NEWS_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        { error: "NEWS_API_KEY is not configured" },
        { status: 500 }
      );
    }

    const url = new URL(
      "https://newsapi.org/v2/top-headlines"
    );

    url.searchParams.set("language", "en");
    url.searchParams.set("pageSize", "20");
    url.searchParams.set("apiKey", apiKey);

    const response = await fetch(url.toString(), {
      next: {
        revalidate: 900,
      },
    });

    if (!response.ok) {
      throw new Error("Failed to fetch news");
    }

    const data = await response.json();

    return NextResponse.json(data);
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { error: "Unable to fetch news" },
      { status: 500 }
    );
  }
}