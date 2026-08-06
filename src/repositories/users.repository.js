import { usersDAO } from '../dao/users.dao.js';

class UsersRepository {
  constructor(dao) {
    this.dao = dao;
  }

  async findByEmail(email) {
    return this.dao.findOne({ email });
  }

  async findById(id) {
    return this.dao.findById(id);
  }

  async create(userData) {
    return this.dao.create(userData);
  }

  async existsByEmail(email) {
    const count = await this.dao.count({ email });
    return count > 0;
  }
}

export const usersRepository = new UsersRepository(usersDAO);