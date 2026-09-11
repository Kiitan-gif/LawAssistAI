import React, { useState, useRef, useEffect } from "react";
import { supabase } from "./supabaseClient";
import { Mic, MessageSquare, FileText, Users, FolderClock, ShieldCheck, Home, Briefcase, Gavel, Sparkles, ArrowLeft } from "lucide-react";

/* ---------- Design tokens ----------
Color: Ink #16211D, Chambers Green #1F3A32, Parchment #EDE8DC, Brass #B08A3E, Muted Sage #6E8378, Alert #A23B2E
Type: display = "Fraunces", ui = "IBM Plex Sans"
------------------------------------- */

const FONT_LINK_ID = "lawassist-fonts";
function useFonts() {
  useEffect(() => {
    if (document.getElementById(FONT_LINK_ID)) return;
    const link = document.createElement("link");
    link.id = FONT_LINK_ID;
    link.rel = "stylesheet";
    link.href =
      "https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,500;9..144,600&family=IBM+Plex+Sans:wght@400;500;600&display=swap";
    document.head.appendChild(link);
  }, []);
}

const ink = "#16211D", chambers = "#1F3A32", parchment = "#EDE8DC", brass = "#B08A3E", sage = "#6E8378", alert = "#A23B2E";
const ui = "'IBM Plex Sans', sans-serif", display = "'Fraunces', serif";

const MODULES = [
  { id: "about", label: "About", desc: "What we do" },
  { id: "assistant", label: "Assistant", desc: "AI legal chat" },
  { id: "documents", label: "Documents", desc: "Generate & draft" },
  { id: "marketplace", label: "Lawyers", desc: "Find counsel" },
  { id: "matters", label: "Matters", desc: "Track cases" },
  { id: "compliance", label: "Compliance", desc: "Filings & deadlines" },
];

const JURISAID_NOTE = "Case law research note: This written address includes placeholders for supporting case law. Before filing, research applicable authorities at JurisAid.ng (https://jurisaid.ng) rather than relying on AI-formulated citations — case law must be independently verified.";

const DOC_CATEGORIES = [
  {
    category: "Civil Litigation",
    templates: [
      { id: "demand_letter", name: "Demand Letter", fields: ["Sender Name", "Recipient Name", "Nature of Claim", "Amount/Remedy Demanded", "Deadline for Response"] },
    ],
  },
  {
    category: "Criminal Litigation",
    templates: [
      { id: "plea_bargain", name: "Plea Bargain Agreement", fields: ["Accused Name", "Prosecuting Authority", "Charge No.", "Terms of Agreement"] },
      { id: "petition_to_police", name: "Petition to the Police/EFCC", fields: ["Petitioner Name", "Respondent Name", "Agency", "Facts of Complaint", "Relief Sought"] },
    ],
  },
  {
    category: "Corporate & Commercial",
    templates: [
      { id: "nda", name: "Non-Disclosure Agreement", fields: ["Disclosing Party", "Receiving Party", "Effective Date", "Purpose of Disclosure", "Duration (years)"] },
      { id: "moa", name: "Memorandum of Agreement", fields: ["Party A", "Party B", "Subject Matter", "Effective Date", "Governing State"] },
      { id: "shareholders_agreement", name: "Shareholders Agreement", fields: ["Company Name", "Shareholder A", "Shareholder B", "Share Ratio", "Effective Date"] },
      { id: "board_resolution", name: "Board Resolution", fields: ["Company Name", "Resolution Subject", "Date of Meeting", "Directors Present"] },
      { id: "partnership_agreement", name: "Partnership Agreement", fields: ["Partner A", "Partner B", "Business Name", "Profit Sharing Ratio", "Effective Date"] },
      { id: "service_agreement", name: "Service Agreement", fields: ["Service Provider", "Client", "Scope of Services", "Fees", "Term"] },
      { id: "privacy_policy", name: "Privacy Policy", fields: ["Business/App Name", "Data Collected", "Purpose of Processing", "Contact Email"] },
      { id: "terms_of_service", name: "Terms of Service", fields: ["Business/App Name", "Nature of Service", "Governing State", "Contact Email"] },
    ],
  },
  {
    category: "Land Law",
    templates: [
      { id: "deed_of_assignment", name: "Deed of Assignment", fields: ["Assignor", "Assignee", "Property Address", "Consideration (₦)", "Date"] },
      { id: "tenancy", name: "Tenancy Agreement", fields: ["Landlord Name", "Tenant Name", "Property Address", "Annual Rent (₦)", "Lease Term (years)"] },
      { id: "deed_of_lease", name: "Deed of Lease", fields: ["Lessor", "Lessee", "Property Address", "Lease Term (years)", "Annual Rent (₦)"] },
      { id: "power_of_attorney", name: "Power of Attorney (Land)", fields: ["Donor Name", "Donee Name", "Property Address", "Powers Granted"] },
      { id: "deed_of_mortgage", name: "Deed of Mortgage", fields: ["Mortgagor", "Mortgagee", "Property Address", "Loan Amount (₦)", "Repayment Terms"] },
    ],
  },
  {
    category: "Employment",
    templates: [
      { id: "employment", name: "Employment Contract", fields: ["Employer Name", "Employee Name", "Job Title", "Monthly Salary (₦)", "Start Date"] },
      { id: "termination_letter", name: "Letter of Termination", fields: ["Employer Name", "Employee Name", "Job Title", "Termination Date", "Reason"] },
      { id: "offer_letter", name: "Offer Letter", fields: ["Employer Name", "Candidate Name", "Job Title", "Monthly Salary (₦)", "Resumption Date"] },
    ],
  },
  {
    category: "Family Law",
    templates: [
      { id: "affidavit_of_marriage", name: "Affidavit of Marital Status", fields: ["Deponent Name", "Marital Status", "Spouse Name (if any)", "Court/Commissioner for Oaths"] },
      { id: "separation_agreement", name: "Separation Agreement", fields: ["Party A", "Party B", "Date of Marriage", "Terms of Separation", "Child Custody Terms"] },
      { id: "consent_letter_minor_travel", name: "Consent Letter for Minor's Travel", fields: ["Parent/Guardian Name", "Minor's Name", "Travelling With", "Destination", "Travel Dates"] },
    ],
  },
  {
    category: "Wills & Probate",
    templates: [
      { id: "last_will", name: "Last Will and Testament", fields: ["Testator Name", "Executor Name", "Beneficiaries", "Assets/Bequests", "Date"] },
      { id: "letters_of_administration_petition", name: "Petition for Letters of Administration", fields: ["Petitioner Name", "Deceased Name", "Date of Death", "Relationship to Deceased", "Estate Details"] },
    ],
  },
  {
    category: "Intellectual Property",
    templates: [
      { id: "trademark_application_cover", name: "Trademark Application Cover Letter", fields: ["Applicant Name", "Trademark", "Class of Goods/Services", "Date of First Use"] },
      { id: "licensing_agreement", name: "IP Licensing Agreement", fields: ["Licensor", "Licensee", "IP Description", "Royalty Terms", "Duration"] },
    ],
  },
  {
    category: "Immigration",
    templates: [
      { id: "invitation_letter_visa", name: "Invitation Letter (Visa Support)", fields: ["Host Name", "Visitor Name", "Purpose of Visit", "Duration of Stay", "Host Address"] },
      { id: "affidavit_of_support", name: "Affidavit of Support", fields: ["Sponsor Name", "Beneficiary Name", "Relationship", "Financial Undertaking"] },
    ],
  },
  {
    category: "Banking & Finance",
    templates: [
      { id: "loan_agreement", name: "Loan Agreement", fields: ["Lender", "Borrower", "Loan Amount (₦)", "Interest Rate", "Repayment Schedule"] },
      { id: "guarantee_agreement", name: "Deed of Guarantee", fields: ["Guarantor", "Creditor", "Principal Debtor", "Guaranteed Amount (₦)"] },
    ],
  },
  {
    category: "Arbitration & ADR",
    templates: [
      { id: "arbitration_agreement", name: "Arbitration Agreement", fields: ["Party A", "Party B", "Subject of Dispute", "Seat of Arbitration", "Arbitration Rules"] },
      { id: "notice_of_arbitration", name: "Notice of Arbitration", fields: ["Claimant", "Respondent", "Dispute Summary", "Relief Sought", "Arbitral Institution"] },
    ],
  },
  {
    category: "General / Sworn Documents",
    templates: [
      { id: "general_affidavit", name: "General Affidavit", fields: ["Deponent Name", "Facts Deposed To", "Purpose of Affidavit", "Court/Commissioner for Oaths"] },
      { id: "statutory_declaration", name: "Statutory Declaration", fields: ["Declarant Name", "Facts Declared", "Purpose"] },
      { id: "indemnity_agreement", name: "Deed of Indemnity", fields: ["Indemnifier", "Indemnified Party", "Subject Matter", "Extent of Indemnity"] },
    ],
  },
];

