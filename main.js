module.exports.templateTags = [{
    name: 'CSRF',
    displayName: 'Laravel CSRF',
    description: 'Apply XSRF-TOKEN from cookie for X-XSRF-TOKEN',
    async run(context) {
        return 'Hello World';
    }
}];