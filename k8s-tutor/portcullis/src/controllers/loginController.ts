import express from "express";
import { sessionStore } from "../data/session";
import { processLogin } from "../data/student";

export const loginController = express.Router();

let sessionId = 0; //TODO Replace this with a UUID

loginController.get("/", (req, res) => {
  res.render('login', { title: "Login" });
});

loginController.post("/", (req, res) => {
  // TODO validator for body having username and password
  const session = processLogin(req.body["username"], req.body["password"]);
  if(!session) {
    return res.sendStatus(401);
  }
  const issuedId = (sessionId++).toString();
  sessionStore.set(issuedId, session);
  res
    .status(200)
    .cookie("session_id", issuedId)
    .render('index', { title: "Login Posted", message: "Logged in as " + req.body["username"] });
});
