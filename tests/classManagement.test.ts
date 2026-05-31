import { describe, expect, it } from "bun:test";
import { readFileSync } from "fs";
import { resolve } from "path";
import { SpecValidatingClient, SpecValidationError } from "./spec-validating-client";
import { getClassesTool, getClassDescriptionsTool, getClassSchedulesTool, getClassVisitsTool } from "../src/tools/classManagement";
import { SimpleCache } from "../src/cache/index";

const spec = JSON.parse(
  readFileSync(resolve(__dirname, "../docs/openapi.json"), "utf-8")
);

function makeClient(fixture: unknown) {
  return new SpecValidatingClient(spec, fixture);
}

function emptyCache() {
  return new SimpleCache(5);
}

const classFixture = {
  Classes: [
    {
      Id: 1,
      ClassDescription: { Name: "Vinyasa Flow", Description: "A dynamic class" },
      Staff: { Name: "Jane Doe", FirstName: "Jane", LastName: "Doe" },
      StartDateTime: "2025-06-01T09:00:00",
      EndDateTime: "2025-06-01T10:00:00",
      Location: { Name: "Main Studio" },
      MaxCapacity: 20,
      TotalBooked: 5,
      IsWaitlistAvailable: true,
      IsCanceled: false,
      IsSubstitute: false,
    },
  ],
};

describe("getClassesTool", () => {
  it("passes validation with valid parameters", async () => {
    const client = makeClient(classFixture);
    const result = await getClassesTool(
      "2025-06-01", "2025-06-07", undefined, undefined, undefined,
      client, emptyCache()
    );
    expect(result.classes).toHaveLength(1);
    expect(result.classes[0].name).toBe("Vinyasa Flow");
  });

  it("fails on unrecognised query parameter", async () => {
    const badClient = makeClient(classFixture);
    // Calling get directly with a bogus param to trigger validation
    await expect(
      badClient.get("/class/classes", { params: { BogusParam: "oops" } })
    ).rejects.toThrow(SpecValidationError);
  });

  it("fails on undocumented path", async () => {
    const badClient = makeClient(classFixture);
    await expect(
      badClient.get("/class/doesnotexist", { params: {} })
    ).rejects.toThrow("Path not found in spec");
  });

  it("fails on wrong HTTP method", async () => {
    const badClient = makeClient(classFixture);
    // /class/classes is GET-only in the spec
    await expect(
      badClient.post("/class/classes")
    ).rejects.toThrow("Method");
  });
});

describe("getClassDescriptionsTool", () => {
  it("passes validation with valid call", async () => {
    const fixture = {
      ClassDescriptions: [
        { Id: 10, Name: "Hot Yoga", Description: "Heated room" },
      ],
    };
    const result = await getClassDescriptionsTool(makeClient(fixture), emptyCache());
    expect(result.classTypes).toHaveLength(1);
    expect(result.totalTypes).toBe(1);
  });
});

describe("getClassSchedulesTool", () => {
  it("passes validation with location filter", async () => {
    const fixture = {
      ClassSchedules: [
        {
          Id: 5,
          ClassDescription: { Name: "Pilates" },
          Staff: { Name: "Alice" },
          Location: { Name: "Downtown" },
          DayOfWeek: "Monday",
          StartTime: "08:00",
          EndTime: "09:00",
          StartDate: "2025-01-01",
          IsActive: true,
        },
      ],
    };
    const result = await getClassSchedulesTool([1], undefined, undefined, undefined, makeClient(fixture));
    expect(result.schedules).toHaveLength(1);
    expect(result.schedules[0].className).toBe("Pilates");
  });
});

describe("getClassVisitsTool", () => {
  it("passes validation with classId", async () => {
    const fixture = {
      Class: {
        Id: 42,
        ClassDescription: { Name: "Barre" },
        Staff: { DisplayName: "Sarah" },
        StartDateTime: "2025-06-01T10:00:00",
        EndDateTime: "2025-06-01T11:00:00",
        Location: { Name: "Uptown" },
        Visits: [
          {
            Id: 100,
            ClientId: "c1",
            Client: { FirstName: "Bob", LastName: "Smith" },
            StartDateTime: "2025-06-01T10:00:00",
            EndDateTime: "2025-06-01T11:00:00",
            SignedIn: true,
            WebSignup: false,
            MakeUp: false,
            LateCancelled: false,
          },
        ],
      },
    };
    const result = await getClassVisitsTool(42, undefined, makeClient(fixture));
    expect(result.totalVisits).toBe(1);
    expect(result.summary.totalSignedIn).toBe(1);
  });
});
