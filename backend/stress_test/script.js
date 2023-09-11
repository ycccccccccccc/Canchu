// k6 run script.js
import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  discardResponseBodies: true,
  scenarios: {
    contacts: {
      executor: 'constant-arrival-rate',
      rate: 40,
      timeUnit: '1s',
      duration: '20s',
      preAllocatedVUs: 50,
      maxVUs: 100,
    },
  },
};

// test HTTP
export default function () {
  // 設定 Access Token
  const accessToken = __ENV.TOKEN;

  // 設定 HTTP 請求的 Header
  const headers = {
    'Authorization': `Bearer ${accessToken}`,
  };

  // 執行 HTTP GET 請求並傳遞 Headers
  const res = http.get('http://13.236.235.254/api/1.0/posts/search', { headers });

  // 檢查 HTTP 狀態碼是否為 200
  check(res, { 'status was 200': (r) => r.status == 200 });
  sleep(1);
}
