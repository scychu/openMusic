/* eslint-disable no-underscore-dangle */
const { Pool } = require('pg');
const { nanoid } = require('nanoid');
const InvariantError = require('../../exceptions/InvariantError');
const NotFoundError = require('../../exceptions/NotFoundError');
// const AuthorizationError = require('../../exceptions/AuthorizationError');

class CollaborationsService {
  constructor() {
    this._pool = new Pool();
	}

	async addCollaboration(playlistId, userId) {
		const id = `collaborationId-${nanoid(16)}`;
		const query = {
			text: 'INSERT INTO collaborations VALUES($1, $2, $3) RETURNING id',
      values: [id, playlistId, userId],
    };
		const result = await this._pool.query(query);
		if (!result.rows.length > 0) {
      throw new InvariantError('Kolaborasi gagal dibuat.');
		}
		return result.rows[0].id;
	}

	async deletePlaylist(id) {
		const query = {
      text: 'DELETE FROM playlists WHERE id = $1 RETURNING id',
      values: [id],
    };
    const result = await this._pool.query(query);
    if (!result.rows.length) {
      throw new NotFoundError('Playlist gagal dihapus. Id tidak ditemukan');
    }
	}
}
module.exports = CollaborationsService;
