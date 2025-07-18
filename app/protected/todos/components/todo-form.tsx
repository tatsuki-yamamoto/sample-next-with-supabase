"use client";

import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createTodo } from "../actions";
import { useTransition, useRef, useState } from "react";
import { SubmitButton } from "@/components/submit-button";

interface TodoFormProps {
  onSuccess?: () => void;
}

export function TodoForm({ onSuccess }: TodoFormProps) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const formRef = useRef<HTMLFormElement>(null);

  const handleSubmit = async (formData: FormData) => {
    setError(null);
    
    startTransition(async () => {
      try {
        const result = await createTodo({ success: false }, formData);
        
        if (result.success) {
          formRef.current?.reset();
          if (onSuccess) {
            onSuccess();
          }
        } else {
          setError(result.error || "エラーが発生しました");
        }
      } catch (err) {
        setError("エラーが発生しました");
      }
    });
  };

  return (
    <form 
      ref={formRef} 
      action={handleSubmit}
      className="space-y-4"
    >
      <input type="hidden" name="completed" value="false" />

      <div className="space-y-2">
        <Label htmlFor="title">タイトル</Label>
        <Input
          id="title"
          name="title"
          type="text"
          placeholder="Todoのタイトルを入力"
          disabled={isPending}
          required
        />
        {error && (
          <p className="text-sm text-red-500">{error}</p>
        )}
      </div>

      <SubmitButton disabled={isPending}>
        {isPending ? "処理中..." : "追加"}
      </SubmitButton>
    </form>
  );
}
