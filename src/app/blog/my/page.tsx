import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";

export default async function MyBlogPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login?next=/blog/my");
  redirect(`/blog/${user.username}`);
}
