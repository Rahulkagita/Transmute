// DEMO / SAMPLE CONTENT — fictional, hand-written. Never presented as AI output.
import type { CanonicalContent, Deliverable, OutputType } from "./api/types";

export const SAMPLE_ADVISORY = `[DEMO SAMPLE — FICTIONAL ADVISORY FOR DEMONSTRATION ONLY]

National Cyber Coordination Centre (NCCC) — Advisory NCCC-2026-0142
Issued: 14 September 2026
Severity: High

Subject: Active exploitation of authentication bypass in FleetGate VPN Appliance (CVE-2026-31337)

Summary
The NCCC has observed active exploitation of an authentication bypass vulnerability in FleetGate VPN Appliance firmware versions 7.2.0 through 7.4.3. The vulnerability has a CVSS v3.1 base score of 9.8. Between 2 September and 12 September 2026, the NCCC received 37 incident reports from government departments and 112 reports from private-sector organisations linked to this vulnerability.

Affected
- FleetGate VPN Appliance firmware 7.2.0 – 7.4.3
- Approximately 4,800 internet-exposed devices identified in national IP space as of 13 September 2026

Impact
Successful exploitation allows an unauthenticated remote attacker to obtain administrative session tokens. Observed post-exploitation activity includes credential harvesting, creation of rogue administrator accounts, and lateral movement into internal networks. In 9 confirmed cases, attackers deployed ransomware within 72 hours of initial access.

Vendor Response
FleetGate Systems released patched firmware version 7.4.4 on 10 September 2026.

Recommendations
1. Upgrade all affected appliances to firmware 7.4.4 immediately.
2. Enforce multi-factor authentication (MFA) for all VPN and administrative access.
3. Rotate all credentials and session secrets stored on affected devices.
4. Review appliance logs from 1 August 2026 onward for unknown administrator accounts.
5. Report suspected compromise to the NCCC incident desk within 6 hours of detection.

Deadline
Government departments must complete patching by 21 September 2026.`;

export const SAMPLE_CONTEXT = "Audience is department heads. Emphasise the patching deadline.";

export const SAMPLE_CANONICAL: CanonicalContent = {
  title: "Active exploitation of FleetGate VPN authentication bypass (CVE-2026-31337)",
  summary:
    "NCCC reports active exploitation of an authentication bypass in FleetGate VPN firmware 7.2.0–7.4.3 (CVSS 9.8). Patched firmware 7.4.4 is available; government departments must patch by 21 September 2026.",
  key_points: [
    "Authentication bypass allows unauthenticated attackers to obtain admin session tokens.",
    "Firmware 7.4.4 released 10 September 2026 fixes the issue.",
    "Government patching deadline: 21 September 2026.",
  ],
  facts: [
    { text: "Affected firmware versions are 7.2.0 through 7.4.3.", source_ref: "s-affected" },
    { text: "Ransomware was deployed within 72 hours of initial access in 9 confirmed cases.", source_ref: "s-impact" },
  ],
  statistics: [
    { text: "CVSS v3.1 base score 9.8", source_ref: "s-summary" },
    { text: "37 government incident reports", source_ref: "s-summary" },
    { text: "112 private-sector incident reports", source_ref: "s-summary" },
    { text: "~4,800 internet-exposed devices", source_ref: "s-affected" },
  ],
  dates: [
    { text: "Advisory issued 14 September 2026", source_ref: "s-header" },
    { text: "Reports received 2–12 September 2026", source_ref: "s-summary" },
    { text: "Patch released 10 September 2026", source_ref: "s-vendor" },
    { text: "Patching deadline 21 September 2026", source_ref: "s-deadline" },
  ],
  entities: [
    { name: "National Cyber Coordination Centre (NCCC)", type: "organisation" },
    { name: "FleetGate Systems", type: "vendor" },
    { name: "CVE-2026-31337", type: "vulnerability" },
  ],
  risks: ["Credential harvesting", "Rogue administrator accounts", "Lateral movement", "Ransomware deployment"],
  recommendations: [
    "Upgrade to firmware 7.4.4 immediately",
    "Enforce MFA for VPN and admin access",
    "Rotate credentials and session secrets",
    "Review logs from 1 August 2026 for unknown admin accounts",
    "Report suspected compromise within 6 hours",
  ],
  source_sections: [
    { id: "s-header", heading: "Header", text: "Advisory NCCC-2026-0142 · Issued 14 September 2026 · Severity High" },
    { id: "s-summary", heading: "Summary", text: "CVSS 9.8; 37 government and 112 private-sector reports between 2–12 September 2026." },
    { id: "s-affected", heading: "Affected", text: "Firmware 7.2.0–7.4.3; ~4,800 exposed devices as of 13 September 2026." },
    { id: "s-impact", heading: "Impact", text: "Admin token theft; ransomware within 72 hours in 9 cases." },
    { id: "s-vendor", heading: "Vendor Response", text: "Firmware 7.4.4 released 10 September 2026." },
    { id: "s-deadline", heading: "Deadline", text: "Government patching by 21 September 2026." },
  ],
};

const g = (claim: string, source_ref: string) => ({ claim, status: "verified" as const, source_ref });

export const SAMPLE_DELIVERABLES: Partial<Record<OutputType, Deliverable>> = {
  linkedin: {
    output_type: "linkedin",
    title: "LinkedIn Post",
    content: `Patch FleetGate VPN appliances now.

The NCCC (Advisory NCCC-2026-0142, 14 Sep 2026) reports active exploitation of CVE-2026-31337 — an authentication bypass rated CVSS 9.8 in firmware 7.2.0–7.4.3.

• 37 government and 112 private-sector incident reports (2–12 Sep)
• Ransomware deployed within 72 hours in 9 confirmed cases
• Fixed firmware 7.4.4 has been available since 10 Sep

Government departments must patch by 21 September 2026.

#CyberSecurity #VulnerabilityManagement #PatchNow`,
    grounding: [
      g("CVSS 9.8", "s-summary"),
      g("37 government and 112 private-sector reports", "s-summary"),
      g("9 ransomware cases within 72 hours", "s-impact"),
      g("Deadline 21 September 2026", "s-deadline"),
    ],
    generated_statements: [{ text: "Patch FleetGate VPN appliances now.", kind: "recommendation" }],
  },
  executive_summary: {
    output_type: "executive_summary",
    title: "Executive Summary",
    content: `## Bottom line
FleetGate VPN appliances on firmware 7.2.0–7.4.3 are being actively exploited. Patch to 7.4.4 by **21 September 2026**.

## Key facts
- Severity: High · CVSS 9.8
- 149 incident reports in 11 days (37 government, 112 private sector)
- ~4,800 exposed devices nationally
- Ransomware within 72 hours in 9 confirmed cases

## Decisions required
- Confirm patch ownership per department
- Mandate MFA on VPN and admin access`,
    grounding: [
      g("Firmware 7.2.0–7.4.3", "s-affected"),
      g("~4,800 exposed devices", "s-affected"),
      g("Deadline 21 September 2026", "s-deadline"),
    ],
    generated_statements: [
      { text: "149 incident reports (sum of 37 + 112)", kind: "interpretation" },
      { text: "Confirm patch ownership per department", kind: "recommendation" },
    ],
  },
};
