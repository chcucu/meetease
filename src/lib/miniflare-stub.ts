// Cloudflare builds bundle the Prisma D1 adapter. It lazily imports miniflare
// for shadow-database migrations, which pulls the workerd binary into the
// bundle. Migrations run through Wrangler here, so the import is stubbed out.
export class Miniflare {
  constructor() {
    throw new Error("miniflare is not available in the Cloudflare runtime");
  }
}
