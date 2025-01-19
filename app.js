const express = require('express');
const app = express();
const cors = require('cors');
const cookieParser = require('cookie-parser');
const port = 5000;
const auth = require('./routes/auth');
const createtask = require('./routes/createtask');
const fetchtasks = require('./routes/fetchtasks');
const deletetask = require('./routes/deletetask');
const updatetask = require('./routes/updatetask');
const fetchuser = require('./routes/fetchuser');
const validatetoken = require('./routes/validate-token');
const fetchtask = require('./routes/fetchtask');
const taskgrantaccess = require('./routes/taskgrantaccess');
const addupdate = require('./routes/addupdate');
const editupdate = require('./routes/editupdate');
const deleteupdate = require('./routes/deleteupdate');
const getAiResponse = require('./routes/getAiResponse');
const incompleteTask = require('./routes/incompleteTask');
const completeTask = require('./routes/completeTask');
const requestAccess = require('./routes/requestAccess');
const taskdenyaccess = require('./routes/taskdenyaccess');
const breakTasksWithAI = require('./routes/breakTasksWithAi');
const emptyApi = require('./routes/emptyApi');

const loginRoute = require('./authRoutes/loginRoute');
const logoutRoute = require('./authRoutes/logoutRoute');
// const refreshTokenRoute = require('./authRoutes/refreshTokenRoute');
const refreshTokenRoute = require('./authRoutes/refreshTokenRoute');

require('dotenv').config();

// Add AI module
const generateAIResponse = require('./google_gen_ai/text_generation'); // Adjust the path as necessary

app.use(express.json());
//app.use(cors());
const allowedOrigins = [
  'http://localhost:3001', // Local frontend for development
  'https://chronocraft-frontend.onrender.com',
  'https://chronocraft-frontend.vercel.app' // Production frontend on Render
];

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps, Postman, etc.) or check if origin is in the allowedOrigins array
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'], // Allowed methods
  allowedHeaders: ['Content-Type', 'Authorization'], // Allowed headers
  credentials: true // Allow cookies to be sent
}));
//app.use(cors({ origin: 'http://localhost:3000', credentials: true })); //for production, use this
app.use(cookieParser());
const connectDB = require("./db");

connectDB();

const UserDetails = require('./models/userDetails');
const TaskDetails =require('./models/taskDetails');

app.get('/', (req, res) => {
  res.send('Hello World!')
});

app.use(auth);
app.use(fetchuser);
app.use(createtask);
app.use(fetchtasks);
app.use(deletetask);
app.use(updatetask);
app.use(validatetoken);
app.use(loginRoute);
app.use(logoutRoute);
// app.use(refreshTokenRoute);
app.use(refreshTokenRoute);
app.use(fetchtask);
app.use(taskgrantaccess);
app.use(addupdate);
app.use(editupdate);
app.use(deleteupdate);
app.use(getAiResponse);
app.use(incompleteTask);
app.use(completeTask);
app.use(requestAccess);
app.use(taskdenyaccess);
app.use(breakTasksWithAI);
app.use(emptyApi);

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
  console.log(process.env.NODE_ENV === 'production');

});
