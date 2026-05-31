import type { AxiosRequestConfig } from "axios";
import type { IMindbodyClient } from "../src/api/client";

interface OpenApiParameter {
  name: string;
  in: "query" | "header" | "path" | "body";
  required?: boolean;
}

interface OpenApiOperation {
  parameters?: OpenApiParameter[];
}

interface OpenApiPathItem {
  get?: OpenApiOperation;
  post?: OpenApiOperation;
  put?: OpenApiOperation;
  delete?: OpenApiOperation;
}

interface OpenApiSpec {
  paths: Record<string, OpenApiPathItem>;
}

export class SpecValidatingClient implements IMindbodyClient {
  private spec: OpenApiSpec;
  private fixture: unknown;

  constructor(spec: OpenApiSpec, fixture: unknown) {
    this.spec = spec;
    this.fixture = fixture;
  }

  async request<T>(config: AxiosRequestConfig): Promise<T> {
    const method = (config.method || "GET").toLowerCase();
    const url = config.url || "";
    this.validate(method, url, config.params);
    return this.fixture as T;
  }

  async get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    this.validate("get", url, config?.params);
    return this.fixture as T;
  }

  async post<T>(url: string, _data?: unknown, _config?: AxiosRequestConfig): Promise<T> {
    this.validate("post", url);
    return this.fixture as T;
  }

  private validate(method: string, toolPath: string, params?: Record<string, unknown>): void {
    const specPath = this.resolveSpecPath(toolPath);
    if (!specPath) {
      throw new SpecValidationError(
        `Path not found in spec: ${toolPath}\n` +
          `No matching path exists in the OpenAPI spec for this endpoint.`
      );
    }

    const pathItem = this.spec.paths[specPath];
    const operation = pathItem[method as keyof OpenApiPathItem] as OpenApiOperation | undefined;
    if (!operation) {
      const available = Object.keys(pathItem).join(", ");
      throw new SpecValidationError(
        `Method "${method.toUpperCase()}" not allowed for ${toolPath}\n` +
          `Spec allows: ${available}`
      );
    }

    if (method === "get" && params) {
      this.validateQueryParams(toolPath, operation, params);
    }
  }

  private validateQueryParams(
    toolPath: string,
    operation: OpenApiOperation,
    params: Record<string, unknown>
  ): void {
    const rawSpecParams = (operation.parameters || [])
      .filter((p) => p.in === "query")
      .map((p) => p.name);

    const specQueryParamSet = new Set(
      rawSpecParams.map((n) => this.normaliseParamName(n))
    );

    for (const key of Object.keys(params)) {
      if (params[key] === undefined) continue;
      const normalised = this.normaliseParamName(key);
      if (!specQueryParamSet.has(normalised)) {
        const recognised = rawSpecParams
          .map((p) => p.replace(/^request\./, ""))
          .sort()
          .join(", ");
        throw new SpecValidationError(
          `Unrecognised query parameter "${key}" for ${toolPath}\n` +
            `Recognised parameters: ${recognised}`
        );
      }
    }

    const requiredParams = (operation.parameters || [])
      .filter((p) => p.in === "query" && p.required)
      .map((p) => p.name);

    for (const required of requiredParams) {
      const normalised = this.normaliseParamName(required);
      const present = Object.keys(params).some(
        (k) => this.normaliseParamName(k) === normalised && params[k] !== undefined
      );
      if (!present) {
        throw new SpecValidationError(
          `Missing required query parameter "${required}" for ${toolPath}`
        );
      }
    }
  }

  private resolveSpecPath(toolPath: string): string | null {
    const suffix = toolPath.replace(/^\//, "").toLowerCase();
    for (const specPath of Object.keys(this.spec.paths)) {
      const specSuffix = specPath
        .replace(/^\/public\/v\{version\}\//, "")
        .toLowerCase();
      if (specSuffix === suffix) return specPath;
    }
    return null;
  }

  // The spec uses "request.startDateTime" style, tools pass "StartDateTime".
  // Normalise both to the same form for comparison.
  private normaliseParamName(name: string): string {
    return name.replace(/^request\./, "").toLowerCase();
  }
}

export class SpecValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "SpecValidationError";
  }
}
