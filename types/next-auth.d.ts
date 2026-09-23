import 'next-auth';

declare module 'next-auth' {
  interface User {
    id: string;
    roleId: number;
    roleCode: string;
    roleName: string;
    unitId: number | null;
  }

  interface Session {
    user: User & {
      name: string;
      email: string;
    };
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string;
    roleId: number;
    roleCode: string;
    roleName: string;
    unitId: number | null;
  }
}
