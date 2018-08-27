const { expect } = require("chai");
import sut from '../../src/serialization/sort-param-serializer';
import parser = require('../../src/parsing/parser');

const legalSortsToSerialization = {
  "fieldA,(ax,:x,x)": true,
  "fieldA,(:ax,[])": true,
  "fieldA,-fieldB": true,
  "nullified": true,
  "truthy": true,
  "fieldA,(x,:y,z)": true,
  "(x,:y,z),fieldA": true,
  "fieldA,-(x,:y,z)": true,
  "-(x,:y,z),fieldA": true,
  "-(a,4)": true,
  "test": true,
  "test,-test,(1,:eq,1),-(1,1)": "test,-test,(1,1),-(1,1)",
  "%C2%A9": true,
  // tests that symbols can be begin with a [-\.0-9] character
  // if it's encoded, even though these can't appear literally
  // as leading chars to prevent ambiguity.
  "%2D": true,
  "%39": true,
  "%2e": "%2E" // encoding should normalize to upper case
};

describe("Sort Serialization", () => {
  it("should be the inverse of parsing", () => {
    Object.keys(legalSortsToSerialization).forEach(k => {
      const v = legalSortsToSerialization[k as keyof typeof legalSortsToSerialization];
      const expected = v === true ? k : v;

      expect(sut(parser.parse(k, { startRule: "Sort" }))).to.equal(expected);
    })
  });
});
