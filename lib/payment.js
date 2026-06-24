import crypto from "crypto";

const BASE_URL = "https://app.orderkuota.com";
const ENDPOINT = "/api/v2/get";
const USER_AGENT = "okhttp/5.3.2";

function getCredentials() {
  const username = process.env.ORKUT_USERNAME;
  const token = process.env.ORKUT_TOKEN;
  if (!username || !token) {
    throw new Error("Missing ORKUT_USERNAME or ORKUT_TOKEN environment variables.");
  }
  return { username, token };
}

function buildFormEncoded(formData) {
  return Object.keys(formData)
    .map((key) => `${encodeURIComponent(key)}=${encodeURIComponent(formData[key])}`)
    .join("&");
}

function generateSignature(timestamp) {
  const secret = "X7Kp9mN2vR5tY8wQ3bL6jF0hD4sA1gC";
  return crypto.createHash("sha512").update(`${secret}${timestamp}`).digest("hex");
}

export async function createQris(amount) {
  const { username, token } = getCredentials();
  const timestamp = Date.now().toString();

  const formData = {
    "requests[qris_ajaib][amount]": amount.toString(),
    request_time: timestamp,
    app_reg_id: "ehBB4RxJR8OpDgOY9ii21p:APA91bHzT0DbvNSsiccRFfDEJHPeNmWgACiZbfONfNquSMFH1ewKDKYEg0NgddCfbWAVMFMcWEDkqBguH99ZgYuHQy7SmElXbR1gRmyCcVoWNZGT3syofoc",
    phone_android_version: "11",
    app_version_code: "260204",
    phone_uuid: "ehBB4RxJR8OpDgOY9ii21p",
    auth_username: username,
    auth_token: token,
    app_version_name: "26.02.04",
    ui_mode: "light",
    phone_model: "M2102K1G",
  };

  const formEncoded = buildFormEncoded(formData);

  const headers = {
    Host: "app.orderkuota.com",
    signature: generateSignature(timestamp),
    timestamp: timestamp,
    "content-type": "application/x-www-form-urlencoded",
    "content-length": Buffer.byteLength(formEncoded).toString(),
    "accept-encoding": "gzip",
    "user-agent": USER_AGENT,
  };

  try {
    const response = await fetch(`${BASE_URL}${ENDPOINT}`, {
      method: "POST",
      headers,
      body: formEncoded,
      signal: AbortSignal.timeout(30000),
    });

    const data = await response.json();

    if (!data.success || !data.qris_ajaib?.success) {
      return {
        success: false,
        error: data.qris_ajaib?.message || "Gagal membuat QRIS",
        data,
      };
    }

    const qris = data.qris_ajaib.results;
    return {
      success: true,
      data: {
        id: qris.id,
        amount: qris.amount,
        qrcode_url: qris.qrcode_url,
        name: qris.name,
        status: qris.status,
        info: qris.info,
        date: qris.date,
        expired: qris.expired,
      },
    };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

export async function getHistory(page = 1, dariTanggal = "", keTanggal = "", keterangan = "", jumlah = "") {
  const { username, token } = getCredentials();
  const timestamp = Date.now().toString();

  const formData = {
    "requests[qris_ajaib_history][dari_tanggal]": dariTanggal,
    app_reg_id: "ehBB4RxJR8OpDgOY9ii21p:APA91bHzT0DbvNSsiccRFfDEJHPeNmWgACiZbfONfNquSMFH1ewKDKYEg0NgddCfbWAVMFMcWEDkqBguH99ZgYuHQy7SmElXbR1gRmyCcVoWNZGT3syofoc",
    phone_uuid: "ehBB4RxJR8OpDgOY9ii21p",
    phone_model: "M2102K1G",
    "requests[qris_ajaib_history][page]": page.toString(),
    "requests[qris_ajaib_history][ke_tanggal]": keTanggal,
    "requests[qris_ajaib_history][keterangan]": keterangan,
    request_time: timestamp,
    phone_android_version: "11",
    app_version_code: "260204",
    "requests[qris_ajaib_history][jumlah]": jumlah,
    auth_username: username,
    auth_token: token,
    app_version_name: "26.02.04",
    ui_mode: "light",
  };

  const formEncoded = buildFormEncoded(formData);

  const headers = {
    Host: "app.orderkuota.com",
    signature: generateSignature(timestamp),
    timestamp: timestamp,
    "content-type": "application/x-www-form-urlencoded",
    "content-length": Buffer.byteLength(formEncoded).toString(),
    "accept-encoding": "gzip",
    "user-agent": USER_AGENT,
  };

  try {
    const response = await fetch(`${BASE_URL}${ENDPOINT}`, {
      method: "POST",
      headers,
      body: formEncoded,
      signal: AbortSignal.timeout(30000),
    });

    const data = await response.json();

    if (!data.success || !data.qris_ajaib_history?.success) {
      return {
        success: false,
        error: data.qris_ajaib_history?.message || "Gagal mengambil history",
        data,
      };
    }

    const history = data.qris_ajaib_history;
    return {
      success: true,
      data: {
        total: history.total,
        page: history.page,
        pages: history.pages,
        results: history.results,
      },
    };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

export async function getAllHistory() {
  let allResults = [];
  let currentPage = 1;
  let totalPages = 1;

  while (currentPage <= totalPages) {
    const response = await getHistory(currentPage);
    if (!response.success) {
      return { success: false, error: response.error, data: allResults };
    }

    allResults = allResults.concat(response.data.results || []);
    totalPages = response.data.pages || 1;
    currentPage++;
  }

  return { success: true, data: allResults, total: allResults.length };
}

export function checkStatus(status) {
  const statusMap = {
    pending: "Menunggu pembayaran",
    sukses: "Pembayaran berhasil",
    expired: "QRIS kadaluarsa",
    failed: "Pembayaran gagal",
  };
  return statusMap[status] || status;
}

export function isQrisExpired(expiredTimestamp) {
  const now = Math.floor(Date.now() / 1000);
  return expiredTimestamp < now;
}

export function getQrisStatus(expiredTimestamp, status) {
  if (status === "expired" || isQrisExpired(expiredTimestamp)) {
    return "expired";
  }
  return status;
}
