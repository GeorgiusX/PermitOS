/**
 * Ingest Miami Beach city building permits from the EnerGov Civic Access portal.
 *
 * Source: City of Miami Beach — Tyler Technologies EnerGov CSS
 * Portal:  https://energovcss.miamibeachfl.gov/EnerGovProd/SelfService#/search
 * API:     POST /energovprod/selfservice/api/energov/search/search
 * Records: ~389,850 permits
 *
 * Run:
 *   npx tsx --env-file=.env.local scripts/ingest-miami-beach-permits.ts
 */

import { createClient } from "@supabase/supabase-js";

const API_URL =
  "https://energovcss.miamibeachfl.gov/energovprod/selfservice/api/energov/search/search";

const PAGE_SIZE = 50;
const UPSERT_BATCH = 50;
const SOURCE = "miami_beach_city";
const DELAY_MS = 350;

// ---------------------------------------------------------------------------
// Supabase client
// ---------------------------------------------------------------------------
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";
const supabaseKey =
  serviceKey.startsWith("eyJ") || serviceKey.startsWith("sb_secret_")
    ? serviceKey
    : process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  supabaseKey,
);

// ---------------------------------------------------------------------------
// Request body — exact structure the EnerGov portal sends (payload-captured)
// ---------------------------------------------------------------------------
function buildBody(pageNumber: number, pageSize: number) {
  return {
    Keyword: "",
    ExactMatch: true,
    SearchModule: 1,
    FilterModule: 2,
    SearchMainAddress: false,
    PlanCriteria: {
      PlanNumber: null, PlanTypeId: null, PlanWorkclassId: null,
      PlanStatusId: null, ProjectName: null, ApplyDateFrom: null,
      ApplyDateTo: null, ExpireDateFrom: null, ExpireDateTo: null,
      CompleteDateFrom: null, CompleteDateTo: null, Address: null,
      Description: null, SearchMainAddress: false, ContactId: null,
      ParcelNumber: null, TypeId: null, WorkClassIds: null,
      ExcludeCases: null, EnableDescriptionSearch: false,
      PageNumber: 0, PageSize: 0, SortBy: null, SortAscending: false,
    },
    PermitCriteria: {
      PermitNumber: null, PermitTypeId: "none", PermitWorkclassId: null,
      PermitStatusId: "none", ProjectName: null, IssueDateFrom: null,
      IssueDateTo: null, Address: null, Description: null,
      ExpireDateFrom: null, ExpireDateTo: null, FinalDateFrom: null,
      FinalDateTo: null, ApplyDateFrom: null, ApplyDateTo: null,
      SearchMainAddress: false, ContactId: null, TypeId: null,
      WorkClassIds: null, ParcelNumber: null, ExcludeCases: null,
      EnableDescriptionSearch: false,
      PageNumber: 0, PageSize: 0, SortBy: "PermitNumber.keyword", SortAscending: false,
    },
    InspectionCriteria: {
      Keyword: null, ExactMatch: false, Complete: null,
      InspectionNumber: null, InspectionTypeId: null, InspectionStatusId: null,
      RequestDateFrom: null, RequestDateTo: null, ScheduleDateFrom: null,
      ScheduleDateTo: null, Address: null, SearchMainAddress: false,
      ContactId: null, TypeId: [], WorkClassIds: [], ParcelNumber: null,
      DisplayCodeInspections: false, ExcludeCases: [], ExcludeFilterModules: [],
      HiddenInspectionTypeIDs: null,
      PageNumber: 0, PageSize: 0, SortBy: null, SortAscending: false,
    },
    CodeCaseCriteria: {
      CodeCaseNumber: null, CodeCaseTypeId: null, CodeCaseStatusId: null,
      ProjectName: null, OpenedDateFrom: null, OpenedDateTo: null,
      ClosedDateFrom: null, ClosedDateTo: null, Address: null,
      ParcelNumber: null, Description: null, SearchMainAddress: false,
      RequestId: null, ExcludeCases: null, ContactId: null,
      EnableDescriptionSearch: false, HiddenCodeCaseTypeIds: null,
      PageNumber: 0, PageSize: 0, SortBy: null, SortAscending: false,
    },
    RequestCriteria: {
      RequestNumber: null, RequestTypeId: null, RequestStatusId: null,
      ProjectName: null, EnteredDateFrom: null, EnteredDateTo: null,
      DeadlineDateFrom: null, DeadlineDateTo: null, CompleteDateFrom: null,
      CompleteDateTo: null, Address: null, ParcelNumber: null,
      SearchMainAddress: false,
      PageNumber: 0, PageSize: 0, SortBy: null, SortAscending: false,
    },
    BusinessLicenseCriteria: {
      LicenseNumber: null, LicenseTypeId: null, LicenseClassId: null,
      LicenseStatusId: null, BusinessStatusId: null, LicenseYear: null,
      ApplicationDateFrom: null, ApplicationDateTo: null, IssueDateFrom: null,
      IssueDateTo: null, ExpirationDateFrom: null, ExpirationDateTo: null,
      SearchMainAddress: false, CompanyTypeId: null, CompanyName: null,
      BusinessTypeId: null, Description: null, CompanyOpenedDateFrom: null,
      CompanyOpenedDateTo: null, CompanyClosedDateFrom: null,
      CompanyClosedDateTo: null, LastAuditDateFrom: null, LastAuditDateTo: null,
      ParcelNumber: null, Address: null, TaxID: null, DBA: null,
      ExcludeCases: null, TypeId: null, WorkClassIds: null, ContactId: null,
      PageNumber: 0, PageSize: 0, SortBy: null, SortAscending: false,
    },
    ProfessionalLicenseCriteria: {
      LicenseNumber: null, HolderFirstName: null, HolderMiddleName: null,
      HolderLastName: null, HolderCompanyName: null, LicenseTypeId: null,
      LicenseClassId: null, LicenseStatusId: null, IssueDateFrom: null,
      IssueDateTo: null, ExpirationDateFrom: null, ExpirationDateTo: null,
      ApplicationDateFrom: null, ApplicationDateTo: null, Address: null,
      MainParcel: null, SearchMainAddress: false, ExcludeCases: null,
      TypeId: null, WorkClassIds: null, ContactId: null,
      PageNumber: 0, PageSize: 0, SortBy: null, SortAscending: false,
    },
    LicenseCriteria: {
      LicenseNumber: null, LicenseTypeId: null, LicenseClassId: null,
      LicenseStatusId: null, BusinessStatusId: null, ApplicationDateFrom: null,
      ApplicationDateTo: null, IssueDateFrom: null, IssueDateTo: null,
      ExpirationDateFrom: null, ExpirationDateTo: null, SearchMainAddress: false,
      CompanyTypeId: null, CompanyName: null, BusinessTypeId: null,
      Description: null, CompanyOpenedDateFrom: null, CompanyOpenedDateTo: null,
      CompanyClosedDateFrom: null, CompanyClosedDateTo: null,
      LastAuditDateFrom: null, LastAuditDateTo: null, ParcelNumber: null,
      Address: null, TaxID: null, DBA: null, ExcludeCases: null,
      TypeId: null, WorkClassIds: null, ContactId: null,
      HolderFirstName: null, HolderMiddleName: null, HolderLastName: null,
      MainParcel: null, EnableDescriptionSearchForBLicense: false,
      EnableDescriptionSearchForPLicense: false,
      EnableDescriptionSearchForOperationalPermit: false,
      IsOperationalPermit: false,
      PageNumber: 0, PageSize: 0, SortBy: null, SortAscending: false,
    },
    ProjectCriteria: {
      ProjectNumber: null, ProjectName: null, Address: null,
      ParcelNumber: null, StartDateFrom: null, StartDateTo: null,
      ExpectedEndDateFrom: null, ExpectedEndDateTo: null,
      CompleteDateFrom: null, CompleteDateTo: null, Description: null,
      SearchMainAddress: false, ContactId: null, TypeId: null,
      ExcludeCases: null, EnableDescriptionSearch: false,
      PageNumber: 0, PageSize: 0, SortBy: null, SortAscending: false,
    },
    // Required SortList arrays
    PlanSortList: [
      { Key: "relevance", Value: "Relevance" },
      { Key: "PlanNumber.keyword", Value: "Plan Number" },
      { Key: "ProjectName.keyword", Value: "Project" },
      { Key: "MainAddress", Value: "Address" },
      { Key: "ApplyDate", Value: "Apply Date" },
    ],
    PermitSortList: [
      { Key: "relevance", Value: "Relevance" },
      { Key: "PermitNumber.keyword", Value: "Permit Number" },
      { Key: "ProjectName.keyword", Value: "Project" },
      { Key: "MainAddress", Value: "Address" },
      { Key: "IssueDate", Value: "Issued Date" },
      { Key: "FinalDate", Value: "Finalized Date" },
    ],
    InspectionSortList: [
      { Key: "relevance", Value: "Relevance" },
      { Key: "InspectionNumber.keyword", Value: "Inspection Number" },
      { Key: "MainAddress", Value: "Address" },
      { Key: "ScheduledDate", Value: "Schedule Date" },
      { Key: "RequestDate", Value: "Request Date" },
    ],
    CodeCaseSortList: [
      { Key: "relevance", Value: "Relevance" },
      { Key: "CaseNumber.keyword", Value: "Code Case Number" },
      { Key: "ProjectName.keyword", Value: "Project" },
      { Key: "MainAddress", Value: "Address" },
      { Key: "OpenedDate", Value: "Opened Date" },
      { Key: "ClosedDate", Value: "Closed Date" },
    ],
    RequestSortList: [
      { Key: "relevance", Value: "Relevance" },
      { Key: "RequestNumber.keyword", Value: "Request Number" },
      { Key: "ProjectName.keyword", Value: "Project Name" },
      { Key: "MainAddress", Value: "Address" },
      { Key: "EnteredDate", Value: "Date Entered" },
      { Key: "CompleteDate", Value: "Completion Date" },
    ],
    LicenseSortList: [
      { Key: "relevance", Value: "Relevance" },
      { Key: "LicenseNumber.keyword", Value: "License Number" },
      { Key: "LicenseNumber.keyword", Value: "Operational Permit Number" },
      { Key: "CompanyName.keyword", Value: "Company Name" },
      { Key: "AppliedDate", Value: "Applied Date" },
      { Key: "MainAddress", Value: "Address" },
    ],
    ProjectSortList: [
      { Key: "relevance", Value: "Relevance" },
      { Key: "ProjectNumber.keyword", Value: "Project Number" },
      { Key: "ProjectName.keyword", Value: "Project Name" },
      { Key: "StartDate", Value: "Start Date" },
      { Key: "CompleteDate", Value: "Completed Date" },
      { Key: "ExpectedEndDate", Value: "Expected End Date" },
      { Key: "MainAddress", Value: "Address" },
    ],
    ExcludeCases: null,
    SortOrderList: [
      { Key: true, Value: "Ascending" },
      { Key: false, Value: "Descending" },
    ],
    HiddenInspectionTypeIDs: null,
    PageNumber: pageNumber,
    PageSize: pageSize,
    SortBy: "PermitNumber.keyword",
    SortAscending: true,
  };
}

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
interface EnerGovAddress {
  AddressLine1?: string;
  AddressLine2?: string;
  FullAddress?: string;
  City?: string;
  StateName?: string;
  PostalCode?: string;
}

