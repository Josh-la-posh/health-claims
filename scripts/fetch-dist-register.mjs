import http from 'http';

const url = 'http://localhost:5000/register';

http.get(url, (res) => {
  let data = '';
  res.on('data', (c) => data += c);
  res.on('end', () => {
    console.log(data.slice(0, 1500));
  });
}).on('error', (err) => {
  console.log('ERROR:' + err.message);
  process.exit(1);
});
