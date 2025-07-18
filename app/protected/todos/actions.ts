"use server";

import { prisma } from "@/lib/prisma";
import { todoSchema, updateTodoSchema } from "./schemas";
import { revalidatePath } from "next/cache";

export async function createTodo(
  prevState: { success: boolean; error?: string },
  formData: FormData
) {
  try {
    const title = formData.get("title") as string;
    const completed = formData.get("completed") === "true";

    const validatedData = todoSchema.parse({
      title,
      completed,
    });

    await prisma.todo.create({
      data: validatedData,
    });

    revalidatePath("/protected/todos");
    return { success: true };
  } catch (error) {
    if (process.env.NODE_ENV !== 'test') {
      console.error("Failed to create todo:", error);
    }
    return { success: false, error: "Todoの作成に失敗しました" };
  }
}

export async function updateTodo(id: number, formData: FormData) {
  try {
    const title = formData.get("title") as string;
    const completed = formData.get("completed") === "true";

    const validatedData = updateTodoSchema.parse({
      id,
      title,
      completed,
    });

    await prisma.todo.update({
      where: { id },
      data: {
        title: validatedData.title,
        completed: validatedData.completed,
      },
    });

    revalidatePath("/protected/todos");
    return { success: true };
  } catch (error) {
    if (process.env.NODE_ENV !== 'test') {
      console.error("Failed to update todo:", error);
    }
    return { success: false, error: "Todoの更新に失敗しました" };
  }
}

export async function deleteTodo(id: number) {
  try {
    await prisma.todo.delete({
      where: { id },
    });

    revalidatePath("/protected/todos");
    return { success: true };
  } catch (error) {
    if (process.env.NODE_ENV !== 'test') {
      console.error("Failed to delete todo:", error);
    }
    return { success: false, error: "Todoの削除に失敗しました" };
  }
}

export async function toggleTodoComplete(id: number, completed: boolean) {
  try {
    await prisma.todo.update({
      where: { id },
      data: { completed: !completed },
    });

    revalidatePath("/protected/todos");
    return { success: true };
  } catch (error) {
    if (process.env.NODE_ENV !== 'test') {
      console.error("Failed to toggle todo:", error);
    }
    return { success: false, error: "Todoの更新に失敗しました" };
  }
}