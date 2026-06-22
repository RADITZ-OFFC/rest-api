import { v4 as uuidv4 } from "uuid";
import { supabaseAdmin } from "./supabase";

/**
 * Generate API key unik dengan format: sk-xxxxxxxxxxxxxxxxxxxx
 * @returns {string}
 */
export function generateApiKey() {
  const raw = uuidv4().replace(/-/g, "");
  return `sk-${raw}`;
}

/**
 * Buat API key baru untuk user setelah order dikonfirmasi
 * @param {object} params
 * @param {string} params.userId
 * @param {string} params.productId
 * @param {string} params.orderId
 * @param {number} params.quotaTotal - jumlah request yang dibeli
 * @param {number|null} params.durationDays - masa aktif dalam hari, null = tidak ada expired
 * @returns {object} API key yang baru dibuat
 */
export async function createApiKey({ userId, productId, orderId, quotaTotal, durationDays = null }) {
  const key = generateApiKey();

  let expiresAt = null;
  if (durationDays) {
    const expDate = new Date();
    expDate.setDate(expDate.getDate() + durationDays);
    expiresAt = expDate.toISOString();
  }

  const { data, error } = await supabaseAdmin
    .from("api_keys")
    .insert({
      user_id: userId,
      product_id: productId,
      order_id: orderId,
      key,
      quota_total: quotaTotal,
      quota_used: 0,
      is_active: true,
      expires_at: expiresAt,
    })
    .select()
    .single();

  if (error) {
    throw new Error(`Gagal membuat API key: ${error.message}`);
  }

  return data;
}

/**
 * Validasi API key dari incoming request ke API yang dijual
 * Cek apakah key valid, aktif, kuota masih ada, dan belum expired
 * @param {string} key
 * @param {string} productId
 * @returns {{ valid: boolean, apiKey?: object, error?: string }}
 */
export async function validateApiKey(key, productId) {
  const { data: apiKey, error } = await supabaseAdmin
    .from("api_keys")
    .select("*")
    .eq("key", key)
    .eq("product_id", productId)
    .single();

  if (error || !apiKey) {
    return { valid: false, error: "API key tidak ditemukan." };
  }

  if (!apiKey.is_active) {
    return { valid: false, error: "API key tidak aktif." };
  }

  if (apiKey.expires_at && new Date(apiKey.expires_at) < new Date()) {
    // Nonaktifkan key yang expired
    await supabaseAdmin
      .from("api_keys")
      .update({ is_active: false })
      .eq("id", apiKey.id);
    return { valid: false, error: "API key sudah expired." };
  }

  if (apiKey.quota_used >= apiKey.quota_total) {
    return { valid: false, error: "Kuota API key habis." };
  }

  return { valid: true, apiKey };
}

/**
 * Tambah usage counter setelah request berhasil
 * @param {string} apiKeyId
 * @param {object} logData - { endpoint, statusCode, ipAddress }
 */
export async function incrementUsage(apiKeyId, logData = {}) {
  // Increment quota_used
  await supabaseAdmin.rpc("increment_api_key_usage", { key_id: apiKeyId });

  // Log usage
  await supabaseAdmin.from("usage_logs").insert({
    api_key_id: apiKeyId,
    endpoint: logData.endpoint || null,
    status_code: logData.statusCode || null,
    ip_address: logData.ipAddress || null,
  });
}