const ALL_TEMPLATES = DOC_CATEGORIES.flatMap((c) => c.templates);

function buildAffidavit(deponent, court, suitOrCharge, facts) {
  return `\n\n----------------------------------------\n\nAFFIDAVIT IN SUPPORT\n\nIN THE ${court}\n${suitOrCharge}\n\nI, ${deponent}, Nigerian, [Adult/Gender], of [Address], do hereby make oath and state as follows:\n\n1. That I am the [Applicant/a person conversant with the facts of this case] and by virtue of which I am competent to depose to this affidavit.\n2. ${facts}\n3. That I depose to this affidavit in good faith, believing its contents to be true and correct, and in accordance with the Oaths Act.\n\n_______________________\nDeponent\n\nSworn to at the Registry of the above-named Court this [date].\n\nBEFORE ME\n\n_______________________\nCommissioner for Oaths`;
}

function buildWrittenAddress(court, suitOrCharge, issuesForDetermination, argument) {
  return `\n\n----------------------------------------\n\nWRITTEN ADDRESS\n\nIN THE ${court}\n${suitOrCharge}\n\n1.0 INTRODUCTION\nThis Written Address is filed in support of the accompanying application.\n\n2.0 ISSUE(S) FOR DETERMINATION\n${issuesForDetermination}\n\n3.0 ARGUMENT\n${argument}\n[Cite applicable statutory provisions and case law here.]\n\n4.0 CONCLUSION\nFor the reasons stated above, this Honourable Court is urged to grant the reliefs sought.\n\n_______________________\nCounsel for the Applicant\n\n----------------------------------------\n${JURISAID_NOTE}`;
}

function buildGenericDoc(template, values) {
  const today = new Date().toLocaleDateString("en-NG", { year: "numeric", month: "long", day: "numeric" });
  const v = (k) => values[k] || `[${k}]`;
  const lines = template.fields.map((f) => `${f}: ${v(f)}`).join("\n");
  return `${template.name.toUpperCase()}\n\nDate: ${today}\n\nThis document is made with reference to the following particulars:\n\n${lines}\n\nThe parties named above agree to be bound by the terms of this ${template.name}, to be finalised and executed in accordance with applicable Nigerian law.\n\nThis is a first-draft template — have a lawyer review and complete the substantive clauses before use.\n\nSIGNED:\n\n_______________________               _______________________`;
}

function buildDocText(template, values) {
  const today = new Date().toLocaleDateString("en-NG", { year: "numeric", month: "long", day: "numeric" });
  const v = (k) => values[k] || `[${k}]`;
  const sign = (a, b) => `SIGNED:\n\n_______________________               _______________________\n${a}                          ${b}`;

  switch (template.id) {
    case "statement_of_claim":
      return `IN THE ${v("Court")}\nSUIT NO: ${v("Suit Number")}\n\nBETWEEN\n${v("Claimant Name")} .......................................... CLAIMANT\nAND\n${v("Defendant Name")} ........................................ DEFENDANT\n\nSTATEMENT OF CLAIM\n\n1. The Claimant is as described in the writ of summons.\n2. The Claimant's claim against the Defendant is as follows:\n\nWHEREOF the Claimant claims:\n${v("Reliefs Sought")}\n\nDATED this ${today}.\n\n_______________________\nCounsel for the Claimant`;
    case "motion_on_notice": {
      const motion = `IN THE ${v("Court")}\nSUIT NO: ${v("Suit Number")}\n\nBETWEEN\n${v("Applicant Name")} ........................................ APPLICANT\nAND\n${v("Respondent Name")} ..................................... RESPONDENT\n\nMOTION ON NOTICE\n\nTAKE NOTICE that this Honourable Court will be moved on a date to be fixed by the Registrar, praying for the following orders:\n${v("Orders Sought")}\n\nAND FOR SUCH FURTHER ORDER(S) as this Honourable Court may deem fit to make in the circumstances.\n\nGROUNDS FOR THE APPLICATION:\n${v("Grounds")}\n\nDATED this ${today}.\n\n_______________________\nCounsel for the Applicant`;
      const affidavit = buildAffidavit(v("Deponent Name"), v("Court"), `SUIT NO: ${v("Suit Number")}`, v("Grounds"));
      const address = buildWrittenAddress(v("Court"), `SUIT NO: ${v("Suit Number")}`, "Whether the Applicant is entitled to the reliefs sought.", `The Applicant relies on the grounds stated in the supporting affidavit, namely: ${v("Grounds")}.`);
      return motion + affidavit + address;
    }
    case "motion_exparte": {
      const motion = `IN THE ${v("Court")}\nSUIT NO: ${v("Suit Number")}\n\nIN THE MATTER OF ${v("Applicant Name")}\n\nMOTION EX PARTE\n\nTAKE NOTICE that this Honourable Court will be moved praying for an order (ex parte) that:\n${v("Orders Sought")}\n\nGROUNDS FOR THE APPLICATION:\n${v("Grounds")}\n\nDATED this ${today}.\n\n_______________________\nCounsel for the Applicant`;
      const affidavit = buildAffidavit(v("Deponent Name"), v("Court"), `SUIT NO: ${v("Suit Number")}`, v("Grounds"));
      const address = buildWrittenAddress(v("Court"), `SUIT NO: ${v("Suit Number")}`, "Whether the circumstances justify the grant of the order sought ex parte.", `The urgency and grounds are as deposed to in the supporting affidavit: ${v("Grounds")}.`);
      return motion + affidavit + address;
    }
    case "writ_of_summons":
      return `IN THE ${v("Court")}\n\nBETWEEN\n${v("Claimant Name")} .......................................... CLAIMANT\nAND\n${v("Defendant Name")} ........................................ DEFENDANT\n\nWRIT OF SUMMONS\n\nTo: ${v("Defendant Name")}\n\nYou are hereby commanded that within the time specified you cause an appearance to be entered for you in an action at the suit of ${v("Claimant Name")}.\n\nNATURE OF CLAIM:\n${v("Nature of Claim")}\n\nDATED this ${today}.`;
    case "statement_of_defence":
      return `IN THE ${v("Court")}\nSUIT NO: ${v("Suit Number")}\n\nBETWEEN\n${v("Claimant Name")} .......................................... CLAIMANT\nAND\n${v("Defendant Name")} ........................................ DEFENDANT\n\nSTATEMENT OF DEFENCE\n\n1. The Defendant denies each and every allegation contained in the Statement of Claim as if same were set out and traversed seriatim.\n2. Grounds of defence:\n${v("Grounds of Defence")}\n\nWHEREOF the Defendant urges this Honourable Court to dismiss the Claimant's claim in its entirety.\n\nDATED this ${today}.\n\n_______________________\nCounsel for the Defendant`;
    case "bail_application": {
      const motion = `IN THE ${v("Court")}\nCHARGE NO: ${v("Charge No.")}\n\nBETWEEN\nTHE STATE\nAND\n${v("Applicant/Accused Name")} ................................. ACCUSED/APPLICANT\n\nAPPLICATION FOR BAIL\n\nTAKE NOTICE that an application will be made praying this Honourable Court to admit the Applicant, charged with ${v("Offence Charged")}, to bail pending trial.\n\nGROUNDS FOR BAIL:\n${v("Grounds for Bail")}\n\nDATED this ${today}.\n\n_______________________\nCounsel for the Applicant`;
      const affidavit = buildAffidavit(v("Deponent Name"), v("Court"), `CHARGE NO: ${v("Charge No.")}`, v("Grounds for Bail"));
      const address = buildWrittenAddress(v("Court"), `CHARGE NO: ${v("Charge No.")}`, "Whether the Applicant is entitled to bail pending trial.", `The Applicant relies on the constitutional presumption of innocence and the grounds deposed to: ${v("Grounds for Bail")}.`);
      return motion + affidavit + address;
    }
    case "plea_bargain":
      return `PLEA BARGAIN AGREEMENT\n\nCHARGE NO: ${v("Charge No.")}\n\nBETWEEN\n${v("Prosecuting Authority")} ("the Prosecution")\nAND\n${v("Accused Name")} ("the Accused")\n\nTERMS OF AGREEMENT:\n${v("Terms of Agreement")}\n\nThis Agreement is entered into voluntarily and with full understanding of its consequences.\n\n${sign(v("Prosecuting Authority"), v("Accused Name"))}`;
    case "nda":
      return `NON-DISCLOSURE AGREEMENT\n\nThis Agreement is made this ${v("Effective Date") === "[Effective Date]" ? today : v("Effective Date")} between ${v("Disclosing Party")} ("Disclosing Party") and ${v("Receiving Party")} ("Receiving Party").\n\n1. PURPOSE\nThe parties wish to explore ${v("Purpose of Disclosure")}.\n\n2. CONFIDENTIALITY\nThe Receiving Party shall hold all confidential information in strict confidence.\n\n3. DURATION\nThis Agreement remains in effect for ${v("Duration (years)")} year(s).\n\n4. GOVERNING LAW\nLaws of the Federal Republic of Nigeria.\n\n${sign(v("Disclosing Party"), v("Receiving Party"))}`;
    case "moa":
      return `MEMORANDUM OF AGREEMENT\n\nThis Memorandum is made between ${v("Party A")} and ${v("Party B")} regarding ${v("Subject Matter")}, effective ${v("Effective Date")}.\n\nThe parties agree to be bound by the terms herein and submit to the jurisdiction of the courts of ${v("Governing State")} State.\n\n${sign(v("Party A"), v("Party B"))}`;
    case "shareholders_agreement":
      return `SHAREHOLDERS AGREEMENT\n\nThis Agreement is made effective ${v("Effective Date")} between ${v("Shareholder A")} and ${v("Shareholder B")}, being shareholders of ${v("Company Name")}, in the ratio of ${v("Share Ratio")}.\n\nThe parties agree to regulate their relationship as shareholders in accordance with the terms herein and the Companies and Allied Matters Act.\n\n${sign(v("Shareholder A"), v("Shareholder B"))}`;
    case "board_resolution":
      return `${v("Company Name")}\n\nRESOLUTION OF THE BOARD OF DIRECTORS\n\nPassed at a meeting of the Board held on ${v("Date of Meeting")}.\n\nDirectors present: ${v("Directors Present")}\n\nRESOLVED THAT:\n${v("Resolution Subject")}\n\n_______________________\nChairman/Company Secretary`;
    case "deed_of_assignment":
      return `DEED OF ASSIGNMENT\n\nTHIS DEED is made this ${v("Date") === "[Date]" ? today : v("Date")} BETWEEN ${v("Assignor")} ("the Assignor") AND ${v("Assignee")} ("the Assignee").\n\nIn consideration of ₦${v("Consideration (₦)")} paid by the Assignee, the Assignor hereby assigns unto the Assignee ALL THAT property situate at ${v("Property Address")}, together with all rights and appurtenances thereto.\n\n${sign(v("Assignor"), v("Assignee"))}`;
    case "tenancy":
      return `TENANCY AGREEMENT\n\nTHIS AGREEMENT is made between ${v("Landlord Name")} ("Landlord") and ${v("Tenant Name")} ("Tenant") in respect of the property at ${v("Property Address")}.\n\n1. TERM: ${v("Lease Term (years)")} year(s).\n2. RENT: ₦${v("Annual Rent (₦)")} per annum, payable in advance.\n3. The Tenant shall keep the premises in good condition and shall not sublet without written consent.\n\n${sign(v("Landlord Name"), v("Tenant Name"))}`;
    case "deed_of_lease":
      return `DEED OF LEASE\n\nTHIS LEASE is made between ${v("Lessor")} ("Lessor") and ${v("Lessee")} ("Lessee") in respect of the property at ${v("Property Address")}, for a term of ${v("Lease Term (years)")} year(s) at an annual rent of ₦${v("Annual Rent (₦)")}.\n\n${sign(v("Lessor"), v("Lessee"))}`;
    case "power_of_attorney":
      return `POWER OF ATTORNEY\n\nKNOW ALL MEN by these presents that I, ${v("Donor Name")} ("the Donor"), of the property situate at ${v("Property Address")}, DO HEREBY APPOINT ${v("Donee Name")} ("the Donee") to be my true and lawful attorney, with the following powers:\n${v("Powers Granted")}\n\n_______________________\n${v("Donor Name")} (Donor)`;
    case "employment":
      return `EMPLOYMENT CONTRACT\n\nThis Contract is made between ${v("Employer Name")} ("Employer") and ${v("Employee Name")} ("Employee").\n\n1. POSITION: ${v("Job Title")}, commencing ${v("Start Date")}.\n2. REMUNERATION: ₦${v("Monthly Salary (₦)")} monthly.\n3. TERMINATION: Either party may terminate by written notice per applicable Nigerian labour law.\n\n${sign(v("Employer Name"), v("Employee Name"))}`;
    case "termination_letter":
      return `LETTER OF TERMINATION OF EMPLOYMENT\n\nDate: ${today}\n\nTo: ${v("Employee Name")}\nRe: Termination of Appointment as ${v("Job Title")}\n\nWe write to inform you that your employment with ${v("Employer Name")} is terminated with effect from ${v("Termination Date")}.\n\nReason: ${v("Reason")}\n\nYours faithfully,\n_______________________\nFor: ${v("Employer Name")}`;
    default:
      return buildGenericDoc(template, values);
  }
}

