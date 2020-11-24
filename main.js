module.exports.templateTags = [{
    name: 'laravel_csrf',
    displayName: 'Laravel CSRF',
    description: 'Apply XSRF-TOKEN from cookie for X-XSRF-TOKEN request header',
    args: [
        {
            displayName: 'CSRF Cookie Name',
            type: 'string',
            defaultValue: 'XSRF-TOKEN',
            placeholder: 'It is "XSRF-TOKEN" by default in laravel',
        }
    ],
    async run(context, cookieName = 'XSRF-TOKEN') {
        const cookieJar = await this.getCookieJar(context);

        const token = cookieJar.cookies?.find(cookie => cookie.key === cookieName);

        if (token === undefined) {
            throw new Error(`${cookieName} not found in cookies`);
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