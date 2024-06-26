"use client";

import { useRouter } from "next/navigation";
import { Breadcrumb, BreadcrumbSection, BreadcrumbDivider, Divider } from "semantic-ui-react";

export default function DashboardLayout({ children }) {
  const router = useRouter();

  return (
    <section>
      <Breadcrumb>
        <BreadcrumbSection link>Home</BreadcrumbSection>
        <BreadcrumbDivider />
        <BreadcrumbSection link>Files</BreadcrumbSection>
        <BreadcrumbDivider />
        <BreadcrumbSection active>Save in blockchain</BreadcrumbSection>
      </Breadcrumb>
      <Divider hidden />

      {children}
    </section>
  );
}
