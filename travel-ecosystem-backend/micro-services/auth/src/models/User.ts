import { DataTypes, Model, Optional } from 'sequelize';
import bcrypt from 'bcryptjs';
import { sequelize } from '../config/database.js';

export interface IUserAttributes {
  id: number;
  name: string;
  email: string;
  password: string;
  role: 'user' | 'admin' | 'super_admin' | 'host';
  isEmailVerified: boolean;
  profileImage?: string;
  phone?: string;
  bio?: string;
  location?: string;
  preferences?: {
    newsletter: boolean;
    notifications: boolean;
  };
  resetPasswordToken?: string;
  resetPasswordExpires?: Date;
  emailVerificationToken?: string;
  emailVerificationExpires?: Date;
  refreshTokens: string[];
  lastLogin?: Date;
  isActive: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IUserCreationAttributes extends Optional<IUserAttributes, 'id' | 'role' | 'isEmailVerified' | 'profileImage' | 'phone' | 'bio' | 'location' | 'preferences' | 'resetPasswordToken' | 'resetPasswordExpires' | 'emailVerificationToken' | 'emailVerificationExpires' | 'refreshTokens' | 'lastLogin' | 'isActive' | 'createdAt' | 'updatedAt'> {}

export class User extends Model<IUserAttributes, IUserCreationAttributes> implements IUserAttributes {
  declare id: number;
  declare name: string;
  declare email: string;
  declare password: string;
  declare role: 'user' | 'admin' | 'super_admin' | 'host';
  declare isEmailVerified: boolean;
  declare profileImage?: string;
  declare phone?: string;
  declare bio?: string;
  declare location?: string;
  declare preferences?: {
    newsletter: boolean;
    notifications: boolean;
  };
  declare resetPasswordToken?: string;
  declare resetPasswordExpires?: Date;
  declare emailVerificationToken?: string;
  declare emailVerificationExpires?: Date;
  declare refreshTokens: string[];
  declare lastLogin?: Date;
  declare isActive: boolean;

  declare readonly createdAt: Date;
  declare readonly updatedAt: Date;

  // Instance method to compare password
  public async comparePassword(candidatePassword: string): Promise<boolean> {
    return await bcrypt.compare(candidatePassword, this.password);
  }
}

User.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    name: {
      type: DataTypes.STRING(50),
      allowNull: false,
      validate: {
        notEmpty: {
          msg: 'Name is required'
        },
        len: {
          args: [2, 50],
          msg: 'Name must be between 2 and 50 characters'
        }
      }
    },
    email: {
      type: DataTypes.STRING(255),
      allowNull: false,
      unique: true,
      validate: {
        notEmpty: {
          msg: 'Email is required'
        },
        isEmail: {
          msg: 'Please provide a valid email'
        }
      },
      set(value: string) {
        this.setDataValue('email', value.toLowerCase().trim());
      }
    },
    password: {
      type: DataTypes.STRING(255),
      allowNull: false,
      validate: {
        notEmpty: {
          msg: 'Password is required'
        },
        len: {
          args: [6, 255],
          msg: 'Password must be at least 6 characters'
        }
      }
    },
    role: {
      type: DataTypes.ENUM('user', 'admin', 'super_admin', 'host'),
      defaultValue: 'user',
      allowNull: false
    },
    isEmailVerified: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      allowNull: false
    },
    profileImage: {
      type: DataTypes.STRING(500),
      allowNull: true,
      defaultValue: null
    },
    phone: {
      type: DataTypes.STRING(20),
      allowNull: true,
      defaultValue: null
    },
    bio: {
      type: DataTypes.TEXT,
      allowNull: true,
      validate: {
        len: {
          args: [0, 500],
          msg: 'Bio cannot exceed 500 characters'
        }
      }
    },
    location: {
      type: DataTypes.STRING(100),
      allowNull: true,
      validate: {
        len: {
          args: [0, 100],
          msg: 'Location cannot exceed 100 characters'
        }
      }
    },
    preferences: {
      type: DataTypes.JSONB,
      allowNull: true,
      defaultValue: {
        newsletter: true,
        notifications: true
      }
    },
    resetPasswordToken: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    resetPasswordExpires: {
      type: DataTypes.DATE,
      allowNull: true
    },
    emailVerificationToken: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    emailVerificationExpires: {
      type: DataTypes.DATE,
      allowNull: true
    },
    refreshTokens: {
      type: DataTypes.ARRAY(DataTypes.TEXT),
      allowNull: false,
      defaultValue: []
    },
    lastLogin: {
      type: DataTypes.DATE,
      allowNull: true
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
      allowNull: false
    }
  },
  {
    sequelize,
    tableName: 'users',
    timestamps: true,
    indexes: [
      {
        unique: true,
        fields: ['email']
      },
      {
        fields: ['role']
      },
      {
        fields: ['isActive']
      }
    ],
    hooks: {
      beforeCreate: async (user: User) => {
        // Hash password on creation
        if (user.password && !user.password.startsWith('$2a$') && !user.password.startsWith('$2b$')) {
          const salt = await bcrypt.genSalt(10);
          user.password = await bcrypt.hash(user.password, salt);
        }
      },
      beforeUpdate: async (user: User) => {
        // Hash password if it has been modified
        if (user.changed('password') && user.password && !user.password.startsWith('$2a$') && !user.password.startsWith('$2b$')) {
          const salt = await bcrypt.genSalt(10);
          user.password = await bcrypt.hash(user.password, salt);
        }
      }
    }
  }
);
