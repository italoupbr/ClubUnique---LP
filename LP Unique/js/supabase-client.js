(() => {
  "use strict";

  const config = window.ClubUniqueSupabase;

  if (!config?.url || !config?.anonKey || config.anonKey === "COLE_SUA_ANON_KEY_AQUI") {
    throw new Error("Configure js/supabase-config.js com a URL e a anon key do Supabase.");
  }

  const restBase = `${config.url.replace(/\/$/, "")}/rest/v1`;

  const defaultHeaders = {
    apikey: config.anonKey,
    "Content-Type": "application/json",
  };

  async function parseResponse(response) {
    const text = await response.text();
    let data = null;

    if (text) {
      try {
        data = JSON.parse(text);
      } catch (err) {
        data = text;
      }
    }

    if (!response.ok) {
      const message =
        (data && data.message) ||
        (data && data.error_description) ||
        (data && data.error) ||
        `Erro ${response.status}`;
      throw new Error(message);
    }

    return data;
  }

  async function insertPresence(payload) {
    const response = await fetch(`${restBase}/presence_confirmations`, {
      method: "POST",
      headers: {
        ...defaultHeaders,
        Prefer: "return=minimal",
      },
      body: JSON.stringify(payload),
    });

    await parseResponse(response);
  }

  async function listPresences(edition) {
    const params = new URLSearchParams({
      select: "id,full_name,phone,email,company,edition,created_at",
      order: "created_at.desc",
    });

    if (edition && edition !== "all") {
      params.set("edition", `eq.${edition}`);
    }

    const response = await fetch(`${restBase}/presence_confirmations?${params}`, {
      headers: {
        ...defaultHeaders,
        Authorization: `Bearer ${config.anonKey}`,
      },
    });

    return parseResponse(response);
  }

  window.ClubUniqueApi = {
    insertPresence,
    listPresences,
  };
})();
