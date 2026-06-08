import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import LandingPage from "./LandingPage";

export default async function Page() {
  const cookieStore =  await cookies();
  const supabase = createClient(cookieStore);

  // Fetch current user authentication status
  const { data: { user } } = await supabase.auth.getUser();

  // Fetch user's past flight logs (represented by the 'todos' table rows)
  let todos: any[] = [];
  if (user) {
    const { data, error } = await supabase
      .from("todos")
      .select()
      .order("id", { ascending: false });
    
    if (!error && data) {
      todos = data;
    }
  }

  return <LandingPage initialUser={user} initialTodos={todos} />;
}
