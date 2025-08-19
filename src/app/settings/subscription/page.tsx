import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "~/lib/auth";
import Setting from "~/components/setting";

export default async function SubscriptionPage() {
    const session = await auth.api.getSession({
        headers: await headers(),
      });
      if (!session) {
        redirect("/login");
      }

    return (
        <div>
            <Setting />
        </div>
    )
}