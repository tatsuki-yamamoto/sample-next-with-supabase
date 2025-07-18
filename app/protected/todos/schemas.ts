import { z } from "zod";

export const todoSchema = z.object({
  title: z.string().min(1, "タイトルは必須です").max(100, "タイトルは100文字以内で入力してください"),
  completed: z.boolean(),
});

export type TodoSchema = z.infer<typeof todoSchema>;

export const updateTodoSchema = z.object({
  id: z.number(),
  title: z.string().min(1, "タイトルは必須です").max(100, "タイトルは100文字以内で入力してください"),
  completed: z.boolean(),
});

export type UpdateTodoSchema = z.infer<typeof updateTodoSchema>;