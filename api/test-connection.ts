/**
 * Vercel serverless function for testing LLM provider API key validity.
 *
 * Validates the API key format and attempts a lightweight API call
 * to the provider's models endpoint to verify connectivity.
 */

interface TestConnectionRequest {
  provider: string;
  apiKey: string;
}

interface TestConnectionResponse {
  success: boolean;
  message: string;
  provider: string;
  latencyMs: number;
}

/**
 * Validates API key format for known providers.
 */
function validateApiKeyFormat(provider: string, apiKey: string): { valid: boolean; message: string } {
  const trimmed = apiKey.trim();

  if (!trimmed) {
    return { valid: false, message: 'API key is empty' };
  }

  if (trimmed.length < 8) {
    return { valid: false, message: 'API key is too short (minimum 8 characters)' };
  }

  switch (provider.toLowerCase()) {
    case 'openai':
      if (!trimmed.startsWith('sk-')) {
        return { valid: false, message: 'OpenAI API keys must start with "sk-"' };
      }
      break;
    case 'anthropic':
      // Anthropic keys can start with sk-ant- or various other prefixes
      if (trimmed.length < 20) {
        return { valid: false, message: 'Anthropic API key appears too short' };
      }
      break;
    case 'google':
      // Google API keys are typically long base64 strings
      if (trimmed.length < 20) {
        return { valid: false, message: 'Google API key appears too short' };
      }
      break;
    case 'ollama':
      // Ollama is local and doesn't need an API key
      return { valid: true, message: 'Ollama runs locally — no API key required' };
    default:
      break;
  }

  return { valid: true, message: 'Key format looks valid' };
}

/**
 * Attempts to verify the API key by making a real request to the provider.
 */
async function verifyProviderKey(provider: string, apiKey: string): Promise<{ success: boolean; message: string }> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 8000);

  try {
    let response: Response;

    switch (provider.toLowerCase()) {
      case 'openai': {
        response = await fetch('https://api.openai.com/v1/models', {
          headers: { 'Authorization': `Bearer ${apiKey}` },
          signal: controller.signal,
        });
        if (response.ok) {
          return { success: true, message: 'Connected to OpenAI successfully' };
        }
        if (response.status === 401) {
          return { success: false, message: 'Invalid API key — OpenAI rejected authentication' };
        }
        return { success: false, message: `OpenAI returned status ${response.status}` };
      }

      case 'anthropic': {
        // Anthropic doesn't have a public models list endpoint without version header
        // We do a lightweight check by trying to access the messages endpoint with a minimal request
        response = await fetch('https://api.anthropic.com/v1/messages', {
          method: 'POST',
          headers: {
            'x-api-key': apiKey,
            'anthropic-version': '2023-06-01',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'claude-sonnet-4-20250514',
            max_tokens: 1,
            messages: [{ role: 'user', content: 'hi' }],
          }),
          signal: controller.signal,
        });
        // 200 or 400 (overshoot) both mean the key is valid
        if (response.ok || response.status === 400) {
          return { success: true, message: 'Connected to Anthropic successfully' };
        }
        if (response.status === 401) {
          return { success: false, message: 'Invalid API key — Anthropic rejected authentication' };
        }
        return { success: false, message: `Anthropic returned status ${response.status}` };
      }

      case 'google': {
        response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`, {
          signal: controller.signal,
        });
        if (response.ok) {
          return { success: true, message: 'Connected to Google AI successfully' };
        }
        if (response.status === 400 || response.status === 403) {
          return { success: false, message: 'Invalid API key — Google rejected authentication' };
        }
        return { success: false, message: `Google returned status ${response.status}` };
      }

      case 'ollama': {
        // Try to connect to local Ollama instance
        try {
          response = await fetch('http://localhost:11434/api/tags', {
            signal: controller.signal,
          });
          if (response.ok) {
            return { success: true, message: 'Connected to Ollama successfully' };
          }
          return { success: false, message: 'Ollama is running but returned an error' };
        } catch {
          return { success: false, message: 'Cannot connect to Ollama — is it running on localhost:11434?' };
        }
      }

      default:
        return { valid: false, message: 'Unknown provider', success: false } as { success: boolean; message: string };
    }
  } catch (err) {
    if (err instanceof DOMException && err.name === 'AbortError') {
      return { success: false, message: 'Connection timed out — provider may be unreachable' };
    }
    return { success: false, message: 'Network error — could not reach provider' };
  } finally {
    clearTimeout(timeout);
  }
}

export default async function handler(req: Request): Promise<Response> {
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const body = await req.json() as TestConnectionRequest;
    const { provider, apiKey } = body;

    if (!provider || !apiKey) {
      return new Response(JSON.stringify({ error: 'Provider and API key are required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const startTime = Date.now();

    // Step 1: Validate key format
    const formatCheck = validateApiKeyFormat(provider, apiKey);
    if (!formatCheck.valid) {
      return new Response(JSON.stringify({
        success: false,
        message: formatCheck.message,
        provider,
        latencyMs: Date.now() - startTime,
      } as TestConnectionResponse), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Step 2: Attempt real provider connection
    const result = await verifyProviderKey(provider, apiKey);
    const latencyMs = Date.now() - startTime;

    return new Response(JSON.stringify({
      success: result.success,
      message: result.message,
      provider,
      latencyMs,
    } as TestConnectionResponse), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Internal server error';
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
