import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

// Khởi tạo Redis cache & API Limit
// Sẽ yêu cầu cấu hình UPSTASH_REDIS_REST_URL và UPSTASH_REDIS_REST_TOKEN ở .env.local
let redis: Redis;
let fallbackMode = false;

try {
  redis = Redis.fromEnv();
} catch (e) {
  console.warn("⚠️ Không tìm thấy biến môi trường Upstash Redis. Chạy chế độ Fallback (Không có Ratelimit).");
  fallbackMode = true;
}

// Cấu hình: Max 5 request mỗi 10 giây đối với các API endpoint quan trọng
export const surveyRateLimiter = fallbackMode 
  ? null 
  : new Ratelimit({
      redis: redis!,
      limiter: Ratelimit.slidingWindow(5, "10 s"),
      analytics: true,
      prefix: "@upstash/ratelimit/survey",
    });
