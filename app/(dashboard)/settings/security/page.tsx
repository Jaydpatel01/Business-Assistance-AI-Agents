/**
 * Enterprise Security Settings Page
 * Phase 5.2: Enterprise Security & Integration
 */

import { Metadata } from "next";
import EnterpriseSecurityDashboard from "@/components/security/EnterpriseSecurityDashboard";

export const metadata: Metadata = {
  title: "Enterprise Security | Business AI Agents",
  description: "Monitor security metrics, compliance status, and access controls for your organization.",
};

export default function SecurityPage() {
  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <EnterpriseSecurityDashboard />
    </div>
  );
}
