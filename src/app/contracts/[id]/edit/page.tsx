import PDFFillerIntegration from "@/components/pdf-filler-integration";

export default async function ContractEditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <PDFFillerIntegration contractId={id} />;
}
