import axios from 'axios';

// ruleid: internal.mobile.security.rn-cleartext-traffic
const api = axios.create({ baseURL: 'http://api.example.com', timeout: 5000 });

// ruleid: internal.mobile.security.rn-cleartext-traffic
const api2 = axios.create({ timeout: 3000, baseURL: 'http://192.168.0.1:8080' });

// ruleid: internal.mobile.security.rn-cleartext-traffic
fetch('http://api.example.com/users', { method: 'GET' });

// ruleid: internal.mobile.security.rn-cleartext-traffic
fetch('http://api.example.com/login');

// ruleid: internal.mobile.security.rn-cleartext-traffic
const BASE_URL = 'http://api.example.com';

// ruleid: internal.mobile.security.rn-cleartext-traffic
const apiUrl = 'http://192.168.1.1:3000';

// ok: internal.mobile.security.rn-cleartext-traffic
const secureApi = axios.create({ baseURL: 'https://api.example.com' });

// ok: internal.mobile.security.rn-cleartext-traffic
fetch('https://api.example.com/users');

// ok: internal.mobile.security.rn-cleartext-traffic
const SECURE_BASE_URL = 'https://api.example.com';

// ok: internal.mobile.security.rn-cleartext-traffic
const localUrl = 'http://localhost:8080'; // localhost 는 별도 판단 필요
