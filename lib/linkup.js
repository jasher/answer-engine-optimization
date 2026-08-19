/**
 * Linkup.so API Client for AEO Readiness Check & Cloudflare Worker integration.
 * Zero-dependency client built on native Fetch API.
 */

export class LinkupClient {
  /**
   * @param {Object} options
   * @param {string} options.apiKey - Linkup API Key (Bearer token)
   * @param {string} [options.baseUrl] - Base API URL (defaults to https://api.linkup.so/v1)
   */
  constructor({ apiKey, baseUrl = "https://api.linkup.so/v1" } = {}) {
    if (!apiKey) {
      throw new Error("LinkupClient requires an apiKey.");
    }
    this.apiKey = apiKey;
    this.baseUrl = baseUrl.replace(/\/+$/, "");
  }

  /**
   * Internal request helper
   * @private
   */
  async _request(endpoint, body) {
    const url = `${this.baseUrl}${endpoint}`;
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${this.apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorText = await response.text().catch(() => "");
      throw new Error(
        `Linkup API error (${response.status} ${response.statusText}): ${errorText || "Unknown error"}`
      );
    }

    return response.json();
  }

  /**
   * Execute a search with Linkup
   * @param {Object} params
   * @param {string} params.query - Search query string
   * @param {"standard"|"deep"} [params.depth="standard"] - Search depth
   * @param {"searchResults"|"sourcedAnswer"|"structured"} [params.outputType="searchResults"] - Output format
   * @param {Object} [params.structuredOutputSchema] - JSON Schema if outputType is "structured"
   * @returns {Promise<Object>}
   */
  async search({ query, depth = "standard", outputType = "searchResults", structuredOutputSchema }) {
    const payload = {
      q: query,
      depth,
      outputType,
    };

    if (outputType === "structured" && structuredOutputSchema) {
      payload.structuredOutputSchema = structuredOutputSchema;
    }

    return this._request("/search", payload);
  }

  /**
   * Fetch rendered web content from a URL
   * @param {Object} params
   * @param {string} params.url - URL to fetch
   * @param {boolean} [params.renderJs=false] - Whether to render JavaScript
   * @returns {Promise<Object>}
   */
  async fetchPage({ url, renderJs = false }) {
    return this._request("/fetch", { url, renderJs });
  }

  /**
   * Find competitor cohort for a given domain using structured search
   * @param {string} domain - Target company domain (e.g. "supabase.com")
   * @param {Object} [options]
   * @param {number} [options.limit=5] - Maximum competitors to return
   * @returns {Promise<Array<{name: string, domain: string, description: string}>>}
   */
  async findCompetitors(domain, { limit = 5 } = {}) {
    const cleanDomain = domain.replace(/^https?:\/\//, "").replace(/\/.*$/, "");
    const query = `What are the top ${limit} direct competitors and alternative software/services to ${cleanDomain}? Return company names, official domains, and short descriptions.`;

    const schema = {
      type: "object",
      properties: {
        competitors: {
          type: "array",
          items: {
            type: "object",
            properties: {
              name: { type: "string" },
              domain: { type: "string" },
              description: { type: "string" },
            },
            required: ["name", "domain"],
          },
        },
      },
      required: ["competitors"],
    };

    const response = await this.search({
      query,
      depth: "deep",
      outputType: "structured",
      structuredOutputSchema: schema,
    });

    return response.structured?.competitors || [];
  }

  /**
   * Check whether a target domain is cited in search results for a query
   * @param {string} query - Buyer-intent query
   * @param {string} targetDomain - Target domain to look for
   * @returns {Promise<{isCited: boolean, rank: number, sources: string[], snippet?: string}>}
   */
  async checkCitation(query, targetDomain) {
    const cleanTarget = targetDomain.replace(/^https?:\/\//, "").replace(/\/.*$/, "").toLowerCase();
    const response = await this.search({
      query,
      depth: "standard",
      outputType: "searchResults",
    });

    const results = response.results || [];
    let rank = -1;
    let snippet = "";
    const sources = [];

    for (let i = 0; i < results.length; i++) {
      const item = results[i];
      if (item.url) {
        sources.push(item.url);
        if (item.url.toLowerCase().includes(cleanTarget) && rank === -1) {
          rank = i + 1;
          snippet = item.snippet || item.content || "";
        }
      }
    }

    return {
      isCited: rank !== -1,
      rank,
      sources,
      snippet,
    };
  }
}

export default LinkupClient;