/* ---------- Auth ---------- */

function AuthScreen({ onBack, initialMode }) {
  const [mode, setMode] = useState(initialMode || "signin"); // signin | signup
  const [role, setRole] = useState("client");
  const [form, setForm] = useState({ fullName: "", email: "", password: "", practiceArea: "", years: "", state: "", rate: "", bio: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSignup() {
    setError("");
    if (!form.fullName || !form.email || !form.password) {
      setError("Name, email, and password are required.");
      return;
    }
    setLoading(true);
    const { data, error: signUpError } = await supabase.auth.signUp({ email: form.email, password: form.password });
    if (signUpError) {
      setError(signUpError.message);
      setLoading(false);
      return;
    }
    const userId = data.user?.id;
    if (userId) {
      const { error: profileError } = await supabase.from("profiles").insert({
        id: userId,
        full_name: form.fullName,
        role,
        practice_area: role === "lawyer" ? form.practiceArea : null,
        years_experience: role === "lawyer" ? Number(form.years) || null : null,
        state: form.state || null,
        rate: role === "lawyer" ? form.rate : null,
        bio: form.bio || null,
      });
      if (profileError) {
        setError(profileError.message);
        setLoading(false);
        return;
      }
    }
    setLoading(false);
    if (!data.session) {
      setError("Account created — check your email to confirm, then sign in.");
      setMode("signin");
    }
  }

  async function handleSignin() {
    setError("");
    setLoading(true);
    const { error: signInError } = await supabase.auth.signInWithPassword({ email: form.email, password: form.password });
    setLoading(false);
    if (signInError) setError(signInError.message);
  }

  const field = (label, key, type = "text") => (
    <div style={{ marginBottom: 12 }}>
      <label style={{ display: "block", fontFamily: ui, fontSize: 12.5, color: ink, marginBottom: 5, fontWeight: 500 }}>{label}</label>
      <input
        type={type}
        value={form[key]}
        onChange={(e) => setForm({ ...form, [key]: e.target.value })}
        style={{ width: "100%", padding: "10px 12px", borderRadius: 8, border: "1px solid #C7BFA8", fontFamily: ui, fontSize: 13.5, outline: "none", boxSizing: "border-box" }}
      />
    </div>
  );

  return (
    <div style={{ minHeight: "100vh", width: "100%", background: parchment, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: ui }}>
      <div style={{ width: 400, maxWidth: "90%", background: "#fff", border: "1px solid #DDD6C4", borderRadius: 14, padding: "32px 30px" }}>
        {onBack && (
          <div onClick={onBack} style={{ fontFamily: ui, fontSize: 12.5, color: sage, cursor: "pointer", marginBottom: 14 }}>← Back to homepage</div>
        )}
        <div style={{ fontFamily: display, fontSize: 24, color: ink, marginBottom: 4 }}>LawAssist</div>
        <div style={{ fontFamily: ui, fontSize: 12.5, color: sage, marginBottom: 22 }}>Legal infrastructure, Africa</div>

        <div style={{ display: "flex", marginBottom: 20, borderRadius: 8, overflow: "hidden", border: "1px solid #C7BFA8" }}>
          {["signin", "signup"].map((m) => (
            <div
              key={m}
              onClick={() => { setMode(m); setError(""); }}
              style={{ flex: 1, textAlign: "center", padding: "9px 0", cursor: "pointer", background: mode === m ? chambers : "transparent", color: mode === m ? parchment : ink, fontSize: 13, fontWeight: 600 }}
            >
              {m === "signin" ? "Sign in" : "Create account"}
            </div>
          ))}
        </div>

        {mode === "signup" && (
          <div style={{ display: "flex", marginBottom: 16, borderRadius: 8, overflow: "hidden", border: "1px solid #C7BFA8" }}>
            {["client", "lawyer"].map((r) => (
              <div
                key={r}
                onClick={() => setRole(r)}
                style={{ flex: 1, textAlign: "center", padding: "8px 0", cursor: "pointer", background: role === r ? brass : "transparent", color: role === r ? "#1B1400" : ink, fontSize: 12.5, fontWeight: 600, textTransform: "capitalize" }}
              >
                I'm a {r}
              </div>
            ))}
          </div>
        )}

        {mode === "signup" && field("Full Name", "fullName")}
        {field("Email", "email", "email")}
        {field("Password", "password", "password")}

        {mode === "signup" && role === "lawyer" && (
          <>
            {field("Practice Area", "practiceArea")}
            {field("Years of Experience", "years")}
            {field("State", "state")}
            {field("Rate (e.g. ₦40,000/hr)", "rate")}
            {field("Short Bio", "bio")}
          </>
        )}
        {mode === "signup" && role === "client" && field("State", "state")}

        {error && <div style={{ color: alert, fontSize: 12.5, marginBottom: 12, fontFamily: ui }}>{error}</div>}

        <button
          onClick={mode === "signin" ? handleSignin : handleSignup}
          disabled={loading}
          style={{ width: "100%", padding: "12px 0", borderRadius: 8, border: "none", background: loading ? "#9CAB9F" : chambers, color: parchment, fontFamily: ui, fontWeight: 600, fontSize: 14, cursor: loading ? "default" : "pointer" }}
        >
          {loading ? "Please wait…" : mode === "signin" ? "Sign in" : "Create account"}
        </button>
      </div>
    </div>
  );
}

/* ---------- About ---------- */

function AboutModule() {
  return (
    <div style={{ padding: "36px 40px", overflowY: "auto", height: "100%", boxSizing: "border-box", maxWidth: 760 }}>
      <div style={{ fontFamily: display, fontSize: 28, color: ink, marginBottom: 10 }}>Legal infrastructure for Africa</div>
      <p style={{ fontFamily: ui, fontSize: 14.5, color: ink, lineHeight: 1.7, marginBottom: 16 }}>
        LawAssist AI brings together AI-powered legal assistance and a marketplace of licensed Nigerian lawyers, so individuals, businesses, startups, and NGOs can get reliable legal help without the usual friction.
      </p>
      <p style={{ fontFamily: ui, fontSize: 14.5, color: ink, lineHeight: 1.7, marginBottom: 16 }}>
        Ask the AI Assistant a legal question, draft documents across civil litigation, criminal litigation, corporate and commercial law, and land law, or connect directly with a verified lawyer for representation. Clients can track the progress of their matters in real time, and lawyers can build a public profile backed by real client reviews.
      </p>
      <p style={{ fontFamily: ui, fontSize: 13, color: sage, lineHeight: 1.6 }}>
        LawAssist AI is a human-AI legal services platform, not a substitute for a lawyer. The AI Assistant provides general legal information; for filings, representation, and binding advice, engage a lawyer through the marketplace.
      </p>
    </div>
  );
}

/* ---------- Assistant ---------- */

function AssistantModule() {
  const [messages, setMessages] = useState([
    { role: "assistant", text: "I can help with Nigerian legal questions, contract review, or pointing you to next steps. What's on your mind?" },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, loading]);

  async function send() {
    const text = input.trim();
    if (!text || loading) return;
    setMessages((m) => [...m, { role: "user", text }]);
    setInput("");
    setLoading(true);
    try {
      const resp = await fetch("/.netlify/functions/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text }),
      });
      const data = await resp.json();
      if (!resp.ok) {
        setMessages((m) => [...m, { role: "assistant", text: data.error || "The assistant isn't configured yet. Add ANTHROPIC_API_KEY in Netlify's environment variables and redeploy." }]);
      } else {
        setMessages((m) => [...m, { role: "assistant", text: data.reply || "I couldn't generate a response — please try rephrasing." }]);
      }
    } catch (e) {
      setMessages((m) => [...m, { role: "assistant", text: "Something went wrong reaching the assistant. Please try again." }]);
    } finally {
      setLoading(false);
    }
  }

  const voice = useVoiceInput((transcript) => setInput((prev) => (prev ? prev + " " : "") + transcript));

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      <div ref={scrollRef} style={{ flex: 1, overflowY: "auto", padding: "28px 32px", display: "flex", flexDirection: "column", gap: 16 }}>
        {messages.map((m, i) => (
          <div key={i} style={{ display: "flex", justifyContent: m.role === "user" ? "flex-end" : "flex-start" }}>
            <div style={{ maxWidth: "72%", padding: "12px 16px", borderRadius: m.role === "user" ? "14px 14px 3px 14px" : "14px 14px 14px 3px", background: m.role === "user" ? chambers : "#F4F1E8", color: m.role === "user" ? parchment : ink, fontFamily: ui, fontSize: 14.5, lineHeight: 1.55, whiteSpace: "pre-wrap", border: m.role === "user" ? "none" : "1px solid #DDD6C4" }}>
              {m.text}
            </div>
          </div>
        ))}
        {loading && (
          <div style={{ display: "flex", justifyContent: "flex-start" }}>
            <div style={{ padding: "12px 16px", borderRadius: "14px 14px 14px 3px", background: "#F4F1E8", border: "1px solid #DDD6C4", color: sage, fontFamily: ui, fontSize: 14 }}>Thinking…</div>
          </div>
        )}
      </div>
      <div style={{ padding: "18px 32px 26px", borderTop: "1px solid #DDD6C4", background: parchment }}>
        {voice.listening && <div style={{ fontFamily: ui, fontSize: 12, color: alert, marginBottom: 8 }}>Listening… speak now.</div>}
        <div style={{ display: "flex", gap: 10 }}>
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && send()}
            placeholder="Ask about a contract, a filing, or a procedure…"
            style={{ flex: 1, padding: "13px 16px", borderRadius: 10, border: "1px solid #C7BFA8", background: "#FFFFFF", fontFamily: ui, fontSize: 14.5, outline: "none", color: ink }}
          />
          {voice.supported && (
            <button
              onClick={voice.toggle}
              title={voice.listening ? "Stop recording" : "Speak your question"}
              style={{ width: 44, borderRadius: 10, background: voice.listening ? alert : "#FFFFFF", color: voice.listening ? parchment : chambers, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", border: `1px solid ${voice.listening ? alert : "#C7BFA8"}` }}
            >
              <Mic size={16} />
            </button>
          )}
          <button onClick={send} disabled={loading} style={{ padding: "0 22px", borderRadius: 10, border: "none", background: loading ? "#9CAB9F" : chambers, color: parchment, fontFamily: ui, fontWeight: 600, fontSize: 14, cursor: loading ? "default" : "pointer" }}>
            Send
          </button>
        </div>
      </div>
    </div>
  );
}

/* ---------- Documents ---------- */

const DRAFTABLE_DOCUMENTS_MENU = `Property & Land: Tenancy Agreement, Power of Attorney, Deed of Lease, Deed of Assignment, Search Report, Notice of Owner's Intention to Recover Premises, Notice to Quit, Deed of Gift.
Business & Contract: Shareholders Agreement, Letter of Confirmation of Instructions, Vendor Agreement, Partnership Agreement, Service Level Agreement, Employment Contract, Vendor/Supply Agreement, Memorandum of Understanding, Non-Disclosure Agreement, Arbitration Agreement/Clause, Declaration as to Next of Kin.
Litigation: Application for Police Bail, Application for Court Bail, Statement of Defence, Statement of Claim, Notice of Preliminary Objection, Notice of Appeal, Memorandum of Appearance, Letter for Adjournment of a Matter, Writ of Summons, Counter Affidavit, Motion for Extension of Time, Motion on Notice, Motion Ex Parte, Terms of Settlement, Affidavit in Support of Motion, Originating Summons, Fundamental Rights Enforcement Application, Divorce Petition, Notice of Discontinuance, Demand Letter.
General litigation components: Statement of Facts for Pleadings, Written Address, Points of Law, Legal Submissions, Affidavits (general).
This list is illustrative, not exhaustive — if the facts call for a Nigerian legal document not named here, draft the correct one anyway.`;

function useVoiceInput(onResult) {
  const [listening, setListening] = useState(false);
  const [supported, setSupported] = useState(true);
  const recognitionRef = useRef(null);

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setSupported(false);
      return;
    }
    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = "en-NG";
    recognition.onresult = (event) => {
      const transcript = Array.from(event.results).map((r) => r[0].transcript).join(" ");
      onResult(transcript);
    };
    recognition.onend = () => setListening(false);
    recognition.onerror = () => setListening(false);
    recognitionRef.current = recognition;
  }, []);

  function toggle() {
    if (!recognitionRef.current) return;
    if (listening) {
      recognitionRef.current.stop();
      setListening(false);
    } else {
      recognitionRef.current.start();
      setListening(true);
    }
  }

  return { listening, supported, toggle };
}

