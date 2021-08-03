/* eslint-disable no-underscore-dangle */
const { Pool } = require('pg');
const { nanoid } = require('nanoid');
const bcrypt = require('bcrypt');
const { mapDBToModel } = require('../utils');
const InvariantError = require('../../exceptions/InvariantError');
const NotFoundError = require('../../exceptions/NotFoundError');
const AuthorizationError = require('../../exceptions/AuthorizationError');

class PlaylistsService {
  constructor(collaborationService, cacheService) {
		this._pool = new Pool();
		this._cacheService = cacheService;
		this._collaborationService = collaborationService;
	}

	async createPlaylist({ name, owner }) {
		const id = `playlist-${nanoid(16)}`;
		const query = {
			text: 'INSERT INTO playlists VALUES($1, $2, $3) RETURNING id',
      values: [id, name, owner],
    };
		const result = await this._pool.query(query);
		if (!result.rows.length > 0) {
      throw new InvariantError('Playlist gagal dibuat.');
		}
		return result.rows[0].id;
	}

	async verifyPlaylist(id, owner) {
		const query = {
      text: 'SELECT * FROM playlists WHERE id = $1',
      values: [id],
    };
    const result = await this._pool.query(query);
    if (!result.rows.length) {
      throw new NotFoundError('Playlist tidak ditemukan');
    }
		const playlist = result.rows[0];
    if (playlist.owner !== owner) {
      throw new AuthorizationError('Anda tidak berhak mengakses resource ini');
		}
	}

	async verifyPlaylistAccess(playlistId, userId) {
		try {
			await this.verifyPlaylist(playlistId, userId);
		} catch (error) {
			if (error instanceof NotFoundError) {
				throw error;
			}
		}
	}

	async addUser({ username, password, fullname }) {
		await this.verifyNewUsername(username);
		const id = `user-${nanoid(16)}`;
		const hashedPass = await bcrypt.hash(password, 10);
		const query = {
      text: 'INSERT INTO users VALUES($1, $2, $3, $4) RETURNING id',
      values: [id, username, hashedPass, fullname],
    };
		const result = await this._pool.query(query);
		if (!result.rows.length) {
			throw new InvariantError('User gagal ditambahkan');
		}
		return result.rows[0].id;
	}

	async getPlaylists(user) {
		const query = {
			text: `SELECT playlists.id, playlists.name, users.username 
			FROM playlists 
			INNER JOIN users ON playlists.owner=users.id
			WHERE playlists.owner = $1`,
      values: [user],
    };
		const result = await this._pool.query(query);
		return result.rows;
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

	async addSongToPlaylist(playlistId, songId) {
		const id = `playlistSong-${nanoid(16)}`;
		const query = {
			text: 'INSERT INTO playlistsongs VALUES($1, $2, $3) RETURNING id',
      values: [id, playlistId, songId],
		};
		const result = await this._pool.query(query);
		if (!result.rows.length > 0) {
      throw new InvariantError('Lagu gagal ditambahkan ke playlist.');
		}
		await this._cacheService.delete(`songs:${playlistId}`);
		return result.rows[0].id;
	}

	async getPlaylistSongs(playlistId) {
		try {
			const result = await this._cacheService.get(`songs:${playlistId}`);
			return JSON.parse(result);
		} catch (error) {
			const query = {
				text: `SELECT songs.id, songs.title, songs.performer 
				FROM songs 
				INNER JOIN playlistsongs ON songs.id=playlistsongs.song_id
				WHERE playlistsongs.playlist_id = $1`,
				values: [playlistId],
			};
			const result = await this._pool.query(query);
			const mappedResult = result.rows.map(mapDBToModel);
			await this._cacheService.set(`songs:${playlistId}`, JSON.stringify(mappedResult));
			return mappedResult;
		}
	}

	async deleteSongFromPlaylist(playlistId, songId) {
		const query = {
			text: `DELETE FROM playlistsongs WHERE playlist_id = $1
			AND song_id = $2 RETURNING id`,
      values: [playlistId, songId],
    };
		const result = await this._pool.query(query);
    if (!result.rows.length) {
      throw new NotFoundError('Lagu gagal dihapus dari playlist. Id tidak ditemukan');
		}
		await this._cacheService.delete(`songs:${playlistId}`);
	}

	async verifySong(songId) {
		const query = {
      text: 'SELECT * FROM songs WHERE id = $1',
      values: [songId],
    };
		const result = await this._pool.query(query);
    if (!result.rows.length) {
      throw new InvariantError('Lagu tidak ditemukan');
    }
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
}
module.exports = PlaylistsService;
