import { DelingAvCv } from '../../api-routes-with-obo.ts';
import { NextRequest } from 'next/server';
import { proxyWithOBO } from '../../oboProxy.ts';


export async function GET(req: NextRequest) {
    return proxyWithOBO(DelingAvCv, req);
}

export async function PUT(req: NextRequest) {
    return proxyWithOBO(DelingAvCv, req);
}

export async function DELETE(req: NextRequest) {
    return proxyWithOBO(DelingAvCv, req);
}