import express from "express";
import path from "path";
import { loginController } from "./controllers/loginController";
import { appProxy } from "./controllers/appProxy";
import bodyParser from "body-parser";
import cookieParser from "cookie-parser";

const app = express();
const port = 4000;

app.set('view engine', 'pug');
app.set('views', path.join(__dirname, '/views'));

app.use(express.static(path.join(__dirname, '/public')));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
// define a route handler for the default home page
app.get( "/", ( req, res ) => {
  res.render('index', { title: 'Hey', message: 'Hello there!' });
} );

app.use("/login", loginController);
app.use("/apps", appProxy);
// start the Express server
app.listen( port, () => {
  console.log( `server started at http://localhost:${ port }` );
} );