const DOC_CATEGORY_CARDS = [
  {
    id: "property",
    icon: Home,
    title: "Property & Land",
    desc: "Deeds, tenancy agreements, and property transfer documents.",
    guidance: "This matter is in the Property & Land category.",
    documents: [
      "Tenancy Agreement",
      "Power of Attorney",
      "Deed of Lease",
      "Deed of Assignment",
      "Search Report",
      "Notice of Owner's Intention to Recover Premises",
      "Notice to Quit",
      "Deed of Gift",
    ],
  },
  {
    id: "business",
    icon: Briefcase,
    title: "Business & Contracts",
    desc: "Partnership agreements, MOUs, and service contracts.",
    guidance: "This matter is in the Business & Contracts category.",
    documents: [
      "Shareholders Agreement",
      "Letter of Confirmation of Instructions",
      "Vendor Agreement",
      "Partnership Agreement",
      "Service Level Agreement",
      "Employment Contract",
      "Vendor/Supply Agreement",
      "Memorandum of Understanding",
      "Non-Disclosure Agreement",
      "Arbitration Agreement/Clause",
      "Declaration as to Next of Kin",
    ],
  },
  {
    id: "litigation",
    icon: Gavel,
    title: "Litigation Documents",
    desc: "Writs, motions, affidavits, and other court processes.",
    guidance: "This matter is in the Litigation category. Where the chosen document is a motion, bail application, or fundamental rights application, include the full bundle: the process itself, a supporting Affidavit with numbered deposed paragraphs, and a Written Address with issues for determination and legal argument.",
    documents: [
      "Application for Police Bail",
      "Application for Court Bail",
      "Statement of Defence",
      "Statement of Claim",
      "Notice of Preliminary Objection",
      "Notice of Appeal",
      "Memorandum of Appearance",
      "Letter for Adjournment of a Matter",
      "Writ of Summons",
      "Counter Affidavit",
      "Motion for Extension of Time",
      "Motion on Notice",
      "Motion Ex Parte",
      "Terms of Settlement",
      "Affidavit in Support of Motion",
      "Originating Summons",
      "Fundamental Rights Enforcement Application",
      "Divorce Petition",
      "Notice of Discontinuance",
      "Demand Letter",
      "Statement of Facts for Pleadings",
      "Written Address",
      "Points of Law",
      "Legal Submissions",
      "Arguments",
      "Affidavit (general)",
    ],
  },
  {
    id: "unsure",
    icon: Sparkles,
    title: "Not sure — just describe it",
    desc: "Skip the list. The AI works out what's needed from the facts alone.",
    guidance: "The category and document have not been pre-selected — determine both from the facts alone.",
    documents: [],
  },
];

