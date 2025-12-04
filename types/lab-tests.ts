/**
 * ═══════════════════════════════════════════════════════════════
 * LAB TEST DEFINITIONS
 * ═══════════════════════════════════════════════════════════════
 * Contains all lab test groups and individual tests for the
 * Laboratory module. Used by /lab/visit/[visitId] page.
 * ═══════════════════════════════════════════════════════════════
 */

// All lab groups (section headers)
export type LabTestGroupId =
  | "HEMATOLOGI"
  | "URINALYSIS"
  | "FAECES_ANALYSIS"
  | "MICROBIOLOGY"
  | "KIMIA_DARAH_LFT"
  | "RENAL_FUNCTION"
  | "LIPID_PROFILE"
  | "DIABETES"
  | "IMMUNOSEROLOGY"
  | "ELECTROLYTE_BLOOD_GAS";

export interface LabTestGroup {
  id: LabTestGroupId;
  label: string;
}

export const LAB_TEST_GROUPS: LabTestGroup[] = [
  { id: "HEMATOLOGI",            label: "Hematologi" },
  { id: "URINALYSIS",            label: "Urinalysis" },
  { id: "FAECES_ANALYSIS",       label: "Faeces Analysis" },
  { id: "MICROBIOLOGY",          label: "Microbiology" },
  { id: "KIMIA_DARAH_LFT",       label: "Kimia Darah / Liver Function Test (LFT)" },
  { id: "RENAL_FUNCTION",        label: "Renal Function Test (RFT)" },
  { id: "LIPID_PROFILE",         label: "Lipid Profile (LP)" },
  { id: "DIABETES",              label: "Diabetes" },
  { id: "IMMUNOSEROLOGY",        label: "Immunoserology" },
  { id: "ELECTROLYTE_BLOOD_GAS", label: "Electrolyte – Blood Gas" },
];

export type LabTestId =
  // HEMATOLOGI
  | "HEMATOLOGI_RUTIN"
  | "HEMOGLOBIN"
  | "LED"
  | "RUMPLE_LEED"
  | "MASA_PERDARAHAN_BT"
  | "MASA_PEMBEKUAN_CT"
  | "GOL_DARAH_ABO_RHESUS"
  | "HEMATOLOGI_LAIN_LAIN"

  // URINALYSIS
  | "URINE_LENGKAP_UL"
  | "ESBACH_PROTEIN_BENCE_JONES"
  | "PROTEIN_URINE"
  | "GLUCOSE_URINE"
  | "PREGNANT_TEST_PT"

  // FAECES ANALYSIS
  | "FESES_LENGKAP"
  | "FEACES_LIPID"
  | "FEACES_DIGESTION"
  | "FEACES_OCCULT_BLOOD"

  // MICROBIOLOGY
  | "BTA"
  | "GRAM_STAINING"
  | "MALARIA"

  // KIMIA DARAH / LFT
  | "SGOT_AST"
  | "SGPT_ALT"
  | "GAMMA_GT"
  | "ALP"
  | "BILIRUBIN_TOTAL"
  | "BILIRUBIN_DIRECT"
  | "TOTAL_PROTEIN_TP"
  | "ALBUMIN"

  // RENAL FUNCTION TEST (RFT)
  | "UREA_N"
  | "CREATININ"
  | "URIC_ACID"

  // LIPID PROFILE (LP)
  | "TOTAL_CHOLESTEROL"
  | "LDL_CHOLESTEROL"
  | "HDL_CHOLESTEROL"
  | "TRIGLISERIDA"

  // DIABETES
  | "GLUKOSA_SEWAKTU"
  | "GLUKOSA_PUASA"
  | "GLUKOSA_2_JPP"
  | "HBA1C"
  | "TTGO"
  | "DIABETES_LAIN_LAIN"

  // IMMUNOSEROLOGY
  | "HBSAG"
  | "ANTI_HBS"
  | "ANTI_HBC"
  | "IGM_ANTI_HBE"
  | "HBEAG"
  | "ANTI_HAV"
  | "IGM_ANTI_HAV"
  | "ANTI_HCV"
  | "IGM_ANTI_HEV"
  | "VDRL"
  | "TPHA"
  | "GO"
  | "IGG_IGM_ANTI_DENGUE"
  | "NS1_ANTIGEN"
  | "ANTI_HIV"
  | "ANTI_HIV_KONFIRMASI"
  | "WIDAL"
  | "IGG_IGM_MALARIA"
  | "IGG_IGM_RUBELLA"
  | "IMMUNO_LAIN_LAIN"

  // ELECTROLYTE – BLOOD GAS
  | "KALIUM_K"
  | "CALSIUM_CA"
  | "SODIUM_NA"
  | "MAGNESIUM_MG"
  | "CHLORIDA_CL"
  | "ANALISA_GAS_DARAH";

