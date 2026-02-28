import { Container } from "@/components/ui";

export default function AccountLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen">
      <div className="py-20 md:py-30">
        <Container className="max-w-2xl">{children}</Container>
      </div>
    </div>
  );
}
