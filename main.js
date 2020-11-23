module.exports.templateTags = [{
    name: 'CSRF',
    displayName: 'Laravel CSRF',
    description: 'Apply XSRF-TOKEN from cookie for X-XSRF-TOKEN',
    async run(context) {
        const workspace = await this.getWorkspace(context);

        const cookieJar = await context.util.models.cookieJar.getOrCreateForWorkspace(workspace);

        if (!cookieJar) {
            throw new Error(`Cookie jar not found`);
        }

        console.log(cookieJar.cookies.find(e => e.key === 'XSRF-TOKEN'));

        return null;
    },

    async getWorkspace(context) {
        const { meta } = context;

        // Cannot get request and workspace metadata.
        if (!meta.requestId || !meta.workspaceId) {
            return null;
        }

        const workspace = await context.util.models.workspace.getById(meta.workspaceId);

        if (!workspace) {
            throw new Error(`Workspace not found for ${meta.workspaceId}`);
        }

        return workspace;
    }
}];