import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Student Portal | Skyline Student Association",
};

export default function StudentLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