interface EnerGovPermit {
  CaseId?: string;
  CaseNumber?: string;
  CaseType?: string;
  CaseWorkclass?: string;
  CaseStatus?: string;
  ProjectName?: string;
  Description?: string;
  MainParcel?: string;
  IssueDate?: string | null;
  ApplyDate?: string | null;
  ExpireDate?: string | null;
  CompleteDate?: string | null;
  FinalDate?: string | null;
  Address?: EnerGovAddress;
  [key: string]: unknown;
}

interface EnerGovResponse {
  Result?: {
    EntityResults?: EnerGovPermit[];
    PermitsFound?: number;
    TotalPages?: number;
  };
  Success?: boolean;
}

interface PermitRow {
  source: string;
  source_id: string;
  permit_number: string | null;
  permit_type: string | null;
  application_type: string | null;
  folio_number: string | null;
  property_address: string | null;
  city: string | null;
  state: string;
  zip: string | null;
  work_description: string | null;
  application_date: string | null;
  permit_issued_date: string | null;
  co_cc_date: string | null;
  status: string | null;
  raw_data: Record<string, unknown>;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function str(val: unknown): string | null {
  if (!val) return null;
  const s = String(val).trim();
  return s || null;
}

function toDate(val: unknown): string | null {
  if (!val) return null;
  const s = String(val).trim();
  if (/^\d{4}-\d{2}-\d{2}/.test(s)) return s.slice(0, 10);
  return null;
}

function cleanZip(raw: string | undefined): string | null {
  if (!raw) return null;
  // Some zips come through as negative: "-331394415" → strip leading dash
  const z = raw.replace(/^-/, "").trim();
  return z || null;
}

function mapRecord(p: EnerGovPermit): PermitRow {
  const addr = p.Address;
  const street = str(addr?.FullAddress ?? `${addr?.AddressLine1 ?? ""} ${addr?.AddressLine2 ?? ""}`.trim());
  return {
    source: SOURCE,
    source_id: p.CaseId ?? p.CaseNumber ?? `unknown-${Date.now()}`,
    permit_number: str(p.CaseNumber),
    permit_type: str(p.CaseType),
    application_type: str(p.CaseWorkclass),
    folio_number: str(p.MainParcel),
    property_address: street,
    city: str(addr?.City) ?? "Miami Beach",
    state: str(addr?.StateName) ?? "FL",
    zip: cleanZip(addr?.PostalCode),
    work_description: str(p.Description) ?? str(p.ProjectName),
    application_date: toDate(p.ApplyDate),
    permit_issued_date: toDate(p.IssueDate),
    co_cc_date: toDate(p.CompleteDate ?? p.FinalDate),
    status: str(p.CaseStatus),
    raw_data: p as Record<string, unknown>,
  };
}

// ---------------------------------------------------------------------------
// Fetch + upsert
// ---------------------------------------------------------------------------
async function fetchPage(pageNumber: number): Promise<EnerGovResponse> {
  const res = await fetch(API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json;charset=UTF-8",
      Accept: "application/json, text/plain, */*",
      "X-Requested-With": "XMLHttpRequest",
      Origin: "https://energovcss.miamibeachfl.gov",
      Referer: "https://energovcss.miamibeachfl.gov/EnerGovProd/SelfService",
      tenantId: "3",
      tenantName: "miamibeachflprod2",
      "Tyler-TenantUrl": "MiamiBeachFLProd",
      "Tyler-Tenant-Culture": "en-US",
    },
    body: JSON.stringify(buildBody(pageNumber, PAGE_SIZE)),
  });

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`EnerGov HTTP ${res.status}: ${body.slice(0, 300)}`);
  }
  return res.json() as Promise<EnerGovResponse>;
}

