/**
 * ═══════════════════════════════════════════════════════════════
 * RADIOLOGY TEST DEFINITIONS
 * ═══════════════════════════════════════════════════════════════
 * Contains all radiology test groups and individual tests for the
 * Radiologi module. Used by /radiologi/visit/[visitId] page.
 * ═══════════════════════════════════════════════════════════════
 */

// ===== RADIOLOGY – GROUPS =====
export type RadiologyTestGroupId =
  | "SKULL"
  | "THORAX"
  | "ABDOMEN"
  | "VERTEBRA"
  | "EXTREMITY_SUPERIOR"
  | "EXTREMITY_INFERIOR"
  | "USG"
  | "REFERRAL"; // Pemeriksaan Rujukan

export interface RadiologyTestGroup {
  id: RadiologyTestGroupId;
  label: string;
}

export const RADIOLOGY_TEST_GROUPS: RadiologyTestGroup[] = [
  { id: "SKULL",              label: "Skull" },
  { id: "THORAX",             label: "Thorax" },
  { id: "ABDOMEN",            label: "Abdomen" },
  { id: "VERTEBRA",           label: "Vertebra" },
  { id: "EXTREMITY_SUPERIOR", label: "Ekstremitas Superior" },
  { id: "EXTREMITY_INFERIOR", label: "Ekstremitas Inferior" },
  { id: "USG",                label: "USG" },
  { id: "REFERRAL",           label: "Pemeriksaan Rujukan" },
];

// ===== RADIOLOGY – TEST IDS =====
export type RadiologyTestId =
  // SKULL
  | "SKULL_CRANIUM"
  | "SKULL_SPN"
  | "SKULL_MANDIBULLA"
  | "SKULL_NASAL"

  // THORAX
  | "THORAX_CHILD_AP_PA_LATERAL"
  | "THORAX_ADULT_AP_PA_LATERAL"
  | "THORAX_RLD"

  // ABDOMEN
  | "ABDOMEN_BNO_POLOS"
  | "ABDOMEN_BNO_2_POSISI"

  // VERTEBRA
  | "VERTEBRA_CERVICAL_AP_LAT_OBLIQUE"
  | "VERTEBRA_THORACOLUMBAL"
  | "VERTEBRA_LUMBOSACRAL"
  | "VERTEBRA_SACRUM"
  | "VERTEBRA_COCCYGEUS"

  // EKSTREMITAS SUPERIOR
  | "EXT_SUP_MANUS"
  | "EXT_SUP_WRIST_JOINT"
  | "EXT_SUP_ANTEBRACHII"
  | "EXT_SUP_ELBOW_JOINT_CUBITI"
  | "EXT_SUP_HUMERUS"
  | "EXT_SUP_SHOULDER_JOINT"
  | "EXT_SUP_CLAVICULA"
  | "EXT_SUP_SCAPULA"

  // EKSTREMITAS INFERIOR
  | "EXT_INF_PELVIS"
  | "EXT_INF_HIP_JOINT"
  | "EXT_INF_FEMUR"
  | "EXT_INF_CRURIS"
  | "EXT_INF_GENU"
  | "EXT_INF_ANKLE_JOINT"
  | "EXT_INF_PEDIS"
  | "EXT_INF_CALCANEUS"

  // USG
  | "USG_ABDOMEN"
  | "USG_MAMAE"
  | "USG_TYROID"
  | "USG_SCROTUM"
  | "USG_DOPPLER"
  | "USG_DVT"
  | "USG_THORAX"
  | "USG_LAIN_LAIN"

  // PEMERIKSAAN RUJUKAN
  | "REF_APPENDICOGRAM"
  | "REF_BNO_IVP"
  | "REF_BNO_SONDE"
  | "REF_COLON_IN_LOOP"
  | "REF_CYSTOGRAFI"
  | "REF_FISTULOGRAFI"
  | "REF_FOLLOW_TROUGHT" // as written on sheet
  | "REF_HSG"
  | "REF_OMD"
  | "REF_URETROGRAFI"
  | "REF_CT_SCAN_KONTRAS"
  | "REF_CT_SCAN_NON_KONTRAS"
  | "REF_MRI"
  | "REF_DENTAL"
  | "REF_PANORAMIC"
  | "REF_FLUROSKOPI"
  | "REF_MAMMOGRAFI";

