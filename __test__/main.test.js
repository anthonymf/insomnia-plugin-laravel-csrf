const { jarFromCookies, cookiesFromJar } = require('insomnia-cookies');
const tag = require('..').templateTags[0];

describe('Plugin', () => {
    describe('Kernel Errors', () => {
        it('cannot get request id', async () => {
            const context = {
                meta: { workspaceId: 'wrk_1' }
            };
            try {
                await tag.run(context);
            } catch (err) {
                expect(err.message).toBe('Request ID or workspace ID not found');
            }
        });
        
        it('cannot get workspace id', async () => {
            const context = {
                meta: { requestId: 'rq_1' }
            };
            try {
                await tag.run(context);
            } catch (err) {
                expect(err.message).toBe('Request ID or workspace ID not found');
            }
        });

        it('cannot get workspace by id', async () => {
            const context = {
                meta: { requestId: 'rq_1', workspaceId: 'wrk_1' },
                util: {
                    models: {
                        workspace: {
                            getById(id) {
                                return undefined;
                            }
                        }
                    }
                }
            };

            try {
                await tag.run(context);
            } catch (err) {
                expect(err.message).toBe('Workspace not found for wrk_1');
            }
        });

        it('cannot get cookie jar', async () => {
            const workspaces = [
                { _id: 'wrk_1' }
            ];
            const context = {
                meta: { requestId: 'rq_1', workspaceId: 'wrk_1' },
                util: {
                    models: {
                        workspace: {
                            getById(id) {
                                return workspaces.find(w => w._id === id);
                            }
                        },
                        cookieJar: {
                            getOrCreateForWorkspace(workspace) {
                                return undefined;
                            }
                        }
                    }
                }
            };

            try {
                await tag.run(context);
            } catch (err) {
                expect(err.message).toBe('Cookie jar not found for wrk_1');
            }
        });
    });

    describe('Get CSRF cookie', () => {

        it('when cookiejar cookies is undefined', async () => {
            const context = _getContext(
                [{_id: 'wrk_1'}], 
                [{parentId: 'wrk_1'}] // .cookies is not set in cookie jar.
            );

            try {
                await tag.run(context);
            } catch (err) {
                expect(err.message).toBe('XSRF-TOKEN not found in cookies');
            }
        });

        it('when cookiejar is empty', async () => {
            const context = _getContext([{_id: 'wrk_1'}]);

            try {
                await tag.run(context);
            } catch (err) {
                expect(err.message).toBe('XSRF-TOKEN not found in cookies');
            }
        });

        it('when XSRF-TOKEN cookie is set', async () => {
            const jar = jarFromCookies([]);
            jar.setCookieSync(
                [
                    'XSRF-TOKEN=this-is-laravel-XSRF-TOKEN-cookie',
                    'path=/',
                    'HttpOnly Cache-Control: public, no-cache',
                ].join('; '),
                'http://localhost'
            );
            const cookies = await cookiesFromJar(jar);
            const context = _getContext(
                [{_id: 'wrk_1'}],
                [{_id: 'jar_1', parentId: 'wrk_1', cookies}]
            );
            const result = await tag.run(context);

            expect(result).toBe('this-is-laravel-XSRF-TOKEN-cookie');
        });

        it('XSRF-TOKEN can be url decode', async () => {
            const jar = jarFromCookies([]);
            jar.setCookieSync(
                [
                    'XSRF-TOKEN=HelloWorld%3D',
                    'path=/',
                    'HttpOnly Cache-Control: public, no-cache',
                ].join('; '),
                'http://localhost'
            );
            const cookies = await cookiesFromJar(jar);
            const context = _getContext(
                [{_id: 'wrk_1'}],
                [{_id: 'jar_1', parentId: 'wrk_1', cookies}]
            );
            const result = await tag.run(context);

            expect(result).toBe('HelloWorld=');
        });

        it('Use comtomize CSRF cookie name', async () => {
            const jar = jarFromCookies([]);
            jar.setCookieSync(
                [
                    'CUSTOM-CSRF-TOKEN=this-is-customize-csrf-token%3D',
                    'path=/',
                    'HttpOnly Cache-Control: public, no-cache',
                ].join('; '),
                'http://localhost'
            );
            const cookies = await cookiesFromJar(jar);
            const context = _getContext(
                [{_id: 'wrk_1'}],
                [{_id: 'jar_1', parentId: 'wrk_1', cookies}]
            );
            const result = await tag.run(context, 'CUSTOM-CSRF-TOKEN');

            expect(result).toBe('this-is-customize-csrf-token=');
        });
    });
});

function _getContext(workspaces, jars = [])
{
    return {
        meta: {
            requestId: 'rq_1',
            workspaceId: workspaces[0]._id,
        },
        util: {
            models: {
                workspace: {
                    getById(id) {
                        return workspaces.find(w => w._id === id);
                    }
                },
                cookieJar: {
                    getOrCreateForWorkspace(workspace) {
                        const defaultJar = {
                            parentId: workspace._id,
                            cookies: []
                        };

                        return jars.find(j => j.parentId === workspace._id) || defaultJar;
                    }
                }
            }
        }
    };
}