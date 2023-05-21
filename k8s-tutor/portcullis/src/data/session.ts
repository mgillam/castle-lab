import { Student, User } from "./student";

interface Session {
  type: "student"|"instructor"|"admin",
  user: User,
  iat: Date,
  exp: Date,
  lastAccess: Date
}

export interface StudentSession extends Session {
  type: "student",
  user: Student
}

export let sessionStore: Map<String, Session> = new Map<String, Session>();