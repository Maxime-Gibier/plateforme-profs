import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export default async function SettingsPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/");
  }

  // Redirect based on user role
  if (session.user.role === "PROFESSOR") {
    redirect("/professor/settings");
  } else if (session.user.role === "CLIENT") {
    redirect("/client/settings");
  } else {
    redirect("/");
  }
}
