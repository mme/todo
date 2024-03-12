"use client";

/**
 *
 * 1) Import the CopilotKit components
 *
 **/

import {
  CopilotKit,
  useCopilotAction,
  useMakeCopilotReadable,
} from "@copilotkit/react-core";
import { CopilotPopup } from "@copilotkit/react-ui";
import "@copilotkit/react-ui/styles.css";

import { nanoid } from "nanoid";
import { useState } from "react";

export default function Home() {
  return (
    <div className="border rounded-md max-w-2xl mx-auto p-4">
      <h1 className="text-2xl font-bold ">Hello CopilotKit 🪁</h1>
      <h2 className="text-base font-base mb-4">Todo List Example</h2>

      {/**
       *
       * 2) Wrap the TodoList component with CopilotKit
       *
       **/}

      <CopilotKit url="/api/copilotkit/">
        <TodoList />

        {/**
         *
         * 3) Add the CopilotPopup component to get the chat
         *
         */}

        <CopilotPopup
          instructions={
            "Help the user manage a todo list. If the user provides a high level goal, " +
            "break it down into a few specific tasks and add them to the list"
          }
          defaultOpen={true}
          labels={{
            title: "Todo List Copilot",
            initial: "Hi you! 👋 I can help you manage your todo list.",
          }}
          clickOutsideToClose={false}
        />
      </CopilotKit>
    </div>
  );
}

const TodoList: React.FC = () => {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [input, setInput] = useState("");

  /**
   *
   * 4) make the users todo list available with useMakeCopilotReadable
   *
   **/
  useMakeCopilotReadable(
    "This is the user's todo list: " + JSON.stringify(todos)
  );

  /**
   *
   * 5) Add the useCopilotAction to enable the copilot to interact with the todo list
   *
   **/

  useCopilotAction({
    name: "updateTodoList",
    description: "Update the users todo list",
    parameters: [
      {
        name: "items",
        type: "object[]",
        description: "The new and updated todo list items.",
        attributes: [
          {
            name: "id",
            type: "string",
            description:
              "The id of the todo item. When creating a new todo item, just make up a new id.",
          },
          {
            name: "text",
            type: "string",
            description: "The text of the todo item.",
          },
          {
            name: "isCompleted",
            type: "boolean",
            description: "The completion status of the todo item.",
          },
          {
            name: "assignedTo",
            type: "string",
            description:
              "The person assigned to the todo item. If you don't know, assign it to 'YOU'.",
            required: true,
          },
        ],
      },
    ],
    handler: ({ items }) => {
      console.log(items);
      const newTodos = [...todos];
      for (const item of items) {
        const existingItemIndex = newTodos.findIndex(
          (todo) => todo.id === item.id
        );
        if (existingItemIndex !== -1) {
          newTodos[existingItemIndex] = item;
        } else {
          newTodos.push(item);
        }
      }
      setTodos(newTodos);
    },
    render: "Updating the todo list...",
  });

  /**
   *
   * 5) Add another useCopilotAction to enable the copilot to delete a todo item
   *
   **/
  useCopilotAction({
    name: "deleteTodo",
    description: "Delete a todo item",
    parameters: [
      {
        name: "id",
        type: "string",
        description: "The id of the todo item to delete.",
      },
    ],
    handler: ({ id }) => {
      setTodos(todos.filter((todo) => todo.id !== id));
    },
    render: "Deleting a todo item...",
  });

  const addTodo = () => {
    if (input.trim() !== "") {
      // Check if input is not just whitespace
      const newTodo: Todo = {
        id: nanoid(),
        text: input.trim(), // Trim whitespace
        isCompleted: false,
      };
      setTodos([...todos, newTodo]);
      setInput(""); // Reset input field
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      addTodo();
    }
  };

  const toggleComplete = (id: string) => {
    setTodos(
      todos.map((todo) =>
        todo.id === id ? { ...todo, isCompleted: !todo.isCompleted } : todo
      )
    );
  };

  const deleteTodo = (id: string) => {
    setTodos(todos.filter((todo) => todo.id !== id));
  };

  const assignPerson = (id: string, person: string | null) => {
    setTodos(
      todos.map((todo) =>
        todo.id === id
          ? { ...todo, assignedTo: person ? person : undefined }
          : todo
      )
    );
  };

  return (
    <div>
      <div className="flex mb-4">
        <input
          className="border rounded-md p-2 flex-1 mr-2"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyPress} // Add this to handle the Enter key press
        />
        <button
          className="bg-blue-500 rounded-md p-2 text-white"
          onClick={addTodo}
        >
          Add Todo
        </button>
      </div>
      {todos.length > 0 && (
        <div className="border rounded-lg">
          {todos.map((todo, index) => (
            <TodoItem
              key={todo.id}
              todo={todo}
              toggleComplete={toggleComplete}
              deleteTodo={deleteTodo}
              assignPerson={assignPerson}
              hasBorder={index !== todos.length - 1}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export interface Todo {
  id: string;
  text: string;
  isCompleted: boolean;
  assignedTo?: string;
}

interface TodoItemProps {
  todo: Todo;
  toggleComplete: (id: string) => void;
  deleteTodo: (id: string) => void;
  assignPerson: (id: string, person: string | null) => void;
  hasBorder?: boolean;
}

const TodoItem: React.FC<TodoItemProps> = ({
  todo,
  toggleComplete,
  deleteTodo,
  assignPerson,
  hasBorder,
}) => {
  return (
    <div
      className={
        "flex items-center justify-between px-4 py-2 group" +
        (hasBorder ? " border-b" : "")
      }
    >
      <div className="flex items-center">
        <input
          className="h-5 w-5 text-blue-500"
          type="checkbox"
          checked={todo.isCompleted}
          onChange={() => toggleComplete(todo.id)}
        />
        <span
          className={`ml-2 text-sm ${
            todo.isCompleted ? "text-gray-500 line-through" : "text-gray-900"
          }`}
        >
          {todo.assignedTo && (
            <span className="border rounded-md text-xs py-[2px] px-1 mr-2  border-purple-700 uppercase bg-purple-400 text-black font-medium">
              {todo.assignedTo}
            </span>
          )}
          {todo.text}
        </span>
      </div>
      <div>
        <button
          onClick={() => deleteTodo(todo.id)}
          className="text-red-500 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="w-5 h-5"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0"
            />
          </svg>
        </button>
        <button
          onClick={() => {
            const name = prompt("Assign person to this task:");
            assignPerson(todo.id, name);
          }}
          className="ml-2 text-blue-500 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="w-5 h-5"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M18 7.5v3m0 0v3m0-3h3m-3 0h-3m-2.25-4.125a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0ZM3 19.235v-.11a6.375 6.375 0 0 1 12.75 0v.109A12.318 12.318 0 0 1 9.374 21c-2.331 0-4.512-.645-6.374-1.766Z"
            />
          </svg>
        </button>
      </div>
    </div>
  );
};
