const counts = {};

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const fid = searchParams.get('fid') || '0';
  return Response.json({ fid, count: counts[fid] || 0 });
}

export async function POST(request) {
  const { fid } = await request.json();
  if (!fid) return Response.json({ error: 'no fid' }, { status: 400 });
  counts[fid] = (counts[fid] || 0) + 1;
  return Response.json({ fid, count: counts[fid] });
}
