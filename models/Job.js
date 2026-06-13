const db = require('./db');
const crypto = require('crypto');

class Job {
  constructor(data) {
    Object.assign(this, data);
    if (!this._id) {
      this._id = crypto.randomUUID();
    }
  }

  async save() {
    db.jobs.push(this);
    return this;
  }

  static async findById(id) {
    return db.jobs.find(j => j._id === id);
  }

  static async find() {
    return db.jobs;
  }
}

module.exports = Job;
