import { User } from '../models/user.model.js';

class UsersDAO {
  async findAll(filter = {}) {
    return User.find(filter).lean();
  }

  async findById(id) {
    return User.findById(id).lean();
  }

  async findOne(filter) {
    return User.findOne(filter).lean();
  }

  async create(data) {
    const created = await User.create(data);
    return created.toObject();
  }

  async count(filter = {}) {
    return User.countDocuments(filter);
  }
}

export const usersDAO = new UsersDAO();