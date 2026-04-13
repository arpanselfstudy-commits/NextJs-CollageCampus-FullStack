import { NextRequest } from "next/server";

export async function GET(req: NextRequest) {
  const base = req.nextUrl.origin;
  return Response.redirect(`${base}/api/swagger?ui=1`, 302);
}
