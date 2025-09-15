import http from 'http';

const url = 'http://127.0.0.1:5173/register';

function fetchOnce() {
  return new Promise((resolve) => {
    http.get(url, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => resolve({ ok: true, text: data }));
    }).on('error', (err) => resolve({ ok: false, error: err.message }));
  });
}

(async () => {
  const res = await fetchOnce();
  if (!res.ok) {
    console.log('ERROR:' + res.error);
    process.exit(1);
  }
  const txt = res.text;
  console.log(txt.slice(0, 2000));
})();
