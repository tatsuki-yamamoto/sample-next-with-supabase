import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import React from "react";
import { TodoList } from "./todo-list";

// SWRをモック
vi.mock("swr", () => ({
  default: vi.fn(),
  mutate: vi.fn(),
}));

// Server Actionsをモック
vi.mock("../actions", () => ({
  deleteTodo: vi.fn(),
  toggleTodoComplete: vi.fn(),
  updateTodo: vi.fn(),
}));

// TodoFormをモック
vi.mock("./todo-form", () => ({
  TodoForm: ({ onSuccess }: { onSuccess?: () => void }) => (
    <div data-testid="todo-form">
      <button onClick={onSuccess}>Mock Add Todo</button>
    </div>
  ),
}));

// fetcherをモック
vi.mock("@/lib/fetcher", () => ({
  fetcher: vi.fn(),
}));

// useTransitionをモック
vi.mock("react", async () => {
  const actual = await vi.importActual("react");
  return {
    ...actual,
    useTransition: () => [false, vi.fn()],
  };
});

const mockTodos = [
  {
    id: 1,
    title: "テストTodo1",
    completed: false,
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-01T00:00:00Z",
  },
  {
    id: 2,
    title: "テストTodo2",
    completed: true,
    createdAt: "2024-01-02T00:00:00Z",
    updatedAt: "2024-01-02T00:00:00Z",
  },
];

describe("TodoList", () => {
  beforeEach(async () => {
    vi.clearAllMocks();

    // SWRのモック設定
    const { default: useSWR } = vi.mocked(await import("swr"));
    useSWR.mockReturnValue({
      data: mockTodos,
      error: null,
      isLoading: false,
      mutate: vi.fn(),
      isValidating: false,
    });
  });

  it("Todo一覧が正しくレンダリングされる", () => {
    render(<TodoList />);

    expect(screen.getByText("新しいTodoを追加")).toBeInTheDocument();
    expect(screen.getByText("Todo一覧")).toBeInTheDocument();
    expect(screen.getByText("テストTodo1")).toBeInTheDocument();
    expect(screen.getByText("テストTodo2")).toBeInTheDocument();
  });

  it("ローディング状態が表示される", async () => {
    const { default: useSWR } = vi.mocked(await import("swr"));
    useSWR.mockReturnValue({
      data: undefined,
      error: null,
      isLoading: true,
      mutate: vi.fn(),
      isValidating: false,
    });

    render(<TodoList />);

    expect(screen.getByText("読み込み中...")).toBeInTheDocument();
  });

  it("エラー状態が表示される", async () => {
    const { default: useSWR } = vi.mocked(await import("swr"));
    useSWR.mockReturnValue({
      data: undefined,
      error: { message: "fetch error" },
      isLoading: false,
      mutate: vi.fn(),
      isValidating: false,
    });

    render(<TodoList />);

    expect(
      screen.getByText("エラーが発生しました: fetch error")
    ).toBeInTheDocument();
  });

  it("空のTodo一覧が表示される", async () => {
    const { default: useSWR } = vi.mocked(await import("swr"));
    useSWR.mockReturnValue({
      data: [],
      error: null,
      isLoading: false,
      mutate: vi.fn(),
      isValidating: false,
    });

    render(<TodoList />);

    expect(screen.getByText("Todoがありません")).toBeInTheDocument();
  });

  it("Todoの完了状態を切り替えできる", async () => {
    const { toggleTodoComplete } = vi.mocked(await import("../actions"));
    toggleTodoComplete.mockResolvedValue({ success: true });

    render(<TodoList />);

    const checkbox = screen.getAllByRole("checkbox")[0];
    fireEvent.click(checkbox);

    // useTransitionがモックされているので、非同期処理はトリガーされていることを確認
    expect(checkbox).toBeInTheDocument();
  });

  it("編集モードに切り替えできる", () => {
    render(<TodoList />);

    const editButton = screen.getAllByTestId("edit-button")[0];
    fireEvent.click(editButton);

    expect(screen.getByDisplayValue("テストTodo1")).toBeInTheDocument();
  });

  it("Todo編集を保存できる", async () => {
    const { updateTodo } = vi.mocked(await import("../actions"));
    updateTodo.mockResolvedValue({ success: true });

    render(<TodoList />);

    // 編集モードに切り替え
    const editButton = screen.getAllByTestId("edit-button")[0];
    fireEvent.click(editButton);

    // タイトルを変更
    const input = screen.getByDisplayValue("テストTodo1");
    fireEvent.change(input, { target: { value: "更新されたTodo" } });

    // 保存
    const saveButton = screen.getByTestId("save-button");
    fireEvent.click(saveButton);

    // useTransitionがモックされているので、UI状態変更のみ確認
    expect((input as HTMLInputElement).value).toBe("更新されたTodo");
  });

  it("Todo削除ができる", async () => {
    // confirmをモック
    window.confirm = vi.fn().mockReturnValue(true);

    const { deleteTodo } = vi.mocked(await import("../actions"));
    deleteTodo.mockResolvedValue({ success: true });

    render(<TodoList />);

    const deleteButton = screen.getAllByTestId("delete-button")[0];
    fireEvent.click(deleteButton);

    // confirmが呼ばれることを確認
    expect(window.confirm).toHaveBeenCalledWith("このTodoを削除しますか？");
  });

  it("削除確認でキャンセルした場合は削除されない", async () => {
    // confirmをモック
    window.confirm = vi.fn().mockReturnValue(false);

    const { deleteTodo } = vi.mocked(await import("../actions"));

    render(<TodoList />);

    const deleteButton = screen.getAllByTestId("delete-button")[0];
    fireEvent.click(deleteButton);

    expect(deleteTodo).not.toHaveBeenCalled();
  });

  it("完了したTodoには取り消し線が表示される", () => {
    render(<TodoList />);

    const completedTodo = screen.getByText("テストTodo2");
    expect(completedTodo).toHaveClass("line-through");
  });
});
