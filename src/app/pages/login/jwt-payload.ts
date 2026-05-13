export interface JwtPayload {
  sub: string;        // username
  userId: number;
  role: string;
  firstName: string;
  lastName: string;
  iat: number;
  exp: number;
}