function DrafterPanel({ category, onBack }) {
  const [mode, setMode] = useState(category.documents.length ? "browse" : "describe"); // browse | describe
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [issue, setIssue] = useState("");
  const [court, setCourt] = useState("");
  const [parties, setParties] = useState("");
  const [draft, setDraft] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const voice = useVoiceInput((transcript) => setIssue((prev) => (prev ? prev + " " : "") + transcript));

  function pickDocument(name) {
    setSelectedDoc(name);
    setDraft(null);
  }

  async function generateDraft() {
    if (!issue.trim() || loading) return;
    setLoading(true);
    setError("");
    setDraft(null);

    const docInstruction = selectedDoc
      ? `Draft a "${selectedDoc}" for this matter. State the document type at the top of your response, then draft it fully.`
      : `Determine which Nigerian legal document is appropriate for the matter described below. Here is the range of documents you may draft, though it is illustrative rather than a fixed menu:\n\n${DRAFTABLE_DOCUMENTS_MENU}\n\n${category.guidance}\n\nState your chosen document type clearly at the very top of your response (e.g. "DOCUMENT TYPE: Deed of Assignment"), then draft the complete document.`;

    const message = `A lawyer using LawAssist AI needs a document drafted. ${docInstruction}

Where the matter calls for a court process bundle (a motion, a bail application, a fundamental rights application), include the full bundle: the process itself, a supporting Affidavit with numbered deposed paragraphs in the deponent's voice, and a Written Address with issues for determination and legal argument — all formulated by you from the facts, not left blank for the user.

Court (if known): ${court || "[not provided — infer if possible]"}
Parties (if known): ${parties || "[not provided — infer roles from the facts]"}

Facts / description of the issue (reason from these; do not just restate them verbatim):
${issue.trim()}`;

    try {
      const resp = await fetch("/.netlify/functions/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message, mode: "draft" }),
      });
      const data = await resp.json();
      if (!resp.ok) {
        setError(data.error || "The AI drafting engine isn't configured yet. Add ANTHROPIC_API_KEY in Netlify's environment variables and redeploy.");
      } else {
        setDraft(data.reply);
      }
    } catch (e) {
      setError("Something went wrong reaching the drafting engine. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  function download() {
    const blob = new Blob([draft], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${(selectedDoc || "LawAssist_Draft").replace(/\s+/g, "_")}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  }

  // Step 1 within a category: browse the visible document list
  if (mode === "browse" && !selectedDoc) {
    return (
      <div style={{ padding: "26px 28px", overflowY: "auto", height: "100%", boxSizing: "border-box" }}>
        <div onClick={onBack} style={{ display: "flex", alignItems: "center", gap: 6, cursor: "pointer", marginBottom: 14 }}>
          <ArrowLeft size={13} color={sage} />
          <div style={{ fontFamily: ui, fontSize: 12.5, color: sage }}>All categories</div>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
          <div style={{ fontFamily: display, fontSize: 21, color: ink }}>{category.title}</div>
          <div onClick={() => setMode("describe")} style={{ fontFamily: ui, fontSize: 12.5, fontWeight: 600, color: chambers, cursor: "pointer", border: `1px solid ${chambers}`, padding: "7px 14px", borderRadius: 8 }}>
            Or just describe your issue →
          </div>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 10 }}>
          {category.documents.map((name) => (
            <div
              key={name}
              onClick={() => pickDocument(name)}
              style={{ background: "#FFFFFF", border: "1px solid #DDD6C4", borderRadius: 10, padding: "14px 16px", cursor: "pointer", fontFamily: ui, fontSize: 13.5, color: ink, fontWeight: 500 }}
            >
              {name}
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div style={{ flex: 1, display: "flex", overflow: "hidden" }}>
      <div style={{ width: "42%", padding: "26px 28px", overflowY: "auto", borderRight: "1px solid #DDD6C4" }}>
        <div
          onClick={() => (selectedDoc ? setSelectedDoc(null) : category.documents.length ? setMode("browse") : onBack())}
          style={{ display: "flex", alignItems: "center", gap: 6, cursor: "pointer", marginBottom: 14 }}
        >
          <ArrowLeft size={13} color={sage} />
          <div style={{ fontFamily: ui, fontSize: 12.5, color: sage }}>{selectedDoc ? category.title : "All categories"}</div>
        </div>
        <div style={{ fontFamily: display, fontSize: 21, color: ink, marginBottom: 4 }}>{selectedDoc ? selectedDoc : "What's the issue?"}</div>
        <div style={{ fontFamily: ui, fontSize: 12.5, color: sage, marginBottom: 16, lineHeight: 1.5 }}>
          {selectedDoc
            ? "Give the details — the AI drafts this document fully from what you provide."
            : "Describe the matter — the AI decides exactly which document fits and drafts it fully."}{" "}
          Case law citations are left as placeholders; verify them at{" "}
          <a href="https://jurisaid.ng" target="_blank" rel="noreferrer" style={{ color: chambers }}>JurisAid.ng</a> before filing.
        </div>

        <div style={{ position: "relative", marginBottom: 12 }}>
          <textarea
            value={issue}
            onChange={(e) => setIssue(e.target.value)}
            rows={8}
            placeholder="e.g. I'm letting out my 3-bedroom flat in Lekki to a tenant for 2 years at ₦2.5m annually… or: My client was detained for four days without charge and the police won't grant bail…"
            style={{ width: "100%", padding: "10px 46px 10px 12px", borderRadius: 8, border: "1px solid #C7BFA8", fontFamily: ui, fontSize: 13.5, outline: "none", boxSizing: "border-box", resize: "vertical" }}
          />
          {voice.supported && (
            <button
              onClick={voice.toggle}
              title={voice.listening ? "Stop recording" : "Speak instead of typing"}
              style={{ position: "absolute", right: 8, top: 8, width: 32, height: 32, borderRadius: "50%", border: "none", background: voice.listening ? alert : chambers, color: parchment, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
            >
              <Mic size={15} />
            </button>
          )}
        </div>
        {voice.listening && <div style={{ fontFamily: ui, fontSize: 12, color: alert, marginBottom: 10 }}>Listening… speak now.</div>}

        <label style={{ display: "block", fontFamily: ui, fontSize: 12.5, color: ink, marginBottom: 5, fontWeight: 500 }}>Court (optional)</label>
        <input value={court} onChange={(e) => setCourt(e.target.value)} placeholder="e.g. High Court of Lagos State" style={{ width: "100%", padding: "10px 12px", borderRadius: 8, border: "1px solid #C7BFA8", fontFamily: ui, fontSize: 13.5, outline: "none", boxSizing: "border-box", marginBottom: 12 }} />

        <label style={{ display: "block", fontFamily: ui, fontSize: 12.5, color: ink, marginBottom: 5, fontWeight: 500 }}>Party names (optional)</label>
        <input value={parties} onChange={(e) => setParties(e.target.value)} placeholder="e.g. Landlord: Chidi Okafor; Tenant: Bright Bakes Ltd" style={{ width: "100%", padding: "10px 12px", borderRadius: 8, border: "1px solid #C7BFA8", fontFamily: ui, fontSize: 13.5, outline: "none", boxSizing: "border-box", marginBottom: 14 }} />

        {error && <div style={{ color: alert, fontSize: 12.5, marginBottom: 10, fontFamily: ui }}>{error}</div>}
        <button onClick={generateDraft} disabled={loading} style={{ padding: "12px 20px", borderRadius: 8, border: "none", background: loading ? "#9CAB9F" : brass, color: "#1B1400", fontFamily: ui, fontWeight: 600, fontSize: 13.5, cursor: loading ? "default" : "pointer", width: "100%" }}>
          {loading ? "Drafting…" : "Draft with AI"}
        </button>
      </div>
      <div style={{ flex: 1, padding: "26px 28px", overflowY: "auto", background: "#F4F1E8" }}>
        {draft ? (
          <>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
              <div style={{ fontFamily: ui, fontSize: 12, color: sage }}>AI-formulated draft</div>
              <button onClick={download} style={{ padding: "7px 14px", borderRadius: 7, border: `1px solid ${chambers}`, background: "transparent", color: chambers, fontFamily: ui, fontSize: 12.5, fontWeight: 600, cursor: "pointer" }}>
                Download .txt
              </button>
            </div>
            <pre style={{ whiteSpace: "pre-wrap", fontFamily: ui, fontSize: 13, lineHeight: 1.7, color: ink, background: "#FFFFFF", border: "1px solid #DDD6C4", borderRadius: 10, padding: "22px 24px" }}>{draft}</pre>
          </>
        ) : (
          <div style={{ fontFamily: ui, fontSize: 13.5, color: sage, marginTop: 40, textAlign: "center" }}>{loading ? "Reviewing the facts, choosing the right document, and drafting…" : "Describe the issue and draft to preview the full document here."}</div>
        )}
      </div>
    </div>
  );
}

function DocumentsModule() {
  const [category, setCategory] = useState(null);

  if (!category) {
    return (
      <div style={{ padding: "40px 32px", overflowY: "auto", height: "100%", boxSizing: "border-box" }}>
        <div style={{ fontFamily: display, fontSize: 24, color: ink, marginBottom: 6, textAlign: "center" }}>What are you drafting today?</div>
        <div style={{ fontFamily: ui, fontSize: 13.5, color: sage, marginBottom: 32, textAlign: "center" }}>Pick a starting point — the AI still works out the exact document from what you describe.</div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 16, maxWidth: 900, margin: "0 auto" }}>
          {DOC_CATEGORY_CARDS.map((c) => (
            <div
              key={c.id}
              onClick={() => setCategory(c)}
              style={{ background: "#FFFFFF", border: "1px solid #DDD6C4", borderRadius: 14, padding: "24px 22px", cursor: "pointer" }}
            >
              <div style={{ width: 42, height: 42, borderRadius: 10, background: parchment, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 16 }}>
                <c.icon size={20} color={chambers} />
              </div>
              <div style={{ fontFamily: display, fontSize: 16.5, color: ink, marginBottom: 6 }}>{c.title}</div>
              <div style={{ fontFamily: ui, fontSize: 12.5, color: sage, lineHeight: 1.5 }}>{c.desc}</div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      <DrafterPanel category={category} onBack={() => setCategory(null)} />
    </div>
  );
}

/* ---------- Marketplace ---------- */

function LawyerCard({ lawyer, profile }) {
  const [reviews, setReviews] = useState([]);
  const [comment, setComment] = useState("");
  const [showReviews, setShowReviews] = useState(false);

  async function loadReviews() {
    const { data } = await supabase.from("reviews").select("*").eq("lawyer_id", lawyer.id).order("created_at", { ascending: false });
    setReviews(data || []);
  }

  useEffect(() => { loadReviews(); }, []);

  async function submitReview() {
    if (!comment.trim() || profile.role !== "client") return;
    const { error } = await supabase.from("reviews").insert({ lawyer_id: lawyer.id, client_id: profile.id, client_name: profile.full_name, comment: comment.trim() });
    if (!error) {
      setComment("");
      loadReviews();
    }
  }

  return (
    <div style={{ border: "1px solid #DDD6C4", borderRadius: 12, padding: "18px 18px", background: "#FFFFFF" }}>
      <div style={{ fontFamily: display, fontSize: 16.5, color: ink }}>{lawyer.full_name}</div>
      <div style={{ fontFamily: ui, fontSize: 12.5, color: chambers, fontWeight: 600, marginTop: 4 }}>{lawyer.practice_area || "General Practice"}</div>
      <div style={{ fontFamily: ui, fontSize: 12.5, color: sage, marginTop: 2 }}>{lawyer.years_experience || "—"} yrs · {lawyer.state || "—"} State</div>
      <div style={{ fontFamily: ui, fontSize: 13, color: ink, marginTop: 10, lineHeight: 1.5 }}>{lawyer.bio || "No bio provided yet."}</div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 14 }}>
        <div style={{ fontFamily: ui, fontSize: 13, fontWeight: 600, color: ink }}>{lawyer.rate || "Rate on request"}</div>
        <button onClick={() => setShowReviews(!showReviews)} style={{ padding: "8px 14px", borderRadius: 7, border: "none", background: chambers, color: parchment, fontFamily: ui, fontSize: 12.5, fontWeight: 600, cursor: "pointer" }}>
          {reviews.length} review{reviews.length === 1 ? "" : "s"}
        </button>
      </div>
      {showReviews && (
        <div style={{ marginTop: 14, borderTop: "1px solid #EAE4D2", paddingTop: 12 }}>
          {reviews.length === 0 && <div style={{ fontFamily: ui, fontSize: 12.5, color: sage, marginBottom: 10 }}>No reviews yet.</div>}
          {reviews.map((r) => (
            <div key={r.id} style={{ marginBottom: 10 }}>
              <div style={{ fontFamily: ui, fontSize: 12.5, fontWeight: 600, color: ink }}>{r.client_name}</div>
              <div style={{ fontFamily: ui, fontSize: 12.5, color: ink, lineHeight: 1.5 }}>{r.comment}</div>
            </div>
          ))}
          {profile.role === "client" && (
            <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
              <input value={comment} onChange={(e) => setComment(e.target.value)} placeholder="Leave a review…" style={{ flex: 1, padding: "8px 10px", borderRadius: 7, border: "1px solid #C7BFA8", fontFamily: ui, fontSize: 12.5, outline: "none" }} />
              <button onClick={submitReview} style={{ padding: "0 12px", borderRadius: 7, border: "none", background: brass, color: "#1B1400", fontFamily: ui, fontSize: 12, fontWeight: 600, cursor: "pointer" }}>Post</button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function MarketplaceModule({ profile }) {
  const [lawyers, setLawyers] = useState([]);
  const [practiceFilter, setPracticeFilter] = useState("All");

  useEffect(() => {
    supabase.from("profiles").select("*").eq("role", "lawyer").then(({ data }) => setLawyers(data || []));
  }, []);

  const practices = ["All", ...Array.from(new Set(lawyers.map((l) => l.practice_area).filter(Boolean)))];
  const filtered = practiceFilter === "All" ? lawyers : lawyers.filter((l) => l.practice_area === practiceFilter);

  return (
    <div style={{ padding: "28px 32px", overflowY: "auto", height: "100%", boxSizing: "border-box" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 20 }}>
        <div>
          <div style={{ fontFamily: display, fontSize: 22, color: ink }}>Find counsel</div>
          <div style={{ fontFamily: ui, fontSize: 13, color: sage, marginTop: 3 }}>Licensed Nigerian lawyers, reviewed by real clients.</div>
        </div>
        <select value={practiceFilter} onChange={(e) => setPracticeFilter(e.target.value)} style={{ padding: "9px 12px", borderRadius: 8, border: "1px solid #C7BFA8", fontFamily: ui, fontSize: 13, background: "#FFFFFF" }}>
          {practices.map((p) => <option key={p} value={p}>{p}</option>)}
        </select>
      </div>
      {lawyers.length === 0 && <div style={{ fontFamily: ui, fontSize: 13.5, color: sage }}>No lawyers have joined yet — once lawyers sign up, they'll appear here.</div>}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 14 }}>
        {filtered.map((l) => <LawyerCard key={l.id} lawyer={l} profile={profile} />)}
      </div>
    </div>
  );
}

/* ---------- Matters ---------- */

function MattersModule({ profile }) {
  const [matters, setMatters] = useState([]);
  const [title, setTitle] = useState("");

  async function loadMatters() {
    const col = profile.role === "client" ? "client_id" : "lawyer_id";
    const { data } = await supabase.from("matters").select("*").eq(col, profile.id).order("created_at", { ascending: false });
    setMatters(data || []);
  }

  useEffect(() => { loadMatters(); }, []);

  async function addMatter() {
    if (!title.trim() || profile.role !== "client") return;
    const { error } = await supabase.from("matters").insert({ client_id: profile.id, title: title.trim(), status: "Open", stage: "Just created" });
    if (!error) {
      setTitle("");
      loadMatters();
    }
  }

  const stageProgress = { "Just created": 10, "Document uploaded": 35, "CAC filing submitted": 55, "Under review": 70, "Hearing scheduled": 85, "Resolved": 100 };

  return (
    <div style={{ padding: "28px 32px", overflowY: "auto", height: "100%", boxSizing: "border-box" }}>
      <div style={{ fontFamily: display, fontSize: 22, color: ink, marginBottom: 4 }}>{profile.role === "client" ? "Your matters" : "Assigned matters"}</div>
      <div style={{ fontFamily: ui, fontSize: 13, color: sage, marginBottom: 20 }}>Track progress across every active matter.</div>
      {profile.role === "client" && (
        <div style={{ display: "flex", gap: 10, marginBottom: 22 }}>
          <input value={title} onChange={(e) => setTitle(e.target.value)} onKeyDown={(e) => e.key === "Enter" && addMatter()} placeholder="New matter title…" style={{ flex: 1, padding: "11px 14px", borderRadius: 8, border: "1px solid #C7BFA8", fontFamily: ui, fontSize: 13.5, outline: "none" }} />
          <button onClick={addMatter} style={{ padding: "0 18px", borderRadius: 8, border: "none", background: brass, color: "#1B1400", fontFamily: ui, fontWeight: 600, fontSize: 13, cursor: "pointer" }}>Add matter</button>
        </div>
      )}
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {matters.length === 0 && <div style={{ fontFamily: ui, fontSize: 13.5, color: sage }}>No matters yet.</div>}
        {matters.map((m) => (
          <div key={m.id} style={{ border: "1px solid #DDD6C4", borderRadius: 10, padding: "14px 18px", background: "#FFFFFF" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <div style={{ fontFamily: ui, fontSize: 14, fontWeight: 600, color: ink }}>{m.title}</div>
                <div style={{ fontFamily: ui, fontSize: 12.5, color: sage, marginTop: 3 }}>{m.stage}{m.due_date ? ` · Due ${m.due_date}` : ""}</div>
              </div>
              <div style={{ fontFamily: ui, fontSize: 12, fontWeight: 600, color: chambers, background: parchment, padding: "5px 10px", borderRadius: 6 }}>{m.status}</div>
            </div>
            <div style={{ marginTop: 10, height: 6, background: "#EDE8DC", borderRadius: 4, overflow: "hidden" }}>
              <div style={{ width: `${stageProgress[m.stage] || 10}%`, height: "100%", background: brass }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ---------- Compliance ---------- */

function ComplianceModule({ profile }) {
  const [items, setItems] = useState([]);
  const [name, setName] = useState("");
  const [category, setCategory] = useState("Annual Returns");
  const [dueDate, setDueDate] = useState("");

  async function loadItems() {
    const { data } = await supabase.from("compliance_items").select("*").eq("owner_id", profile.id).order("created_at", { ascending: false });
    setItems(data || []);
  }

  useEffect(() => { loadItems(); }, []);

  async function addItem() {
    if (!name.trim()) return;
    const { error } = await supabase.from("compliance_items").insert({ owner_id: profile.id, name: name.trim(), category, due_date: dueDate || null, status: "On track" });
    if (!error) {
      setName("");
      setDueDate("");
      loadItems();
    }
  }

  async function toggleStatus(item) {
    const next = item.status === "On track" ? "Due soon" : item.status === "Due soon" ? "Resolved" : "On track";
    const { error } = await supabase.from("compliance_items").update({ status: next }).eq("id", item.id);
    if (!error) loadItems();
  }

  const categories = ["Annual Returns", "Tax Obligations", "License Renewals", "Regulatory Filings", "Corporate Governance", "Other"];
  const statusColor = { "On track": chambers, "Due soon": alert, "Resolved": sage };
  const statusBg = { "On track": parchment, "Due soon": "#F6E4DF", "Resolved": "#EAE4D2" };

  return (
    <div style={{ padding: "28px 32px", overflowY: "auto", height: "100%", boxSizing: "border-box" }}>
      <div style={{ fontFamily: display, fontSize: 22, color: ink, marginBottom: 4 }}>Compliance dashboard</div>
      <div style={{ fontFamily: ui, fontSize: 13, color: sage, marginBottom: 20 }}>
        Track obligations across Annual Returns, tax, licensing, regulatory filings, and corporate governance — for yourself or your business.
      </div>
      <div style={{ display: "flex", gap: 10, marginBottom: 22, flexWrap: "wrap" }}>
        <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Obligation name…" style={{ flex: "1 1 200px", padding: "11px 14px", borderRadius: 8, border: "1px solid #C7BFA8", fontFamily: ui, fontSize: 13.5, outline: "none" }} />
        <select value={category} onChange={(e) => setCategory(e.target.value)} style={{ padding: "11px 12px", borderRadius: 8, border: "1px solid #C7BFA8", fontFamily: ui, fontSize: 13, background: "#FFFFFF" }}>
          {categories.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
        <input value={dueDate} onChange={(e) => setDueDate(e.target.value)} placeholder="Due date (e.g. Dec 31, 2026)" style={{ flex: "1 1 160px", padding: "11px 14px", borderRadius: 8, border: "1px solid #C7BFA8", fontFamily: ui, fontSize: 13.5, outline: "none" }} />
        <button onClick={addItem} style={{ padding: "0 18px", borderRadius: 8, border: "none", background: brass, color: "#1B1400", fontFamily: ui, fontWeight: 600, fontSize: 13, cursor: "pointer" }}>Add</button>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {items.length === 0 && <div style={{ fontFamily: ui, fontSize: 13.5, color: sage }}>No compliance items yet — add one above to start tracking.</div>}
        {items.map((it) => (
          <div key={it.id} style={{ border: "1px solid #DDD6C4", borderRadius: 10, padding: "14px 18px", background: "#FFFFFF", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <div style={{ fontFamily: ui, fontSize: 14, fontWeight: 600, color: ink }}>{it.name}</div>
              <div style={{ fontFamily: ui, fontSize: 12.5, color: sage, marginTop: 3 }}>{it.category}{it.due_date ? ` · Due ${it.due_date}` : ""}</div>
            </div>
            <div onClick={() => toggleStatus(it)} style={{ cursor: "pointer", fontFamily: ui, fontSize: 12, fontWeight: 600, color: statusColor[it.status], background: statusBg[it.status], padding: "5px 10px", borderRadius: 6 }}>{it.status}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ---------- App shell ---------- */

function LandingPage({ onSignIn, onGetStarted }) {
  const features = [
    { icon: FileText, title: "Describe it, don't pick it", desc: "Tell the AI what's going on — a tenancy, a dispute, an arrest — and it works out which Nigerian legal document fits, from deeds and agreements to motions and fundamental rights applications, then drafts the whole thing." },
    { icon: MessageSquare, title: "Ask, or just speak", desc: "Type a legal question or use your voice — the AI Assistant answers in plain language, and voice input works straight from the drafting box too." },
    { icon: Users, title: "Real lawyers, real reviews", desc: "Search verified Nigerian lawyers by practice area and see what past clients actually said before you reach out." },
    { icon: FolderClock, title: "Watch your matter move", desc: "Clients see live status on every case they've opened — no chasing a lawyer for updates." },
    { icon: ShieldCheck, title: "Never miss a filing", desc: "Annual Returns, tax obligations, license renewals, regulatory filings — tracked in one dashboard with reminders." },
  ];

  const steps = [
    { n: "01", title: "Say what's going on", desc: "In your own words, or by voice." },
    { n: "02", title: "The AI works out what's needed", desc: "The right document, or the right kind of lawyer." },
    { n: "03", title: "Review and act", desc: "Download, file, or connect with counsel." },
  ];

  return (
    <div style={{ minHeight: "100vh", width: "100%", background: parchment, fontFamily: ui }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "20px 40px", borderBottom: "1px solid #DDD6C4" }}>
        <div style={{ fontFamily: display, fontSize: 20, color: ink }}>LawAssist</div>
        <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
          <div onClick={onSignIn} style={{ fontFamily: ui, fontSize: 13.5, fontWeight: 600, color: ink, cursor: "pointer" }}>Sign in</div>
          <div onClick={onGetStarted} style={{ fontFamily: ui, fontSize: 13.5, fontWeight: 600, color: parchment, background: chambers, padding: "9px 18px", borderRadius: 8, cursor: "pointer" }}>Get started</div>
        </div>
      </div>

      <div style={{ maxWidth: 780, margin: "0 auto", padding: "64px 32px 40px", textAlign: "center" }}>
        <div style={{ fontFamily: display, fontSize: 34, color: ink, lineHeight: 1.25, marginBottom: 14 }}>Tell it what's wrong. It knows what to draft.</div>
        <p style={{ fontFamily: ui, fontSize: 15.5, color: ink, lineHeight: 1.7, marginBottom: 28 }}>
          LawAssist AI is legal infrastructure built for Nigeria — describe your situation and the AI determines and drafts the right document, or connects you with a verified lawyer. No legal jargon required to get started.
        </p>
        <div onClick={onGetStarted} style={{ display: "inline-block", fontFamily: ui, fontSize: 14.5, fontWeight: 600, color: parchment, background: chambers, padding: "13px 28px", borderRadius: 10, cursor: "pointer" }}>Create your free account</div>
      </div>

      <div style={{ maxWidth: 780, margin: "0 auto", padding: "12px 32px 56px", display: "flex", justifyContent: "space-between", gap: 20, flexWrap: "wrap" }}>
        {steps.map((s) => (
          <div key={s.n} style={{ flex: "1 1 200px" }}>
            <div style={{ fontFamily: display, fontSize: 26, color: brass, marginBottom: 6 }}>{s.n}</div>
            <div style={{ fontFamily: ui, fontSize: 14, fontWeight: 600, color: ink, marginBottom: 4 }}>{s.title}</div>
            <div style={{ fontFamily: ui, fontSize: 12.5, color: sage, lineHeight: 1.5 }}>{s.desc}</div>
          </div>
        ))}
      </div>

      <div style={{ maxWidth: 960, margin: "0 auto", padding: "20px 32px 72px", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 16 }}>
        {features.map((f) => (
          <div key={f.title} style={{ background: "#FFFFFF", border: "1px solid #DDD6C4", borderRadius: 12, padding: "20px 20px" }}>
            <div style={{ width: 34, height: 34, borderRadius: 8, background: parchment, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 12 }}>
              <f.icon size={17} color={chambers} />
            </div>
            <div style={{ fontFamily: display, fontSize: 16.5, color: ink, marginBottom: 8 }}>{f.title}</div>
            <div style={{ fontFamily: ui, fontSize: 13, color: sage, lineHeight: 1.55 }}>{f.desc}</div>
          </div>
        ))}
      </div>

      <div style={{ borderTop: "1px solid #DDD6C4", padding: "20px 40px", textAlign: "center" }}>
        <div style={{ fontFamily: ui, fontSize: 12, color: sage }}>
          LawAssist AI is a human-AI legal services platform, not a substitute for a lawyer. For filings, representation, and binding advice, engage a lawyer through the marketplace.
        </div>
      </div>
    </div>
  );
}

export default function LawAssistApp() {
  useFonts();
  const [session, setSession] = useState(null);
  const [profile, setProfile] = useState(null);
  const [active, setActive] = useState("about");
  const [loadingAuth, setLoadingAuth] = useState(true);
  const [showAuth, setShowAuth] = useState(false);
  const [authMode, setAuthMode] = useState("signin");

  async function loadProfile(userId) {
    const { data } = await supabase.from("profiles").select("*").eq("id", userId).single();
    setProfile(data);
  }

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) loadProfile(session.user.id);
      setLoadingAuth(false);
    });
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) loadProfile(session.user.id);
      else setProfile(null);
    });
    return () => listener.subscription.unsubscribe();
  }, []);

  async function handleSignOut() {
    await supabase.auth.signOut();
  }

  if (loadingAuth) {
    return <div style={{ minHeight: "100vh", background: parchment, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: ui, color: sage }}>Loading…</div>;
  }

  if (!session || !profile) {
    if (!showAuth) {
      return (
        <LandingPage
          onSignIn={() => { setAuthMode("signin"); setShowAuth(true); }}
          onGetStarted={() => { setAuthMode("signup"); setShowAuth(true); }}
        />
      );
    }
    return <AuthScreen onBack={() => setShowAuth(false)} initialMode={authMode} />;
  }

  return (
    <div style={{ display: "flex", height: "100vh", width: "100%", background: parchment, fontFamily: ui }}>
      <div style={{ width: 220, background: ink, display: "flex", flexDirection: "column", padding: "22px 0" }}>
        <div style={{ padding: "0 22px 22px", borderBottom: "1px solid #2A3830" }}>
          <div style={{ fontFamily: display, fontSize: 20, color: parchment }}>LawAssist</div>
          <div style={{ fontSize: 11, color: "#8A9990", marginTop: 2 }}>Legal infrastructure, Africa</div>
        </div>
        <div style={{ padding: "16px 12px", flex: 1 }}>
          {MODULES.map((m) => (
            <div key={m.id} onClick={() => setActive(m.id)} style={{ padding: "11px 14px", borderRadius: 8, marginBottom: 4, cursor: "pointer", background: active === m.id ? chambers : "transparent" }}>
              <div style={{ fontSize: 13.5, fontWeight: 600, color: active === m.id ? parchment : "#C9D1CB" }}>{m.label}</div>
              <div style={{ fontSize: 11, color: active === m.id ? "#B7C4BC" : "#6E7D74", marginTop: 1 }}>{m.desc}</div>
            </div>
          ))}
        </div>
        <div style={{ padding: "12px 22px 0", borderTop: "1px solid #2A3830" }}>
          <div style={{ fontSize: 11, color: "#8A9990", paddingTop: 12 }}>Signed in as</div>
          <div style={{ fontSize: 13, color: parchment, fontWeight: 600, marginTop: 2 }}>{profile.full_name}</div>
          <div style={{ fontSize: 11, color: "#8A9990", marginTop: 1, textTransform: "capitalize" }}>{profile.role}</div>
          <div onClick={handleSignOut} style={{ fontSize: 11.5, color: brass, marginTop: 10, cursor: "pointer", fontWeight: 600 }}>Sign out</div>
        </div>
      </div>
      <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column" }}>
        <div style={{ padding: "16px 32px", borderBottom: "1px solid #DDD6C4", background: "#F7F5EE" }}>
          <div style={{ fontFamily: display, fontSize: 18, color: ink }}>{MODULES.find((m) => m.id === active)?.label}</div>
        </div>
        <div style={{ flex: 1, minHeight: 0, background: "#FFFFFF" }}>
          {active === "about" && <AboutModule />}
          {active === "assistant" && <AssistantModule />}
          {active === "documents" && <DocumentsModule />}
          {active === "marketplace" && <MarketplaceModule profile={profile} />}
          {active === "matters" && <MattersModule profile={profile} />}
          {active === "compliance" && <ComplianceModule profile={profile} />}
        </div>
      </div>
    </div>
  );
}
