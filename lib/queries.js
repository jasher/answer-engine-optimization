/**
 * Query Generator Module
 * Generates category-specific buyer-intent search queries based on domain and extracted content.
 */

export async function generateBuyerQueries(domain, brandName, summaryText, apiKey) {
  const cleanBrand = brandName || domain.replace(/\.[a-z]+$/, "").replace(/^www\./, "");
  
  // High quality default templates customized to the target entity
  const defaultQueries = [
    `best ${cleanBrand} alternative for enterprise AI`,
    `how does ${cleanBrand} compare to top competitors`,
    `is ${cleanBrand} open source and production ready`
  ];

  if (!apiKey) {
    return defaultQueries;
  }

  try {
    const prompt = `Given this company domain: "${domain}" and opening text: "${summaryText.slice(0, 500)}", generate 3 realistic buyer-intent search queries that potential customers would ask ChatGPT, Perplexity, or Claude when searching for solutions in this space. Format as a JSON array of 3 strings. Return only valid JSON.`;

    const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "google/gemini-2.0-flash-001",
        messages: [{ role: "user", content: prompt }],
        response_format: { type: "json_object" }
      }),
      signal: AbortSignal.timeout(5000)
    });

    if (res.ok) {
      const data = await res.json();
      const text = data.choices?.[0]?.message?.content;
      const parsed = JSON.parse(text);
      const list = Array.isArray(parsed) ? parsed : (parsed.queries || parsed.questions || defaultQueries);
      if (Array.isArray(list) && list.length >= 3) {
        return list.slice(0, 3);
      }
    }
  } catch (err) {
    // Fall back to template queries on timeout/error
  }

  return defaultQueries;
}
