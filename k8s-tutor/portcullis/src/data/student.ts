import { StudentSession } from "./session";

export interface User {
  username: string,
  password: string,
}

export interface Student extends User {
  name: string,
  namespace: string,
  org?: string,
  allowedTools: string[],
  allowedTargets: string[]
}

const sampleData: Student[] = [
  { 
    username: "mic@secureideas.com",
    password: "password",
    name: "Mic Whitehorn-Gillam",
    namespace: "student-mic-whiteh123",
    allowedTools: ["*"],
    allowedTargets: ["*"]
  },
  {
    username: "nevil@secureideas.com",
    password: "password",
    name: "Nevil Devil",
    namespace: "student-nevil-devi042",
    allowedTools: ["zap", "firefox"],
    allowedTargets: ["dojo"]
  }
];

export function processLogin(username: string, password:string): StudentSession|undefined {
  const matchedStudent = sampleData.find(student => student.username === username);
  if(matchedStudent?.password === password) {
    return { 
      type: "student",
      user: matchedStudent,
      iat: new Date(),
      exp: new Date(),
      lastAccess: new Date() 
    };
  } else {
    return;
  }
}