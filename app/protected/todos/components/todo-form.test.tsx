import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import React from "react";
import { TodoForm } from "./todo-form";

// Server Actionsをモック
vi.mock("../actions", () => ({
  createTodo: vi.fn(),
}));

// SubmitButtonをモック
vi.mock("@/components/submit-button", () => ({
  SubmitButton: ({ children, disabled, ...props }: any) => (
    <button disabled={disabled} {...props}>
      {children}
    </button>
  ),
}));

// useTransitionをモック
const mockStartTransition = vi.fn();
vi.mock("react", async () => {
  const actual = await vi.importActual("react");
  return {
    ...actual,
    useTransition: () => [false, mockStartTransition],
  };
});

describe("TodoForm", () => {
  const mockOnSuccess = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    mockStartTransition.mockImplementation((callback) => callback());
  });

  it("フォームが正しくレンダリングされる", () => {
    render(<TodoForm onSuccess={mockOnSuccess} />);

    expect(screen.getByLabelText("タイトル")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Todoのタイトルを入力")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "追加" })).toBeInTheDocument();
  });

  it("タイトル入力欄に値を入力できる", () => {
    render(<TodoForm onSuccess={mockOnSuccess} />);

    const titleInput = screen.getByLabelText("タイトル") as HTMLInputElement;
    fireEvent.change(titleInput, { target: { value: "新しいTodo" } });

    expect(titleInput.value).toBe("新しいTodo");
  });

  it("フォーム送信時にServer Actionが呼ばれる", async () => {
    const { createTodo } = vi.mocked(await import("../actions"));
    createTodo.mockResolvedValue({ success: true });

    render(<TodoForm onSuccess={mockOnSuccess} />);

    const titleInput = screen.getByLabelText("タイトル");
    const form = titleInput.closest('form')!;

    fireEvent.change(titleInput, { target: { value: "新しいTodo" } });
    fireEvent.submit(form);

    await waitFor(() => {
      expect(mockStartTransition).toHaveBeenCalled();
    });
  });

  it("成功時にonSuccessコールバックが呼ばれる", async () => {
    const { createTodo } = vi.mocked(await import("../actions"));
    createTodo.mockResolvedValue({ success: true });

    render(<TodoForm onSuccess={mockOnSuccess} />);

    const titleInput = screen.getByLabelText("タイトル");
    const form = titleInput.closest('form')!;

    fireEvent.change(titleInput, { target: { value: "新しいTodo" } });
    fireEvent.submit(form);

    await waitFor(() => {
      expect(mockOnSuccess).toHaveBeenCalled();
    });
  });

  it("エラー時にエラーメッセージが表示される", async () => {
    const { createTodo } = vi.mocked(await import("../actions"));
    createTodo.mockResolvedValue({ 
      success: false, 
      error: "エラーが発生しました" 
    });

    render(<TodoForm onSuccess={mockOnSuccess} />);

    const titleInput = screen.getByLabelText("タイトル");
    const form = titleInput.closest('form')!;

    fireEvent.change(titleInput, { target: { value: "新しいTodo" } });
    fireEvent.submit(form);

    await waitFor(() => {
      expect(screen.getByText("エラーが発生しました")).toBeInTheDocument();
    });
  });

  it("required属性が設定されている", () => {
    render(<TodoForm onSuccess={mockOnSuccess} />);

    const titleInput = screen.getByLabelText("タイトル");
    expect(titleInput).toHaveAttribute("required");
  });
});