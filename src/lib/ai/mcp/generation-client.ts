/**
 * MCP Generation Client — sends ProductionBrief.generationPayload to Higgsfield MCP.
 *
 * Request format (MCP tool: generate_video):
 * {
 *   "tool": "generate_video",
 *   "server": "higgsfield",
 *   "arguments": {
 *     "briefId": "uuid",
 *     "characterId": "uuid",
 *     "prompt": "...compiled hidden prompt...",
 *     "parameters": { "duration": 15, "aspectRatio": "9:16", "style": "UGC" }
 *   }
 * }
 */

export interface MCPGenerationRequest {
  tool: "generate_video" | "generate_image" | "generate_script" | "generate_caption";
  server: string;
  arguments: {
    briefId?: string;
    characterId: string;
    prompt: string;
    parameters?: Record<string, unknown>;
    payload?: Record<string, unknown>;
  };
}

export interface MCPGenerationResponse {
  success: boolean;
  jobId?: string;
  url?: string;
  text?: string;
  error?: string;
}

export class MCPGenerationClient {
  private serverUrl: string;

  constructor(serverUrl?: string) {
    this.serverUrl = serverUrl ?? process.env.HIGGSFIELD_MCP_URL ?? "mcp://higgsfield/generate-video";
  }

  async sendVideoGeneration(payload: {
    briefId?: string;
    characterId: string;
    prompt: string;
    parameters?: Record<string, unknown>;
    fullPayload?: Record<string, unknown>;
  }): Promise<MCPGenerationResponse> {
    const request: MCPGenerationRequest = {
      tool: "generate_video",
      server: "higgsfield",
      arguments: {
        briefId: payload.briefId,
        characterId: payload.characterId,
        prompt: payload.prompt,
        parameters: payload.parameters,
        payload: payload.fullPayload,
      },
    };

    return this.dispatch(request);
  }

  async sendFromBriefPayload(
    briefId: string,
    characterId: string,
    generationPayload: Record<string, unknown>,
    promptHidden: string
  ): Promise<MCPGenerationResponse> {
    const video = generationPayload.video as Record<string, unknown> | undefined;
    return this.sendVideoGeneration({
      briefId,
      characterId,
      prompt: promptHidden,
      parameters: (video?.parameters as Record<string, unknown>) ?? {},
      fullPayload: generationPayload,
    });
  }

  /** Stub dispatcher — replace with CallMcpTool when MCP server is live. */
  private async dispatch(request: MCPGenerationRequest): Promise<MCPGenerationResponse> {
    if (!process.env.HIGGSFIELD_API_KEY && !process.env.HIGGSFIELD_MCP_URL) {
      return {
        success: false,
        error: "Higgsfield MCP not configured",
      };
    }

    // Production: CallMcpTool(request.server, request.tool, request.arguments)
    return {
      success: true,
      jobId: `mcp-${request.tool}-${Date.now()}`,
      url: undefined,
    };
  }
}

export const mcpGenerationClient = new MCPGenerationClient();
