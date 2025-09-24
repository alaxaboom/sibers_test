import { Model, DataTypes, Optional } from "sequelize";
import sequelize from "../utils/dbConfig";

interface UserAttributes {
  id: number;
  username: string;
  password: string;
  email: string;
  first_name?: string | null;
  last_name?: string | null;
  gender?: string | null;
  birthdate?: Date | null;
  role?: string | null;
}

interface UserCreationAttributes extends Optional<UserAttributes, "id"> {}

class User
  extends Model<UserAttributes, UserCreationAttributes>
  implements UserAttributes
{
  public id!: number;
  public username!: string;
  public password!: string;
  public email!: string;
  public first_name!: string | null;
  public last_name!: string | null;
  public gender!: string | null;
  public birthdate!: Date | null;
  public role!: string | null;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

User.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    username: {
      type: DataTypes.STRING,
      unique: true,
      allowNull: false,
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
      set(value: string) {
        const hash = require("bcrypt").hashSync(value, 10);
        this.setDataValue("password", hash);
      },
    },
    email: {
      type: DataTypes.STRING,
      unique: true,
      allowNull: false,
    },
    first_name: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    last_name: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    gender: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    birthdate: {
      type: DataTypes.DATEONLY,
      allowNull: true,
    },
    role: {
      type: DataTypes.STRING,
      allowNull: false, // Теперь not null
      defaultValue: "user", // Default 'user'
    },
  },
  {
    sequelize,
    modelName: "User",
  }
);
User.afterSync(async () => {
  try {
    const admin = await User.findOne({ where: { username: "admin" } });
    if (!admin) {
      await User.create({
        username: "admin",
        password: "admin123",
        email: "admin@example.com",
        first_name: "Admin",
        last_name: "User",
        role: "admin",
      });
      console.log("Admin user created");
    }
  } catch (error) {
    console.error("Error creating admin user:", error);
  }
});
export default User;
