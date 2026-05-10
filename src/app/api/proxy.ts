export async function POST(request: Request) {
  const body = await request.text();
  const response = await fetch('https://yashrajaipm.app.n8n.cloud/webhook/reel-engine', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body
  });
  const data = await response.json();
  return new Response(JSON.stringify(data), {
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*'
    }
  });
}