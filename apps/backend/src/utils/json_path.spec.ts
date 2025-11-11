import { describe, it, expect } from "vitest";
import getByPath from "./json_path";

const testObj = {
  store: {
    books: {
      my_special_book: {
        title: "The Great Adventure",
      },
    },
  },
};

const testJsonPathTemplate = "store.books.<bookId>.title";

const keycloakExempleObj = {
  resource_access: {
    my_client_id: {
      roles: ["user", "admin"],
    },
  },
};

const keycloakExemplePath = "resource_access.<client_id>.roles";

describe("JSON Path", () => {
  it("resolves template placeholder <bookId>", () => {
    const placeholders = { bookId: "my_special_book" };
    const title = getByPath(testObj, testJsonPathTemplate, placeholders);
    expect(title).toBe("The Great Adventure");
  });

  it("resolves nested path with <client_id>", () => {
    const placeholders = { client_id: "my_client_id" };
    const roles = getByPath(
      keycloakExempleObj,
      keycloakExemplePath,
      placeholders,
    );
    expect(roles).toEqual(["user", "admin"]);
  });

  it("returns undefined when placeholder missing", () => {
    const placeholders = {};
    const val = getByPath(testObj, testJsonPathTemplate, placeholders);
    expect(val).toBeUndefined();
  });
});
