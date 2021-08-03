/* eslint-disable no-underscore-dangle */
const ClientError = require('../../exceptions/ClientError');

class PlaylistsHandler {
	constructor(service, validator) {
		this._service = service;
		this._validator = validator;

		this.postPlaylistsHandler = this.postPlaylistsHandler.bind(this);
		this.getPlaylistsHandler = this.getPlaylistsHandler.bind(this);
		this.deletePlaylistByIdHandler = this.deletePlaylistByIdHandler.bind(this);
		this.getPlaylistSongsHandler = this.getPlaylistSongsHandler.bind(this);
		this.postSongToPlaylistHandler = this.postSongToPlaylistHandler.bind(this);
		this.deletePlaylistSongHandler = this.deletePlaylistSongHandler.bind(this);
	}

	async postPlaylistsHandler(request, h) {
		try {
			this._validator.validatePostPlaylistPayload(request.payload);
			const { name } = request.payload;
			const { id: credentialId } = request.auth.credentials;
			const playlistId = await this._service.createPlaylist({ name, owner: credentialId });
			const response = h.response({
				status: 'success',
				message: 'Playlist berhasil ditambahkan',
				data: {
					playlistId,
				},
			});
			response.code(201);
			return response;
		} catch (error) {
			if (error instanceof ClientError) {
				const response = h.response({
					status: 'fail',
					message: error.message,
				});
				response.code(error.statusCode);
				return response;
			}
			const response = h.response({
				status: 'error',
				message: 'Maaf, terjadi kegagalan pada server kami.',
			});
			response.code(500);
			console.error('err', error);
			return response;
		}
	}

	async getPlaylistsHandler(request, h) {
		try {
			const { id: credentialId } = request.auth.credentials;
			const playlists = await this._service.getPlaylists(credentialId);
			const response = h.response({
				status: 'success',
				data: {
					playlists,
				},
			});
			response.code(200);
			return response;
		} catch (error) {
			if (error instanceof ClientError) {
				const response = h.response({
					status: 'fail',
					message: error.message,
				});
				response.code(error.statusCode);
				return response;
			}
			const response = h.response({
				status: 'error',
				message: 'Maaf, terjadi kegagalan pada server kami.',
			});
			response.code(500);
			console.log('err', error);
			return response;
		}
	}

	async deletePlaylistByIdHandler(request, h) {
		try {
			const { playlistId } = request.params;
			const { id: credentialId } = request.auth.credentials;
			await this._service.verifyPlaylist(playlistId, credentialId);
			await this._service.deletePlaylist(playlistId);
			const response = h.response({
				status: 'success',
				message: 'Playlist berhasil dihapus',
			});
			response.code(200);
			return response;
		} catch (error) {
			if (error instanceof ClientError) {
				const response = h.response({
					status: 'fail',
					message: error.message,
				});
				response.code(error.statusCode);
				return response;
			}
			const response = h.response({
				status: 'error',
				message: 'Maaf, terjadi kegagalan pada server kami.',
			});
			response.code(500);
			console.log('err', error);
			return response;
		}
	}

	async postSongToPlaylistHandler(request, h) {
		try {
			this._validator.validatePostSongToPlaylistPayload(request.payload);
			const { songId } = request.payload;
			const { playlistId } = request.params;
			const { id: credentialId } = request.auth.credentials;
			await this._service.verifyPlaylistAccess(playlistId, credentialId);
			await this._service.verifyPlaylist(playlistId, credentialId);
			await this._service.addSongToPlaylist(playlistId, songId);
			const response = h.response({
				status: 'success',
				message: 'Lagu berhasil ditambahkan ke playlist',
			});
			response.code(201);
			return response;
		} catch (error) {
			if (error instanceof ClientError) {
				const response = h.response({
					status: 'fail',
					message: error.message,
				});
				response.code(error.statusCode);
				return response;
			}
			const response = h.response({
				status: 'error',
				message: 'Maaf, terjadi kegagalan pada server kami.',
			});
			response.code(500);
			console.log('err', error);
			return response;
		}
	}

	async getPlaylistSongsHandler(request, h) {
		try {
			const { id: credentialId } = request.auth.credentials;
			const { playlistId } = request.params;
			await this._service.verifyPlaylistAccess(playlistId, credentialId);
			await this._service.verifyPlaylist(playlistId, credentialId);
			const songs = await this._service.getPlaylistSongs(playlistId);
			const response = h.response({
				status: 'success',
				data: {
					songs,
				},
			});
			response.code(200);
			return response;
		} catch (error) {
			if (error instanceof ClientError) {
				const response = h.response({
					status: 'fail',
					message: error.message,
				});
				response.code(error.statusCode);
				return response;
			}
			const response = h.response({
				status: 'error',
				message: 'Maaf, terjadi kegagalan pada server kami.',
			});
			response.code(500);
			console.log('err', error);
			return response;
		}
	}

	async deletePlaylistSongHandler(request, h) {
		try {
			const { playlistId } = request.params;
			const { songId } = request.payload;
			const { id: credentialId } = request.auth.credentials;
			await this._service.verifyPlaylist(playlistId, credentialId);
			await this._service.verifyPlaylistAccess(playlistId, credentialId);
			await this._service.verifySong(songId);
			await this._service.deleteSongFromPlaylist(playlistId, songId);
			const response = h.response({
				status: 'success',
				message: 'Lagu berhasil dihapus dari playlist',
			});
			response.code(200);
			return response;
		} catch (error) {
			if (error instanceof ClientError) {
				const response = h.response({
					status: 'fail',
					message: error.message,
				});
				response.code(error.statusCode);
				return response;
			}
			const response = h.response({
				status: 'error',
				message: 'Maaf, terjadi kegagalan pada server kami.',
			});
			response.code(500);
			console.log('err', error);
			return response;
		}
	}
}
module.exports = PlaylistsHandler;
