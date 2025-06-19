// Clerk SignUp page (Next.js App Router)
import { SignUp } from "@clerk/nextjs";

export default function SignUpPage() {
  return (
    <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "80vh" }}>
      <SignUp routing="path" path="/signup" />
    </div>
  );
}
