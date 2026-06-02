import { redirect } from "next/navigation";

// Redirect /dashboard/configurator → /dashboard/configurator/tables (default tab)
export default function Page() {
    redirect("/dashboard/configurator/tables");
}
