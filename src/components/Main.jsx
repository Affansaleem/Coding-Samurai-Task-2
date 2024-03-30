import { useState, useEffect } from "react";

function Main() {
  const [todos, setTodos] = useState(() => {
    const storedTodos = JSON.parse(localStorage.getItem("todos"));
    return storedTodos || [];
  });
  const [inputValue, setInputValue] = useState("");
  const [inputDescription, setInputDescription] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [editingIndex, setEditingIndex] = useState(null);
  const [sortBy, setSortBy] = useState("default");
  const [filterBy, setFilterBy] = useState("all");

  useEffect(() => {
    fetch("http://localhost:5122/api/Todos")
      .then((response) => response.json())
      .then((data) => {
        setTodos(data);
      })
      .catch((error) => {
        // Handle error
        console.error("Error fetching todos:", error);
      });
  }, []);

  useEffect(() => {
    localStorage.setItem("todos", JSON.stringify(todos));
  }, [todos]);

  const addTodo = () => {
    if (inputValue.trim() !== "") {
      const newTodo = {
        title: inputValue,
        description: inputDescription,
      };

      fetch("http://localhost:5122/api/Todos", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newTodo),
      })
        .then((response) => response.json())
        .then((data) => {
          setTodos([...todos, data]);
          setInputValue("");
          setInputDescription("");
        })
        .catch((error) => {
          console.error("Error adding todo:", error);
        });
    }
  };

  const removeTodo = (todo) => {
    fetch(`http://localhost:5122/api/Todos/${todo.id}`, {
      method: "DELETE",
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Failed to delete todo");
        }
        // Remove the todo from the state
        const updatedTodos = todos.filter((t) => t.id !== todo.id);
        setTodos(updatedTodos);
      })
      .catch((error) => {
        console.error("Error deleting todo:", error);
      });
  };

  const handleCheckboxToggle = (index) => {
    const updatedTodos = [...todos];
    updatedTodos[index] = {
      ...updatedTodos[index],
      completed: !updatedTodos[index].completed,
    };
    setTodos(updatedTodos);
  };

  const handleEdit = (index) => {
    setEditingIndex(index);
    setInputValue(todos[index].title);
    setInputDescription(todos[index].description);
    setIsEditing(true);
  };

  const handleSaveEdit = () => {
    if (inputValue.trim() !== "") {
      const updatedTodo = {
        ...todos[editingIndex],
        title: inputValue,
        description: inputDescription,
      };

      fetch(`http://localhost:5122/api/Todos/${updatedTodo.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updatedTodo),
      })
        .then((response) => response.json())
        .then((data) => {
          const updatedTodos = [...todos];
          updatedTodos[editingIndex] = data;
          setTodos(updatedTodos);
          setInputValue("");
          setInputDescription("");
          setIsEditing(false);
          setEditingIndex(null);
        })
        .catch((error) => {
          console.error("Error updating todo:", error);
        });
    }
  };

  const sortedTodos = todos.slice().sort((a, b) => {
    if (sortBy === "high") {
      return a.priority - b.priority;
    } else if (sortBy === "low") {
      return b.priority - a.priority;
    }
    return 0;
  });

  const filteredTodos = sortedTodos.filter((todo) => {
    if (filterBy === "pending") {
      return !todo.completed;
    } else if (filterBy === "approved") {
      return todo.completed;
    }
    return true;
  });
  console.log(filteredTodos);

  return (
    <main className="container mx-auto py-8 flex-grow">
      <div className="flex items-center justify-center h-full">
        <div className="max-w-md">
          <div className="flex mb-4 gap-2">
            <input
              required
              type="text"
              className="border-0 w-52 px-2 rounded-full focus:outline-none focus:ring-4 focus:ring-orange-500 focus:border-transparent"
              placeholder="Add title"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
            />
            <input
              required
              type="text"
              className="border-0 w-52 px-2 rounded-full focus:outline-none focus:ring-4 focus:ring-orange-500 focus:border-transparent"
              placeholder="Add description"
              value={inputDescription}
              onChange={(e) => setInputDescription(e.target.value)}
            />
            {isEditing ? (
              <button
                className="bg-orange-500 hover:bg-white hover:text-orange-500 transition-all text-white px-4 py-2 ml-2 rounded"
                onClick={handleSaveEdit}
              >
                Update
              </button>
            ) : (
              <button
                className="bg-orange-500 hover:bg-white hover:text-orange-500 transition-all text-white px-4 py-2 ml-2 rounded"
                onClick={addTodo}
              >
                Add
              </button>
            )}
          </div>
          <div className="flex mb-4 gap-2">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="text-sm border-0 rounded-full bg-gray-700 text-white focus:outline-none focus:ring-1 focus:ring-white focus:border-transparent p-2"
            >
              <option value="default">Sort by Priority</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
            <select
              value={filterBy}
              onChange={(e) => setFilterBy(e.target.value)}
              className="text-sm border-0 rounded-full bg-gray-700 text-white focus:outline-none focus:ring-1 focus:ring-white focus:border-transparent p-2"
            >
              <option value="all">Show All</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
            </select>
          </div>
          <div className={`flex ${filteredTodos.length > 0 ? "border-2" : ""}`}>
            {filteredTodos.length > 0 ? (
              <ul className="bg-gray-800 max-w-lg w-full">
                {filteredTodos.map((todo, index) => (
                  <li
                    key={index}
                    className={`py-4 text-lg border-b border-gray-300`}
                    onClick={() => handleEdit(index)}
                  >
                    <div className="flex justify-between items-center">
                      <div className="mx-3">
                        <h3
                          className={`text-xl font-bold text-orange-500 ${
                            todo.completed && "text-gray-400 line-through"
                          }`}
                        >
                          {todo.title}
                        </h3>
                        <p
                          className={`text-sm text-orange-200 ${
                            todo.completed && "text-gray-400 line-through"
                          }`}
                        >
                          {todo.description}
                        </p>
                      </div>
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          checked={todo.completed}
                          onChange={() => handleCheckboxToggle(index)}
                          className="mr-2"
                        />
                        <button
                          className="text-red-500 text-sm rounded-full border-2 p-2 hover:bg-red-200 hover:text-red-500 hover:font-light transition-all"
                          onClick={(e) => {
                            e.stopPropagation();
                            removeTodo(todo);
                          }}
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="bg-gray-600 rounded-full p-2 flex justify-center items-center w-full h-full">
                <p className="font-semibold text-white text-2xl">
                  No Todo found!
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}

export default Main;
