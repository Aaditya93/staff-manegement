import { auth } from "@/auth";
import { getUserById } from "@/db/models/User";
import { EditProfile } from "@/components/profile/edit";
import { redirect } from "next/navigation";

export default async function EditProfilePage() {
  const session = await auth();
  const userData = session?.user;
  console.log("Session data:", session);

  const user = await getUserById(userData.id);

  if (!user) {
    redirect("/"); // Redirect to home if user data can't be found
    return null;
  }

  console.log("User data:", user);

  return (
    <div className="container mx-auto py-8">
      <EditProfile
        initialName={user.name || ""}
        initialCountry={user.country || "us"}
        initialEmails={user.accounts?.map((account) => account.email) || []}
        userId={userData.id}
      />
    </div>
  );
}
