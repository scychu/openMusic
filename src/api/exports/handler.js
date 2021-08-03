/* eslint-disable no-underscore-dangle */
const ClientError = require('../../exceptions/ClientError');

class ExportsHandler {
  constructor(service, playlistsService, validator) {
    this._service = service;
		this._validator = validator;
		this._playlistsService = playlistsService;
		this.postExportSongsHandler = this.postExportSongsHandler.bind(this);
  }

	async postExportSongsHandler(request, h) {
    try {
			this._validator.validateExportSongsPayload(request.payload);
			const { playlistId } = request.params;
			const { id: credentialId } = request.auth.credentials;
			await this._playlistsService.verifyPlaylist(playlistId, credentialId);
			await this._playlistsService.verifyPlaylistAccess(playlistId, credentialId);
			const message = {
        playlistId,
        targetEmail: request.payload.targetEmail,
			};
			await this._service.sendMessage('export:songs', JSON.stringify(message));
      const response = h.response({
        status: 'success',
        message: 'Permintaan Anda sedang kami proses',
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
      console.error(error);
      return response;
    }
  }
}
module.exports = ExportsHandler;
