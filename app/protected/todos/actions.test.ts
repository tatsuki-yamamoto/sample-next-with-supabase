import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  createTodo,
  updateTodo,
  deleteTodo,
  toggleTodoComplete,
} from "./actions";

// Prismaをモック
vi.mock("@/lib/prisma", () => ({
  prisma: {
    todo: {
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
  },
}));

// revalidatePathをモック
vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}));

describe("Todo Actions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("createTodo", () => {
    it("成功時にTodoを作成できる", async () => {
      const { prisma } = await import("@/lib/prisma");
      const mockCreate = prisma.todo.create as any;
      mockCreate.mockResolvedValue({
        id: 1,
        title: "テストTodo",
        completed: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const formData = new FormData();
      formData.append("title", "テストTodo");
      formData.append("completed", "false");

      const result = await createTodo({ success: false }, formData);

      expect(result).toEqual({ success: true });
      expect(mockCreate).toHaveBeenCalledWith({
        data: {
          title: "テストTodo",
          completed: false,
        },
      });
    });

    it("エラー時にエラーメッセージを返す", async () => {
      const { prisma } = await import("@/lib/prisma");
      const mockCreate = prisma.todo.create as any;
      mockCreate.mockRejectedValue(new Error("Database error"));

      const formData = new FormData();
      formData.append("title", "テストTodo");
      formData.append("completed", "false");

      const result = await createTodo({ success: false }, formData);

      expect(result).toEqual({
        success: false,
        error: "Todoの作成に失敗しました",
      });
    });

    it("タイトルが空の場合にバリデーションエラーを返す", async () => {
      const formData = new FormData();
      formData.append("title", "");
      formData.append("completed", "false");

      const result = await createTodo({ success: false }, formData);

      expect(result).toEqual({
        success: false,
        error: "Todoの作成に失敗しました",
      });
    });
  });

  describe("updateTodo", () => {
    it("成功時にTodoを更新できる", async () => {
      const { prisma } = await import("@/lib/prisma");
      const mockUpdate = prisma.todo.update as any;
      mockUpdate.mockResolvedValue({
        id: 1,
        title: "更新されたTodo",
        completed: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const formData = new FormData();
      formData.append("title", "更新されたTodo");
      formData.append("completed", "true");

      const result = await updateTodo(1, formData);

      expect(result).toEqual({ success: true });
      expect(mockUpdate).toHaveBeenCalledWith({
        where: { id: 1 },
        data: {
          title: "更新されたTodo",
          completed: true,
        },
      });
    });
  });

  describe("deleteTodo", () => {
    it("成功時にTodoを削除できる", async () => {
      const { prisma } = await import("@/lib/prisma");
      const mockDelete = prisma.todo.delete as any;
      mockDelete.mockResolvedValue({});

      const result = await deleteTodo(1);

      expect(result).toEqual({ success: true });
      expect(mockDelete).toHaveBeenCalledWith({
        where: { id: 1 },
      });
    });
  });

  describe("toggleTodoComplete", () => {
    it("成功時にTodoの完了状態を切り替えできる", async () => {
      const { prisma } = await import("@/lib/prisma");
      const mockUpdate = prisma.todo.update as any;
      mockUpdate.mockResolvedValue({});

      const result = await toggleTodoComplete(1, false);

      expect(result).toEqual({ success: true });
      expect(mockUpdate).toHaveBeenCalledWith({
        where: { id: 1 },
        data: { completed: true },
      });
    });
  });
});
