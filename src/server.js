require('dotenv').config();
const Hapi = require('@hapi/hapi');
const songs = require('./api/songs');
const SongsService = require('./services/inMemory/SongsService');
const SongsValidator = require('./validator/songs/index');

const init = async () => {
	const songsService = new SongsService();
  const server = Hapi.server({
    port: process.env.PORT,
    host: process.env.HOST,
    routes: {
      cors: {
        origin: ['*'],
      },
    },
  });

	await server.register({
		plugin: songs,
		options: {
			service: songsService,
			validator: SongsValidator,
		},
	});

  await server.start();
  console.log(`Server berjalan pada ${server.info.uri}`);
};

init();