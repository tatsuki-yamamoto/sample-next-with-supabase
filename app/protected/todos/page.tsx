import { TodoList } from "./components/todo-list";
import { createProtectedPageMetadata } from "../metadata";

export const metadata = createProtectedPageMetadata({
  title: "Todo管理",
  description: "Todoタスクの作成・編集・削除・完了状態の管理ができます",
  keywords: ["todo", "タスク", "管理", "タスク管理"],
});

export default function TodosPage() {
  return (
    <div className="w-full max-w-4xl">
      <h1 className="text-2xl font-bold mb-8">Todo管理</h1>
      <TodoList />
    </div>
  );
}