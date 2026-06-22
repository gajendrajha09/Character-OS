/**
 * Higgsfield MCP / API client.
 * Production: calls Higgsfield MCP tools (generate_image, generate_video).
 * Development: mock mode returns deterministic placeholder assets when unconfigured.
 */

export interface HiggsfieldImageParams {
  model: string;
  prompt: string;
  aspect_ratio?: string;
  count?: number;
}

export interface HiggsfieldVideoParams {
  model: string;
  prompt: string;
  aspect_ratio?: string;
  duration?: number;
  medias?: Array<{ value: string; role: string }>;
}

export interface HiggsfieldGenerationResponse {
  success: boolean;
  url?: string;
  urls?: string[];
  thumbnailUrl?: string;
  jobId?: string;
  model?: string;
  seed?: string;
  error?: string;
  raw?: Record<string, unknown>;
}

interface HiggsfieldJobResult {
  id?: string;
  status?: string;
  model?: string;
  results?: {
    rawUrl?: string;
    minUrl?: string;
    thumbnailUrl?: string;
  };
}

export class HiggsfieldClient {
  private apiBase: string;
  private apiKey: string | undefined;

  constructor() {
    this.apiBase = process.env.HIGGSFIELD_API_BASE ?? "https://api.higgsfield.ai";
    this.apiKey = process.env.HIGGSFIELD_API_KEY;
  }

  isConfigured(): boolean {
    return Boolean(this.apiKey);
  }

  isMockMode(): boolean {
    return process.env.MOCK_GENERATION === "true" || !this.isConfigured();
  }

  async generateImage(params: HiggsfieldImageParams): Promise<HiggsfieldGenerationResponse> {
    if (this.isMockMode()) {
      return this.mockImage(params);
    }

    return this.callTool("generate_image", { params });
  }

  async generateVideo(params: HiggsfieldVideoParams): Promise<HiggsfieldGenerationResponse> {
    if (this.isMockMode()) {
      return this.mockVideo(params);
    }

    return this.callTool("generate_video", { params });
  }

  private async callTool(
    tool: "generate_image" | "generate_video",
    body: Record<string, unknown>
  ): Promise<HiggsfieldGenerationResponse> {
    try {
      const mcpUrl = process.env.HIGGSFIELD_MCP_HTTP_URL;
      const endpoint = mcpUrl ?? `${this.apiBase}/mcp/tools/${tool}`;

      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(this.apiKey ? { Authorization: `Bearer ${this.apiKey}` } : {}),
        },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        const text = await response.text();
        return { success: false, error: `Higgsfield ${tool} failed: ${response.status} ${text}` };
      }

      const data = (await response.json()) as {
        results?: HiggsfieldJobResult[];
        error?: string;
      };

      if (data.error) {
        return { success: false, error: data.error, raw: data as Record<string, unknown> };
      }

      const first = data.results?.[0];
      const url = first?.results?.rawUrl ?? first?.results?.minUrl;

      return {
        success: Boolean(url || first?.id),
        url,
        thumbnailUrl: first?.results?.thumbnailUrl,
        jobId: first?.id,
        model: first?.model ?? (body.params as HiggsfieldImageParams)?.model,
        raw: data as Record<string, unknown>,
      };
    } catch (err) {
      return {
        success: false,
        error: err instanceof Error ? err.message : "Higgsfield request failed",
      };
    }
  }

  private mockImage(params: HiggsfieldImageParams): HiggsfieldGenerationResponse {
    const seed = Buffer.from(params.prompt).toString("base64url").slice(0, 12);
    const [w, h] = aspectToSize(params.aspect_ratio ?? "4:5");
    const count = params.count ?? 1;
    const urls = Array.from({ length: count }, (_, i) =>
      `https://picsum.photos/seed/${seed}-${i}/${w}/${h}`
    );

    return {
      success: true,
      url: urls[0],
      urls,
      thumbnailUrl: urls[0],
      jobId: `mock-img-${Date.now()}`,
      model: params.model,
      seed,
      raw: { mock: true, tool: "generate_image" },
    };
  }

  private mockVideo(params: HiggsfieldVideoParams): HiggsfieldGenerationResponse {
    const seed = Buffer.from(params.prompt).toString("base64url").slice(0, 12);
    return {
      success: true,
      url: `https://picsum.photos/seed/${seed}-video/1080/1920`,
      thumbnailUrl: `https://picsum.photos/seed/${seed}-thumb/540/960`,
      jobId: `mock-vid-${Date.now()}`,
      model: params.model,
      raw: { mock: true, tool: "generate_video", duration: params.duration },
    };
  }
}

function aspectToSize(aspect: string): [number, number] {
  switch (aspect) {
    case "9:16":
      return [1080, 1920];
    case "1:1":
      return [1080, 1080];
    case "16:9":
      return [1920, 1080];
    default:
      return [1080, 1350];
  }
}

export const higgsfieldClient = new HiggsfieldClient();