export interface LabTestDefinition {
  id: LabTestId;
  groupId: LabTestGroupId;
  label: string;     // what you display in the checkbox
  note?: string;     // for the (*) ones or extra info if needed
}

// Structured by group – nice for accordion rendering
export const LAB_TESTS_BY_GROUP: Record<LabTestGroupId, LabTestDefinition[]> = {
  HEMATOLOGI: [
    { id: "HEMATOLOGI_RUTIN",        groupId: "HEMATOLOGI", label: "Hematologi Rutin" },
    { id: "HEMOGLOBIN",              groupId: "HEMATOLOGI", label: "Hemoglobin" },
    { id: "LED",                     groupId: "HEMATOLOGI", label: "LED" },
    { id: "RUMPLE_LEED",             groupId: "HEMATOLOGI", label: "Rumple Leed" },
    { id: "MASA_PERDARAHAN_BT",      groupId: "HEMATOLOGI", label: "Masa Perdarahan (BT)" },
    { id: "MASA_PEMBEKUAN_CT",       groupId: "HEMATOLOGI", label: "Masa Pembekuan (CT)" },
    { id: "GOL_DARAH_ABO_RHESUS",    groupId: "HEMATOLOGI", label: "Golongan Darah ABO dan Rhesus" },
    { id: "HEMATOLOGI_LAIN_LAIN",    groupId: "HEMATOLOGI", label: "Lain-lain" },
  ],

  URINALYSIS: [
    { id: "URINE_LENGKAP_UL",           groupId: "URINALYSIS", label: "Urine Lengkap (UL)" },
    { id: "ESBACH_PROTEIN_BENCE_JONES", groupId: "URINALYSIS", label: "Esbach Protein Bence Jones (*)", note: "(*)" },
    { id: "PROTEIN_URINE",              groupId: "URINALYSIS", label: "Protein Urine (*)", note: "(*)" },
    { id: "GLUCOSE_URINE",              groupId: "URINALYSIS", label: "Glucose Urine" },
    { id: "PREGNANT_TEST_PT",           groupId: "URINALYSIS", label: "Pregnant Test (PT)" },
  ],

  FAECES_ANALYSIS: [
    { id: "FESES_LENGKAP",       groupId: "FAECES_ANALYSIS", label: "Feses Lengkap" },
    { id: "FEACES_LIPID",        groupId: "FAECES_ANALYSIS", label: "Lipid" },
    { id: "FEACES_DIGESTION",    groupId: "FAECES_ANALYSIS", label: "Digestion" },
    { id: "FEACES_OCCULT_BLOOD", groupId: "FAECES_ANALYSIS", label: "Occult Blood" },
  ],

  MICROBIOLOGY: [
    { id: "BTA",            groupId: "MICROBIOLOGY", label: "BTA" },
    { id: "GRAM_STAINING",  groupId: "MICROBIOLOGY", label: "Gram Staining" },
    { id: "MALARIA",        groupId: "MICROBIOLOGY", label: "Malaria" },
  ],

  KIMIA_DARAH_LFT: [
    { id: "SGOT_AST",         groupId: "KIMIA_DARAH_LFT", label: "SGOT / AST" },
    { id: "SGPT_ALT",         groupId: "KIMIA_DARAH_LFT", label: "SGPT / ALT" },
    { id: "GAMMA_GT",         groupId: "KIMIA_DARAH_LFT", label: "Gamma GT" },
    { id: "ALP",              groupId: "KIMIA_DARAH_LFT", label: "ALP" },
    { id: "BILIRUBIN_TOTAL",  groupId: "KIMIA_DARAH_LFT", label: "Bilirubin Total" },
    { id: "BILIRUBIN_DIRECT", groupId: "KIMIA_DARAH_LFT", label: "Bilirubin Direct" },
    { id: "TOTAL_PROTEIN_TP", groupId: "KIMIA_DARAH_LFT", label: "Total Protein (TP)" },
    { id: "ALBUMIN",          groupId: "KIMIA_DARAH_LFT", label: "Albumin" },
  ],

  RENAL_FUNCTION: [
    { id: "UREA_N",     groupId: "RENAL_FUNCTION", label: "Urea N (*)", note: "(*)" },
    { id: "CREATININ",  groupId: "RENAL_FUNCTION", label: "Creatinin" },
    { id: "URIC_ACID",  groupId: "RENAL_FUNCTION", label: "Uric Acid (*)", note: "(*)" },
  ],

  LIPID_PROFILE: [
    { id: "TOTAL_CHOLESTEROL", groupId: "LIPID_PROFILE", label: "Total Cholesterol" },
    { id: "LDL_CHOLESTEROL",   groupId: "LIPID_PROFILE", label: "LDL Cholesterol" },
    { id: "HDL_CHOLESTEROL",   groupId: "LIPID_PROFILE", label: "HDL Cholesterol" },
    { id: "TRIGLISERIDA",      groupId: "LIPID_PROFILE", label: "Trigliserida (*)", note: "(*)" },
  ],

  DIABETES: [
    { id: "GLUKOSA_SEWAKTU", groupId: "DIABETES", label: "Glukosa Sewaktu" },
    { id: "GLUKOSA_PUASA",   groupId: "DIABETES", label: "Glukosa Puasa (*)", note: "(*)" },
    { id: "GLUKOSA_2_JPP",   groupId: "DIABETES", label: "Glukosa 2 JPP" },
    { id: "HBA1C",           groupId: "DIABETES", label: "HBA1c" },
    { id: "TTGO",            groupId: "DIABETES", label: "TTGO" },
    { id: "DIABETES_LAIN_LAIN", groupId: "DIABETES", label: "Lain-lain" },
  ],

  IMMUNOSEROLOGY: [
    { id: "HBSAG",               groupId: "IMMUNOSEROLOGY", label: "HBsAg" },
    { id: "ANTI_HBS",            groupId: "IMMUNOSEROLOGY", label: "Anti-HBs" },
    { id: "ANTI_HBC",            groupId: "IMMUNOSEROLOGY", label: "Anti-HBc" },
    { id: "IGM_ANTI_HBE",        groupId: "IMMUNOSEROLOGY", label: "IgM Anti HBe" },
    { id: "HBEAG",               groupId: "IMMUNOSEROLOGY", label: "HBeAg" },
    { id: "ANTI_HAV",            groupId: "IMMUNOSEROLOGY", label: "Anti-HAV" },
    { id: "IGM_ANTI_HAV",        groupId: "IMMUNOSEROLOGY", label: "IgM Anti-HAV" },
    { id: "ANTI_HCV",            groupId: "IMMUNOSEROLOGY", label: "Anti-HCV" },
    { id: "IGM_ANTI_HEV",        groupId: "IMMUNOSEROLOGY", label: "IgM Anti-HEV" },
    { id: "VDRL",                groupId: "IMMUNOSEROLOGY", label: "VDRL" },
    { id: "TPHA",                groupId: "IMMUNOSEROLOGY", label: "TPHA" },
    { id: "GO",                  groupId: "IMMUNOSEROLOGY", label: "GO" },
    { id: "IGG_IGM_ANTI_DENGUE", groupId: "IMMUNOSEROLOGY", label: "IgG IgM Anti-Dengue" },
    { id: "NS1_ANTIGEN",         groupId: "IMMUNOSEROLOGY", label: "NS1 Antigen" },
    { id: "ANTI_HIV",            groupId: "IMMUNOSEROLOGY", label: "Anti-HIV" },
    { id: "ANTI_HIV_KONFIRMASI", groupId: "IMMUNOSEROLOGY", label: "Anti-HIV Konfirmasi" },
    { id: "WIDAL",               groupId: "IMMUNOSEROLOGY", label: "WIDAL" },
    { id: "IGG_IGM_MALARIA",     groupId: "IMMUNOSEROLOGY", label: "IgG IgM Malaria" },
    { id: "IGG_IGM_RUBELLA",     groupId: "IMMUNOSEROLOGY", label: "IgG IgM Rubella" },
    { id: "IMMUNO_LAIN_LAIN",    groupId: "IMMUNOSEROLOGY", label: "Lain-lain" },
  ],

  ELECTROLYTE_BLOOD_GAS: [
    { id: "KALIUM_K",          groupId: "ELECTROLYTE_BLOOD_GAS", label: "Kalium (K)" },
    { id: "CALSIUM_CA",        groupId: "ELECTROLYTE_BLOOD_GAS", label: "Calsium (Ca)" },
    { id: "SODIUM_NA",         groupId: "ELECTROLYTE_BLOOD_GAS", label: "Sodium (Na)" },
    { id: "MAGNESIUM_MG",      groupId: "ELECTROLYTE_BLOOD_GAS", label: "Magnesium (Mg)" },
    { id: "CHLORIDA_CL",       groupId: "ELECTROLYTE_BLOOD_GAS", label: "Chlorida (Cl)" },
    { id: "ANALISA_GAS_DARAH", groupId: "ELECTROLYTE_BLOOD_GAS", label: "Analisa Gas Darah" },
  ],
};

// Helper to get all tests as a flat array
export const getAllLabTests = (): LabTestDefinition[] => {
  return Object.values(LAB_TESTS_BY_GROUP).flat();
};

// Helper to find a test by ID
export const getLabTestById = (testId: LabTestId): LabTestDefinition | undefined => {
  return getAllLabTests().find(test => test.id === testId);
};

// Helper to get group by ID
export const getLabTestGroupById = (groupId: LabTestGroupId): LabTestGroup | undefined => {
  return LAB_TEST_GROUPS.find(group => group.id === groupId);
};

