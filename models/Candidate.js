const db = require('./db');
const crypto = require('crypto');

class Candidate {
  constructor(data) {
    Object.assign(this, data);
    if (!this._id) {
      this._id = crypto.randomUUID();
    }
  }

  async save() {
    const existingIndex = db.candidates.findIndex(c => c._id === this._id);
    if (existingIndex >= 0) {
      db.candidates[existingIndex] = this;
    } else {
      db.candidates.push(this);
    }
    return this;
  }

  static async find() {
    return db.candidates;
  }
}

module.exports = Candidate;
