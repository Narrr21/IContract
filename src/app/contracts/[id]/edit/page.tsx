import PDFFillerIntegration from "@/components/pdf-filler-integration";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic"; // ensure per-request auth check

const ALLOWED_ROLES = ["MANAGEMENT", "LEGAL"] as const;

export default async function ContractEditPage({
  params,
}: {
  params: { id: string };
}) {
  const { id } = params;

  const cookieStore = await cookies();
  const token = cookieStore.get?.("auth-token")?.value;

  let role: string | undefined;
  if (token) {
    try {
      const decoded: any = jwt.verify(
        token,
        process.env.JWT_SECRET || "your-secret-key"
      );
      role = decoded?.category;
    } catch (e) {
      // invalid token -> treat as unauthorized
    }
  }

  if (!role || !ALLOWED_ROLES.includes(role as any)) {
    // Option 1: redirect back to contract view with a flag
    redirect(`/contracts/${id}?denied=edit`);
  }

  return <PDFFillerIntegration contractId={id} />;
}