export interface RadiologyTestDefinition {
  id: RadiologyTestId;
  groupId: RadiologyTestGroupId;
  label: string;      // label shown in UI
  note?: string;      // for things like "R / L *" or AP/PA/Lateral
  hasSide?: boolean;  // true for items with R / L option
}

// ===== RADIOLOGY – TESTS BY GROUP =====
export const RADIOLOGY_TESTS_BY_GROUP: Record<
  RadiologyTestGroupId,
  RadiologyTestDefinition[]
> = {
  SKULL: [
    { id: "SKULL_CRANIUM",   groupId: "SKULL", label: "Cranium" },
    { id: "SKULL_SPN",       groupId: "SKULL", label: "SPN" },
    { id: "SKULL_MANDIBULLA",groupId: "SKULL", label: "Mandibulla" },
    { id: "SKULL_NASAL",     groupId: "SKULL", label: "Nasal" },
  ],

  THORAX: [
    {
      id: "THORAX_CHILD_AP_PA_LATERAL",
      groupId: "THORAX",
      label: "Thorax Anak",
      note: "AP / PA / Lateral*",
    },
    {
      id: "THORAX_ADULT_AP_PA_LATERAL",
      groupId: "THORAX",
      label: "Thorax Dewasa",
      note: "AP / PA / Lateral*",
    },
    {
      id: "THORAX_RLD",
      groupId: "THORAX",
      label: "Thorax RLD",
      note: "RLD*",
    },
  ],

  ABDOMEN: [
    { id: "ABDOMEN_BNO_POLOS",   groupId: "ABDOMEN", label: "BNO Polos" },
    { id: "ABDOMEN_BNO_2_POSISI",groupId: "ABDOMEN", label: "BNO 2 Posisi" },
  ],

  VERTEBRA: [
    {
      id: "VERTEBRA_CERVICAL_AP_LAT_OBLIQUE",
      groupId: "VERTEBRA",
      label: "V. Cervical",
      note: "AP / LAT / Oblique*",
    },
    { id: "VERTEBRA_THORACOLUMBAL", groupId: "VERTEBRA", label: "V. Thoracolumbal" },
    { id: "VERTEBRA_LUMBOSACRAL",   groupId: "VERTEBRA", label: "V. Lumbosacral" },
    { id: "VERTEBRA_SACRUM",        groupId: "VERTEBRA", label: "Sacrum" },
    { id: "VERTEBRA_COCCYGEUS",     groupId: "VERTEBRA", label: "Coccygeus" },
  ],

  EXTREMITY_SUPERIOR: [
    { id: "EXT_SUP_MANUS",              groupId: "EXTREMITY_SUPERIOR", label: "Manus",          hasSide: true },
    { id: "EXT_SUP_WRIST_JOINT",        groupId: "EXTREMITY_SUPERIOR", label: "Wrist Joint",    hasSide: true },
    { id: "EXT_SUP_ANTEBRACHII",        groupId: "EXTREMITY_SUPERIOR", label: "Antebrachii",    hasSide: true },
    { id: "EXT_SUP_ELBOW_JOINT_CUBITI", groupId: "EXTREMITY_SUPERIOR", label: "Elbow Joint / Cubiti", hasSide: true },
    { id: "EXT_SUP_HUMERUS",            groupId: "EXTREMITY_SUPERIOR", label: "Humerus",        hasSide: true },
    { id: "EXT_SUP_SHOULDER_JOINT",     groupId: "EXTREMITY_SUPERIOR", label: "Shoulder Joint", hasSide: true },
    { id: "EXT_SUP_CLAVICULA",          groupId: "EXTREMITY_SUPERIOR", label: "Clavicula",      hasSide: true },
    { id: "EXT_SUP_SCAPULA",            groupId: "EXTREMITY_SUPERIOR", label: "Scapula",        hasSide: true },
  ],

  EXTREMITY_INFERIOR: [
    { id: "EXT_INF_PELVIS",     groupId: "EXTREMITY_INFERIOR", label: "Pelvis" },
    { id: "EXT_INF_HIP_JOINT",  groupId: "EXTREMITY_INFERIOR", label: "Hip Joint",  hasSide: true },
    { id: "EXT_INF_FEMUR",      groupId: "EXTREMITY_INFERIOR", label: "Femur",      hasSide: true },
    { id: "EXT_INF_CRURIS",     groupId: "EXTREMITY_INFERIOR", label: "Cruris",     hasSide: true },
    { id: "EXT_INF_GENU",       groupId: "EXTREMITY_INFERIOR", label: "Genu",       hasSide: true },
    { id: "EXT_INF_ANKLE_JOINT",groupId: "EXTREMITY_INFERIOR", label: "Ankle Joint",hasSide: true },
    { id: "EXT_INF_PEDIS",      groupId: "EXTREMITY_INFERIOR", label: "Pedis",      hasSide: true },
    { id: "EXT_INF_CALCANEUS",  groupId: "EXTREMITY_INFERIOR", label: "Calcaneus",  hasSide: true },
  ],

  USG: [
    { id: "USG_ABDOMEN",  groupId: "USG", label: "USG Abdomen" },
    { id: "USG_MAMAE",    groupId: "USG", label: "USG Mamae" },
    { id: "USG_TYROID",   groupId: "USG", label: "USG Tyroid" },
    { id: "USG_SCROTUM",  groupId: "USG", label: "USG Scrotum" },
    { id: "USG_DOPPLER",  groupId: "USG", label: "USG Doppler" },
    { id: "USG_DVT",      groupId: "USG", label: "USG DVT" },
    { id: "USG_THORAX",   groupId: "USG", label: "USG Thorax" },
    { id: "USG_LAIN_LAIN",groupId: "USG", label: "USG Lain-lain" },
  ],

  REFERRAL: [
    { id: "REF_APPENDICOGRAM",     groupId: "REFERRAL", label: "Appendicogram" },
    { id: "REF_BNO_IVP",           groupId: "REFERRAL", label: "BNO IVP" },
    { id: "REF_BNO_SONDE",         groupId: "REFERRAL", label: "BNO Sonde" },
    { id: "REF_COLON_IN_LOOP",     groupId: "REFERRAL", label: "Colon In Loop" },
    { id: "REF_CYSTOGRAFI",        groupId: "REFERRAL", label: "Cystografi" },
    { id: "REF_FISTULOGRAFI",      groupId: "REFERRAL", label: "Fistulografi" },
    { id: "REF_FOLLOW_TROUGHT",    groupId: "REFERRAL", label: "Follow Trought" },
    { id: "REF_HSG",               groupId: "REFERRAL", label: "HSG" },
    { id: "REF_OMD",               groupId: "REFERRAL", label: "OMD" },
    { id: "REF_URETROGRAFI",       groupId: "REFERRAL", label: "Uretrografi" },
    { id: "REF_CT_SCAN_KONTRAS",   groupId: "REFERRAL", label: "CT Scan Kontras" },
    { id: "REF_CT_SCAN_NON_KONTRAS",groupId: "REFERRAL", label: "CT Scan Non Kontras" },
    { id: "REF_MRI",               groupId: "REFERRAL", label: "MRI" },
    { id: "REF_DENTAL",            groupId: "REFERRAL", label: "Dental" },
    { id: "REF_PANORAMIC",         groupId: "REFERRAL", label: "Panoramic" },
    { id: "REF_FLUROSKOPI",        groupId: "REFERRAL", label: "Fluroskopi" },
    { id: "REF_MAMMOGRAFI",        groupId: "REFERRAL", label: "Mammografi" },
  ],
};

// Helper to get all radiology tests as a flat array
export const getAllRadiologyTests = (): RadiologyTestDefinition[] => {
  return Object.values(RADIOLOGY_TESTS_BY_GROUP).flat();
};

// Helper to find a radiology test by ID
export const getRadiologyTestById = (testId: RadiologyTestId): RadiologyTestDefinition | undefined => {
  return getAllRadiologyTests().find(test => test.id === testId);
};

// Helper to get radiology group by ID
export const getRadiologyTestGroupById = (groupId: RadiologyTestGroupId): RadiologyTestGroup | undefined => {
  return RADIOLOGY_TEST_GROUPS.find(group => group.id === groupId);
};

