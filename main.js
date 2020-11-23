module.exports.templateTags = [{
    name: 'CSRF',
    displayName: 'Laravel CSRF',
    description: 'Apply XSRF-TOKEN from cookie for X-XSRF-TOKEN',
    async run(context) {
        const { meta } = context;

        if (!meta.requestId || !meta.workspaceId) {
            return null;
        }

        const workspace = await context.util.models.workspace.getById(meta.workspaceId);

        if (!workspace) {
            throw new Error(`Workspace not found for ${meta.workspaceId}`);
        }
    }
}];