import { redirect } from "next/navigation";

export default function Home() {
  // A superficie de trabalho do milestone 1 e a lista de tarefas.
  redirect("/tasks");
}
