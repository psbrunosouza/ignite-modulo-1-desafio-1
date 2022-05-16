const express = require('express');
const cors = require('cors');

const { v4: uuidv4 } = require('uuid');

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  const { username } = request.headers;
  
  const userExists = users.find(user => {
    return user.username === username;
  })
  
  if(!userExists){
    return response.status(400).json({error: "User doesn't exists"});
  }
  
  request.user = userExists;
  
  return next();
}

app.post('/users', (request, response) => {
  const {name, username} = request.body;
  
  const user = {
    id: uuidv4(),
    name, 
    username,
    todos: []
  }
  
  const userAlreadyExists = users.find((user) => user.username === username);
  
  if(userAlreadyExists){
    return response.status(400).json({error: "User already exists!"})
  }
  
  users.push(user);
  
  return response.status(201).json(user);
});

app.get('/todos', checksExistsUserAccount, (request, response) => {
  const {user} = request;
  
  response.json(user.todos)
});

app.post('/todos', checksExistsUserAccount, (request, response) => {
  
  const todo = request.body;
  const {user} = request;
  
  const todoToBeCreated = {
    id: uuidv4(), 
    title: todo.title,
    done: false,
    deadline: new Date(todo.deadline),
    created_at: new Date()
  }

  user.todos.push(todoToBeCreated);
  
  return response.status(201).json(todoToBeCreated);
});

app.put('/todos/:id', checksExistsUserAccount, (request, response) => {
  const todo = request.body;
  const { id } = request.params;
  const {user} = request;

  const todoIndex = user.todos.findIndex((todo) => {
    return todo.id === id;
  });
  
  if(todoIndex === -1) {
    return response.status(404).json({error: "Todo doesn't exists!"})
  }
  
  user.todos[todoIndex] = {
    ...user.todos[todoIndex],
    deadline: todo.deadline,
    title: todo.title
  }
  
  return response.json(user.todos[todoIndex]);
});

app.patch('/todos/:id/done', checksExistsUserAccount, (request, response) => {
  const { id } = request.params;
  const {user} = request;

  const todoIndex = user.todos.findIndex((todo) => {
    return todo.id === id;
  });

  if(todoIndex === -1) {
    return response.status(404).json({error: "Todo doesn't exists!"})
  }

  user.todos[todoIndex].done = true;

  return response.json(user.todos[todoIndex]);
});

app.delete('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { id } = request.params;
  const {user} = request;

  const todoIndex = user.todos.findIndex((todo) => {
    return todo.id === id;
  });

  if(todoIndex === -1) {
    return response.status(404).json({error: "Todo doesn't exists!"})
  }

  user.todos.splice(todoIndex, 1);

  return response.status(204).send();
});

module.exports = app;