/* eslint-disable no-underscore-dangle */
const ClientError = require('../../exceptions/ClientError');

class CollaborationsHandler {
	constructor(service, playlistsService, validator) {
		this._service = service;
		this._validator = validator;
		this._playlistsService = playlistsService;
		this.postCollaborationsHandler = this.postCollaborationsHandler.bind(this);
		this.deleteCollaborationHandler = this.deleteCollaborationHandler.bind(this);
	}

	async postCollaborationsHandler(request, h) {
		try {
			this._validator.validateCollaborationPayload(request.payload);
			const { playlistId, userId } = request.payload;
			const { id: credentialId } = request.auth.credentials;
			await this._playlistsService.verifyPlaylistAccess(playlistId, credentialId);
			await this._playlistsService.verifyPlaylist(playlistId, credentialId);
			const collaborationId = await this._playlistsService.addCollaboration(playlistId, userId);
			const response = h.response({
				status: 'success',
				message: 'Kolaborasi berhasil ditambahkan',
				data: {
					collaborationId,
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

	async deleteCollaborationHandler(request, h) {
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
}
module.exports = CollaborationsHandler;
