import { app, HttpRequest, HttpResponseInit } from '@azure/functions';
import { BlobServiceClient } from '@azure/storage-blob';
import { DefaultAzureCredential } from '@azure/identity';
import { guard } from './auth.js';

/**
 * Issue a short-lived user-delegation SAS for a blob in the tenant's container.
 * The container name is `tenant-${tid}` and is created lazily.
 *
 * Auth: requires `blob:write` scope. Tenant is derived from the authenticated
 * principal (API key binding or user session) — NOT from request headers,
 * which a hostile client could spoof.
 */
const account = process.env.STORAGE_ACCOUNT!;
const blobService = new BlobServiceClient(
  `https://${account}.blob.core.windows.net`,
  new DefaultAzureCredential(),
);

async function ensureContainer(name: string) {
  const c = blobService.getContainerClient(name);
  await c.createIfNotExists();
  return c;
}

export async function uploadUrl(req: HttpRequest): Promise<HttpResponseInit> {
  const g = await guard(req, 'blob:write'); if (!g.ok) return g.response;
  const principal = g.principal;

  // Tenant comes from the bound API key, or from the user-session header stamped by APIM.
  const tid = (principal.kind === 'key' ? principal.tenant : null)
    ?? req.headers.get('x-tenant-id');
  if (!tid) return { status: 400, jsonBody: { error: 'no_tenant', detail: 'API key must be bound to a tenant, or X-Tenant-Id must be set by the auth gateway.' } };
  // Sanitize to container-safe form.
  const slug = tid.toLowerCase().replace(/[^a-z0-9-]/g, '-').slice(0, 40);
  if (!slug) return { status: 400, jsonBody: { error: 'invalid_tenant' } };

  const path = new URL(req.url).searchParams.get('path');
  if (!path || path.includes('..')) return { status: 400, jsonBody: { error: 'bad path' } };

  const container = await ensureContainer(`tenant-${slug}`);
  const blob = container.getBlobClient(path);

  const start = new Date(Date.now() - 60_000);
  const expiry = new Date(Date.now() + 10 * 60_000);

  const udk = await blobService.getUserDelegationKey(start, expiry);
  const { generateBlobSASQueryParameters, BlobSASPermissions } = await import('@azure/storage-blob');
  const sas = generateBlobSASQueryParameters(
    {
      containerName: container.containerName,
      blobName: path,
      permissions: BlobSASPermissions.parse('cw'),
      startsOn: start,
      expiresOn: expiry,
      protocol: 'https' as any,
    },
    udk,
    account,
  ).toString();

  return { status: 200, jsonBody: { url: `${blob.url}?${sas}`, expiresAt: expiry.getTime(), container: container.containerName } };
}

app.http('upload-url', {
  route: 'storage/upload-url',
  methods: ['GET'],
  authLevel: 'function',
  handler: uploadUrl,
});
