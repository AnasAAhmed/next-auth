
export interface Session {
  user: {
    id: string
    email: string
  }
}

export interface AuthResult {
  type: string
  message: string
}
export interface Result {
  type: string
  resultCode: string
}
export interface User extends Record<string, any> {
  id: string
  email: string
  name:string
  password: string
  image:string
}
export interface UserSignInHistory {
  userid:string;
  browser:string;
  device:string;
  ip:string;
  os:string;
  user_agent:string;
  city:string;
  country:string;
  signed_in_at:Date;
}
