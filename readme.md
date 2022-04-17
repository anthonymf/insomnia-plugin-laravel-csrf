# Insomnia Laravel CSRF Plugin

![Build](https://github.com/chivincent-rosetta/insomnia-plugin-laravel-csrf/workflows/CI/badge.svg)

The insomnia plugin for setting X-XSRF-TOKEN header in request from XSRF-TOKEN cookie in laravel applications.

Please note if you are using [sub-environments](https://docs.insomnia.rest/insomnia/environment-variables/#sub-environments), with this plugin it is necessary to delete the XSRF-TOKEN cookie every time you switch between sub-environments.

