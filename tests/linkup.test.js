import { LinkupClient } from "../lib/linkup.js";

// Test suite for LinkupClient
async function runTests() {
  console.log("Running Linkup client unit tests...");

  // Test 1: Constructor validation
  try {
    new LinkupClient();
    console.error("FAIL: Should throw on missing API key");
  } catch (err) {
    console.log("PASS: Constructor throws without API key");
  }

  // Test 2: Mocked request validation
  const originalFetch = globalThis.fetch;
  let lastFetchParams = null;

  globalThis.fetch = async (url, options) => {
    lastFetchParams = { url, options, body: JSON.parse(options.body) };
    return {
      ok: true,
      json: async () => ({
        results: [
          { url: "https://example.com/blog", title: "Example Post", snippet: "Test snippet" },
          { url: "https://other.com/item", title: "Other Post" }
        ],
        structured: {
          competitors: [
            { name: "CompetitorA", domain: "competitor-a.com", description: "Cloud DB" },
            { name: "CompetitorB", domain: "competitor-b.com", description: "Auth Service" }
          ]
        }
      })
    };
  };

  const client = new LinkupClient({ apiKey: "test_linkup_key" });

  // Test 3: Search method
  const searchRes = await client.search({ query: "best database", depth: "standard" });
  if (
    lastFetchParams.url === "https://api.linkup.so/v1/search" &&
    lastFetchParams.options.headers.Authorization === "Bearer test_linkup_key" &&
    lastFetchParams.body.q === "best database" &&
    searchRes.results.length === 2
  ) {
    console.log("PASS: Search method dispatches correctly");
  } else {
    console.error("FAIL: Search method mismatch", lastFetchParams);
  }

  // Test 4: Find competitors
  const competitors = await client.findCompetitors("supabase.com");
  if (
    competitors.length === 2 &&
    competitors[0].name === "CompetitorA" &&
    lastFetchParams.body.depth === "deep" &&
    lastFetchParams.body.outputType === "structured"
  ) {
    console.log("PASS: findCompetitors constructs structured query");
  } else {
    console.error("FAIL: findCompetitors mismatch", competitors, lastFetchParams);
  }

  // Test 5: Check citation
  const citation = await client.checkCitation("best database", "example.com");
  if (citation.isCited === true && citation.rank === 1 && citation.snippet === "Test snippet") {
    console.log("PASS: checkCitation finds target domain correctly");
  } else {
    console.error("FAIL: checkCitation mismatch", citation);
  }

  const missCitation = await client.checkCitation("best database", "notfound.org");
  if (missCitation.isCited === false && missCitation.rank === -1) {
    console.log("PASS: checkCitation handles uncited domains correctly");
  } else {
    console.error("FAIL: checkCitation uncited mismatch", missCitation);
  }

  // Restore fetch
  globalThis.fetch = originalFetch;
  console.log("\nAll Linkup tests completed successfully!");
}

runTests().catch(console.error);
