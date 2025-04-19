"use client";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function UserInfo() {
  const { data: session, status } = useSession();
  const router = useRouter();

  if (status === "loading") {
    return <div>Загрузка...</div>;
  }

  if (status === "unauthenticated") {
    return (
      <div className="flex gap-2">
        <button
          onClick={() => router.push("/auth/signin")}
          className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600"
        >
          Войти
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-2 p-4 bg-white rounded shadow">
      <div className="text-xl font-bold">
        {session?.user?.name || session?.user?.email}
      </div>
      <div className="text-sm text-gray-500">Роль: {session?.user?.role}</div>
      <button
        onClick={() => signOut()}
        className="bg-red-500 text-white py-1 px-3 rounded text-sm hover:bg-red-600"
      >
        Выйти
      </button>
    </div>
  );
} 