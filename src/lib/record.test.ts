import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { buildDocument, buildRecordNo, previewRecordNo } from "./record";
import { matchesDocument } from "./search";
import type { SaveInput } from "./types";

const savedAt = "2026-10-15T00:00:00.000Z";

function input(overrides: Partial<SaveInput> = {}): SaveInput {
  return {
    title: "Proposal report on crankshaft Crankpin",
    documentTypeId: "R-report",
    departmentId: "Rd",
    sectionId: "D",
    subsectionId: "D",
    lineId: "CS",
    modelId: "W",
    serial: "1",
    version: "0",
    concernName: "Karim",
    employeeId: "W-1044",
    date: "2026-10-15",
    originalFileName: "notes.pdf",
    size: 1200,
    ...overrides,
  };
}

describe("record numbers", () => {
  it("builds the crankshaft report number from the SOP template", () => {
    const doc = buildDocument(input(), savedAt);
    assert.equal(doc.recordNo, "RHHcPRdDDCSW0001_000");
    assert.equal(doc.fileName, "RHHcPRdDDCSW0001_000.pdf");
    assert.equal(doc.jsonName, "RHHcPRdDDCSW0001_000.json");
    assert.equal(doc.serialNumber, "0001");
    assert.equal(doc.version, "000");
    assert.ok(!doc.fileName.toLowerCase().includes("proposal"));
    assert.ok(!doc.fileName.toLowerCase().includes("crank"));
  });

  it("keeps a second serial distinct", () => {
    const doc = buildDocument(input({ serial: "2" }), savedAt);
    assert.equal(doc.recordNo, "RHHcPRdDDCSW0002_000");
  });

  it("builds the format specimen", () => {
    const doc = buildDocument(
      input({
        documentTypeId: "F",
        lineId: "XX",
        title: "Proposal Report Format",
      }),
      savedAt,
    );
    assert.equal(doc.recordNo, "FHHcPRdDDXXW0001_000");
  });

  it("builds meeting minutes with the MOM_ prefix", () => {
    const doc = buildDocument(
      input({
        documentTypeId: "MOM",
        lineId: "XX",
        title: "Meeting minutes for Mechanical Design",
        originalFileName: "minutes.docx",
      }),
      savedAt,
    );
    assert.equal(doc.recordNo, "MOM_HHcPRdDDXXW0001_000");
    assert.equal(doc.fileName, "MOM_HHcPRdDDXXW0001_000.docx");
    assert.equal(doc.category, "word");
  });

  it("uses the same symbol for both report types", () => {
    const testReport = buildRecordNo({
      documentTypeSymbol: "R",
      departmentSymbol: "Rd",
      sectionSymbol: "D",
      subsectionSymbol: "D",
      lineSymbol: "CS",
      modelSymbol: "W",
      serialNumber: "0001",
      version: "000",
    });
    assert.equal(testReport, "RHHcPRdDDCSW0001_000");
  });

  it("accepts a custom document type without putting the title in the name", () => {
    const doc = buildDocument(
      input({
        documentTypeId: "custom",
        customDocumentType: "Work instruction addendum",
        customSymbol: "WI",
        title: "Night shift addendum",
      }),
      savedAt,
    );
    assert.equal(doc.recordNo, "WIHHcPRdDDCSW0001_000");
    assert.equal(doc.documentType.label, "Work instruction addendum");
  });

  it("rejects an empty file and a bad date", () => {
    assert.throws(() => buildDocument(input({ size: 0 }), savedAt), /Choose a file/);
    assert.throws(
      () => buildDocument(input({ date: "2026-02-31" }), savedAt),
      /valid date/,
    );
  });

  it("shows a partial nameplate until every symbol is present", () => {
    const partial = previewRecordNo({ documentTypeSymbol: "R", serial: "1" });
    assert.equal(partial.complete, false);
    assert.match(partial.text, /^RHHcP/);
    assert.match(partial.text, /0001_/);
    const full = previewRecordNo({
      documentTypeSymbol: "R",
      departmentSymbol: "Rd",
      sectionSymbol: "D",
      subsectionSymbol: "D",
      lineSymbol: "CS",
      modelSymbol: "W",
      serial: "1",
      version: "0",
    });
    assert.equal(full.complete, true);
    assert.equal(full.text, "RHHcPRdDDCSW0001_000");
  });
});

describe("search", () => {
  const doc = buildDocument(input(), savedAt);

  it("matches a padded serial and ignores blank fields", () => {
    assert.equal(matchesDocument(doc, { serial: "1", title: "crankpin" }), true);
    assert.equal(matchesDocument(doc, {}), true);
  });

  it("keeps the two R document types distinct", () => {
    assert.equal(matchesDocument(doc, { documentTypeId: "R-report" }), true);
    assert.equal(matchesDocument(doc, { documentTypeId: "R-test" }), false);
  });

  it("matches a custom symbol only against custom types", () => {
    const custom = buildDocument(
      input({
        documentTypeId: "custom",
        customDocumentType: "Gauge note",
        customSymbol: "GN",
      }),
      savedAt,
    );
    assert.equal(
      matchesDocument(custom, {
        documentTypeId: "custom",
        customSymbol: "GN",
      }),
      true,
    );
    assert.equal(
      matchesDocument(doc, { documentTypeId: "custom", customSymbol: "GN" }),
      false,
    );
  });
});
