import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const todos = await prisma.todo.findMany({
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(todos);
  } catch (error) {
    console.error("Failed to fetch todos:", error);
    return NextResponse.json(
      { error: "Todoの取得に失敗しました" },
      { status: 500 }
    );
  }
}