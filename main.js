module.exports.templateTags = [{
    name: 'CSRF',
    displayName: 'Laravel CSRF',
    description: 'Apply XSRF-TOKEN from cookie for X-XSRF-TOKEN',
    async run(context) {
        const workspace = await this.getWorkspace(context);
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