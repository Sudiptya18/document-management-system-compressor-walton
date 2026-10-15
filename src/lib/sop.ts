export type SopOption = {
  id: string;
  symbol: string;
  label: string;
};

export const PLANT_CODE = {
  headquarter: { symbol: "H", label: "Headquarter" },
  hiTech: { symbol: "H", label: "Hi-Tech" },
  compressor: { symbol: "cP", label: "Compressor" },
} as const;

export const CUSTOM_TYPE_ID = "custom";

export const DOCUMENT_TYPES: SopOption[] = [
  { id: "I", symbol: "I", label: "Operating Instruction/SOP/OKP" },
  {
    id: "S",
    symbol: "S",
    label: "Standardization file (in-house/External/International)",
  },
  { id: "D", symbol: "D", label: "Drawing" },
  { id: "F", symbol: "F", label: "Format / Checklist" },
  { id: "R-test", symbol: "R", label: "Test Report/Analysis" },
  { id: "N", symbol: "N", label: "Policy / Notice" },
  { id: "M", symbol: "M", label: "Manual/Method of analysis" },
  { id: "R-report", symbol: "R", label: "Report" },
  { id: "C", symbol: "C", label: "Change note" },
  { id: "P", symbol: "P", label: "Planning document" },
  { id: "MOM", symbol: "MOM_", label: "Meeting Minutes" },
];

export const DEPARTMENTS: SopOption[] = [
  { id: "PD", symbol: "PD", label: "Process Development" },
  { id: "Rd", symbol: "Rd", label: "R&D" },
  { id: "qC", symbol: "qC", label: "Quality Control" },
  { id: "Pr", symbol: "Pr", label: "Production" },
];

export const SECTIONS: SopOption[] = [
  { id: "L", symbol: "L", label: "Laboratory" },
  { id: "P-process", symbol: "P", label: "Process Engineering/Process Control" },
  { id: "C", symbol: "C", label: "Chemical Process Development" },
  { id: "M", symbol: "M", label: "Mechanical Process Development" },
  { id: "A", symbol: "A", label: "R&D Applied Product Development" },
  {
    id: "D",
    symbol: "D",
    label: "R&D Mechanical Design and Advanced research",
  },
  { id: "E", symbol: "E", label: "R&D Motor Design" },
  { id: "I", symbol: "I", label: "R&D Engineering Intelligence" },
  { id: "P-proto", symbol: "P", label: "Prototyping and Product Implementation" },
  { id: "G", symbol: "G", label: "General" },
  { id: "S", symbol: "S", label: "Assembly Line" },
  { id: "N", symbol: "N", label: "Manufacturing Line" },
  { id: "R", symbol: "R", label: "Production Planning & Monitoring" },
];

export const SUBSECTIONS: SopOption[] = [
  { id: "C", symbol: "C", label: "Chemical Process" },
  { id: "M", symbol: "M", label: "Metal Process/Machining Process" },
  { id: "O", symbol: "O", label: "Project & Operational Development" },
  { id: "D", symbol: "D", label: "Mechanical Design/Drawing" },
  { id: "E", symbol: "E", label: "Electrical Lab/Motor design" },
  { id: "S", symbol: "S", label: "Tools Drawing/Spare" },
  {
    id: "G",
    symbol: "G",
    label:
      "Calculation Tool/Simulation tool/Matlab code/Excel file with formula",
  },
  { id: "T", symbol: "T", label: "Material Testing & Analysis Lab" },
  { id: "Q", symbol: "Q", label: "Metrology Lab" },
  { id: "P", symbol: "P", label: "Performance Lab" },
  { id: "R", symbol: "R", label: "Reliability/Life testing Lab" },
  { id: "A", symbol: "A", label: "Chemical Lab" },
  { id: "F", symbol: "F", label: "Failure & Analysis/Advanced Engineering" },
  { id: "Y", symbol: "Y", label: "General" },
  { id: "Z", symbol: "Z", label: "Quality Assurance" },
  { id: "L", symbol: "L", label: "Inline Quality Control" },
];

export const LINES: SopOption[] = [
  { id: "CC", symbol: "CC", label: "Crank Case Line" },
  { id: "CS", symbol: "CS", label: "Crank Shaft Line" },
  { id: "CR", symbol: "CR", label: "Conrod Line" },
  { id: "CY", symbol: "CY", label: "Cylinder Head Line" },
  { id: "FB", symbol: "FB", label: "Flange Bearing Line" },
  { id: "VP", symbol: "VP", label: "Valve plate Line" },
  { id: "PI", symbol: "PI", label: "Piston Line" },
  { id: "ST", symbol: "ST", label: "Stator Line" },
  { id: "RO", symbol: "RO", label: "Rotor Line" },
  { id: "HT", symbol: "HT", label: "Heat Treatment Line" },
  { id: "SW", symbol: "SW", label: "Shell Welding Line" },
  { id: "PH", symbol: "PH", label: "Phosphating Line" },
  { id: "SL", symbol: "SL", label: "Stamping Press" },
  { id: "IA", symbol: "IA", label: "Internal Assembly Line" },
  { id: "EA", symbol: "EA", label: "External Assembly Line" },
  { id: "FA", symbol: "FA", label: "Final Assembly Line" },
  { id: "ED", symbol: "ED", label: "ED Paint Line" },
  { id: "SC", symbol: "SC", label: "Shell and Cover/Washing" },
  { id: "SP", symbol: "SP", label: "Small Parts Washing" },
  { id: "GE", symbol: "GE", label: "Grinding Emulsion" },
  { id: "CE", symbol: "CE", label: "Cutting Emulsion" },
  { id: "TH", symbol: "TH", label: "Transport & Handling" },
  { id: "DM", symbol: "DM", label: "DM Plant" },
  { id: "IM", symbol: "IM", label: "Injection Moulding Unit" },
  { id: "AC", symbol: "AC", label: "Aluminium Cylinder Head" },
  { id: "HS", symbol: "HS", label: "Material Handling and Storing" },
  {
    id: "XX",
    symbol: "XX",
    label: "General (For all lines or overall compressor models)",
  },
  { id: "EC", symbol: "EC", label: "Electrical Component" },
  { id: "PC", symbol: "PC", label: "Packaging" },
  { id: "MC", symbol: "MC", label: "Metal Casting" },
  { id: "ME", symbol: "ME", label: "Metrology Lab" },
  { id: "MT", symbol: "MT", label: "Material Testing and Analysis Lab" },
  { id: "PL", symbol: "PL", label: "Performance Lab" },
  { id: "RL", symbol: "RL", label: "Reliability Lab" },
  { id: "EL", symbol: "EL", label: "Electrical Lab" },
  { id: "FT", symbol: "FT", label: "Failure & Analysis" },
  { id: "AE", symbol: "AE", label: "Appliance Engineering Lab" },
];

export const MODELS: SopOption[] = [
  { id: "W", symbol: "W", label: "Walpha" },
  { id: "K", symbol: "K", label: "Kappa" },
];

export function findOption(
  list: SopOption[],
  id: string,
): SopOption | undefined {
  return list.find((option) => option.id === id);
}
