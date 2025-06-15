export async function GET() {
  return new Response(process.env.USERPWD || '', {
    status: 200,
    headers: { 'Content-Type': 'text/plain' },
  });
}
