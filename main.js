module.exports.templateTags = [{
    name: 'laravel_csrf',
    displayName: 'Laravel CSRF',
    description: 'Apply XSRF-TOKEN from cookie for X-XSRF-TOKEN request header',
    async run(context) {
        const token = (await this.getCookieJar(context))?.cookies.find(cookie => cookie.key === 'XSRF-TOKEN');

        if (token === undefined) {
            throw new Error(`XSRF-TOKEN not found in cookies`);
        }

        return decodeURIComponent(token.value);
    },

    async getCookieJar(context) {
        const { meta } = context;

        if (!meta.requestId || !meta.workspaceId) {
            throw new Error(`Request ID or workspace ID not found`);
        }

        const workspace = await context.util.models.workspace.getById(meta.workspaceId);

        if (!workspace) {
            throw new Error(`Workspace not found for ${meta.workspaceId}`);
        }

        const cookieJar = await context.util.models.cookieJar.getOrCreateForWorkspace(workspace);

        if (!cookieJar) {
            throw new Error(`Cookie jar not found for ${meta.workspaceId}`);
        }

        return cookieJar;
    },
}];