async function upsertBatch(rows: PermitRow[]): Promise<void> {
  const { error } = await supabase
    .from("public_permits")
    .upsert(rows, { onConflict: "source,source_id" });
  if (error) throw new Error(`Supabase upsert error: ${error.message}`);
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------
async function main() {
  console.log("=== Miami Beach city permit ingestion ===");
  console.log(`Endpoint: ${API_URL}`);

  const first = await fetchPage(1);
  if (!first.Success) throw new Error("API returned Success: false on page 1");

  const total = first.Result?.PermitsFound ?? 0;
  const totalPages = Math.ceil(total / PAGE_SIZE);
  const firstBatch = first.Result?.EntityResults ?? [];

  console.log(`Total permits: ${total.toLocaleString()} across ${totalPages.toLocaleString()} pages`);

  let ingested = 0;

  for (let page = 1; page <= totalPages; page++) {
    process.stdout.write(
      `\rPage ${page}/${totalPages} — ingested ${ingested.toLocaleString()} / ${total.toLocaleString()}  `,
    );

    const batch = page === 1 ? firstBatch : (await fetchPage(page)).Result?.EntityResults ?? [];
    if (batch.length === 0) break;

    for (let i = 0; i < batch.length; i += UPSERT_BATCH) {
      await upsertBatch(batch.slice(i, i + UPSERT_BATCH).map(mapRecord));
    }

    ingested += batch.length;

    if (page < totalPages) await new Promise((r) => setTimeout(r, DELAY_MS));
  }

  console.log(`\n\nDone. ${ingested.toLocaleString()} Miami Beach permits upserted.`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
