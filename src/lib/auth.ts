import "next-auth";

// Определяем тип UserRole напрямую, чтобы не зависеть от сгенерированного клиента
enum UserRole {
  ADMIN = "ADMIN",
  MANAGER = "MANAGER",
  USER = "USER"
}

declare module "next-auth" {
  interface User {
    role: UserRole;
    hashedPassword?: string;
  }

  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
      role: string;
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role: string;
  }
} 