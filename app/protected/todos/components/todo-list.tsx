"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { deleteTodo, toggleTodoComplete, updateTodo } from "../actions";
import { Pencil, Trash2, X, Check } from "lucide-react";
import { useState, useTransition } from "react";
import { TodoForm } from "./todo-form";
import useSWR, { mutate } from "swr";
import { fetcher } from "@/lib/fetcher";
import { Todo } from "../types";

export function TodoList() {
  const {
    data: todos = [],
    error,
    isLoading,
  } = useSWR<Todo[]>("/api/todos", fetcher);
  const [isPending, startTransition] = useTransition();
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editTitle, setEditTitle] = useState("");

  const handleToggleComplete = (id: number, completed: boolean) => {
    startTransition(async () => {
      const result = await toggleTodoComplete(id, completed);
      if (result.success) {
        mutate("/api/todos");
      }
    });
  };

  const handleStartEdit = (todo: Todo) => {
    setEditingId(todo.id);
    setEditTitle(todo.title);
  };

  const handleSaveEdit = (id: number) => {
    if (!editTitle.trim()) return;

    const todo = todos.find((t) => t.id === id);
    if (!todo) return;

    startTransition(async () => {
      const formData = new FormData();
      formData.append("title", editTitle);
      formData.append("completed", todo.completed.toString());

      const result = await updateTodo(id, formData);
      if (result.success) {
        setEditingId(null);
        setEditTitle("");
        mutate("/api/todos");
      }
    });
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditTitle("");
  };

  const handleDelete = (id: number) => {
    if (!confirm("このTodoを削除しますか？")) return;

    startTransition(async () => {
      const result = await deleteTodo(id);
      if (result.success) {
        mutate("/api/todos");
      }
    });
  };

  if (isLoading) {
    return <div>読み込み中...</div>;
  }

  if (error) {
    return <div>エラーが発生しました: {error.message}</div>;
  }

  return (
    <div className="space-y-6">
      <div className="bg-card p-6 rounded-lg border">
        <h2 className="text-lg font-semibold mb-4">新しいTodoを追加</h2>
        <TodoForm onSuccess={() => mutate("/api/todos")} />
      </div>

      <div className="space-y-4">
        <h2 className="text-lg font-semibold">Todo一覧</h2>
        {todos.length === 0 ? (
          <p className="text-muted-foreground">Todoがありません</p>
        ) : (
          <div className="space-y-2">
            {todos.map((todo) => (
              <div
                key={todo.id}
                className="flex items-center space-x-3 p-4 bg-card rounded-lg border"
              >
                <Checkbox
                  checked={todo.completed}
                  disabled={isPending}
                  onCheckedChange={() =>
                    handleToggleComplete(todo.id, todo.completed)
                  }
                />

                <div className="flex-1">
                  {editingId === todo.id ? (
                    <Input
                      value={editTitle}
                      disabled={isPending}
                      onChange={(e) => setEditTitle(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          handleSaveEdit(todo.id);
                        } else if (e.key === "Escape") {
                          handleCancelEdit();
                        }
                      }}
                      autoFocus
                    />
                  ) : (
                    <span
                      className={`${
                        todo.completed
                          ? "line-through text-muted-foreground"
                          : ""
                      }`}
                    >
                      {todo.title}
                    </span>
                  )}
                </div>

                <div className="flex space-x-2">
                  {editingId === todo.id ? (
                    <>
                      <Button
                        size="sm"
                        variant="ghost"
                        disabled={isPending}
                        onClick={() => handleSaveEdit(todo.id)}
                        data-testid="save-button"
                      >
                        <Check size={16} />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        disabled={isPending}
                        onClick={handleCancelEdit}
                      >
                        <X size={16} />
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button
                        size="sm"
                        variant="ghost"
                        disabled={isPending}
                        onClick={() => handleStartEdit(todo)}
                        data-testid="edit-button"
                      >
                        <Pencil size={16} />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        disabled={isPending}
                        onClick={() => handleDelete(todo.id)}
                        data-testid="delete-button"
                      >
                        <Trash2 size={16} />
                      </Button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
