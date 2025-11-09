import type { Context } from "hono";

export interface ApiConfig {
  id: string;
  owner_address: string;
  api_name: string;
  description?: string;
  documentation?: string;
  tags?: string;
  target_url: string;
  price: string;
  network: string;
  is_active: number;
  verified: number;
  headers?: string; // JSON string of custom headers (private field)
  created_at: number;
  updated_at: number;
}

export interface ApiEndpoint {
  id: string;
  api_id: string;
  path: string;
  method: string;
  price?: string;
}

export class ApiRegistry {
  constructor(private db: D1Database) {}

  async registerApi(config: Omit<ApiConfig, "id" | "created_at" | "updated_at">): Promise<ApiConfig> {
    const id = crypto.randomUUID();
    const now = Date.now();

    await this.db
      .prepare(
        `INSERT INTO apis (id, owner_address, api_name, description, target_url, price, network, is_active, headers, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
      )
      .bind(
        id,
        config.owner_address,
        config.api_name,
        config.description || null,
        config.target_url,
        config.price,
        config.network,
        config.is_active,
        config.headers || '{}',
        now,
        now
      )
      .run();

    return {
      id,
      ...config,
      created_at: now,
      updated_at: now,
    };
  }

  async getApiByPath(path: string): Promise<ApiConfig | null> {
    // Path formatı: /api/{api_id}/rest/of/path
    const match = path.match(/^\/api\/([^\/]+)/);
    if (!match) return null;

    const apiId = match[1];
    const result = await this.db
      .prepare("SELECT * FROM apis WHERE id = ? AND is_active = 1")
      .bind(apiId)
      .first<ApiConfig>();

    return result;
  }

  async getUserApis(ownerAddress: string): Promise<ApiConfig[]> {
    const result = await this.db
      .prepare("SELECT * FROM apis WHERE owner_address = ? ORDER BY created_at DESC")
      .bind(ownerAddress)
      .all<ApiConfig>();

    return result.results || [];
  }

  async getAllActiveApis(): Promise<ApiConfig[]> {
    const result = await this.db
      .prepare("SELECT * FROM apis WHERE is_active = 1 ORDER BY created_at DESC")
      .all<ApiConfig>();

    return result.results || [];
  }

  async updateApi(id: string, updates: Partial<Omit<ApiConfig, "id" | "created_at">>): Promise<boolean> {
    const now = Date.now();
    const fields: string[] = [];
    const values: any[] = [];

    Object.entries(updates).forEach(([key, value]) => {
      if (key !== "id" && key !== "created_at") {
        fields.push(`${key} = ?`);
        values.push(value);
      }
    });

    if (fields.length === 0) return false;

    fields.push("updated_at = ?");
    values.push(now, id);

    const sql = `UPDATE apis SET ${fields.join(", ")} WHERE id = ?`;
    const result = await this.db.prepare(sql).bind(...values).run();

    return result.success;
  }

  async deleteApi(id: string): Promise<boolean> {
    const result = await this.db.prepare("DELETE FROM apis WHERE id = ?").bind(id).run();
    return result.success;
  }
}
